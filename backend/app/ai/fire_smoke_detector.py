from ultralytics import YOLO

FIRE_SMOKE_WEIGHTS_PATH = "weights/fire_smoke_yolov8_custom.pt"  # place your model here


class FireSmokeDetector:
    def __init__(self, weights_path: str = FIRE_SMOKE_WEIGHTS_PATH, conf_threshold: float = 0.60):
        self.model = YOLO(weights_path)
        self.conf_threshold = conf_threshold
        # Fire/smoke datasets commonly label classes as below - confirm
        # against your chosen model's data.yaml and adjust if needed.
        self.class_names = {0: "smoke", 1: "fire"}

    def detect(self, frame):
        results = self.model(frame, conf=self.conf_threshold, verbose=False)[0]
        detections = []

        for box in results.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            label = self.class_names.get(class_id, f"class_{class_id}")

            detections.append({
                "label": label,
                "confidence": round(confidence, 3),
                "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                "class_id": class_id,
            })

        return detections
