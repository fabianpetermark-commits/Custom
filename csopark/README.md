# Csopark

Rendszámfelismerő és kapunyitó parkolórendszer: Flask + OCR (EasyOCR) +
YOLO alapú Python kódbázis, a Google Drive-ról ide áthozva. A repo
gyökerében lévő Splat Run projekttől független — külön mappában él, mert
más témában, más életciklussal fut.

## Fő fájl

**`Csopark_stabil.py`** — ez az egyetlen, továbbfejlesztendő fő fájl.

A Drive-on emellett két majdnem-azonos verzió is volt, ezeket törölve
konszolidáltuk:
- `parkolo_rendszer_laptop_pwa_teszt.py` — bájt-pontosan megegyezett a
  `Csopark_stabil.py`-vel, felesleges duplikátum volt.
- `Csopark_stabil_V2_Gem.py` (a "Csopark stabil V2 Gem" Google Docból) —
  egy megszakadt export volt, a fájl a 545. sornál egy CSS tulajdonság
  közepén véget ért, route-ok/app-logika nélkül, nem futtatható. Egy
  hasznos részét (a Flask `secret_key` `.flask_secret` fájlba mentése,
  hogy ne érvénytelenítse a bejelentkezéseket minden restart) átvettük
  a fő fájlba.

## Eddigi javítások (a Drive-ról áthozott állapothoz képest)

- **Hiba javítva**: az `/add` route (`Új rendszám hozzáadása`) egy
  típó miatt (`load_whistelist()` a helyes `load_whitelist()` helyett)
  minden alkalommal `NameError`-ral elhasalt — javítva.
- **Biztonság**: a beégetett alapértelmezett admin jelszó
  (`bence` / `SanchoPanza567`) kivéve — most az `APP_USERNAME` és
  `APP_PASSWORD` környezeti változók megléte kötelező, alapérték nélkül.
- **Biztonság**: a Flask `secret_key` most `.flask_secret` fájlban
  perzisztálódik (ha nincs `FLASK_SECRET_KEY` env var beállítva),
  ahelyett hogy minden újraindításnál újat generálna és kijelentkezne
  mindenkit.
- **Multi-kamera architektúra**: a korábbi egyetlen globális `camera`
  objektum helyett egy `CAMERAS` konfigurációs lista (`{"id", "name",
  "source"}`) és egy `cameras` dict vezérli a kamerákat. Új kamera
  hozzáadásához (akár USB index, akár RTSP URL `source`-ként) nem kell
  kódot módosítani, csak a listát bővíteni. A `/video_feed`,
  `/single_frame` és `/capture` route-ok most `<cam_id>`-t kapnak, a UI
  kamera-rácsa Jinja `{% for cam in cams %}` ciklussal a konfigurált
  kameraszámhoz igazodik (a korábbi statikus "Kamera 2/3/4 (inaktív)"
  placeholderek eltűntek). Az OCR-felismerés kameránként külön szálon
  fut, de egy közösen megosztott YOLO+EasyOCR recognizer-t használ
  (lockkal szerializálva a kikövetkeztetést), hogy ne kelljen
  kamerénként külön modellt betölteni.
- **Hiba javítva**: az OCR-szál a whitelistet eddig csak egyszer, a
  szál indulásakor töltötte be — ha valaki a webes felületen rendszámot
  adott hozzá/törölt, az csak újraindítás után érvényesült. Most minden
  ciklusban újratölti.
- **HTML sablonok kiszedve Jinja `templates/` mappába**: a korábbi
  hatalmas Python string-ek (`base_head`, `control_page`, stb.) helyett
  `templates/base.html` (közös fejléc/CSS/toast, `{% block content %}`
  és `{% block scripts %}` blokkokkal) + `login.html`, `control.html`,
  `live_camera.html`, `status.html`, `log.html` — mindegyik
  `{% extends "base.html" %}`. A route-ok `render_template_string`
  helyett `render_template`-et hívnak.
- **`static/` mappa rendbe téve**: a `manifest.json` és a
  `service-worker.js`/`sw.js` eddig a projekt gyökerében voltak, de a
  `/manifest.json` route `send_from_directory(app.static_folder, ...)`-
  vel a `static/` mappából próbálta kiszolgálni őket — ez éles
  szerveren 404-et adott volna. Most a helyükön vannak
  (`static/manifest.json`, `static/service-worker.js`, `static/sw.js`).
  A `static/icons/` alá egyszerű, egyszínű placeholder PNG-k kerültek
  (`icon-192x192.png`, `icon-512x512.png`, `csopark_icon.png`) — a
  Drive-on nem voltak tényleges ikonfájlok, ezek nélkül a manifest és a
  service worker ikon-hivatkozásai 404-et adtak volna. Cserélendők
  valódi grafikára élesítés előtt.
- **Whitelist SQLite adatbázisban** (`whitelist.db`) a sima `.txt` fájl
  helyett. Induláskor egyszeri migráció (`migrate_whitelist_txt_to_db`)
  átveszi a régi `whitelist.txt` tartalmát, ha a DB még üres — így egy
  korábban élesített telepítésen sem vesznek el a meglévő rendszámok.
  `add_to_whitelist`/`remove_from_whitelist` visszaadja, hogy tényleg
  történt-e változás (duplikált hozzáadás/hiányzó törlés nem naplózódik
  feleslegesen).
- **CSRF-védelem**: minden POST form (`/`, `/open`, `/close`,
  `/toggle_camera_feed`, `/add`, `/delete/<plate>`) rejtett
  `csrf_token` mezőt kap, a session-ben tárolt tokenhez hasonlítva egy
  `@app.before_request` hookban — eltérés esetén 403. A `/delete`
  végpont a korábbi GET-alapú linkről POST-ra (kis inline form +
  gomb) került át, hogy ezt is lefedje a védelem.
- **Rate-limit a login végponton**: 5 sikertelen próbálkozás után 5
  percre zárolja az adott IP-t (egyszerű, memóriában tartott számláló,
  külön függőség nélkül — egy-processzes kisüzemi telepítéshez elég,
  több worker-processes/nagy forgalmú környezethez nem).

## Tervben (folyamatban)

- Valós kamera-hardveren tesztelés, ha eldől, hány kamera és milyen
  típus (USB vagy IP/RTSP) lesz — a `CAMERAS` lista ehhez már készen áll.
- A rendszámfelismerés (YOLO+EasyOCR vs. a `LicensePR.py`-ban lévő
  kereskedelmi SimpleLPR SDK) irányának eldöntése — a jelenlegi YOLO
  modell kevés, sokszorosan augmentált adaton lett tanítva. Ehhez előbb
  a tanító-adat mennyiségét/minőségét kell átnézni.
- Valódi ikongrafika a placeholder PNG-k helyére.

## Fontos: nem futtatható/tesztelhető ebben a környezetben

A kód valódi kamerát, Raspberry Pi GPIO-t, és a repóba szándékosan nem
felvett YOLO modell-fájlt (`license_plate_yolov8.pt`) igényel, a Python
függőségei (Flask, OpenCV, EasyOCR, ultralytics stb.) sincsenek
telepítve ebben a fejlesztői környezetben. Amit valóban futtatva
igazoltunk:
- a Python kód szintaktikailag helyes (`python3 -m py_compile`);
- a Jinja sablonok Jinja2-vel valós renderelést kaptak (dummy adatokkal
  minden oldal, multi-kamera ciklus 2 kamerával, CSRF hidden mezők
  jelenléte mind az 5 form-on);
- a whitelist SQLite-migráció és CRUD logika (`migrate_whitelist_txt_to_db`,
  `add_to_whitelist`, `remove_from_whitelist`) valós sqlite3-mal, kimásolt
  logikával;
- a login rate-limit logika (`is_login_rate_limited`, `record_failed_login`)
  is valós, kimásolt logikával.

Ami emiatt NINCS lefedve: a Flask-alkalmazás tényleges elindítása, valós
HTTP-kérések a route-okon keresztül, kamera/GPIO/YOLO integráció. Ezeket
valós hardveren/környezetben kell kipróbálni élesítés előtt.

## Szándékosan kimaradt a Drive-ról

- `cert.pem`, `license.key` — titkosnak tűnő fájlok.
- `log_202504.txt` — élő Flask fejlesztői szerver debug-PIN kódját
  tartalmazta, biztonsági okból kihagyva.
- `__pycache__/`, `train/`, `valid/`, `runs/`, `images/`, `logs/` — nagy
  méretű, generált vagy tréning-adat mappák, nem kellenek verziózásra.

## Ide tartozik

- A Csopark Python kódja (`Csopark_stabil.py` és a hozzá tartozó modulok:
  `camera.py`, `camera1.py`, `capture.py`, `ocr.py`, `conf.py`,
  `train_yolo.py`, `LicensePR.py`).
- `templates/` — Jinja HTML sablonok.
- `static/` — `manifest.json`, `service-worker.js`, `sw.js`,
  `static/icons/` (placeholder ikonok).
- Konfiguráció és adat: `data.yaml`, `manifest(old).json`, `conf old.py`.
- Indító szkriptek: `inditás.bat`, `inditas_csopark teszt.bat`,
  `train.bat`.
- Dokumentáció: `readme.txt`, `README.dataset.txt`, `README.roboflow.txt`,
  `whitelist.txt`, `LicensePR.txt` (üres a forrásban is).
