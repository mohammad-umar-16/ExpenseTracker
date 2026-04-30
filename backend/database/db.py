import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine(os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/expense_tracker"))
Session = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()
