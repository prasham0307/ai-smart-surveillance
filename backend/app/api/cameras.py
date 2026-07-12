from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.camera import Camera
from app.api.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel
from typing import List

router = APIRouter()

class CameraCreate(BaseModel):
    name: str
    rtsp_url: str
    location: str = ""

class CameraResponse(BaseModel):
    id: int
    name: str
    rtsp_url: str
    location: str
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CameraResponse])
def get_cameras(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Camera).all()

@router.post("/", response_model=CameraResponse)
def create_camera(camera: CameraCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db_camera = Camera(**camera.model_dump())
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    return db_camera

@router.delete("/{camera_id}")
def delete_camera(camera_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    db.delete(camera)
    db.commit()
    return {"message": "Camera deleted successfully"}
