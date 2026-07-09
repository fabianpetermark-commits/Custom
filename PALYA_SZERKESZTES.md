# Splat Run — pályák szerkesztése LDtk-ban

## Első lépés (egyszeri)

1. Töltsd le és telepítsd az **LDtk**-t: https://ldtk.io (ingyenes).
2. Nyisd meg a `splat_levels.ldtk` fájlt az LDtk-ban.

## Szerkesztés

- Bal oldalon látod mind a 15 pályát (a Worlds/Levels listában).
- Az entitás-paletta jobb oldalon: `Platform`, `Spike`, `Saw`, `Pendulum`, `MosquitoSwarm`, `Leech`, `Ladder`, `Wall`, `Slope`, `Rope`, `Water`, `Icicle`, `Spring`, `FishSpawner`, `Start`, `Goal`.
- Jégvilág elemek: a `Platform` `ice` pipája csúszóssá teszi; az `Icicle` a plafonról lóg és leesik, ha a játékos alá ér; a `Spring` felfelé repít (`power` mező, alap 11 — 12-vel ~145px magasra dob).
- A pálya `theme` mezője (bal alsó panel a pályán): `dungeon`, `rainforest` vagy `ice` — ez adja a hátteret és a platformok kinézetét.
- Teszteléshez: a játék URL-je mögé írt `#palya=12` azzal a pályával indítja az új játékot.
- Húzd be az entitást a pályára, méretezd (ha átméretezhető), és a bal alsó mezőkben állítsd be a paramétereit (pl. `Saw`-nál `r`, `axis`, `min`, `max`, `speed`, `phase`).
- **Ha egy mezőt nem töltesz ki**, a betöltés értelmes alapértéket ad neki (pl. egy fűrész sugara automatikusan 13 lesz) — nem lesz "láthatatlan/nulla" elem.
- A `Spike` entitásnak van egy `followRef` mezője — ezzel egy mozgó `Platform`-hoz köthető (a tüske együtt mozog vele). Csak akkor add meg, ha kell.
- Mentsd el (Ctrl+S) az LDtk-ban.

## Játékba importálás

Nyiss egy terminált a `Splat` mappában, és futtasd:

```
python import_levels.py import
```

Ez frissíti a `splat_run.html` és `index.html` fájlokat a szerkesztett pályákkal. Ezután nyisd meg a `splat_run.html`-t böngészőben, és próbáld ki.

## Ha végleges

Szólj Claude-nak, hogy publikálja (commit + push a GitHub Pages oldalra).

## Egyéb parancsok

- `python import_levels.py export-ldtk` — a jelenlegi `splat_run.html`-ből újra legenerálja az `.ldtk` fájlt (csak akkor kell, ha valamiért teljesen elölről akarod kezdeni a szerkesztést a jelenlegi játék-állapotból).
- `python import_levels.py verify` — ellenőrzi, hogy a `.ldtk` fájl és a `levels_canonical.json` pillanatkép összhangban van-e (csak diagnosztikai célra).
