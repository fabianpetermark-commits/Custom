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

## Tervben (folyamatban)

- Valós kamera-hardveren tesztelés, ha eldől, hány kamera és milyen
  típus (USB vagy IP/RTSP) lesz — a `CAMERAS` lista ehhez már készen áll.
- A rendszámfelismerés (YOLO+EasyOCR vs. a `LicensePR.py`-ban lévő
  kereskedelmi SimpleLPR SDK) irányának eldöntése — a jelenlegi YOLO
  modell kevés, sokszorosan augmentált adaton lett tanítva. Ehhez előbb
  a tanító-adat mennyiségét/minőségét kell átnézni.
- HTML sablonok kiszedése Jinja `templates/` mappába (jelenleg Python
  string-ekbe égetve).
- Whitelist adatbázisba tétele (jelenleg sima `.txt` fájl).
- CSRF-védelem és rate-limit a login/form végpontokra.

## Fontos: nem futtatható/tesztelhető ebben a környezetben

A kód valódi kamerát, Raspberry Pi GPIO-t, és a repóba szándékosan nem
felvett YOLO modell-fájlt (`license_plate_yolov8.pt`) igényel, a Python
függőségei (Flask, OpenCV, EasyOCR, ultralytics stb.) sincsenek
telepítve ebben a fejlesztői környezetben. A változásokat szintaktikai
ellenőrzéssel (`python3 -m py_compile`) és alapos manuális átolvasással
igazoltuk, de valós hardveren még nincs kipróbálva — ezt az élesítés
előtt érdemes elvégezni.

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
- Konfiguráció és adat: `data.yaml`, `manifest.json`,
  `manifest(old).json`, `conf old.py`.
- Indító szkriptek: `inditás.bat`, `inditas_csopark teszt.bat`,
  `train.bat`.
- Web/PWA: `service-worker.js`, `sw.js`.
- Dokumentáció: `readme.txt`, `README.dataset.txt`, `README.roboflow.txt`,
  `whitelist.txt`, `LicensePR.txt` (üres a forrásban is).
