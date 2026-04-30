from dotenv import load_dotenv; load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
import models.models  # register tables
from routers import auth, expenses, summary

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Expense Tracker API")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router,     prefix="/api/auth")
app.include_router(expenses.router, prefix="/api/expenses")
app.include_router(summary.router,  prefix="/api/summary")
