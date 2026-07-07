"""
Phase 1: upload a video file, run it through the detection pipeline,
save an annotated output video + return the list of alerts.
"""
import os
import shutil
import uuid

import cv2
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

from app.services.video_processor import VideoProcessor

router = APIRouter()
processor = VideoProcessor()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    video_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{video_id}_{file.filename}")
    output_path = os.path.join(OUTPUT_DIR, f"{video_id}_annotated.mp4")

    # Save the uploaded file to disk
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Set up the output video writer (matches input resolution/fps)
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    writer = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    def on_frame(frame, frame_index):
        writer.write(frame)

    result = processor.process_source(input_path, on_frame=on_frame)
    writer.release()

    return JSONResponse({
        "video_id": video_id,
        "frames_processed": result["frames_processed"],
        "alerts": result["alerts"],
        "annotated_video_path": output_path,
    })
