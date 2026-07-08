"""
Core detection pipeline. Same code path is used for:
  - Phase 1: an uploaded video file (cv2.VideoCapture(path))
  - Phase 2: a live webcam (cv2.VideoCapture(0))
This is the whole point of processing frame-by-frame with OpenCV: the
*source* changes between phases, but the detection logic doesn't.
"""
import cv2
import time

from app.ai.yolo_detector import YoloDetector
from app.ai.abandoned_object import AbandonedObjectTracker
from app.ai.face_detector import FaceDetector
from app.ai.fire_smoke_detector import FireSmokeDetector

PROCESS_EVERY_N_FRAMES = 3  # skip frames for speed; raise for weaker hardware


class VideoProcessor:
    def __init__(self):
        self.yolo = YoloDetector()
        self.abandoned_tracker = AbandonedObjectTracker()
        self.face_detector = FaceDetector()
        self.fire_smoke = FireSmokeDetector()
        self.last_fire_alert_time = 0

    def process_source(self, source, on_frame=None, on_alert=None, max_frames=None, verbose=False):
        """
        source: a file path (Phase 1) or an int like 0 for webcam (Phase 2).
        on_frame: optional callback(annotated_frame, frame_index) - e.g. to
                  stream frames over WebSocket or write to an output video.
        on_alert: optional callback(alert_dict) - e.g. to save to DB / push
                  a real-time notification.
        max_frames: stop after N frames (useful for live demo/testing so it
                    doesn't run forever) - leave None to run to completion.
        verbose: if True, prints every raw detection to the console - useful
                 for checking exactly what label/class YOLO assigns to an
                 object, e.g. if something isn't being tracked as expected.
        """
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            raise RuntimeError(f"Could not open video source: {source}")

        # is_live: webcam sources are ints (e.g. 0); file paths are strings.
        # This decides which clock the abandoned-object timer should use.
        is_live = isinstance(source, int)
        fps = cap.get(cv2.CAP_PROP_FPS) or 25

        frame_index = 0
        all_alerts = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if max_frames and frame_index >= max_frames:
                break

            if frame_index % PROCESS_EVERY_N_FRAMES == 0:
                # Live webcam: use real wall-clock time (frames arrive in real time).
                # Uploaded file: use video time (frame_index / fps), NOT wall-clock -
                # otherwise "10 seconds stationary" depends on how fast your CPU
                # processes the file instead of the actual video content.
                current_time = time.time() if is_live else frame_index / fps

                detections = self.yolo.detect(frame)
                faces = self.face_detector.detect(frame)

                if verbose:
                    for det in detections:
                        print(f"[frame {frame_index}] detected: {det['label']} "
                              f"(conf={det['confidence']}, class_id={det.get('class_id')})")

                abandoned_alerts = self.abandoned_tracker.update(detections, current_time)
                fire_smoke_detections = self.fire_smoke.detect(frame)
                
                # Immediately alert on fire/smoke, but with a 3-second cooldown to prevent spam
                fire_smoke_alerts = []
                if fire_smoke_detections and (current_time - self.last_fire_alert_time) > 3.0:
                    self.last_fire_alert_time = current_time
                    det = fire_smoke_detections[0] # Just use the highest confidence one for the alert
                    fire_smoke_alerts.append({
                        "object_id": None,
                        "label": det["label"],
                        "message": f"DANGER: {det['label'].upper()} DETECTED",
                        "frame_index": frame_index,
                        "video_time_seconds": round(current_time, 1)
                    })

                for alert in abandoned_alerts + fire_smoke_alerts:
                    if "frame_index" not in alert:
                        alert["frame_index"] = frame_index
                    if "video_time_seconds" not in alert:
                        alert["video_time_seconds"] = round(current_time, 1)
                    all_alerts.append(alert)
                    if on_alert:
                        on_alert(alert, frame)

                frame = self._draw_boxes(frame, detections + faces + fire_smoke_detections)

            if on_frame:
                on_frame(frame, frame_index)

            frame_index += 1

        cap.release()
        return {"frames_processed": frame_index, "alerts": all_alerts}

    @staticmethod
    def _draw_boxes(frame, detections):
        for det in detections:
            x1, y1, x2, y2 = [int(v) for v in det["bbox"]]
            label = f"{det['label']} {det['confidence']:.2f}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, max(y1 - 10, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        return frame
