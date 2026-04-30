from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import User
from schemas.schemas import Register, Login, TokenOut, UserOut, Onboarding, Msg
from core.core import hash_pw, verify_pw, make_token, current_user

router = APIRouter()

@router.post("/register", response_model=TokenOut, status_code=201)
def register(data: Register, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email, hashed_password=hash_pw(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    # register login
    return TokenOut(access_token=make_token(user.id), user=UserOut.model_validate(user))

@router.post("/login", response_model=TokenOut)
def login(data: Login, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email).first()
    if not user or not verify_pw(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    return TokenOut(access_token=make_token(user.id), user=UserOut.model_validate(user))

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
