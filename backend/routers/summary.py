from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List
from database.db import get_db
from models.models import Expense, User, Budget
from schemas.schemas import MonthlySummary, CategoryTotal, DayTotal, BudgetProgress
from core.core import current_user

from services.insights import build_insights

router = APIRouter()

def _compute(db, user, month, year):
    rows = db.query(Expense).filter(
        Expense.user_id == user.id,
        extract("month", Expense.date) == month,
        extract("year",  Expense.date) == year,
    ).all()

    total = float(sum(float(r.amount) for r in rows))
    cats, days, day_cnt = {}, {}, {}
    for r in rows:
        amount = float(r.amount)
        cats[r.category]  = cats.get(r.category, 0.0) + amount
        days[r.date]      = days.get(r.date, 0.0) + amount
        day_cnt[r.date]   = day_cnt.get(r.date, 0) + 1
    return total, cats, days, day_cnt

@router.get("/monthly", response_model=MonthlySummary)
def monthly(
    month: int = Query(..., ge=1, le=12),
    year:  int = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    total, cats, days, day_cnt = _compute(db, user, month, year)

    return MonthlySummary(
        month=month, year=year, total=total,
        bank_balance=user.bank_balance,
        monthly_income=user.monthly_income,
        by_category=[
            CategoryTotal(category=c, total=a, percentage=round(a / total * 100, 1) if total else 0)
            for c, a in sorted(cats.items(), key=lambda x: -x[1])
        ],
        daily_totals=[DayTotal(date=d, total=days[d], count=day_cnt[d]) for d in sorted(days)],
    )

@router.get("/insights")
async def insights(
    month: int = Query(..., ge=1, le=12),
    year:  int = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    total, cats, _, _ = _compute(db, user, month, year)
    prev_month, prev_year = (12, year - 1) if month == 1 else (month - 1, year)
    prev_total, prev_cats, _, _ = _compute(db, user, prev_month, prev_year)

    text = await build_insights(total=total, cats=cats, prev_total=prev_total, prev_cats=prev_cats)
    return {"insights": text}

@router.get("/budget-progress", response_model=List[BudgetProgress])
def budget_progress(
    month: int = Query(..., ge=1, le=12),
    year:  int = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    _, cats, _, _ = _compute(db, user, month, year)
    budgets = db.query(Budget).filter_by(user_id=user.id).all()
    return [
        BudgetProgress(
            category=b.category,
            limit=b.monthly_limit,
            spent=cats.get(b.category, 0.0),
            percentage=round(cats.get(b.category, 0.0) / b.monthly_limit * 100, 1) if b.monthly_limit else 0,
        )
        for b in budgets
    ]