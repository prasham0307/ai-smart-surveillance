from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.models.base import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, default="default")  # Can map to Camera table later
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    alert_type = Column(String, index=True, nullable=False)  # person, fire, abandoned_object
    confidence = Column(Float, nullable=False)
    snapshot_path = Column(String, nullable=True)
    status = Column(String, default="new")  # new, acknowledged, resolved
