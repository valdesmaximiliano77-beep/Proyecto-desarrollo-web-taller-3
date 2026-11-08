from pymongo import MongoClient
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


mongo = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=2000)
mongo_db = mongo[settings.mongo_db]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()