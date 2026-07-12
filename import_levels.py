#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Splat Run <-> LDtk palya-konverter.

Hasznalat:
  python import_levels.py export-ldtk   # egyszeri migracio: levels.js -> splat_levels.ldtk
  python import_levels.py import        # rendszeres irany: splat_levels.ldtk -> levels.js

Az 'import' automatikusan ellenorzi a kort a levels_canonical.json pillanatkep ellen
(ha letezik), es csak akkor ir, ha a szemantikus diff ures (vagy --force).
"""
import json
import os
import re
import sys
import uuid

BASE = os.path.dirname(os.path.abspath(__file__))
LEVELS_JS_PATH = os.path.join(BASE, 'levels.js')
LDTK_PATH = os.path.join(BASE, 'splat_levels.ldtk')
SNAPSHOT_PATH = os.path.join(BASE, 'levels_canonical.json')

GRID = 10
LEVEL_W, LEVEL_H = 600, 340

# ---------------------------------------------------------------------------
# JS -> Python parszolas (a jelenlegi buildLevels() kiolvasasa)
# ---------------------------------------------------------------------------

def find_matching_brace(text, open_idx, open_ch='{', close_ch='}'):
    depth = 0
    i = open_idx
    in_str = None
    while i < len(text):
        c = text[i]
        if in_str:
            if c == '\\':
                i += 2
                continue
            if c == in_str:
                in_str = None
        elif c in ('"', "'"):
            in_str = c
        elif c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError('nincs zaro %s' % close_ch)


def extract_build_levels(html):
    m = re.search(r'function buildLevels\(\)\s*\{', html)
    if not m:
        raise ValueError('buildLevels() nem talalhato')
    open_idx = html.index('{', m.start())
    close_idx = find_matching_brace(html, open_idx)
    return m.start(), close_idx + 1, html[open_idx + 1:close_idx]


def jsify_to_json(s):
    s = re.sub(r"'([^']*)'", lambda mm: json.dumps(mm.group(1)), s)
    s = re.sub(r'([\{,\[]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', s)
    return s


class Shared(dict):
    """Megosztott (referenciaval hivatkozott) platform-objektum jelzese."""
    pass


def parse_levels_from_html(html):
    _, _, body = extract_build_levels(html)
    shared = {}
    for mm in re.finditer(r'var\s+(\w+)\s*=\s*\{', body):
        name = mm.group(1)
        o = body.index('{', mm.start())
        c = find_matching_brace(body, o)
        literal = body[o:c + 1]
        shared[name] = Shared(json.loads(jsify_to_json(literal)))

    rm = re.search(r'return\s*\[', body)
    if not rm:
        raise ValueError('return [ nem talalhato')
    o = body.index('[', rm.start())
    c = find_matching_brace(body, o, '[', ']')
    arr_text = body[o:c + 1]
    if shared:
        pattern = r'\b(' + '|'.join(re.escape(k) for k in shared) + r')\b'
        arr_text = re.sub(pattern, lambda mm: '"@@%s@@"' % mm.group(1), arr_text)
    levels = json.loads(jsify_to_json(arr_text))

    def resolve(node):
        if isinstance(node, list):
            return [resolve(x) for x in node]
        if isinstance(node, dict):
            return {k: resolve(v) for k, v in node.items()}
        if isinstance(node, str) and node.startswith('@@') and node.endswith('@@'):
            return shared[node[2:-2]]
        return node

    return resolve(levels)

# ---------------------------------------------------------------------------
# Normalizalas (szemantikus osszehasonlitashoz)
# ---------------------------------------------------------------------------

def _rnd(v):
    if isinstance(v, float):
        return round(v, 6)
    return v


def normalize_levels(levels):
    out = []
    for lv in levels:
        plats = lv.get('platforms', [])
        pidx = {id(p): i for i, p in enumerate(plats)}
        nl = {'name': lv.get('name'), 'theme': lv.get('theme', 'dungeon')}
        st = dict(lv.get('start', {}))
        fp = st.pop('followPlatform', None)
        st = {k: _rnd(v) for k, v in st.items()}
        if fp is not None:
            st['followIndex'] = pidx[id(fp)]
        nl['start'] = st
        nps = []
        for p in plats:
            np = {k: _rnd(v) for k, v in p.items() if not k.startswith('_') and k not in ('move', 'sink', 'tilt')}
            for sub in ('move', 'sink', 'tilt'):
                if p.get(sub):
                    np[sub] = {k: _rnd(v) for k, v in p[sub].items() if k != 'active'}
            nps.append(np)
        nl['platforms'] = nps
        nsp = []
        for s in lv.get('spikes', []):
            if s.get('follow'):
                nsp.append({'w': s['w'], 'h': s['h'],
                            'followIndex': pidx[id(s['follow']['platform'])],
                            'offsetX': _rnd(s['follow']['offsetX']),
                            'offsetY': _rnd(s['follow']['offsetY'])})
            else:
                nsp.append({k: _rnd(v) for k, v in s.items()})
        nl['spikes'] = nsp
        for key in ('saws', 'pendulums', 'mosquitoSwarms', 'leeches', 'ladders',
                    'walls', 'slopes', 'water', 'icicles', 'springs', 'rocks', 'cannons'):
            nl[key] = [{k: _rnd(v) for k, v in e.items() if not k.startswith('_')}
                       for e in lv.get(key, [])]
        ngp = []
        for g in lv.get('portcullis', []):
            ng = {k: _rnd(v) for k, v in g.items() if not k.startswith('_') and k != 'move'}
            if g.get('move'):
                ng['move'] = {k: _rnd(v) for k, v in g['move'].items() if k != 'active'}
            ngp.append(ng)
        nl['portcullis'] = ngp
        nrp = []
        for r in lv.get('ropes', []):
            nrp.append({'anchorX': _rnd(r['anchorX']), 'anchorY': _rnd(r['anchorY']),
                        'length': _rnd(r['length']), 'vineSkin': bool(r.get('vineSkin'))})
        nl['ropes'] = nrp
        nfs = []
        for f in lv.get('fishSpawners', []):
            nf = {k: _rnd(v) for k, v in f.items() if k not in ('active', 'phase', '_x', '_y')}
            nf['cruise'] = bool(f.get('cruise'))
            nfs.append(nf)
        nl['fishSpawners'] = nfs
        nl['goal'] = {k: _rnd(v) for k, v in lv.get('goal', {}).items()}
        out.append(nl)
    return out

# ---------------------------------------------------------------------------
# LDtk projekt generalas (export-ldtk)
# ---------------------------------------------------------------------------

class UidGen:
    def __init__(self):
        self.n = 100

    def __call__(self):
        self.n += 1
        return self.n


def _field_def(uid, ident, ftype, is_array=False, can_null=False, enum_uid=None):
    tname = {'float': ('Float', 'F_Float'), 'int': ('Int', 'F_Int'),
             'bool': ('Bool', 'F_Bool'), 'string': ('String', 'F_String'),
             'ref': ('EntityRef', 'F_EntityRef')}.get(ftype)
    if ftype == 'enum':
        t0, t1 = 'LocalEnum.' + enum_uid[0], 'F_Enum(%d)' % enum_uid[1]
    else:
        t0, t1 = tname
    if is_array:
        t0 = 'Array<%s>' % t0
    return {
        'identifier': ident, 'doc': None, '__type': t0, 'uid': uid, 'type': t1,
        'isArray': is_array, 'canBeNull': can_null,
        'arrayMinLength': None, 'arrayMaxLength': None,
        'editorDisplayMode': 'NameAndValue', 'editorDisplayScale': 1,
        'editorDisplayPos': 'Above', 'editorLinkStyle': 'StraightArrow',
        'editorAlwaysShow': False, 'editorShowInWorld': False,
        'editorCutLongValues': True, 'editorTextSuffix': None,
        'editorTextPrefix': None, 'useForSmartColor': False,
        'exportToToc': False, 'searchable': False,
        'min': None, 'max': None, 'regex': None, 'acceptFileTypes': None,
        'defaultOverride': None, 'textLanguageMode': None,
        'symmetricalRef': False, 'autoChainRef': True,
        'allowOutOfLevelRef': True, 'allowedRefs': 'Any',
        'allowedRefsEntityUid': None, 'allowedRefTags': [], 'tilesetUid': None,
    }


ENTITY_SPECS = {
    # ident: (w, h, resizable, color, fields[(name, type, opts)])
    'Platform': (90, 40, True, '#3EE08A', [
        ('color', 'string'), ('moveAxis', 'enum', 'MoveAxis'),
        ('moveMin', 'float'), ('moveMax', 'float'), ('moveSpeed', 'float'), ('movePhase', 'float'),
        ('sinkMaxY', 'float'), ('sinkSpeed', 'float'),
        ('tiltMaxAngle', 'float'), ('tiltSpeed', 'float'), ('ice', 'bool'), ('crumble', 'bool')]),
    'Spike': (40, 12, True, '#9C1524', [('followRef', 'ref')]),
    'Saw': (26, 26, False, '#C9C9D4', [
        ('r', 'float'), ('axis', 'enum', 'SawAxis'),
        ('min', 'float'), ('max', 'float'), ('speed', 'float'), ('phase', 'float')]),
    'Pendulum': (16, 16, False, '#8A1A2A', [
        ('length', 'float'), ('minAngle', 'float'), ('maxAngle', 'float'),
        ('speed', 'float'), ('phase', 'float'), ('r', 'float')]),
    'MosquitoSwarm': (16, 16, False, '#28282C', [
        ('r', 'float'), ('ampX', 'float'), ('ampY', 'float'),
        ('speedX', 'float'), ('speedY', 'float'), ('phaseX', 'float'), ('phaseY', 'float')]),
    'Leech': (16, 16, True, '#B4285A', []),
    'Ladder': (18, 100, True, '#B98A4A', []),
    'Wall': (15, 90, True, '#8C7D5F', []),
    'Slope': (20, 20, True, '#6A8F4E', [('direction', 'enum', 'SlopeDir')]),
    'Rope': (10, 10, False, '#3C5A2A', [('length', 'float'), ('vineSkin', 'bool')]),
    'Water': (70, 30, True, '#1A4A6E', []),
    'FishSpawner': (14, 14, False, '#4C92AC', [
        ('variant', 'enum', 'FishVariant'), ('spots', 'float_array'),
        ('r', 'float'), ('jumpHeight', 'float'), ('jumpDuration', 'float'),
        ('timer', 'float'), ('cooldownMin', 'float'), ('cooldownMax', 'float'),
        ('rangeMin', 'float'), ('rangeMax', 'float'), ('speed', 'float')]),
    'Icicle': (12, 24, True, '#BEE0FF', []),
    'Spring': (24, 12, True, '#C83240', [('power', 'float')]),
    'Rock': (60, 40, True, '#3A3F4A', []),
    'Portcullis': (20, 100, True, '#6B6258', [
        ('moveAxis', 'enum', 'MoveAxis'),
        ('moveMin', 'float'), ('moveMax', 'float'), ('moveSpeed', 'float'), ('movePhase', 'float')]),
    'Cannon': (20, 16, True, '#4A463E', [
        ('dir', 'enum', 'CannonDir'), ('interval', 'float'), ('speed', 'float'), ('r', 'float'),
        ('range', 'float')]),
    'Start': (18, 26, False, '#F4F1E6', [('followRef', 'ref')]),
    'Goal': (30, 40, True, '#FFE066', []),
}

ENUMS = {
    'MoveAxis': ['none', 'x', 'y'],
    'SawAxis': ['x', 'y'],
    'SlopeDir': ['up', 'down'],
    'FishVariant': ['spots', 'range', 'cruise'],
    'CannonDir': ['left', 'right'],
    'Theme': ['dungeon', 'rainforest', 'ice', 'castle'],
}


def build_defs(uid):
    enum_defs, enum_uids = [], {}
    for name, values in ENUMS.items():
        u = uid()
        enum_uids[name] = u
        enum_defs.append({'identifier': name, 'uid': u,
                          'values': [{'id': v, 'tileRect': None, 'color': 0} for v in values],
                          'iconTilesetUid': None, 'externalRelPath': None,
                          'externalFileChecksum': None, 'tags': []})
    layer_uid = uid()
    layer_def = {
        '__type': 'Entities', 'identifier': 'Entities', 'type': 'Entities',
        'uid': layer_uid, 'doc': None, 'uiColor': None, 'gridSize': GRID,
        'guideGridWid': 0, 'guideGridHei': 0, 'displayOpacity': 1,
        'inactiveOpacity': 1, 'hideInList': False, 'hideFieldsWhenInactive': False,
        'canSelectWhenInactive': True, 'renderInWorldView': True,
        'pxOffsetX': 0, 'pxOffsetY': 0, 'parallaxFactorX': 0, 'parallaxFactorY': 0,
        'parallaxScaling': True, 'requiredTags': [], 'excludedTags': [],
        'autoTilesKilledByOtherLayer': False, 'uiFilterTags': [],
        'useAsyncRender': False, 'intGridValues': [], 'intGridValuesGroups': [],
        'autoRuleGroups': [], 'autoSourceLayerDefUid': None,
        'tilesetDefUid': None, 'tilePivotX': 0, 'tilePivotY': 0,
    }
    entity_defs, field_uids = [], {}
    for ident, (w, h, resizable, color, fields) in ENTITY_SPECS.items():
        fdefs = []
        for f in fields:
            fname, ftype = f[0], f[1]
            u = uid()
            field_uids[(ident, fname)] = u
            if ftype == 'enum':
                fd = _field_def(u, fname, 'enum', enum_uid=(f[2], enum_uids[f[2]]))
            elif ftype == 'float_array':
                fd = _field_def(u, fname, 'float', is_array=True)
            elif ftype == 'ref':
                fd = _field_def(u, fname, 'ref', can_null=True)
            else:
                fd = _field_def(u, fname, ftype)
            fdefs.append(fd)
        entity_defs.append({
            'identifier': ident, 'uid': uid(), 'tags': [], 'exportToToc': False,
            'allowOutOfBounds': True, 'doc': None, 'width': w, 'height': h,
            'resizableX': resizable, 'resizableY': resizable,
            'minWidth': None, 'minHeight': None, 'maxWidth': None, 'maxHeight': None,
            'keepAspectRatio': False, 'tileOpacity': 1, 'fillOpacity': 0.35,
            'lineOpacity': 1, 'hollow': False, 'color': color,
            'renderMode': 'Rectangle', 'showName': True, 'tilesetId': None,
            'tileRenderMode': 'FitInside', 'tileRect': None, 'uiTileRect': None,
            'nineSliceBorders': [], 'maxCount': 0, 'limitScope': 'PerLevel',
            'limitBehavior': 'MoveLastOne', 'pivotX': 0, 'pivotY': 0,
            'fieldDefs': fdefs,
        })
    lf_name, lf_theme = uid(), uid()
    level_fields = [_field_def(lf_name, 'name', 'string'),
                    _field_def(lf_theme, 'theme', 'enum', enum_uid=('Theme', enum_uids['Theme']))]
    entity_def_uids = {e['identifier']: e['uid'] for e in entity_defs}
    return ({'layers': [layer_def], 'entities': entity_defs, 'tilesets': [],
             'enums': enum_defs, 'externalEnums': [], 'levelFields': level_fields},
            layer_uid, entity_def_uids, field_uids, {'name': lf_name, 'theme': lf_theme})


def _fi(ident, ftype, value, def_uid):
    return {'__identifier': ident, '__type': ftype, '__value': value,
            'defUid': def_uid, 'realEditorValues': []}


def export_ldtk(levels):
    uid = UidGen()
    defs, layer_uid, ent_uids, field_uids, lf_uids = build_defs(uid)
    world_iid = str(uuid.uuid4())
    out_levels = []
    for li, lv in enumerate(levels):
        level_uid = uid()
        level_iid = str(uuid.uuid4())
        layer_iid = str(uuid.uuid4())
        insts = []
        plat_iids = {}

        def add(ident, x, y, w, h, fields):
            iid = str(uuid.uuid4())
            fis = []
            for f in ENTITY_SPECS[ident][4]:
                fname, ftype = f[0], f[1]
                if fname not in fields:
                    continue
                du = field_uids[(ident, fname)]
                val = fields[fname]
                if ftype == 'enum':
                    fis.append(_fi(fname, 'LocalEnum.' + f[2], val, du))
                elif ftype == 'float_array':
                    fis.append(_fi(fname, 'Array<Float>', val, du))
                elif ftype == 'ref':
                    fis.append(_fi(fname, 'EntityRef',
                                   {'entityIid': val, 'layerIid': layer_iid,
                                    'levelIid': level_iid, 'worldIid': world_iid}, du))
                elif ftype == 'bool':
                    fis.append(_fi(fname, 'Bool', bool(val), du))
                elif ftype == 'string':
                    fis.append(_fi(fname, 'String', val, du))
                else:
                    fis.append(_fi(fname, 'Float', val, du))
            insts.append({'__identifier': ident,
                          '__grid': [int(x // GRID), int(y // GRID)],
                          '__pivot': [0, 0], '__tags': [], '__tile': None,
                          '__smartColor': ENTITY_SPECS[ident][3],
                          '__worldX': li * (LEVEL_W + 20) + int(x),
                          '__worldY': int(y),
                          'iid': iid, 'width': int(w), 'height': int(h),
                          'defUid': ent_uids[ident], 'px': [int(x), int(y)],
                          'fieldInstances': fis})
            return iid

        for p in lv.get('platforms', []):
            fields = {'color': p.get('color', '#3ee08a'), 'moveAxis': 'none',
                      'moveMin': 0, 'moveMax': 0, 'moveSpeed': 0, 'movePhase': 0,
                      'sinkMaxY': 0, 'sinkSpeed': 0, 'tiltMaxAngle': 0, 'tiltSpeed': 0,
                      'ice': bool(p.get('ice')), 'crumble': bool(p.get('crumble'))}
            if p.get('move'):
                mv = p['move']
                fields.update({'moveAxis': mv['axis'], 'moveMin': mv['min'],
                               'moveMax': mv['max'], 'moveSpeed': mv['speed'],
                               'movePhase': mv['phase']})
            if p.get('sink'):
                fields.update({'sinkMaxY': p['sink']['maxY'], 'sinkSpeed': p['sink']['speed']})
            if p.get('tilt'):
                fields.update({'tiltMaxAngle': p['tilt']['maxAngle'], 'tiltSpeed': p['tilt']['speed']})
            plat_iids[id(p)] = add('Platform', p['x'], p['y'], p['w'], p['h'], fields)

        for s in lv.get('spikes', []):
            if s.get('follow'):
                fp = s['follow']
                base = fp['platform']
                add('Spike', base['x'] + fp['offsetX'], base['y'] + fp['offsetY'],
                    s['w'], s['h'], {'followRef': plat_iids[id(base)]})
            else:
                add('Spike', s['x'], s['y'], s['w'], s['h'], {})
        for s in lv.get('saws', []):
            add('Saw', s['cx'], s['cy'], 2 * s['r'], 2 * s['r'],
                {'r': s['r'], 'axis': s['axis'], 'min': s['min'], 'max': s['max'],
                 'speed': s['speed'], 'phase': s['phase']})
        for p in lv.get('pendulums', []):
            add('Pendulum', p['anchorX'], p['anchorY'], 16, 16,
                {'length': p['length'], 'minAngle': p['minAngle'], 'maxAngle': p['maxAngle'],
                 'speed': p['speed'], 'phase': p['phase'], 'r': p['r']})
        for m in lv.get('mosquitoSwarms', []):
            add('MosquitoSwarm', m['x'], m['y'], 2 * m['r'], 2 * m['r'],
                {'r': m['r'], 'ampX': m['ampX'], 'ampY': m['ampY'],
                 'speedX': m['speedX'], 'speedY': m['speedY'],
                 'phaseX': m['phaseX'], 'phaseY': m['phaseY']})
        for le in lv.get('leeches', []):
            add('Leech', le['x'], le['y'], le['w'], le['h'], {})
        for l in lv.get('ladders', []):
            add('Ladder', l['x'], l['y'], l['w'], l['h'], {})
        for w in lv.get('walls', []):
            add('Wall', w['x'], w['y'], w['w'], w['h'], {})
        for s in lv.get('slopes', []):
            add('Slope', s['x'], s['y'], s['w'], s['h'], {'direction': s['direction']})
        for r in lv.get('ropes', []):
            add('Rope', r['anchorX'], r['anchorY'], 10, 10,
                {'length': r['length'], 'vineSkin': bool(r.get('vineSkin'))})
        for w in lv.get('water', []):
            add('Water', w['x'], w['y'], w['w'], w['h'], {})
        for ic in lv.get('icicles', []):
            add('Icicle', ic['x'], ic['y'], ic['w'], ic['h'], {})
        for sp in lv.get('springs', []):
            add('Spring', sp['x'], sp['y'], sp['w'], sp['h'], {'power': sp.get('power', 11)})
        for rk in lv.get('rocks', []):
            add('Rock', rk['x'], rk['y'], rk['w'], rk['h'], {})
        for g in lv.get('portcullis', []):
            fields = {'moveAxis': 'none', 'moveMin': 0, 'moveMax': 0, 'moveSpeed': 0, 'movePhase': 0}
            if g.get('move'):
                mv = g['move']
                fields.update({'moveAxis': mv['axis'], 'moveMin': mv['min'],
                               'moveMax': mv['max'], 'moveSpeed': mv['speed'],
                               'movePhase': mv['phase']})
            add('Portcullis', g['x'], g['y'], g['w'], g['h'], fields)
        for c in lv.get('cannons', []):
            add('Cannon', c['x'], c['y'], c['w'], c['h'], {
                'dir': 'left' if c.get('dir', 1) < 0 else 'right',
                'interval': c.get('interval', 90), 'speed': c.get('speed', 3.2),
                'r': c.get('r', 6), 'range': c.get('range', 260)})
        for f in lv.get('fishSpawners', []):
            if f.get('cruise'):
                variant, ex = 'cruise', f.get('x', (f['rangeMin'] + f['rangeMax']) / 2)
            elif f.get('spots'):
                variant, ex = 'spots', f['spots'][0]
            else:
                variant, ex = 'range', f['rangeMin']
            add('FishSpawner', ex, f['waterY'], 14, 14, {
                'variant': variant, 'spots': f.get('spots', []),
                'r': f.get('r', 12), 'jumpHeight': f.get('jumpHeight', 0),
                'jumpDuration': f.get('jumpDuration', 0), 'timer': f.get('timer', 0),
                'cooldownMin': f.get('cooldownMin', 0), 'cooldownMax': f.get('cooldownMax', 0),
                'rangeMin': f.get('rangeMin', 0), 'rangeMax': f.get('rangeMax', 0),
                'speed': f.get('speed', 0)})
        st = lv.get('start', {})
        sfields = {}
        if st.get('followPlatform') is not None:
            sfields['followRef'] = plat_iids[id(st['followPlatform'])]
        add('Start', st.get('x', 20), st.get('y', 274), 18, 26, sfields)
        g = lv.get('goal')
        if g:
            add('Goal', g['x'], g['y'], g['w'], g['h'], {})

        ident = re.sub(r'[^A-Za-z0-9_]', '_', lv.get('name', 'LEVEL_%d' % li))
        out_levels.append({
            'identifier': ident, 'iid': level_iid, 'uid': level_uid,
            'worldX': li * (LEVEL_W + 20), 'worldY': 0, 'worldDepth': 0,
            'pxWid': LEVEL_W, 'pxHei': LEVEL_H,
            '__bgColor': '#1A1A22', 'bgColor': None, 'useAutoIdentifier': False,
            'bgRelPath': None, 'bgPos': None, 'bgPivotX': 0.5, 'bgPivotY': 0.5,
            '__smartColor': '#ADADB5', '__bgPos': None, 'externalRelPath': None,
            'fieldInstances': [
                _fi('name', 'String', lv.get('name', ident), lf_uids['name']),
                _fi('theme', 'LocalEnum.Theme', lv.get('theme', 'dungeon'), lf_uids['theme']),
            ],
            'layerInstances': [{
                '__identifier': 'Entities', '__type': 'Entities',
                'iid': layer_iid, 'levelId': level_uid, 'layerDefUid': layer_uid,
                'pxOffsetX': 0, 'pxOffsetY': 0, 'visible': True,
                'optionalRules': [], '__cWid': LEVEL_W // GRID, '__cHei': LEVEL_H // GRID,
                '__gridSize': GRID, '__opacity': 1,
                '__pxTotalOffsetX': 0, '__pxTotalOffsetY': 0,
                '__tilesetDefUid': None, '__tilesetRelPath': None,
                'intGridCsv': [], 'autoLayerTiles': [], 'seed': 1234 + li,
                'overrideTilesetUid': None, 'gridTiles': [],
                'entityInstances': insts,
            }],
            '__neighbours': [],
        })

    project = {
        '__header__': {'fileType': 'LDtk Project JSON', 'app': 'LDtk',
                       'doc': 'https://ldtk.io/json',
                       'schema': 'https://ldtk.io/files/JSON_SCHEMA.json',
                       'appAuthor': "Sebastien 'deepnight' Benard",
                       'appVersion': '1.5.3', 'url': 'https://ldtk.io'},
        'iid': str(uuid.uuid4()), 'jsonVersion': '1.5.3', 'appBuildId': 473703,
        'nextUid': uid() + 1, 'identifierStyle': 'Free', 'toc': [],
        'worldLayout': 'LinearHorizontal',
        'worldGridWidth': LEVEL_W, 'worldGridHeight': LEVEL_H,
        'defaultLevelWidth': LEVEL_W, 'defaultLevelHeight': LEVEL_H,
        'defaultGridSize': GRID, 'defaultEntityWidth': 20, 'defaultEntityHeight': 20,
        'defaultPivotX': 0, 'defaultPivotY': 0,
        'bgColor': '#40465B', 'defaultLevelBgColor': '#1A1A22',
        'minifyJson': False, 'externalLevels': False,
        'exportTiled': False, 'simplifiedExport': False,
        'imageExportMode': 'None', 'exportLevelBg': False, 'pngFilePattern': None,
        'backupOnSave': False, 'backupLimit': 10, 'backupRelPath': None,
        'levelNamePattern': '%idx', 'flags': [], 'customCommands': [],
        'dummyWorldIid': world_iid, 'worlds': [],
        'defs': defs, 'levels': out_levels,
    }
    return project

# ---------------------------------------------------------------------------
# LDtk -> jatek-adat (import)
# ---------------------------------------------------------------------------

def _fields(inst):
    return {fi['__identifier']: fi['__value'] for fi in inst.get('fieldInstances', [])}


def read_ldtk(path):
    with open(path, 'r', encoding='utf-8') as fh:
        doc = json.load(fh)
    ld_levels = doc.get('levels') or []
    if not ld_levels and doc.get('worlds'):
        ld_levels = doc['worlds'][0].get('levels', [])
    levels = []
    for ld in ld_levels:
        lfields = {fi['__identifier']: fi['__value'] for fi in ld.get('fieldInstances', [])}
        layer = next((l for l in ld.get('layerInstances', []) if l['__identifier'] == 'Entities'), None)
        insts = layer['entityInstances'] if layer else []
        by_iid = {i['iid']: i for i in insts}
        lv = {'name': lfields.get('name') or ld['identifier'],
              'theme': lfields.get('theme') or 'dungeon',
              'platforms': [], 'spikes': [], 'saws': [], 'blades': [],
              'mosquitoSwarms': [], 'leeches': [], 'pendulums': [],
              'ladders': [], 'walls': [], 'slopes': [], 'ropes': [],
              'water': [], 'icicles': [], 'springs': [], 'rocks': [],
              'portcullis': [], 'cannons': [],
              'fishSpawners': [], 'start': None, 'goal': None}
        plat_by_iid = {}
        for i in insts:
            if i['__identifier'] != 'Platform':
                continue
            f = _fields(i)
            p = {'x': i['px'][0], 'y': i['px'][1], 'w': i['width'], 'h': i['height'],
                 'color': f.get('color') or '#3ee08a'}
            if (f.get('moveAxis') or 'none') != 'none':
                p['move'] = {'axis': f['moveAxis'], 'min': f.get('moveMin') or 0,
                             'max': f.get('moveMax') or 0, 'speed': f.get('moveSpeed') or 0.02,
                             'phase': f.get('movePhase') or 0}
            if f.get('sinkSpeed'):
                p['sink'] = {'restY': i['px'][1], 'maxY': f.get('sinkMaxY') or i['px'][1],
                             'speed': f['sinkSpeed'], 'active': False}
            if f.get('tiltSpeed'):
                p['tilt'] = {'maxAngle': f.get('tiltMaxAngle') or 0.1, 'speed': f['tiltSpeed']}
            if f.get('ice'):
                p['ice'] = True
            if f.get('crumble'):
                p['crumble'] = True
            lv['platforms'].append(p)
            plat_by_iid[i['iid']] = p
        for i in insts:
            ident = i['__identifier']
            f = _fields(i)
            x, y = i['px'][0], i['px'][1]
            w, h = i['width'], i['height']
            if ident == 'Spike':
                ref = f.get('followRef')
                if ref and ref.get('entityIid') in plat_by_iid:
                    base = plat_by_iid[ref['entityIid']]
                    lv['spikes'].append({'x': x, 'y': y, 'w': w, 'h': h,
                                         'follow': {'platform': base,
                                                    'offsetX': x - base['x'],
                                                    'offsetY': y - base['y']}})
                else:
                    lv['spikes'].append({'x': x, 'y': y, 'w': w, 'h': h})
            elif ident == 'Saw':
                lv['saws'].append({'cx': x, 'cy': y, 'r': f.get('r') or 13,
                                   'axis': f.get('axis') or 'x',
                                   'min': f.get('min') if f.get('min') is not None else 0,
                                   'max': f.get('max') or 100,
                                   'speed': f.get('speed') or 0.05, 'phase': f.get('phase') or 0})
            elif ident == 'Pendulum':
                lv['pendulums'].append({'anchorX': x, 'anchorY': y,
                                        'length': f.get('length') or 130,
                                        'minAngle': f.get('minAngle') or -0.7,
                                        'maxAngle': f.get('maxAngle') or 0.7,
                                        'speed': f.get('speed') or 0.035,
                                        'phase': f.get('phase') or 0, 'r': f.get('r') or 13})
            elif ident == 'MosquitoSwarm':
                lv['mosquitoSwarms'].append({'x': x, 'y': y, 'r': f.get('r') or 16,
                                             'ampX': f.get('ampX') or 10, 'ampY': f.get('ampY') or 8,
                                             'speedX': f.get('speedX') or 0.05,
                                             'speedY': f.get('speedY') or 0.05,
                                             'phaseX': f.get('phaseX') or 0,
                                             'phaseY': f.get('phaseY') or 0})
            elif ident == 'Leech':
                lv['leeches'].append({'x': x, 'y': y, 'w': w, 'h': h})
            elif ident == 'Ladder':
                lv['ladders'].append({'x': x, 'y': y, 'w': w, 'h': h})
            elif ident == 'Wall':
                lv['walls'].append({'x': x, 'y': y, 'w': w, 'h': h})
            elif ident == 'Slope':
                lv['slopes'].append({'x': x, 'y': y, 'w': w, 'h': h,
                                     'direction': f.get('direction') or 'up'})
            elif ident == 'Rope':
                lv['ropes'].append({'anchorX': x, 'anchorY': y,
                                    'length': f.get('length') or 110,
                                    'vineSkin': bool(f.get('vineSkin'))})
            elif ident == 'Water':
                lv['water'].append({'x': x, 'y': y, 'w': w, 'h': h})
            elif ident == 'Icicle':
                lv['icicles'].append({'x': x, 'y': y, 'w': w, 'h': h})
            elif ident == 'Spring':
                lv['springs'].append({'x': x, 'y': y, 'w': w, 'h': h,
                                      'power': f.get('power') or 11})
            elif ident == 'Rock':
                lv['rocks'].append({'x': x, 'y': y, 'w': w, 'h': h})
            elif ident == 'Portcullis':
                g = {'x': x, 'y': y, 'w': w, 'h': h}
                if (f.get('moveAxis') or 'none') != 'none':
                    g['move'] = {'axis': f['moveAxis'], 'min': f.get('moveMin') or 0,
                                 'max': f.get('moveMax') or 0, 'speed': f.get('moveSpeed') or 0.02,
                                 'phase': f.get('movePhase') or 0}
                lv['portcullis'].append(g)
            elif ident == 'Cannon':
                lv['cannons'].append({'x': x, 'y': y, 'w': w, 'h': h,
                                      'dir': -1 if (f.get('dir') or 'right') == 'left' else 1,
                                      'interval': f.get('interval') or 90,
                                      'speed': f.get('speed') or 3.2,
                                      'r': f.get('r') or 6,
                                      'range': f.get('range') or 260})
            elif ident == 'FishSpawner':
                variant = f.get('variant') or 'range'
                fs = {'waterY': y, 'r': f.get('r') or 12}
                if variant == 'cruise':
                    fs.update({'cruise': True, 'x': x,
                               'rangeMin': f.get('rangeMin') if f.get('rangeMin') is not None else 100,
                               'rangeMax': f.get('rangeMax') or 300,
                               'speed': f.get('speed') or 0.02, 'phase': 0})
                else:
                    if variant == 'spots':
                        fs['spots'] = f.get('spots') or [x]
                    else:
                        fs.update({'rangeMin': f.get('rangeMin') if f.get('rangeMin') is not None else 100,
                                   'rangeMax': f.get('rangeMax') or 300})
                    fs.update({'jumpHeight': f.get('jumpHeight') or 90,
                               'jumpDuration': f.get('jumpDuration') or 42,
                               'timer': f.get('timer') or 60,
                               'cooldownMin': f.get('cooldownMin') or 70,
                               'cooldownMax': f.get('cooldownMax') or 100,
                               'active': False, 'phase': 0})
                lv['fishSpawners'].append(fs)
            elif ident == 'Start':
                st = {'x': x, 'y': y}
                ref = f.get('followRef')
                if ref and ref.get('entityIid') in plat_by_iid:
                    st['followPlatform'] = plat_by_iid[ref['entityIid']]
                lv['start'] = st
            elif ident == 'Goal':
                lv['goal'] = {'x': x, 'y': y, 'w': w, 'h': h}
        if lv['start'] is None:
            lv['start'] = {'x': 20, 'y': 274}
        if lv['goal'] is None:
            lv['goal'] = {'x': 560, 'y': 260, 'w': 30, 'h': 40}
        levels.append(lv)
    return levels

# ---------------------------------------------------------------------------
# Jatek-adat -> JS kod generalas
# ---------------------------------------------------------------------------

def fmt_num(v):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, float):
        if v == int(v) and abs(v) < 1e15:
            return str(int(v))
        return repr(round(v, 6))
    return str(v)


def js_value(v, refs):
    if isinstance(v, dict):
        if id(v) in refs:
            return refs[id(v)]
        return '{ ' + ', '.join('%s: %s' % (k, js_value(x, refs)) for k, x in v.items()) + ' }'
    if isinstance(v, list):
        return '[' + ', '.join(js_value(x, refs) for x in v) + ']'
    if isinstance(v, str):
        return "'" + v.replace("'", "\\'") + "'"
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if v is None:
        return 'null'
    return fmt_num(v)


def generate_js(levels):
    refs = {}
    decls = []
    counter = [0]
    for lv in levels:
        referenced = set()
        for s in lv.get('spikes', []):
            if s.get('follow'):
                referenced.add(id(s['follow']['platform']))
        st = lv.get('start', {})
        if st.get('followPlatform') is not None:
            referenced.add(id(st['followPlatform']))
        for p in lv.get('platforms', []):
            if id(p) in referenced and id(p) not in refs:
                name = 'sharedP%d' % counter[0]
                counter[0] += 1
                literal = js_value(p, {})
                refs[id(p)] = name
                decls.append('    var %s = %s;' % (name, literal))

    lvl_texts = []
    for lv in levels:
        lines = ['      {']
        lines.append("        name: %s," % js_value(lv['name'], refs))
        lines.append("        theme: %s," % js_value(lv['theme'], refs))
        st = dict(lv['start'])
        fp = st.pop('followPlatform', None)
        st_inner = 'x: %s, y: %s' % (fmt_num(st['x']), fmt_num(st['y']))
        if fp is not None:
            st_inner += ', followPlatform: %s' % refs[id(fp)]
        lines.append('        start: { %s },' % st_inner)
        for key in ('platforms', 'spikes', 'saws', 'blades', 'mosquitoSwarms',
                    'leeches', 'pendulums', 'ladders', 'walls', 'slopes',
                    'ropes', 'water', 'icicles', 'springs', 'rocks',
                    'portcullis', 'cannons', 'fishSpawners'):
            items = lv.get(key, [])
            if key == 'ropes':
                items = [dict(r, angle=0, angVel=0) for r in items]
                for r in items:
                    if not r.get('vineSkin'):
                        r.pop('vineSkin', None)
            if not items:
                lines.append('        %s: [],' % key)
            else:
                lines.append('        %s: [' % key)
                for it in items:
                    lines.append('          %s,' % js_value(it, refs))
                lines[-1] = lines[-1].rstrip(',')
                lines.append('        ],')
        lines.append('        goal: %s' % js_value(lv['goal'], refs))
        lines.append('      }')
        lvl_texts.append('\n'.join(lines))

    body = []
    body.append('function buildLevels() {')
    body.append('    // === LDTK GENERATED LEVELS START (forras: splat_levels.ldtk - ne szerkeszd kezzel) ===')
    body.extend(decls)
    body.append('    return [')
    body.append(',\n'.join(lvl_texts))
    body.append('    ];')
    body.append('    // === LDTK GENERATED LEVELS END ===')
    body.append('}')
    return '\n'.join(body)


def splice_into_html(html, new_fn):
    start, end, _ = extract_build_levels(html)
    line_start = html.rfind('\n', 0, start) + 1
    return html[:line_start] + new_fn + html[end:]

# ---------------------------------------------------------------------------
# Parancsok
# ---------------------------------------------------------------------------

def cmd_export_ldtk():
    with open(LEVELS_JS_PATH, 'r', encoding='utf-8') as fh:
        js = fh.read()
    levels = parse_levels_from_html(js)
    print('Beolvasva %d palya a levels.js-bol.' % len(levels))
    project = export_ldtk(levels)
    with open(LDTK_PATH, 'w', encoding='utf-8') as fh:
        json.dump(project, fh, indent=1)
    with open(SNAPSHOT_PATH, 'w', encoding='utf-8') as fh:
        json.dump(normalize_levels(levels), fh, indent=1, sort_keys=True)
    print('Kiirva: %s (+ pillanatkep: %s)' % (LDTK_PATH, SNAPSHOT_PATH))


def cmd_import(force=False):
    levels = read_ldtk(LDTK_PATH)
    print('Beolvasva %d palya az LDtk projektbol.' % len(levels))
    if os.path.exists(SNAPSHOT_PATH) and not force:
        with open(SNAPSHOT_PATH, 'r', encoding='utf-8') as fh:
            canon = fh.read()
        current = json.dumps(normalize_levels(levels), indent=1, sort_keys=True)
        if canon.strip() == current.strip():
            print('Ellenorzes: a palya-adatok szemantikusan AZONOSAK a pillanatkeppel. OK.')
        else:
            print('Megjegyzes: a palya-adatok elternek a pillanatkeptol (ez szerkesztes utan normalis).')
    new_fn = generate_js(levels)
    with open(LEVELS_JS_PATH, 'r', encoding='utf-8') as fh:
        js = fh.read()
    js = splice_into_html(js, new_fn)
    with open(LEVELS_JS_PATH, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('buildLevels() ujrageneralva: levels.js')


def cmd_verify():
    """Kor-ellenorzes irs nelkul: ldtk -> normalizalt vs pillanatkep."""
    levels = read_ldtk(LDTK_PATH)
    with open(SNAPSHOT_PATH, 'r', encoding='utf-8') as fh:
        canon = json.loads(fh.read())
    current = json.loads(json.dumps(normalize_levels(levels)))
    canon_s = json.dumps(canon, indent=1, sort_keys=True)
    current_s = json.dumps(current, indent=1, sort_keys=True)
    if canon_s == current_s:
        print('VERIFY OK: veszteseg nelkuli kor.')
        return 0
    import difflib
    diff = list(difflib.unified_diff(canon_s.splitlines(), current_s.splitlines(),
                                     'canonical', 'ldtk-import', lineterm=''))
    print('\n'.join(diff[:120]))
    print('VERIFY FAILED: %d diff sor.' % len(diff))
    return 1


if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] not in ('export-ldtk', 'import', 'verify'):
        print(__doc__)
        sys.exit(2)
    if sys.argv[1] == 'export-ldtk':
        cmd_export_ldtk()
    elif sys.argv[1] == 'verify':
        sys.exit(cmd_verify())
    else:
        cmd_import(force='--force' in sys.argv)
