"""
Phase 2: live webcam feed. Streams annotated frames + alerts to the
frontend over a WebSocket so the UI can show live detection boxes.

Note: this reuses the exact same VideoProcessor as Phase 1 - only the
`source` passed to process_source changes (0 = default webcam instead of
a file path). This is why building Phase 1 first pays off.
"""
import asyncio
import base64

import cv2
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.video_processor import VideoProcessor
from app.core.database import SessionLocal
from app.models.incident import Incident
from app.models.camera import Camera

router = APIRouter()
processor = VideoProcessor()


@router.websocket("/webcam/{camera_id}")
async def webcam_feed(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    loop = asyncio.get_event_loop()

    async def send_frame(frame, frame_index):
        _, buffer = cv2.imencode(".jpg", frame)
        b64_frame = base64.b64encode(buffer).decode("utf-8")
        await websocket.send_json({"type": "frame", "frame_index": frame_index, "data": b64_frame})

    async def send_alert(alert):
        await websocket.send_json({"type": "alert", **alert})

    def on_frame(frame, frame_index):
        asyncio.run_coroutine_threadsafe(send_frame(frame, frame_index), loop)

    def on_alert(alert, frame):
        # Generate a small thumbnail from the frame
        small_frame = cv2.resize(frame, (320, 240))
        _, buffer = cv2.imencode(".jpg", small_frame)
        b64_thumb = base64.b64encode(buffer).decode("utf-8")
        alert["thumbnail"] = b64_thumb
        
        # Save to database
        db = SessionLocal()
        try:
            new_incident = Incident(
                alert_type=alert.get("label", "unknown"),
                confidence=alert.get("confidence", 1.0),
                status="new"
            )
            db.add(new_incident)
            db.commit()
        finally:
            db.close()
            
        asyncio.run_coroutine_threadsafe(send_alert(alert), loop)

    try:
        # Determine the video source based on camera_id
        db = SessionLocal()
        source = 0  # Default to local webcam
        try:
            if camera_id != "0" and camera_id != "default":
                camera = db.query(Camera).filter(Camera.id == int(camera_id)).first()
                if camera and camera.rtsp_url:
                    source = camera.rtsp_url
        finally:
            db.close()

        # Run the blocking OpenCV loop in a background thread so it doesn't
        # block the async WebSocket event loop.
        await loop.run_in_executor(
            None,
            lambda: processor.process_source(source, on_frame=on_frame, on_alert=on_alert),
        )
    except WebSocketDisconnect:
        pass
