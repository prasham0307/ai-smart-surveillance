"""
Face detection (demo) - SRS lists this as "Face (demo)", meaning detection
only (drawing a box around faces), not full face recognition/identification.
MediaPipe is lightweight and works well out of the box without training.
"""
import mediapipe as mp


class FaceDetector:
    def __init__(self, min_confidence: float = 0.5):
        self.mp_face_detection = mp.solutions.face_detection
        self.detector = self.mp_face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=min_confidence
        )

    def detect(self, frame):
        """frame: BGR numpy array from OpenCV. Returns list of face boxes."""
        import cv2
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.detector.process(rgb_frame)

        detections = []
        if results.detections:
            h, w, _ = frame.shape
            for det in results.detections:
                box = det.location_data.relative_bounding_box
                x1, y1 = int(box.xmin * w), int(box.ymin * h)
                x2, y2 = int((box.xmin + box.width) * w), int((box.ymin + box.height) * h)
                detections.append({
                    "label": "face",
                    "confidence": round(det.score[0], 3),
                    "bbox": [x1, y1, x2, y2],
                })
        return detections
