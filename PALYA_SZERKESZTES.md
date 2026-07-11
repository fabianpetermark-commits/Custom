# Splat Run — pályák szerkesztése LDtk-ban

## Első lépés (egyszeri)

1. Töltsd le és telepítsd az **LDtk**-t: https://ldtk.io (ingyenes).
2. Nyisd meg a `splat_levels.ldtk` fájlt az LDtk-ban.

## Szerkesztés

- Bal oldalon látod mind a 20 pályát (a Worlds/Levels listában).
- Az entitás-paletta jobb oldalon: `Platform`, `Spike`, `Saw`, `Pendulum`, `MosquitoSwarm`, `Leech`, `Ladder`, `Wall`, `Slope`, `Rope`, `Water`, `Icicle`, `Spring`, `Rock`, `Portcullis`, `Cannon`, `FishSpawner`, `Start`, `Goal`.
- Jégvilág elemek: a `Platform` `ice` pipája csúszóssá teszi; az `Icicle` a plafonról lóg és leesik, ha a játékos alá ér; a `Spring` felfelé repít (`power` mező, alap 11 — 12-vel ~145px magasra dob).
- `Rock`: teljesen szilárd blokk minden irányból (mennyezet/fal/padló egyben) — nem lehet alulról átugrani rajta, mint a `Platform`-on.
- Kővár (castle) elemek: a `Platform` `crumble` pipája omló kőlappá teszi (ráérkezéskor megremeg, ~0.4s után leomlik, majd ~2s után visszaáll). A `Portcullis` egy mozgó, teljesen szilárd rács-kapu (ugyanazok a `moveAxis`/`moveMin`/`moveMax`/`moveSpeed`/`movePhase` mezői, mint a mozgó `Platform`-nak — függőleges tengelyen érdemes nyitni/zárni). A `Cannon` periodikusan vízszintes ágyúgolyót lő ki (`dir`: bal/jobb, `interval`: hány képkockánként lő, `speed`: golyó sebessége, `r`: golyó sugara, `range`: milyen távolságra jut el a cső torkolatától, mielőtt eltűnik — **fontos**: ezt mindig állítsd be úgy, hogy a golyó ne juthasson vissza a pálya korábbi, már bejárt szakaszaira, különben ott is veszélyt jelenthet, ahol nem kellene).
- A pálya `theme` mezője (bal alsó panel a pályán): `dungeon`, `rainforest`, `ice` vagy `castle` — ez adja a hátteret és a platformok kinézetét.
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
