import cv2
from app.ai.fire_smoke_detector import FireSmokeDetector

def test_fire():
    detector = FireSmokeDetector(conf_threshold=0.25)
    cap = cv2.VideoCapture("sample_videos/fire_test.mp4")
    
    frame_count = 0
    while cap.isOpened() and frame_count < 150:
        ret, frame = cap.read()
        if not ret:
            break
            
        detections = detector.detect(frame)
        if detections:
            print(f"[Frame {frame_count}] FIRE/SMOKE DETECTED: {detections}")
            
        frame_count += 1
        
    print(f"Finished. Analyzed {frame_count} frames.")
    cap.release()

if __name__ == "__main__":
    test_fire()
