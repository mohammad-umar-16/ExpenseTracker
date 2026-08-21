import os
from dotenv import load_dotenv; load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
import models.models
from routers import auth, expenses, summary, budgets

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Expense Tracker API")

origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
app.add_middleware(CORSMiddleware,
    allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router,     prefix="/api/auth")
app.include_router(expenses.router, prefix="/api/expenses")
app.include_router(summary.router,  prefix="/api/summary")
app.include_router(budgets.router,  prefix="/api/budgets")

@app.get("/health")
def health():
    return {"status": "awake"}