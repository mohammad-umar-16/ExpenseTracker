from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from database.db import get_db
from models.models import Expense, User
from schemas.schemas import MonthlySummary, CategoryTotal, DayTotal
from core.core import current_user

router = APIRouter()

@router.get("/monthly", response_model=MonthlySummary)
def monthly(
    month: int = Query(..., ge=1, le=12),
    year:  int = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
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
