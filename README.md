# Splat Run

Egy böngészőben futó, retro hangulatú platformer — véres csapdákkal, tüskékkel, mozgó akadályokkal, egy tricolor sheltie főszereplővel, és nyomasztó, fáklyás dungeon háttérrel.

Nincs telepítés, nincs build lépés: nyisd meg a `splat_run.html` fájlt bármelyik böngészőben (asztali gépen vagy telefonon), és már mehet is.

## Játékmenet

- 5 pálya, egyre nehezedő mechanikákkal
- Fűrészek, guruló tüskék, tüskés inda-inga, mozgó platformok, létrák
- Víz, amiből időnként ijesztő, tüskés fogú hal ugrik ki
- Dupla ugrás — a második ugrás gyengébb az elsőnél
- Minden halálnál vér marad a pályán, amíg ott vagy
- Chiptune háttérzene (Web Audio API-val generálva, nincs hozzá külön fájl)

## Irányítás

- **Nyilak / WASD** — mozgás, létramászás
- **Szóköz** — ugrás (tartva magasabb ugrás, levegőben még egyszer dupla ugrás)
- Telefonon automatikusan megjelenik egy D-pad + UGRÁS gomb

## Technológia

Egyetlen önálló HTML fájl — vanilla JavaScript + HTML5 Canvas, semmilyen külső könyvtár vagy build-eszköz nélkül.

## Fejlesztés alatt

Folyamatban van a projekt átültetése [Phaser](https://phaser.io) keretrendszerre, hogy a fizika, ütközés, részecskék és hangkezelés kész, bevált rendszereket használjon a jelenlegi kézzel írt megoldások helyett.
