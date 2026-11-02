
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Backend root directory
BASE_DIR = Path(__file__).resolve().parents[2]

# Storage directory
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# SQLite database location
DATABASE_PATH = STORAGE_DIR / "dermaexplain.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"


# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for database models
Base = declarative_base()


def get_db():
    """Provide a database session to API endpoints."""

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create database tables."""

    # Import models so SQLAlchemy registers them
    from app.database import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
