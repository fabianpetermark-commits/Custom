import time
import logging

logger = logging.getLogger(__name__)

def camera_ocr_loop(camera, ocr_active):
    while True:
        if ocr_active():
            frame = camera.get_frame(_bytes=False)
            if frame is None:
                logger.debug("OCR: nincs képkocka")
                time.sleep(0.5)
                continue
            logger.debug("OCR: képkocka feldolgozás...")
            # ide jönne az OCR feldolgozás
            time.sleep(0.5)
        else:
            time.sleep(0.2)
