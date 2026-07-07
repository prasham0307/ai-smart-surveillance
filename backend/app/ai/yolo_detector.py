"""
Wraps YOLOv8 for person / vehicle detection.
This handles the SRS "Person, Vehicle" detection requirement.

For the fire/smoke model, load a separate fine-tuned .pt weights file
(see fire_smoke_detector.py) - COCO-pretrained YOLOv8 does NOT include
fire/smoke as a class.
"""
from ultralytics import YOLO

# COCO class ids we care about for this project
PERSON_CLASS_ID = 0
VEHICLE_CLASS_IDS = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}
# Bags/luggage - needed by abandoned_object.py to detect left-behind items
BAG_CLASS_IDS = {24: "backpack", 26: "handbag", 28: "suitcase", 25: "umbrella", 75: "vase"}

class YoloDetector:
    def __init__(self, weights_path: str = "yolov8n.pt", conf_threshold: float = 0.30):
        """
        weights_path: 'yolov8n.pt' auto-downloads the small pretrained model
        on first run (needs internet). Swap to yolov8s/m for better accuracy
        at the cost of speed.
        """
        self.model = YOLO(weights_path)
        self.conf_threshold = conf_threshold

    def detect(self, frame):
        """
        Runs inference on a single frame (numpy array, BGR from OpenCV).
        Returns a list of detections: [{"label": str, "confidence": float,
        "bbox": [x1, y1, x2, y2], "class_id": int}, ...]
        """
        results = self.model(frame, conf=self.conf_threshold, verbose=False)[0]
        detections = []

        for box in results.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            print(f"[RAW] class_id={class_id}, name={self.model.names[class_id]}, conf={confidence:.2f}")

            if class_id == PERSON_CLASS_ID:
                label = "person"
            elif class_id in VEHICLE_CLASS_IDS:
                label = VEHICLE_CLASS_IDS[class_id]
            elif class_id in BAG_CLASS_IDS:
                label = BAG_CLASS_IDS[class_id]
            else:
                # Skip classes irrelevant to this project (keeps output clean).
                # Remove this "continue" if you want to log all 80 COCO classes.
                continue

            detections.append({
                "label": label,
                "confidence": round(confidence, 3),
                "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                "class_id": class_id,
            })

        return detections
