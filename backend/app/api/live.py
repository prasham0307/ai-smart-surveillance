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

router = APIRouter()
processor = VideoProcessor()


@router.websocket("/webcam")
async def webcam_feed(websocket: WebSocket):
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
        asyncio.run_coroutine_threadsafe(send_alert(alert), loop)

    try:
        # Run the blocking OpenCV loop in a background thread so it doesn't
        # block the async WebSocket event loop.
        await loop.run_in_executor(
            None,
            lambda: processor.process_source(0, on_frame=on_frame, on_alert=on_alert),
        )
    except WebSocketDisconnect:
        pass
