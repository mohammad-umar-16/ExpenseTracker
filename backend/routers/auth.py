from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import User
from schemas.schemas import Register, Login, UserOut, Onboarding, Msg
from core.core import hash_pw, verify_pw, current_user, set_auth_cookie, clear_auth_cookie

router = APIRouter()
MAX_ATTEMPTS = 5
LOCKOUT_MINS = 15

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: Register, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email, hashed_password=hash_pw(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    set_auth_cookie(response, user.id)
    return user

@router.post("/login", response_model=UserOut)
def login(data: Login, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email).first()

    if user and user.locked_until and user.locked_until > datetime.now(timezone.utc):
        raise HTTPException(429, "Too many failed attempts. Try again later.")

    if not user or not verify_pw(data.password, user.hashed_password):
        if user:
            user.failed_attempts += 1
            if user.failed_attempts >= MAX_ATTEMPTS:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINS)
            db.commit()
        raise HTTPException(401, "Invalid email or password")

    user.failed_attempts = 0
    user.locked_until = None
    db.commit()
    set_auth_cookie(response, user.id)
    return user

@router.post("/logout", response_model=Msg)
def logout(response: Response):
    clear_auth_cookie(response)
    return Msg(message="logged out")

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user

@router.post("/onboarding", response_model=UserOut)
def onboarding(data: Onboarding, user: User = Depends(current_user), db: Session = Depends(get_db)):
    user.bank_balance = data.bank_balance
    user.monthly_income = data.monthly_income
    user.is_onboarded = True
    db.commit()
    db.refresh(user)
    return user

@router.patch("/settings", response_model=UserOut)
def settings(data: Onboarding, user: User = Depends(current_user), db: Session = Depends(get_db)):
    user.bank_balance = data.bank_balance
    user.monthly_income = data.monthly_income
    db.commit()
    db.refresh(user)
    return user