from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database.db import get_db
from models.models import Budget, User
from schemas.schemas import BudgetIn, BudgetOut
from core.core import current_user

router = APIRouter()

@router.get("", response_model=List[BudgetOut])
def list_budgets(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return db.query(Budget).filter_by(user_id=user.id).all()

@router.put("", response_model=BudgetOut)
def set_budget(data: BudgetIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = db.query(Budget).filter_by(user_id=user.id, category=data.category).first()
    if row:
        row.monthly_limit = data.monthly_limit
    else:
        row = Budget(user_id=user.id, category=data.category, monthly_limit=data.monthly_limit)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.delete("/{category}", status_code=204)
def delete_budget(category: str, db: Session = Depends(get_db), user: User = Depends(current_user)):
    row = db.query(Budget).filter_by(user_id=user.id, category=category).first()
    if row:
        db.delete(row)
        db.commit()