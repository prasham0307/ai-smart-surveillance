from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.base import Base
from app.models.user import User
from app.models.camera import Camera
from app.models.incident import Incident
from app.core.security import get_password_hash

def init_db(db: Session):
    # Create all tables in the database (SQLite file)
    Base.metadata.create_all(bind=engine)

    # Check if super admin exists
    admin = db.query(User).filter(User.email == "admin@surveillance.com").first()
    if not admin:
        # Create default super admin
        admin = User(
            email="admin@surveillance.com",
            hashed_password=get_password_hash("admin123"),
            role="super_admin"
        )
        db.add(admin)
        db.commit()
        print("Default Super Admin created: admin@surveillance.com / admin123")
