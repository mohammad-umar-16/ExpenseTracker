from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List

class Register(BaseModel):
    name: str = Field(..., min_length=2, max_length=40)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=40)

class Login(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_onboarded: bool
    bank_balance: float
    monthly_income: float
    class Config: from_attributes = True

MAX_AMOUNT = 1_000_000_000_000

class Onboarding(BaseModel):
    bank_balance: float = Field(..., ge=0, le=MAX_AMOUNT)
    monthly_income: float = Field(..., ge=0, le=MAX_AMOUNT)

class Msg(BaseModel):
    message: str

class ExpenseIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=25)
    amount: float = Field(..., gt=0, le=MAX_AMOUNT)
    category: str
    date: date
    note: Optional[str] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0, le=MAX_AMOUNT)
    category: Optional[str] = None
    date: Optional[date] = None
    note: Optional[str] = None

class ExpenseOut(ExpenseIn):
    id: int
    created_at: Optional[datetime] = None
    class Config: from_attributes = True

class ParseIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=200)

class ParseOut(BaseModel):
    title: str
    amount: float
    category: str
    date: date
    source: str

class CategoryTotal(BaseModel):
    category: str
    total: float
    percentage: float

class DayTotal(BaseModel):
    date: date
    total: float
    count: int

class MonthlySummary(BaseModel):
    month: int
    year: int
    total: float
    by_category: List[CategoryTotal]
    daily_totals: List[DayTotal]
    bank_balance: float
    monthly_income: float