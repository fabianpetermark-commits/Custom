Csopark PWA projekt

1. A projekt felépítése:
   - parkolo_rendszer_laptop_pwa.py  (Flask+OCR+PWA kód)
   - manifest.json                  (PWA definíció)
   - static/icons/csopark_icon.png  (512×512 app ikon)

2. Futattás laptopon:
   cd <mappa ahol kicsomagoltad>
   python parkolo_rendszer_laptop_pwa.py

3. Teszt Androidon:
   - Csatlakoztasd a telefon a laptop Wi-Fi hálózatára.
   - Chrome böngészőben nyisd meg: http://<laptop_IP_cím>:5000
   - Chrome felajánlja: „Telepítés kezdőképernyőre”
   - Telepítés után indítsd az ikonról.

4. Support:
   Hibák a system_errors.txt-ben, naplók a log_YYYYMM.txt fájlban.

Jó tesztelést! – A Csopark csapata
