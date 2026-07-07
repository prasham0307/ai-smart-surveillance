import os
import subprocess
from huggingface_hub import hf_hub_download

def main():
    # 1. Download Fire/Smoke model weights
    print("Downloading fire/smoke YOLOv8 weights from Hugging Face...")
    os.makedirs("weights", exist_ok=True)
    
    # Download the weights file
    weights_path = hf_hub_download(
        repo_id="rabahdev/fire-smoke-yolov8n", 
        filename="best.pt",
        local_dir="weights"
    )
    
    # Rename it to what fire_smoke_detector.py expects
    target_path = "weights/fire_smoke_yolov8.pt"
    if os.path.exists(target_path):
        os.remove(target_path)
    os.rename(weights_path, target_path)
    print(f"Model saved to {target_path}")

    # 2. Download a sample video
    print("Downloading sample fire video for testing...")
    os.makedirs("sample_videos", exist_ok=True)
    output_template = "sample_videos/fire_test.mp4"
    
    if not os.path.exists(output_template):
        try:
            # We search youtube for a short fire stock video and download it
            subprocess.run([
                "yt-dlp",
                "ytsearch1:fire smoke stock video short",
                "-f", "mp4[height<=720]", # limit resolution to keep it fast
                "-o", output_template
            ], check=True)
            print(f"Sample video saved to {output_template}")
        except Exception as e:
            print(f"Failed to download video: {e}")
    else:
        print("Sample video already exists.")

if __name__ == "__main__":
    main()
