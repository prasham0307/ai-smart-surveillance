"""
Entry point for the AI Smart Surveillance backend.
Run with: uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.api import upload, detections, live, auth, cameras, incidents
from app.core.database import SessionLocal
from app.core.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    init_db(db)
    db.close()
    yield

app = FastAPI(title="AI Smart Surveillance System", version="0.1.0", lifespan=lifespan)

# Allow the React/Next.js frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/videos", tags=["Videos"])
app.include_router(detections.router, prefix="/api/detections", tags=["Detections"])
app.include_router(live.router, prefix="/api/live", tags=["Live Camera"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])

# Mount outputs directory so frontend can access the annotated videos
import os
os.makedirs("outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "ai-surveillance-backend"}
