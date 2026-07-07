"""
Fire/Smoke detection.

COCO-pretrained YOLOv8 (yolov8n.pt) has NO fire or smoke class - this needs
a model trained specifically on fire/smoke imagery. Two options, easiest first:

OPTION A (recommended for a training project - fastest to get working):
  Use an already fine-tuned open-source fire/smoke YOLOv8 model from
  Roboflow Universe or Hugging Face (search "fire smoke detection yolov8").
  Download the .pt weights file, drop it in backend/weights/, and point
  FIRE_SMOKE_WEIGHTS_PATH below to it. No training needed.

OPTION B (more impressive for a mentor demo, more time-consuming):
  Fine-tune yolov8n yourself on a fire/smoke dataset (Roboflow has several
  public ones you can export in YOLO format), e.g.:
      yolo train model=yolov8n.pt data=fire_smoke.yaml epochs=50 imgsz=640
  Then point this module to your resulting best.pt.

Either way, the *inference* code below stays the same - only the weights
file changes. Start with Option A to get the pipeline working end-to-end,
then swap in your own fine-tuned model later if you want the extra credit.
"""
from ultralytics import YOLO

FIRE_SMOKE_WEIGHTS_PATH = "weights/fire_smoke_yolov8.pt"  # place your model here


class FireSmokeDetector:
    def __init__(self, weights_path: str = FIRE_SMOKE_WEIGHTS_PATH, conf_threshold: float = 0.25):
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
