# Csopark

Rendszámfelismerő és kapunyitó parkolórendszer: Flask + OCR (EasyOCR) +
YOLO alapú Python kódbázis, a Google Drive-ról ide áthozva. A repo
gyökerében lévő Splat Run projekttől független — külön mappában él, mert
más témában, más életciklussal fut.

## Állapot

A Drive-mappa tartalmának a teljes, tényleges kódot és konfigurációt
jelentő része bekerült ide. Szándékosan kimaradt:

- `cert.pem`, `license.key` — titkosnak tűnő fájlok, nem kerülnek git
  repóba.
- `log_202504.txt` — élő Flask fejlesztői szerver debug-PIN kódját
  tartalmazta, biztonsági okból kihagyva.
- `__pycache__/`, `train/`, `valid/`, `runs/`, `images/`, `logs/` — nagy
  méretű, generált vagy tréning-adat mappák, nem kellenek verziózásra.

`Csopark_stabil.py` és `parkolo_rendszer_laptop_pwa_teszt.py` bájt-pontosan
megegyeznek (a Drive-on is így volt, valószínűleg egy korábbi
teszt-mentés) — mindkettő megmaradt, hogy a forrás tartalmát pontosan
tükrözze.

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
