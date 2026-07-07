"""
Placeholder routes for querying stored detections/alerts once you wire up
PostgreSQL (see SRS section 6 - Database Entities). For the MVP, the
/upload endpoint already returns alerts directly in its response, so this
becomes relevant once you persist results and want a history/reports view.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_detections():
    # TODO: query the Alerts/Detections table once SQLAlchemy models + DB are set up
    return {"message": "Wire this up to PostgreSQL once your DB models are ready."}
