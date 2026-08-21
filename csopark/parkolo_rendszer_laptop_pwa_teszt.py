import os
import re
import sys
import logging
import threading
import time
import cv2
import numpy as np
import easyocr
from ultralytics import YOLO
from loguru import logger as loguru_logger
from flask import Flask, render_template_string, request, redirect, url_for, session, send_from_directory, Response
from flask_socketio import SocketIO, emit
from Levenshtein import distance as levenshtein_distance
from datetime import timedelta, datetime
from roboflow import Roboflow
from conf import dictConfig
try:
    import RPi.GPIO as GPIO
    gpio_available = True
except ImportError:
    gpio_available = False

try:
    import logging.config
    logging.config.dictConfig(dictConfig)
except AttributeError:
    print("ERROR: The 'logging' module is corrupted or shadowed.")
    print(f"Logging module path: {logging.__file__}")
    print("1. Check for a file named 'logging.py' in your project directory")
    print("2. Delete the '__pycache__' directory")
    print("3. Reinstall Python or create a virtual environment.")
    sys.exit(1)

# Configuration
RELAY_PIN = 17
LED_PIN = 18
USERNAME = os.environ.get('APP_USERNAME', 'bence')
PASSWORD = os.environ.get('APP_PASSWORD', 'SanchoPanza567')
WHITELIST_FILE = 'whitelist.txt'
ERROR_LOG_FILE = 'system_errors.txt'
OCR_LOG_FILE = 'logs/ocr_log.log'
APP_LOG_FILE = 'logs/app_log.log'
CAMERA_INDEX = 0
CAMERA_FPS = 20
USE_MJPEG_DIRECT = False
OCR_COOLDOWN = 10
YOLO_MODEL_PATH = 'license_plate_yolov8.pt'
CONFIDENCE_THRESHOLD = 0.5
DATASET_DIR = 'license-plate-recognition-8fvub-2'
FALLBACK_DATASET_DIR = 'license-plate-recognition-2'

os.makedirs('logs', exist_ok=True)
os.makedirs('static/icons', exist_ok=True)

logger = logging.getLogger('__main__')
ocr_logger = logging.getLogger('ocr')
ocr_logger.setLevel(logging.INFO)
app_logger = logging.getLogger('app')
app_logger.setLevel(logging.INFO)
app_handler = logging.FileHandler(APP_LOG_FILE)
app_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
app_logger.addHandler(app_handler)

loguru_logger.remove()
loguru_logger.add(OCR_LOG_FILE, rotation="10 MB", level="INFO", format="{time} - {level} - {message}")

def download_roboflow_dataset():
    api_key = os.environ.get("ROBOFLOW_API_KEY", None)
    if not api_key:
        logger.warning("Roboflow API key not set. Skipping dataset download.")
        return False
    if not os.path.exists(DATASET_DIR):
        logger.info(f"Dataset directory {DATASET_DIR} not found. Downloading from Roboflow...")
        try:
            rf = Roboflow(api_key=api_key)
            project = rf.workspace("amykun-qoz6t").project("license-plate-recognition-8fvub")
            version = project.version(2)
            dataset = version.download("yolov8")
            logger.info(f"Primary dataset downloaded to {dataset.location}")
            return True
        except Exception as e:
            logger.error(f"Failed to download primary Roboflow dataset: {str(e)}")
            logger.info(f"Attempting to download fallback dataset to {FALLBACK_DATASET_DIR}...")
            try:
                project = rf.workspace("roboflow-100").project("license-plate-recognition-2")
                version = project.version(2)
                dataset = version.download("yolov8")
                logger.info(f"Fallback dataset downloaded to {dataset.location}")
                return True
            except Exception as e:
                logger.error(f"Failed to download fallback Roboflow dataset: {str(e)}")
                return False
    else:
        logger.info(f"Dataset directory {DATASET_DIR} already exists. Skipping download.")
        return True

download_roboflow_dataset()

if gpio_available:
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(RELAY_PIN, GPIO.OUT)
        GPIO.setup(LED_PIN, GPIO.OUT)
    except Exception as e:
        logger.warning(f"GPIO initialization failed: {str(e)}")
        gpio_available = False
else:
    logger.warning("GPIO not available.")
    gpio_available = False

app = Flask(__name__, static_folder='static')
app.secret_key = os.environ.get('FLASK_SECRET_KEY', os.urandom(24))
app.permanent_session_lifetime = timedelta(minutes=30)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r

class LicensePlateRecognizer:
    def __init__(self, model_path: str, confidence_threshold: float = 0.5):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"YOLO model file not found: {model_path}")
        try:
            self.model = YOLO(model_path)
            self.reader = easyocr.Reader(['en'], gpu=False)
            self.confidence_threshold = confidence_threshold
            loguru_logger.info("LicensePlateRecognizer initialized successfully.")
        except Exception as e:
            loguru_logger.error(f"Initialization failed: {str(e)}")
            raise

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            denoised = cv2.GaussianBlur(thresh, (3, 3), 0)
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            sharpened = cv2.filter2D(denoised, -1, kernel)
            return sharpened
        except Exception as e:
            loguru_logger.error(f"Image preprocessing failed: {str(e)}")
            return image

    def detect_plate(self, image: np.ndarray) -> tuple[np.ndarray | None, list] | None:
        try:
            results = self.model(image, conf=self.confidence_threshold)
            boxes = results[0].boxes.xyxy.cpu().numpy()
            confidences = results[0].boxes.conf.cpu().numpy()
            if len(boxes) == 0:
                loguru_logger.warning("No license plate detected.")
                return None
            best_idx = np.argmax(confidences)
            x1, y1, x2, y2 = map(int, boxes[best_idx])
            plate_image = image[y1:y2, x1:x2]
            return plate_image, [x1, y1, x2, y2]
        except Exception as e:
            loguru_logger.error(f"Plate detection failed: {str(e)}")
            return None

    def clean_text(self, text: str) -> str:
        text = re.sub(r'[^A-Za-z0-9-]', '', text.upper())
        if len(text) < 5 or len(text) > 8:
            loguru_logger.warning(f"Invalid plate text length: {text}")
            return ""
        return text

    def recognize_text(self, plate_image: np.ndarray) -> str:
        try:
            processed_plate = self.preprocess_image(plate_image)
            results = self.reader.readtext(processed_plate, detail=0, paragraph=True)
            if not results:
                loguru_logger.warning("No text recognized.")
                return ""
            text = self.clean_text(results[0])
            return text
        except Exception as e:
            loguru_logger.error(f"Text recognition failed: {str(e)}")
            return ""

    def process_image(self, image: np.ndarray) -> tuple[str | None, np.ndarray | None]:
        try:
            plate_info = self.detect_plate(image)
            if plate_info is None:
                return None, image
            plate_image, bbox = plate_info
            plate_text = self.recognize_text(plate_image)
            if not plate_text:
                loguru_logger.warning("No valid text recognized.")
                return None, image
            x1, y1, x2, y2 = bbox
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(
                image, plate_text, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2
            )
            loguru_logger.info(f"License plate recognized: {plate_text}")
            return plate_text, image
        except Exception as e:
            loguru_logger.error(f"Image processing failed: {str(e)}")
            return None, image

class Camera:
    def __init__(self, fps=20, video_source=0):
        logger.info(f"Initializing camera with {fps} fps and video_source={video_source}")
        self.fps = fps
        self.video_source = video_source
        self.camera = None
        self.max_frames = 5 * self.fps
        self.frames = []
        self.isrunning = False
        self.lock = threading.Lock()

    def run(self):
        if self.isrunning:
            logger.info("Camera is already running")
            return
        self.camera = cv2.VideoCapture(self.video_source)
        if not self.camera.isOpened():
            logger.error(f"Failed to open camera at index {self.video_source}")
            raise RuntimeError("Camera initialization failed")
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        logger.debug("Preparing thread")
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        logger.debug("Starting thread")
        self.isrunning = True
        self.thread.start()
        logger.info("Thread started")

    def _capture_loop(self):
        dt = 1 / self.fps
        logger.debug("Capture loop started")
        warmup_frames = 10
        while self.isrunning:
            success, im = self.camera.read()
            if success:
                with self.lock:
                    if len(self.frames) == self.max_frames:
                        self.frames = self.frames[1:]
                    self.frames.append(im)
                warmup_frames -= 1
            else:
                logger.warning("Capture loop: Failed to read frame")
            time.sleep(dt if warmup_frames <= 0 else 0.01)
        logger.info("Capture loop stopped")

    def stop(self):
        logger.debug("Stopping thread")
        self.isrunning = False
        if self.camera:
            self.camera.release()
            self.camera = None
        with self.lock:
            self.frames = []
        logger.info("Camera stopped")

    def get_frame(self, _bytes=True):
        with self.lock:
            if len(self.frames) > 0:
                if _bytes:
                    ret, img = cv2.imencode('.jpg', self.frames[-1], [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                    if not ret:
                        logger.warning("Failed to encode frame")
                        with open("images/not_found.jpeg", "rb") as f:
                            return f.read()
                    return img.tobytes()
                return self.frames[-1]
            else:
                logger.debug("No frames available")
                with open("images/not_found.jpeg", "rb") as f:
                    return f.read()

def load_whitelist():
    try:
        with open(WHITELIST_FILE, 'r') as f:
            return [line.strip().upper() for line in f if line.strip()]
    except FileNotFoundError:
        logger.warning(f"Whitelist file {WHITELIST_FILE} not found.")
        return []

def save_whitelist(plates):
    try:
        with open(WHITELIST_FILE, 'w') as f:
            for p in plates:
                f.write(p + '\n')
    except Exception as e:
        logger.error(f"Failed to save whitelist: {str(e)}")
        raise

def is_similar(plate, whitelist):
    for valid in whitelist:
        maxd = 1 if len(valid) <= 6 else 2
        if levenshtein_distance(plate, valid) <= maxd:
            return True
    return False

def open_gate(source='Web'):
    try:
        logger.info(f"Gate opening ({source})")
        app_logger.info(f"Gate opened from {source}")
        if gpio_available:
            GPIO.output(RELAY_PIN, GPIO.HIGH)
            time.sleep(3)
            GPIO.output(RELAY_PIN, GPIO.LOW)
    except Exception as e:
        logger.error(f"Gate open error: {str(e)}")
        raise

def led_feedback(success):
    if not gpio_available:
        return
    try:
        if success:
            GPIO.output(LED_PIN, GPIO.HIGH)
            time.sleep(2)
            GPIO.output(LED_PIN, GPIO.LOW)
        else:
            for _ in range(3):
                GPIO.output(LED_PIN, GPIO.HIGH)
                time.sleep(0.3)
                GPIO.output(LED_PIN, GPIO.LOW)
                time.sleep(0.3)
    except Exception as e:
        logger.error(f"LED feedback error: {str(e)}")

def load_log(date_filter=None):
    try:
        logs = []
        if os.path.exists(APP_LOG_FILE):
            with open(APP_LOG_FILE, 'r') as f:
                for line in f:
                    parts = line.strip().split(' - ', 2)
                    if len(parts) < 3:
                        continue
                    timestamp, level, message = parts
                    if not (
                        message.startswith("User logged in") or
                        message.startswith("User logged out") or
                        message.startswith("Camera feed toggled") or
                        message.startswith("Plate") and (
                            "matched whitelist" in message or
                            "recognized" in message
                        )
                    ):
                        continue
                    try:
                        log_date = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S,%f')
                        if date_filter and log_date.date() != date_filter:
                            continue
                        logs.append({
                            'timestamp': timestamp,
                            'type': level,
                            'message': message
                        })
                    except ValueError:
                        continue
        return logs[-50:]
    except Exception as e:
        logger.error(f"Failed to read log file: {str(e)}")
        return []

def camera_ocr_loop():
    global last_ocr_message, last_recognized_plate, last_plate_time
    whitelist = load_whitelist()
    recognizer = None
    try:
        recognizer = LicensePlateRecognizer(YOLO_MODEL_PATH, CONFIDENCE_THRESHOLD)
    except Exception as e:
        logger.error(f"Failed to initialize LicensePlateRecognizer: {str(e)}")
        socketio.emit('ocr_update', {'plate': '', 'status': 'error', 'message': f'OCR initialization failed: {str(e)}'})
        app_logger.error(f"OCR initialization failed: {str(e)}")
        return
    while True:
        try:
            frame = camera.get_frame(_bytes=False)
            if frame is None:
                logger.debug("OCR: No frame available")
                ocr_logger.warning("No frame available")
                time.sleep(0.2)
                continue
            plate_text, annotated_frame = recognizer.process_image(frame)
            ocr_logger.debug(f"Extracted plate: {plate_text}")
            if plate_text:
                ocr_logger.info(f"Recognized plate: {plate_text}")
                app_logger.info(f"Plate {plate_text} recognized")
                last_recognized_plate = plate_text
                socketio.emit('ocr_update', {'plate': plate_text, 'status': 'recognized'})
                if is_similar(plate_text, whitelist):
                    current_time = time.time()
                    if current_time - last_plate_time > OCR_COOLDOWN:
                        ocr_logger.info(f"Plate {plate_text} matched whitelist, opening gate")
                        app_logger.info(f"Plate {plate_text} matched whitelist, gate opened")
                        socketio.emit('ocr_update', {'plate': plate_text, 'status': 'matched'})
                        open_gate(source='OCR')
                        led_feedback(True)
                        last_ocr_message = f"Rendszám felismerve: {plate_text}, kapu nyitva"
                        last_plate_time = current_time
                    else:
                        ocr_logger.info(f"Plate {plate_text} matched but in cooldown")
                        app_logger.info(f"Plate {plate_text} matched but in cooldown")
                        last_ocr_message = f"Rendszám felismerve: {plate_text}, várakozás (cooldown)"
                        socketio.emit('ocr_update', {'plate': plate_text, 'status': 'cooldown'})
                else:
                    ocr_logger.info(f"Plate {plate_text} not in whitelist")
                    app_logger.info(f"Plate {plate_text} not in whitelist")
                    last_ocr_message = f"Rendszám felismerve: {plate_text}, nincs a whitelistben"
                    socketio.emit('ocr_update', {'plate': plate_text, 'status': 'not_in_whitelist'})
            else:
                ocr_logger.info("No valid plate detected")
                last_ocr_message = "Nem sikerült rendszámot felismerni"
                socketio.emit('ocr_update', {'plate': '', 'status': 'not_detected'})
            time.sleep(0.5)
        except Exception as e:
            logger.error(f"OCR loop error: {str(e)}")
            ocr_logger.error(f"OCR error: {str(e)}")
            app_logger.error(f"OCR error: {str(e)}")
            last_ocr_message = "OCR hiba történt"
            socketio.emit('ocr_update', {'plate': '', 'status': 'error'})
            time.sleep(1)

def gen_frames():
    global camera
    while True:
        if camera_active:
            try:
                frame = camera.get_frame(_bytes=False)
                if frame is None:
                    logger.warning("Stream: No frame available")
                else:
                    logger.debug(f"Stream: Frame shape {frame.shape}, dtype {frame.dtype}")
                frame = camera.get_frame()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            except Exception as e:
                logger.error(f"Stream error: {str(e)}")
        else:
            with open("images/not_found.jpeg", "rb") as f:
                frame = f.read()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        time.sleep(0.05)

base_head = """
<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#4CAF50">
  <meta name="description" content="Rendszámfelismerő és kapunyitó alkalmazás">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>Csopark</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/static/icons/icon-192x192.png">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
      margin: 0;
      padding: 0;
    }
    .navbar {
      background-color: #333;
      display: flex;
      align-items: center;
      padding: 10px 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      gap: 15px;
    }
    .navbar a, .navbar form {
      display: block;
    }
    .navbar button {
      background-color: #4CAF50;
      color: white;
      padding: 8px 15px;
      margin: 0;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    .navbar button:hover {
      background-color: #45a049;
    }
    .navbar .logout {
      margin-left: auto;
    }
    .container {
      max-width: 1200px;
      margin: 20px auto;
      display: flex;
      gap: 20px;
      padding-left: 10px;
    }
    .camera-grid {
      display: grid;
      grid-template-columns: repeat(2, 320px);
      gap: 10px;
      border: 1px solid #ccc;
      border-radius: 10px;
      padding: 10px;
    }
    .camera-window {
      width: 320px;
      height: 240px;
      background-color: #ccc;
      border-radius: 5px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 14px;
    }
    .camera-window img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .whitelist-section, .log-section {
      max-width: fit-content;
      min-width: 200px;
      background: white;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
    }
    .whitelist-section h2, .log-section h2 {
      margin-top: 0;
      font-size: 18px;
    }
    input[type=text], input[type=password], input[type=date] {
      width: 100%;
      padding: 10px;
      margin: 6px 0;
      display: inline-block;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 12px 20px;
      margin: 6px 0;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      width: 100%;
    }
    button:hover {
      opacity: 0.8;
    }
    .message {
      background-color: #ffffcc;
      padding: 8px;
      margin-top: 8px;
      border-radius: 5px;
      text-align: center;
      font-size: 14px;
    }
    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    li {
      padding: 6px;
      background: #eee;
      margin-top: 4px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
    a {
      text-decoration: none;
    }
    .whitelist-section a {
      color: white;
      background-color: #f44336;
      padding: 4px 8px;
      border-radius: 5px;
      font-size: 12px;
    }
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      display: none;
      z-index: 1000;
    }
    .toast.show {
      display: block;
    }
    .toast.success {
      background-color: #4CAF50;
    }
    .toast.error {
      background-color: #f44336;
    }
    .toast.info {
      background-color: #2196F3;
    }
    .log-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .log-table th, .log-table td {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: left;
      font-size: 14px;
    }
    .log-table th {
      background-color: #4CAF50;
      color: white;
    }
    .log-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .log-table tr:hover {
      background-color: #f1f1f1;
    }
  </style>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
    console.log('base_head template loaded - version with navbar gap fix');
  </script>
</head>
<body>
<div id="toast" class="toast"></div>
"""

login_page = base_head + """
<div class="container">
<h2>Bejelentkezés</h2>
<form method="post">
  <input type="text" name="username" placeholder="Felhasználónév">
  <input type="password" name="password" placeholder="Jelszó">
  <button type="submit">Belépés</button>
</form>
{% if error %}<p style="color:red">{{ error }}</p>{% endif %}
</div>
</body></html>
"""

control_page = base_head + """
<div class="navbar">
  <form action="/open" method="post"><button>Kapunyitás</button></form>
  <form action="/close" method="post"><button>Kapuzárás</button></form>
  <form action="/toggle_camera_feed" method="post"><button style="background-color: {{ camera_button_color }};">{{ camera_button_text }}</button></form>
  <a href="/status"><button>Rendszerállapot</button></a>
  <a href="/log"><button>Napló</button></a>
  <a href="/logout" class="logout"><button>Kijelentkezés</button></a>
</div>
<div class="container">
  <div class="camera-grid">
    <div class="camera-window">
      {% if use_mjpeg_direct %}
      <img src="/video_feed" alt="Kamera 1">
      {% else %}
      <img id="cam" alt="Kamera 1">
      <script>
        function updateCam() {
          const img = document.getElementById("cam");
          img.src = "/video_feed?rand=" + Math.random();
        }
        setInterval(updateCam, 200);
      </script>
      {% endif %}
    </div>
    <div class="camera-window">Kamera 2 (inaktív)</div>
    <div class="camera-window">Kamera 3 (inaktív)</div>
    <div class="camera-window">Kamera 4 (inaktív)</div>
  </div>
  <div class="whitelist-section">
    <h2>Whitelist</h2>
    {% if message %}
    <div class="message">{{ message }}</div>
    {% endif %}
    <p>Utolsó felismert rendszám: {{ last_plate }}</p>
    <ul>
      {% for p in wl %}
      <li>{{ p }} <a href="/delete/{{ p }}">Törlés</a></li>
      {% endfor %}
    </ul>
    <form action="/add" method="post">
      <input type="text" name="plate" placeholder="Új rendszám">
      <button>Hozzáadás</button>
    </form>
    {% if error %}<p style="color:red">{{ error }}</p>{% endif %}
  </div>
</div>
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
  socket.on('ocr_update', function(data) {
    const toast = document.getElementById('toast');
    let message = '';
    let toastClass = '';
    if (data.status === 'recognized') {
      message = `Rendszám felismerve: ${data.plate}`;
      toastClass = 'info';
    } else if (data.status === 'matched') {
      message = `Rendszám ${data.plate} egyezik, kapu nyitva`;
      toastClass = 'success';
    } else if (data.status === 'cooldown') {
      message = `Rendszám ${data.plate} várakozik (cooldown)`;
      toastClass = 'info';
    } else if (data.status === 'not_in_whitelist') {
      message = `Rendszám ${data.plate} nincs a whitelistben`;
      toastClass = 'error';
    } else if (data.status === 'not_detected') {
      message = 'Nem sikerült rendszámot felismerni';
      toastClass = 'error';
    } else if (data.status === 'error') {
      message = data.message || 'OCR hiba történt';
      toastClass = 'error';
    }
    toast.textContent = message;
    toast.className = `toast show ${toastClass}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
  });
</script>
</body></html>
"""

live_camera_page = base_head + """
<div class="navbar">
  <a href="/control"><button>Vissza</button></a>
</div>
<div class="container">
  <div class="camera-grid">
    <div class="camera-window">
      {% if use_mjpeg_direct %}
      <img src="/video_feed" alt="Kamera 1">
      {% else %}
      <img id="cam" alt="Kamera 1">
      <script>
        function updateCam() {
          const img = document.getElementById("cam");
          img.src = "/video_feed?rand=" + Math.random();
        }
        setInterval(updateCam, 200);
      </script>
      {% endif %}
    </div>
    <div class="camera-window">Kamera 2 (inaktív)</div>
    <div class="camera-window">Kamera 3 (inaktív)</div>
    <div class="camera-window">Kamera 4 (inaktív)</div>
  </div>
</div>
</body></html>
"""

status_page = base_head + """
<div class="navbar">
  <a href="/control"><button>Vissza</button></a>
</div>
<div class="container">
  <div class="camera-section">
    <h2>Rendszerállapot</h2>
    <p>Státusz: OK</p>
    <p>Kamera feed: {% if camera_active %}<span style="color: green;">Bekapcsolva</span>{% else %}<span style="color: red;">Kikapcsolva</span>{% endif %}</p>
    <p>Utolsó felismert rendszám: {{ last_plate }}</p>
    <h3>Legutóbbi hibák:</h3>
    <pre>{{ errors }}</pre>
  </div>
</div>
</body></html>
"""

log_page = base_head + """
<div class="navbar">
  <a href="/control"><button>Vissza</button></a>
</div>
<div class="container">
  <div class="log-section">
    <h2>Napló</h2>
    <input type="date" id="dateFilter" onchange="filterLogs()">
    <table class="log-table">
      <thead>
        <tr>
          <th>Idő</th>
          <th>Típus</th>
          <th>Esemény</th>
        </tr>
      </thead>
      <tbody id="logBody">
        {% for log in logs %}
        <tr data-date="{{ log.timestamp|truncate(10, true, '') }}">
          <td>{{ log.timestamp }}</td>
          <td>{{ log.type }}</td>
          <td>{{ log.message }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
<script>
  function filterLogs() {
    const dateFilter = document.getElementById('dateFilter').value;
    const rows = document.querySelectorAll('#logBody tr');
    rows.forEach(row => {
      const rowDate = row.getAttribute('data-date');
      if (!dateFilter || rowDate === dateFilter) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
</script>
</body></html>
"""

@app.route('/', methods=['GET', 'POST'])
def login():
    err = None
    if request.method == 'POST':
        if request.form['username'] == USERNAME and request.form['password'] == PASSWORD:
            session['logged_in'] = True
            session.permanent = True
            app_logger.info("User logged in")
            return redirect('/control')
        else:
            err = "Hibás adatok"
    return render_template_string(login_page, error=err)

@app.route('/control')
def control():
    if not session.get('logged_in'):
        return redirect('/')
    button_text = "Kamera kikapcsolása" if camera_active else "Kamera bekapcsolása"
    button_color = "#4CAF50" if camera_active else "#f44336"
    wl = load_whitelist()
    error = session.pop('whitelist_error', None)
    return render_template_string(control_page, camera_button_text=button_text, camera_button_color=button_color, message=last_ocr_message, last_plate=last_recognized_plate, wl=wl, error=error, use_mjpeg_direct=USE_MJPEG_DIRECT)

@app.route('/video_feed')
def video_feed():
    if not session.get('logged_in'):
        return redirect('/')
    if not camera_active:
        with open("images/not_found.jpeg", "rb") as f:
            frame = f.read()
        return Response(frame, mimetype='image/jpeg')
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/single_frame')
def single_frame():
    if not session.get('logged_in'):
        return redirect('/')
    if not camera_active:
        with open("images/not_found.jpeg", "rb") as f:
            return Response(f.read(), mimetype='image/jpeg')
    frame = camera.get_frame()
    return Response(frame, mimetype='image/jpeg')

@app.route('/camera_feed')
def camera_feed():
    if not session.get('logged_in'):
        return redirect('/')
    return render_template_string(live_camera_page, use_mjpeg_direct=USE_MJPEG_DIRECT)

@app.route('/capture')
def capture():
    if not session.get('logged_in'):
        return redirect('/')
    if not camera_active:
        return redirect('/camera_feed')
    frame = camera.get_frame(_bytes=False)
    if frame is not None:
        s = frame.shape
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(frame, time.strftime('%Y-%m-%d %H:%M:%S'),
                    (10, s[0]-10), font, 1, (20, 20, 20), 2)
        cv2.imwrite("images/last.png", frame)
        logger.info("Frame captured to images/last.png")
        ocr_logger.info("Frame captured for OCR verification")
        app_logger.info("Frame captured for OCR verification")
    return redirect('/camera_feed')

@app.route('/add', methods=['POST'])
def add_plate():
    if not session.get('logged_in'):
        return redirect('/')
    p = request.form['plate'].strip().upper()
    if not re.match(r'^[A-Z0-9-]{5,8}$', p):
        session['whitelist_error'] = "Érvénytelen rendszám formátum"
    else:
        wl = load_whistelist()
        if p and p not in wl:
            wl.append(p)
            save_whitelist(wl)
            app_logger.info(f"Plate {p} added to whitelist")
        session.pop('whitelist_error', None)
    return redirect('/control')

@app.route('/delete/<plate>')
def delete_plate(plate):
    if not session.get('logged_in'):
        return redirect('/')
    wl = load_whitelist()
    if plate in wl:
        wl.remove(plate)
        save_whitelist(wl)
        app_logger.info(f"Plate {plate} removed from whitelist")
    return redirect('/control')

@app.route('/status')
def status_page_route():
    if not session.get('logged_in'):
        return redirect('/')
    errors = []
    if os.path.exists(ERROR_LOG_FILE):
        try:
            with open(ERROR_LOG_FILE) as f:
                errors = f.read().splitlines()[-10:]
        except Exception as e:
            logger.error(f"Failed to read error log: {str(e)}")
    return render_template_string(status_page, errors="\n".join(errors), camera_active=camera_active, last_plate=last_recognized_plate)

@app.route('/log')
def log_page_route():
    if not session.get('logged_in'):
        return redirect('/')
    date_filter = request.args.get('date')
    date_obj = None
    if date_filter:
        try:
            date_obj = datetime.strptime(date_filter, '%Y-%m-%d').date()
        except ValueError:
            date_obj = None
    logs = load_log(date_filter=date_obj)
    return render_template_string(log_page, logs=logs)

@app.route('/toggle_camera_feed', methods=['POST'])
def toggle_camera_feed():
    global camera_active, last_ocr_message
    if not session.get('logged_in'):
        return redirect('/')
    camera_active = not camera_active
    if camera_active:
        camera.run()
        last_ocr_message = "Kamera feed elindítva."
    else:
        camera.stop()
        last_ocr_message = "Kamera feed leállítva."
    socketio.emit('ocr_update', {'plate': '', 'status': 'camera_' + ('on' if camera_active else 'off')})
    app_logger.info(f"Camera feed toggled {'on' if camera_active else 'off'}")
    return redirect('/control')

@app.route('/open', methods=['POST'])
def web_open():
    if not session.get('logged_in'):
        return redirect('/')
    try:
        open_gate(source='Web')
        led_feedback(True)
    except Exception as e:
        logger.error(f"Web open error: {str(e)}")
        app_logger.error(f"Web open error: {str(e)}")
    return redirect('/control')

@app.route('/close', methods=['POST'])
def web_close():
    if not session.get('logged_in'):
        return redirect('/')
    try:
        if gpio_available:
            GPIO.output(RELAY_PIN, GPIO.LOW)
        led_feedback(True)
        app_logger.info("Gate closed from Web")
    except Exception as e:
        logger.error(f"Web close error: {str(e)}")
        app_logger.error(f"Web close error: {str(e)}")
    return redirect('/control')

@app.route('/logout')
def logout():
    if session.get('logged_in'):
        app_logger.info("User logged out")
    session.clear()
    return redirect('/')

@app.route('/manifest.json')
def manifest():
    return send_from_directory(app.static_folder, 'manifest.json')

def start_ocr_thread():
    t = threading.Thread(target=camera_ocr_loop, daemon=True)
    t.start()

if __name__ == '__main__':
    camera_active = True
    last_ocr_message = ""
    last_recognized_plate = ""
    last_plate_time = 0
    camera = None
    try:
        camera = Camera(fps=CAMERA_FPS, video_source=CAMERA_INDEX)
        camera.run()
        start_ocr_thread()
        socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        logger.error(f"Application startup error: {str(e)}")
        app_logger.error(f"Application startup error: {str(e)}")
    finally:
        if camera:
            camera.stop()
        if gpio_available:
            GPIO.cleanup()