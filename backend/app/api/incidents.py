from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.incident import Incident
from app.api.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter()

class IncidentResponse(BaseModel):
    id: int
    camera_id: str
    timestamp: datetime
    alert_type: str
    confidence: float
    snapshot_path: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[IncidentResponse])
def get_incidents(limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return latest incidents first
    return db.query(Incident).order_by(Incident.timestamp.desc()).limit(limit).all()
