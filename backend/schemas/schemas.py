from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List

# Auth
class Register(BaseModel):
    name: str = Field(..., min_length=2,max_length=40)
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

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class Onboarding(BaseModel):
    bank_balance: float = Field(..., ge=0,le=1000000000000)
    monthly_income: float = Field(..., ge=0,le =1000000000000)

class Msg(BaseModel):
    message: str

#  Expenses 
class ExpenseIn(BaseModel):
    title: str = Field(..., min_length=1,max_length=25)
    amount: float = Field(..., gt=0,le=1000000000000)
    category: str
    date: date
    note: Optional[str] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0,le=1000000000000)
    category: Optional[str] = None
    date: Optional[date] = None
    note: Optional[str] = None

class ExpenseOut(ExpenseIn):
    id: int
    created_at: Optional[datetime] = None
    class Config: from_attributes = True

#  Summary 
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
