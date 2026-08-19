from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date
from typing import Optional, List
from database.db import get_db
from models.models import Expense, User
from schemas.schemas import ExpenseIn, ExpenseUpdate, ExpenseOut, ParseIn, ParseImageIn, ParseOut
from core.core import current_user
from services.parser import parse_expense_text, parse_expense_image

router = APIRouter()

def get_expense(db, user_id, expense_id):
    exp = db.query(Expense).filter_by(id=expense_id, user_id=user_id).first()
    if not exp:
        raise HTTPException(404, "Expense not found")
    return exp

@router.get("", response_model=List[ExpenseOut])
def list_expenses(
    month: Optional[int] = Query(None, ge=1, le=12),
    year:  Optional[int] = None,
    date:  Optional[date] = None,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    q = db.query(Expense).filter_by(user_id=user.id)
    if date:
        q = q.filter(Expense.date == date)
    elif month and year:
        q = q.filter(
            extract("month", Expense.date) == month,
            extract("year",  Expense.date) == year,
        )
    return q.order_by(Expense.date.desc(), Expense.created_at.desc()).all()

@router.post("/parse", response_model=ParseOut)
async def parse(data: ParseIn, user: User = Depends(current_user)):
    result = await parse_expense_text(data.text)
    return result

@router.post("/parse-image", response_model=ParseOut)
async def parse_image(data: ParseImageIn, user: User = Depends(current_user)):
    return await parse_expense_image(data.image_base64, data.mime_type)

@router.post("", response_model=ExpenseOut, status_code=201)
def create(data: ExpenseIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    exp = Expense(**data.model_dump(), user_id=user.id)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.put("/{eid}", response_model=ExpenseOut)
def update(eid: int, data: ExpenseUpdate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    exp = get_expense(db, user.id, eid)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(exp, key, val)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{eid}", status_code=204)
def delete(eid: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    db.delete(get_expense(db, user.id, eid))
    db.commit()