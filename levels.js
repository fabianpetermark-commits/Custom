// Auto-generated / kezelt a splat_levels.ldtk-bol (import_levels.py).
// Ne szerkeszd kezzel -- lasd PALYA_SZERKESZTES.md.

function buildLevels() {
    // === LDTK GENERATED LEVELS START (forras: splat_levels.ldtk - ne szerkeszd kezzel) ===
    var sharedP0 = { x: 220, y: 300, w: 100, h: 44, color: '#3ee08a', move: { axis: 'x', min: 180, max: 280, speed: 0.02, phase: 0 } };
    var sharedP1 = { x: 250, y: 230, w: 90, h: 18, color: '#3ee08a', move: { axis: 'x', min: 190, max: 280, speed: 0.025, phase: 0 }, tilt: { maxAngle: 0.12, speed: 0.03 } };
    var sharedP2 = { x: 230, y: 300, w: 90, h: 36, color: '#3ee08a', move: { axis: 'y', min: 250, max: 320, speed: 0.03, phase: 0.8 } };
    var sharedP3 = { x: 200, y: 300, w: 90, h: 36, color: '#3ee08a', move: { axis: 'y', min: 255, max: 305, speed: 0.035, phase: 0.4 } };
    return [
      {
        name: 'BEVEZETES',
        theme: 'dungeon',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 120, h: 20, color: '#3ee08a' },
          { x: 170, y: 235, w: 90, h: 20, color: '#3ee08a' },
          { x: 295, y: 300, w: 90, h: 20, color: '#3ee08a' },
          { x: 450, y: 240, w: 110, h: 20, color: '#3ee08a' }
        ],
        spikes: [
          { x: 70, y: 288, w: 25, h: 12 }
        ],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 120, y: 320, w: 480, h: 20 }
        ],
        icicles: [],
        springs: [],
        rocks: [],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 560, y: 200, w: 30, h: 40 }
      },
      {
        name: 'FURESZEK',
        theme: 'dungeon',
        start: { x: 20, y: 294 },
        platforms: [
          { x: 0, y: 320, w: 90, h: 20, color: '#3ee08a' },
          { x: 140, y: 300, w: 60, h: 20, color: '#3ee08a' },
          { x: 140, y: 150, w: 60, h: 16, color: '#3ee08a' },
          { x: 220, y: 270, w: 30, h: 10, color: '#3ee08a' },
          { x: 220, y: 210, w: 30, h: 10, color: '#3ee08a' },
          { x: 220, y: 150, w: 30, h: 10, color: '#3ee08a' },
          { x: 280, y: 60, w: 120, h: 16, color: '#f7c948' },
          { x: 460, y: 100, w: 140, h: 20, color: '#6ce0ff' }
        ],
        spikes: [
          { x: 180, y: 138, w: 20, h: 12 }
        ],
        saws: [
          { cx: 0, cy: 190, r: 11, axis: 'x', min: 225, max: 265, speed: 0.06, phase: 0 },
          { cx: 0, cy: 70, r: 13, axis: 'x', min: 460, max: 560, speed: 0.05, phase: 0 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [
          { x: 160, y: 150, w: 18, h: 150 }
        ],
        walls: [
          { x: 280, y: 76, w: 15, h: 94 },
          { x: 340, y: 76, w: 15, h: 94 }
        ],
        slopes: [],
        ropes: [],
        water: [],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 10 },
          { x: 0, y: 10, w: 20, h: 284 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 540, y: 60, w: 30, h: 40 }
      },
      {
        name: 'TORONY',
        theme: 'dungeon',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 380, h: 40, color: '#3ee08a' },
          { x: 460, y: 130, w: 140, h: 20, color: '#6ce0ff' }
        ],
        spikes: [
          { x: 520, y: 118, w: 40, h: 12 }
        ],
        saws: [
          { cx: 150, cy: 288, r: 13, axis: 'x', min: 100, max: 210, speed: 0.045, phase: 1 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [
          { anchorX: 230, anchorY: 30, length: 150, minAngle: -0.85, maxAngle: 0.85, speed: 0.035, phase: 0, r: 14 }
        ],
        ladders: [
          { x: 280, y: 60, w: 20, h: 240 }
        ],
        walls: [
          { x: 345, y: 150, w: 15, h: 150 }
        ],
        slopes: [],
        ropes: [],
        water: [
          { x: 380, y: 310, w: 220, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 20 },
          { x: 0, y: 20, w: 20, h: 254 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 312, r: 11, cruise: true, x: 480, rangeMin: 395, rangeMax: 585, speed: 0.02, phase: 0 }
        ],
        goal: { x: 450, y: 90, w: 30, h: 40 }
      },
      {
        name: 'KOTELHINTA',
        theme: 'dungeon',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 140, h: 40, color: '#3ee08a' },
          sharedP0,
          { x: 300, y: 220, w: 20, h: 16, color: '#6ce0ff' },
          { x: 375, y: 220, w: 20, h: 16, color: '#6ce0ff' },
          { x: 420, y: 300, w: 90, h: 20, color: '#3ee08a' },
          { x: 560, y: 235, w: 40, h: 20, color: '#3ee08a' }
        ],
        spikes: [
          { x: 258, y: 288, w: 24, h: 12, follow: { platform: sharedP0, offsetX: 38, offsetY: -12 } }
        ],
        saws: [
          { cx: 390, cy: 0, r: 13, axis: 'y', min: 170, max: 280, speed: 0.045, phase: 0 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [
          { anchorX: 290, anchorY: 25, length: 165, vineSkin: true, angle: 0, angVel: 0 }
        ],
        water: [
          { x: 140, y: 310, w: 300, h: 30 },
          { x: 510, y: 310, w: 50, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 16 },
          { x: 0, y: 16, w: 20, h: 258 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 310, r: 12, rangeMin: 410, rangeMax: 410, jumpHeight: 75, jumpDuration: 40, timer: 90, cooldownMin: 90, cooldownMax: 210, active: false, phase: 0 }
        ],
        goal: { x: 560, y: 195, w: 30, h: 40 }
      },
      {
        name: 'FINALE',
        theme: 'dungeon',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 100, h: 40, color: '#3ee08a' },
          { x: 220, y: 300, w: 100, h: 40, color: '#3ee08a' },
          { x: 480, y: 240, w: 120, h: 60, color: '#6ce0ff' },
          { x: 340, y: 260, w: 80, h: 20, color: '#f7c948', move: { axis: 'x', min: 340, max: 420, speed: 0.028, phase: 0 } }
        ],
        spikes: [
          { x: 280, y: 288, w: 40, h: 12 }
        ],
        saws: [
          { cx: 540, cy: 200, r: 13, axis: 'x', min: 500, max: 580, speed: 0.05, phase: 0 },
          { cx: 460, cy: 0, r: 12, axis: 'y', min: 14, max: 130, speed: 0.045, phase: 0.5 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [
          { anchorX: 420, anchorY: 0, length: 170, minAngle: -0.5, maxAngle: 0.5, speed: 0.035, phase: 0, r: 13 }
        ],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 100, y: 310, w: 120, h: 30 },
          { x: 320, y: 310, w: 160, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 16 },
          { x: 0, y: 16, w: 20, h: 258 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 310, r: 11, rangeMin: 120, rangeMax: 200, jumpHeight: 65, jumpDuration: 36, timer: 70, cooldownMin: 80, cooldownMax: 190, active: false, phase: 0 }
        ],
        goal: { x: 560, y: 200, w: 30, h: 40 }
      },
      {
        name: 'INGOVANY',
        theme: 'rainforest',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 100, h: 40, color: '#3ee08a' },
          { x: 170, y: 300, w: 90, h: 40, color: '#3ee08a', sink: { restY: 300, maxY: 316, speed: 0.6, active: false } },
          { x: 330, y: 300, w: 90, h: 40, color: '#3ee08a' },
          { x: 490, y: 235, w: 110, h: 20, color: '#f7c948' }
        ],
        spikes: [
          { x: 375, y: 288, w: 30, h: 12 }
        ],
        saws: [
          { cx: 330, cy: 280, r: 13, axis: 'y', min: 258, max: 300, speed: 0.05, phase: 0 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [
          { x: 250, y: 280, w: 20, h: 20, direction: 'up' }
        ],
        ropes: [],
        water: [
          { x: 100, y: 310, w: 70, h: 30 },
          { x: 260, y: 310, w: 70, h: 30 },
          { x: 420, y: 310, w: 70, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 310, r: 12, spots: [135, 295, 455], jumpHeight: 90, jumpDuration: 42, timer: 60, cooldownMin: 110, cooldownMax: 170, active: false, phase: 0 }
        ],
        goal: { x: 560, y: 195, w: 30, h: 40 }
      },
      {
        name: 'LOMBKORONA',
        theme: 'rainforest',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 110, h: 40, color: '#3ee08a' },
          sharedP1,
          { x: 375, y: 170, w: 90, h: 20, color: '#f7c948' },
          { x: 500, y: 100, w: 100, h: 20, color: '#6ce0ff' }
        ],
        spikes: [
          { x: 285, y: 218, w: 20, h: 12, follow: { platform: sharedP1, offsetX: 35, offsetY: -12 } }
        ],
        saws: [
          { cx: 460, cy: 130, r: 13, axis: 'y', min: 100, max: 170, speed: 0.05, phase: 0 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 110, y: 310, w: 490, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 312, r: 11, cruise: true, x: 300, rangeMin: 150, rangeMax: 550, speed: 0.018, phase: 0 }
        ],
        goal: { x: 560, y: 60, w: 30, h: 40 }
      },
      {
        name: 'PIOCAS MOCSAR',
        theme: 'rainforest',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 90, h: 40, color: '#3ee08a' },
          sharedP2,
          { x: 420, y: 240, w: 80, h: 20, color: '#f7c948' },
          { x: 480, y: 210, w: 40, h: 16, color: '#3ee08a' },
          { x: 540, y: 180, w: 60, h: 20, color: '#6ce0ff' }
        ],
        spikes: [
          { x: 263, y: 288, w: 24, h: 12, follow: { platform: sharedP2, offsetX: 33, offsetY: -12 } },
          { x: 460, y: 228, w: 30, h: 12 }
        ],
        saws: [
          { cx: 500, cy: 170, r: 13, axis: 'x', min: 460, max: 540, speed: 0.05, phase: 0 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [
          { x: 405, y: 224, w: 16, h: 16 }
        ],
        pendulums: [
          { anchorX: 160, anchorY: 30, length: 150, minAngle: -0.75, maxAngle: 0.75, speed: 0.035, phase: 0, r: 13 }
        ],
        ladders: [],
        walls: [],
        slopes: [
          { x: 400, y: 240, w: 20, h: 20, direction: 'up' }
        ],
        ropes: [],
        water: [
          { x: 90, y: 310, w: 510, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 312, r: 12, cruise: true, x: 300, rangeMin: 100, rangeMax: 520, speed: 0.022, phase: 0 },
          { waterY: 310, r: 12, spots: [240, 460], jumpHeight: 95, jumpDuration: 44, timer: 65, cooldownMin: 100, cooldownMax: 160, active: false, phase: 0 }
        ],
        goal: { x: 560, y: 140, w: 30, h: 40 }
      },
      {
        name: 'ODU',
        theme: 'rainforest',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 140, h: 40, color: '#3ee08a' },
          { x: 0, y: 110, w: 130, h: 20, color: '#3ee08a' },
          { x: 380, y: 110, w: 100, h: 20, color: '#f7c948' },
          { x: 380, y: 20, w: 220, h: 20, color: '#6ce0ff' }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [
          { anchorX: 500, anchorY: 0, length: 70, minAngle: -0.6, maxAngle: 0.6, speed: 0.05, phase: 0, r: 12 }
        ],
        ladders: [
          { x: 50, y: 110, w: 18, h: 190 }
        ],
        walls: [
          { x: 430, y: 20, w: 15, h: 90 }
        ],
        slopes: [],
        ropes: [
          { anchorX: 255, anchorY: 20, length: 110, vineSkin: true, angle: 0, angVel: 0 }
        ],
        water: [
          { x: 140, y: 310, w: 460, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 540, y: -20, w: 30, h: 40 }
      },
      {
        name: 'VADON FINALE',
        theme: 'rainforest',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 90, h: 40, color: '#3ee08a' },
          sharedP3,
          { x: 360, y: 190, w: 90, h: 20, color: '#f7c948' },
          { x: 430, y: 150, w: 20, h: 16, color: '#6ce0ff' },
          { x: 500, y: 90, w: 100, h: 60, color: '#6ce0ff' }
        ],
        spikes: [
          { x: 233, y: 288, w: 24, h: 12, follow: { platform: sharedP3, offsetX: 33, offsetY: -12 } },
          { x: 400, y: 178, w: 30, h: 12 }
        ],
        saws: [
          { cx: 520, cy: 60, r: 12, axis: 'y', min: 20, max: 95, speed: 0.045, phase: 0.3 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [
          { anchorX: 150, anchorY: 30, length: 140, minAngle: -0.8, maxAngle: 0.8, speed: 0.04, phase: 0.5, r: 13 }
        ],
        ladders: [],
        walls: [],
        slopes: [
          { x: 340, y: 190, w: 20, h: 20, direction: 'up' }
        ],
        ropes: [
          { anchorX: 475, anchorY: 20, length: 110, vineSkin: true, angle: 0, angVel: 0 }
        ],
        water: [
          { x: 90, y: 310, w: 510, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 310, r: 12, spots: [135, 290], jumpHeight: 95, jumpDuration: 44, timer: 60, cooldownMin: 90, cooldownMax: 150, active: false, phase: 0 },
          { waterY: 312, r: 11, cruise: true, x: 480, rangeMin: 400, rangeMax: 560, speed: 0.02, phase: 0 }
        ],
        goal: { x: 560, y: 50, w: 30, h: 40 }
      },
      {
        name: 'HOMEZO',
        theme: 'ice',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 140, h: 20, color: '#8a99aa' },
          { x: 200, y: 300, w: 180, h: 20, color: '#9fd4ee', ice: true },
          { x: 440, y: 300, w: 160, h: 20, color: '#8a99aa' },
          { x: 250, y: 150, w: 80, h: 16, color: '#8a99aa' },
          { x: 520, y: 190, w: 80, h: 16, color: '#9fd4ee', ice: true }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 140, y: 310, w: 60, h: 30 },
          { x: 380, y: 310, w: 60, h: 30 }
        ],
        icicles: [
          { x: 284, y: 166, w: 12, h: 24 }
        ],
        springs: [
          { x: 500, y: 288, w: 24, h: 12, power: 12 }
        ],
        rocks: [
          { x: 0, y: 0, w: 600, h: 18 },
          { x: 0, y: 18, w: 20, h: 256 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 560, y: 260, w: 30, h: 40 }
      },
      {
        name: 'JEGPARKANY',
        theme: 'ice',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 120, h: 20, color: '#8a99aa' },
          { x: 170, y: 260, w: 90, h: 16, color: '#9fd4ee', ice: true },
          { x: 310, y: 220, w: 90, h: 16, color: '#9fd4ee', ice: true },
          { x: 450, y: 260, w: 90, h: 16, color: '#9fd4ee', ice: true },
          { x: 550, y: 300, w: 50, h: 20, color: '#8a99aa' },
          { x: 430, y: 120, w: 70, h: 16, color: '#8a99aa' }
        ],
        spikes: [
          { x: 310, y: 208, w: 30, h: 12 }
        ],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 120, y: 310, w: 430, h: 30 }
        ],
        icicles: [
          { x: 458, y: 136, w: 12, h: 24 }
        ],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 18 },
          { x: 0, y: 18, w: 20, h: 256 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 560, y: 260, w: 30, h: 40 }
      },
      {
        name: 'JEGCSAP_FOLYOSO',
        theme: 'ice',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 110, h: 20, color: '#8a99aa' },
          { x: 140, y: 220, w: 280, h: 16, color: '#9fd4ee', ice: true },
          { x: 490, y: 300, w: 110, h: 20, color: '#8a99aa' }
        ],
        spikes: [
          { x: 520, y: 288, w: 30, h: 12 }
        ],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 110, y: 310, w: 380, h: 30 }
        ],
        icicles: [
          { x: 180, y: 236, w: 12, h: 24 },
          { x: 260, y: 236, w: 12, h: 24 },
          { x: 340, y: 236, w: 12, h: 24 },
          { x: 400, y: 236, w: 12, h: 24 }
        ],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 18 },
          { x: 0, y: 18, w: 20, h: 256 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 560, y: 260, w: 30, h: 40 }
      },
      {
        name: 'FAGYOS_TORONY',
        theme: 'ice',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 240, h: 20, color: '#8a99aa' },
          { x: 60, y: 180, w: 120, h: 16, color: '#8a99aa' },
          { x: 140, y: 80, w: 140, h: 16, color: '#9fd4ee', ice: true },
          { x: 340, y: 80, w: 120, h: 16, color: '#9fd4ee', ice: true },
          { x: 500, y: 200, w: 100, h: 16, color: '#8a99aa' }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [
          { anchorX: 400, anchorY: 0, length: 60, minAngle: -0.5, maxAngle: 0.5, speed: 0.04, phase: 0, r: 12 }
        ],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 240, y: 310, w: 360, h: 30 }
        ],
        icicles: [
          { x: 210, y: 96, w: 12, h: 24 }
        ],
        springs: [
          { x: 180, y: 288, w: 24, h: 12, power: 12 },
          { x: 140, y: 168, w: 24, h: 12, power: 12 }
        ],
        rocks: [
          { x: 0, y: 0, w: 600, h: 6 },
          { x: 0, y: 6, w: 20, h: 268 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 560, y: 160, w: 30, h: 40 }
      },
      {
        name: 'ZUZMARA_FINALE',
        theme: 'ice',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 100, h: 20, color: '#8a99aa' },
          { x: 140, y: 300, w: 90, h: 36, color: '#9fd4ee', move: { axis: 'x', min: 140, max: 230, speed: 0.025, phase: 0 }, ice: true },
          { x: 310, y: 300, w: 120, h: 40, color: '#9fd4ee', ice: true },
          { x: 470, y: 220, w: 130, h: 16, color: '#9fd4ee', ice: true },
          { x: 460, y: 100, w: 80, h: 16, color: '#8a99aa' }
        ],
        spikes: [
          { x: 365, y: 288, w: 30, h: 12 }
        ],
        saws: [
          { cx: 560, cy: 0, r: 12, axis: 'y', min: 140, max: 260, speed: 0.05, phase: 0 }
        ],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 100, y: 310, w: 500, h: 30 }
        ],
        icicles: [
          { x: 480, y: 116, w: 12, h: 24 },
          { x: 516, y: 116, w: 12, h: 24 }
        ],
        springs: [
          { x: 318, y: 288, w: 24, h: 12, power: 12 }
        ],
        rocks: [
          { x: 0, y: 0, w: 600, h: 18 },
          { x: 0, y: 18, w: 20, h: 256 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [
          { waterY: 310, r: 12, spots: [120, 270], jumpHeight: 85, jumpDuration: 42, timer: 70, cooldownMin: 90, cooldownMax: 150, active: false, phase: 0 }
        ],
        goal: { x: 560, y: 180, w: 30, h: 40 }
      },
      {
        name: 'VARUDVAR_BEJARAT',
        theme: 'castle',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 100, h: 20, color: '#8f8474' },
          { x: 150, y: 235, w: 90, h: 20, color: '#8f8474' },
          { x: 290, y: 170, w: 90, h: 20, color: '#8f8474' },
          { x: 470, y: 260, w: 100, h: 20, color: '#8f8474', crumble: true }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 100, y: 310, w: 500, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 20 },
          { x: 0, y: 20, w: 20, h: 254 }
        ],
        portcullis: [],
        cannons: [],
        fishSpawners: [],
        goal: { x: 540, y: 220, w: 30, h: 40 }
      },
      {
        name: 'RACS_UDVAR',
        theme: 'castle',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 150, h: 20, color: '#8f8474' },
          { x: 200, y: 235, w: 400, h: 20, color: '#8f8474' }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 150, y: 310, w: 50, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 20 },
          { x: 0, y: 20, w: 20, h: 254 }
        ],
        portcullis: [
          { x: 380, y: 20, w: 20, h: 215, move: { axis: 'y', min: -195, max: 20, speed: 0.02, phase: 0 } }
        ],
        cannons: [],
        fishSpawners: [],
        goal: { x: 560, y: 195, w: 30, h: 40 }
      },
      {
        name: 'AGYU_FOLYOSO',
        theme: 'castle',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 140, h: 20, color: '#8f8474' },
          { x: 190, y: 235, w: 410, h: 20, color: '#8f8474' }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 140, y: 310, w: 50, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 20 },
          { x: 0, y: 20, w: 20, h: 254 }
        ],
        portcullis: [],
        cannons: [
          { x: 450, y: 219, w: 20, h: 16, dir: -1, interval: 100, speed: 3.5, r: 6, range: 250 }
        ],
        fishSpawners: [],
        goal: { x: 560, y: 195, w: 30, h: 40 }
      },
      {
        name: 'VAR_FOLYOSO',
        theme: 'castle',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 120, h: 20, color: '#8f8474' },
          { x: 170, y: 235, w: 90, h: 20, color: '#8f8474' },
          { x: 330, y: 235, w: 90, h: 20, color: '#8f8474', crumble: true },
          { x: 470, y: 170, w: 130, h: 20, color: '#8f8474' }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 120, y: 310, w: 480, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 20 },
          { x: 0, y: 20, w: 20, h: 254 }
        ],
        portcullis: [
          { x: 500, y: 20, w: 20, h: 150, move: { axis: 'y', min: -130, max: 20, speed: 0.022, phase: 0.8 } }
        ],
        cannons: [
          { x: 540, y: 154, w: 20, h: 16, dir: -1, interval: 100, speed: 3.5, r: 6, range: 60 }
        ],
        fishSpawners: [],
        goal: { x: 570, y: 130, w: 30, h: 40 }
      },
      {
        name: 'VAR_FINALE',
        theme: 'castle',
        start: { x: 20, y: 274 },
        platforms: [
          { x: 0, y: 300, w: 90, h: 20, color: '#8f8474' },
          { x: 130, y: 235, w: 90, h: 20, color: '#8f8474', crumble: true },
          { x: 260, y: 170, w: 90, h: 20, color: '#8f8474' },
          { x: 440, y: 260, w: 150, h: 20, color: '#8f8474' }
        ],
        spikes: [],
        saws: [],
        blades: [],
        mosquitoSwarms: [],
        leeches: [],
        pendulums: [],
        ladders: [],
        walls: [],
        slopes: [],
        ropes: [],
        water: [
          { x: 90, y: 310, w: 500, h: 30 }
        ],
        icicles: [],
        springs: [],
        rocks: [
          { x: 0, y: 0, w: 600, h: 20 },
          { x: 0, y: 20, w: 20, h: 254 }
        ],
        portcullis: [
          { x: 460, y: 20, w: 20, h: 240, move: { axis: 'y', min: -220, max: 20, speed: 0.025, phase: 1.5 } }
        ],
        cannons: [
          { x: 520, y: 244, w: 20, h: 16, dir: -1, interval: 100, speed: 3.5, r: 6, range: 60 }
        ],
        fishSpawners: [],
        goal: { x: 560, y: 220, w: 30, h: 40 }
      }
    ];
    // === LDTK GENERATED LEVELS END ===
}
