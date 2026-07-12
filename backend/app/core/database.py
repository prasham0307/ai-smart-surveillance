import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Start with SQLite for easy local dev. Can be swapped to postgresql:// later.
SQLALCHEMY_DATABASE_URL = "sqlite:///./surveillance.db"

# connect_args={"check_same_thread": False} is only needed for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
