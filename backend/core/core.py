import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database.db import get_db
from models.models import User

SECRET   = os.getenv("SECRET_KEY", "dxgchcjjjd")
ALGO     = "HS256"
EXP_MINS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# password 
def hash_pw(password: str) -> str:
    return pwd.hash(password)

def verify_pw(password: str, hashed: str) -> bool:
    return pwd.verify(password, hashed)

#jwt
def make_token(uid: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=EXP_MINS)
    return jwt.encode({"sub": str(uid), "exp": exp}, SECRET, algorithm=ALGO)

def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None

# auth depend
def current_user(token: str = Depends(oauth), db: Session = Depends(get_db)) -> User:
    uid = decode_token(token)
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = db.get(User, uid)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
