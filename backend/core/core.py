import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import User

SECRET = os.getenv("SECRET_KEY")
if not SECRET:
    raise RuntimeError("SECRET_KEY env var is not set")

ALGO       = "HS256"
EXP_MINS   = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
COOKIE_KEY = "access_token"
IS_PROD    = os.getenv("ENV", "production") != "development"

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pw(password: str) -> str:
    return pwd.hash(password)

def verify_pw(password: str, hashed: str) -> bool:
    return pwd.verify(password, hashed)

def make_token(uid: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=EXP_MINS)
    return jwt.encode({"sub": str(uid), "exp": exp}, SECRET, algorithm=ALGO)

def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None

def set_auth_cookie(response: Response, uid: int) -> None:
    token = make_token(uid)
    response.set_cookie(
        key=COOKIE_KEY, value=token, httponly=True,
        secure=IS_PROD, samesite="none" if IS_PROD else "lax",
        max_age=EXP_MINS * 60, path="/",
    )

def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE_KEY, path="/", samesite="none" if IS_PROD else "lax", secure=IS_PROD)

def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(COOKIE_KEY)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    uid = decode_token(token)
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = db.get(User, uid)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user