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

## Tervben (folyamatban)

- Multi-kamera támogatás (jelenleg csak 1 aktív kamera, a UI-n 3 inaktív
  placeholder van "Kamera 2/3/4 (inaktív)" néven).
- A rendszámfelismerés (YOLO+EasyOCR vs. a `LicensePR.py`-ban lévő
  kereskedelmi SimpleLPR SDK) irányának eldöntése — a jelenlegi YOLO
  modell kevés, sokszorosan augmentált adaton lett tanítva.
- HTML sablonok kiszedése Jinja `templates/` mappába (jelenleg Python
  string-ekbe égetve).
- Whitelist adatbázisba tétele (jelenleg sima `.txt` fájl).
- CSRF-védelem és rate-limit a login/form végpontokra.

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
