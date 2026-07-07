"""
Fastest way to sanity-check the pipeline before wiring up FastAPI/React.
Run: python quick_test.py path/to/sample_video.mp4
Add -v to print every raw detection (label + confidence) to the console,
useful for checking what YOLO actually calls an object in your video:
Run: python quick_test.py path/to/sample_video.mp4 -v

For Phase 2 webcam quick test, run: python quick_test.py webcam
"""
import sys
import cv2

from app.services.video_processor import VideoProcessor


def main():
    if len(sys.argv) < 2:
        print("Usage: python quick_test.py <video_path | webcam> [-v]")
        sys.exit(1)

    source = 0 if sys.argv[1] == "webcam" else sys.argv[1]
    verbose = "-v" in sys.argv
    processor = VideoProcessor()

    def on_frame(frame, frame_index):
        cv2.imshow("AI Surveillance - Quick Test (press q to quit)", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            raise KeyboardInterrupt

    def on_alert(alert):
        print(f"[ALERT] {alert}")

    try:
        result = processor.process_source(source, on_frame=on_frame, on_alert=on_alert, verbose=verbose)
        print(f"\nDone. Frames processed: {result['frames_processed']}")
        print(f"Total alerts: {len(result['alerts'])}")
    except KeyboardInterrupt:
        print("\nStopped by user.")
    finally:
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()