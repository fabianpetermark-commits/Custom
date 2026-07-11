# Splat Run — fejlesztési folyamat

Ez a dokumentum azt a munkafolyamatot rögzíti, amit ötlettől az élesítésig
minden változtatásnál (pálya, mechanika, UI, hang) érdemes követni. A cél:
a játék soha ne törjön el, és minden pálya ténylegesen, igazolhatóan
végigjátszható legyen — ne csak "kinézetre jónak tűnjön".

## A projekt

- `splat_run.html` és `index.html` — a játék maga, egyetlen self-contained
  HTML fájl (a kettő tartalma mindig **azonos**, kettő van belőle, mert a
  GitHub Pages `index.html`-t szolgál ki gyökérből).
- `splat_levels.ldtk` — a pályák szerkeszthető forrása LDtk-ban.
- `levels_canonical.json` — pillanatkép a pálya-adatokról, az `import_levels.py verify`
  ezzel hasonlítja össze a `.ldtk`-ból beolvasott állapotot (kör-ellenőrzés).
- `import_levels.py` — a pipeline: `.ldtk` ↔ a HTML-be ágyazott JS `buildLevels()`
  ↔ `levels_canonical.json`. Lásd `PALYA_SZERKESZTES.md` a parancsokért.
- `sw.js` — service worker, hálózat-előbb stratégiával (lásd lent, miért fontos).

## A folyamat: ötlettől élesítésig

1. **Értsd meg, mi a jelenlegi állapot.** Ne találgass a memóriából — olvasd ki
   közvetlenül a `.ldtk`-ból (`python3 -c "import json; ..."`) vagy magából a
   HTML-ből, mit tartalmaz ténylegesen az érintett pálya/mechanika. Ha a
   felhasználó screenshotot küld egy hibáról, először ellenőrizd, hogy a leírt
   elrendezés egyáltalán megvan-e még az aktuális kódban — gyakran kiderül,
   hogy egy **régebbi, cache-elt verziót** lát (lásd "Service worker" lent).

2. **Ha pálya-elrendezést vagy fizikát érintesz: szimuláld, ne csak nézd.**
   Ez a legfontosabb tanulság ebből a projektből. Egy ugrás/rés/tüske-pozíció
   "logikusnak tűnik" ránézésre, de a valós hitbox-méret (játékos 18×26px) és
   a valós fizika (lásd konstansok lent) miatt könnyen 0 biztonságos időzítés-
   ablakot ad, vagy fordítva: egy "lehetetlennek tűnő" ugrás simán megoldható.
   - Írj egy kis Python szimulátort (lásd `sim.py` mintaként a session-history-ben,
     vagy építs újat), ami a **pontos** motor-fizikát reprodukálja: gravitáció,
     ugrás-erő, dupla ugrás, platform-landolás egyirányú kaput (csak felülről
     fogja el eséskor), AABB hitbox-tesztet.
   - Ne csak azt nézd, hogy VAN-e megoldás — nézd meg, **milyen széles az
     időzítési ablak** (hány képkocka / ms alatt kell megnyomni a gombot).
     Egy 2-3 képkockás ablak emberi reflexnek gyakorlatilag lehetetlen, még
     ha a szimuláció szerint "van megoldás" is.
   - Külön figyelj: statikus veszély (tüske, fal) **azonnal a landolási ponton**
     ülhet — ez a leggyakoribb hiba-minta, amit ebben a projektben találtunk
     (FINALE, INGOVANY, PIOCAS_MOCSAR, VADON_FINALE, TORONY, FURESZEK mind
     ebbe futott bele). Mindig ellenőrizd a puffert a landolás és a következő
     veszély között.

3. **Implementáld.** Pálya-adatnál: célzott Python szkripttel módosítsd a
   `.ldtk`-t (ne kézzel szerkeszd a hatalmas JSON-t), vagy a
   `parse_levels_from_html` / `generate_js` / `splice_into_html` függvényekkel
   dolgozz közvetlenül a HTML-ből kiindulva (`import_levels.py`-ból importálva).
   Kód/mechanika változásnál közvetlenül a `splat_run.html`-t szerkeszd, majd
   **másold át `index.html`-be is** (a kettőnek mindig egyeznie kell).

4. **Pipeline-futtatás pálya-változtatás után:**
   ```
   python3 import_levels.py import      # .ldtk -> HTML buildLevels()
   # majd patcheld a levels_canonical.json-t a módosított pálya(k) normalizált
   # adataival (ne futtass teljes export-ldtk-t, az felesleges zajt kelt a
   # nem érintett pályák iid/mező-sorrendjében)
   python3 import_levels.py verify      # kör-ellenőrzés, legyen "VERIFY OK"
   ```

5. **Tesztelj Playwright-tal, ne csak vizuálisan.** A `/opt/pw-browsers/chromium`
   előre telepítve van, Node-ból (`NODE_PATH=/opt/node22/lib/node_modules node ...`).
   - Legalább: nyisd meg a pályát, `localStorage.setItem('splatRunPlayer', ...)`-vel
     kerüld meg a névbekérést, `#palya=N` hash-sel indíts konkrét pályáról,
     screenshot a vizuális ellenőrzéshez.
   - Mozgás/vezérlés változásnál: **valós touch-szimuláció** kell, nem csak egér —
     `context({hasTouch:true, isMobile:true})` és tényleges `TouchEvent`
     dispatch, mert az egér és az érintés-események eltérően viselkedhetnek
     (lásd: stick-áthelyezés hibája, amit csak valós touch-teszttel sikerült
     reprodukálni).
   - Mindig ellenőrizz JS-hibát (`page.on('pageerror', ...)`) minden érintett
     pályán/módon, nem csak azon, amit épp módosítottál (regresszió-veszély).

6. **Bumpold a service worker cache-verzióját** (`sw.js`, `CACHE_NAME`)
   **minden** éles változtatásnál. A service worker hálózat-előbb stratégiát
   használ (2026-ban javítva egy korábbi cache-előbb hibából, ami miatt a
   felhasználó hetekig régi pályákat látott) — de a régi SW-példány csak egy
   új verziószám hatására veszi észre, hogy frissítenie kell. Enélkül a
   felhasználó a legjobb esetben is csak egy plusz újratöltés után látja a
   változást.

7. **Commit + push a feature branch-re, majd fast-forward merge `main`-be és
   push `main`-re is.** A GitHub Pages a `main`-ből épül — ha csak a feature
   branch-re pusholsz, a felhasználó a `fabianpetermark-commits.github.io/Custom/`
   címen **nem fogja látni a változást**, és ez összetéveszthető cache-hibával
   (ahogy egyszer meg is történt). A commit-üzenet legyen konkrét: mi romlott
   el / mit hasonlítottunk, és milyen szimuláció/teszt igazolta a javítást —
   ne csak "javítás" vagy "fejlesztés".

8. **Rövid, konkrét visszajelzés magyarul.** Mit találtál (a gyökér-okkal
   együtt, ha hiba volt), mit változtattál, mivel igazoltad. Ha van vizuális
   eredmény, küldj screenshotot (`SendUserFile`).

## Fizika-konstansok (a szimulátorhoz)

```
GRAVITY = 0.5           JUMP_MIN_FORCE = -6.5      JUMP_HOLD_ACCEL = -0.45
JUMP_MAX_HOLD = 14      DOUBLE_JUMP_FORCE = -5.0    MOVE_SPEED = 3.2
PW, PH = 18, 26 (jatekos hitbox)         DASH_SPEED = 6.0, DASH_DURATION = 10
```
Tájékoztató nagyságrendek (nem helyettesítik a szimulációt, csak gyors becsléshez):
- Tap-ugrás: ~39px magasság, ~80px vízszintes hatótáv.
- Teljes tartású ugrás: ~116px magasság, ~150px vízszintes hatótáv.
- Dupla ugrás (apex-nél aktiválva): ~138px magasság, ~195px vízszintes hatótáv.
- Ezek az AABB-hitbox miatt ~18px-szel "kedvezőbbek" a landolás oldalán és
  "szigorúbbak" a veszély-onset oldalán, mint egy pontszerű szereplőnél —
  mindig ezzel számolj, ne a vizuális középponttal.

## Gyakori csapdák, amikbe már belefutottunk

- **`display: contents`** egy szülőn eltünteti a rajta lévő `transform`-ot is —
  ha egy csoport (pl. gombok) egyedileg pozicionálható kell legyen, a
  méretezést/transzformációt a **gyerek** elemekre tedd, ne a wrapperre.
- **Touch vs. mouse esemény-konfliktus**: ha egy elemnek saját touch-logikája
  van (pl. analóg stick) ÉS kívülről is húzható/szerkeszthető kell legyen,
  explicit állapot-kapcsolóval (pl. "szerkesztő mód") tiltsd le az egyik
  viselkedést, különben a kettő vizuálisan "harcol" egymással.
- **Ne bízz a "van megoldás" eredményben vakon** — mindig kérdezd meg a
  szimulátort: mekkora a biztonsági ablak, és mi történik, ha a bot/játékos
  egy kicsit korábban vagy később reagál.
- **Lövedék/mozgó veszély hatótávja**: egy `Cannon`-szerű, folyamatosan
  mozgó veszélynek (ami nem áll meg szilárd testen, csak becsapódáskor vagy
  hatótáv-limitnél tűnik el) MINDIG legyen explicit hatótáv-korlátja
  (`range`), különben visszasodródhat a pálya korábbi, már bejárt
  szakaszaira, és ott okoz megjósolhatatlan, igazságtalan halált — ezt csak
  valós Playwright-lejátszással (nem csak elméleti szimulációval) sikerült
  elkapni, mert a szimulátor nem modellezte a lövedék teljes pálya-hosszú
  útját.
