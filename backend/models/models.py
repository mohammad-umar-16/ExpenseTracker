from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from database.db import Base

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True)
    name            = Column(String(100), nullable=False)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_onboarded    = Column(Boolean, default=False)
    bank_balance    = Column(Float, default=0.0)
    monthly_income  = Column(Float, default=0.0)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    failed_attempts = Column(Integer, default=0)
    locked_until    = Column(DateTime(timezone=True), nullable=True)

class Expense(Base):
    __tablename__ = "expenses"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title      = Column(String(200), nullable=False)
    amount     = Column(Float, nullable=False)
    category   = Column(String(100), nullable=False)
    date       = Column(Date, nullable=False)
    note       = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())