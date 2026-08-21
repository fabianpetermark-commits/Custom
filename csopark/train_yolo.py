from ultralytics import YOLO

# Load a pre-trained YOLOv8 model
model = YOLO("yolov8s.pt")  # Use yolov8s.pt for a small model

# Train the model
model.train(
    data="license-plate-recognition-8fvub-2/data.yaml",
    epochs=50,
    batch=16,
    imgsz=640,
    device=-1,  # Use CPU (set to 0 for GPU if available)
    name="license_plate_yolov8"
)