from main import app
from fastapi.testclient import TestClient


def register(client, email):
    client.post("/api/auth/register", json={"name": "User", "email": email, "password": "password123"})


def test_create_and_list_own_expense(client):
    register(client, "a@test.com")
    r = client.post("/api/expenses", json={
        "title": "Coffee", "amount": 100, "category": "Food & Drinks", "date": "2026-08-19",
    })
    assert r.status_code == 201

    r2 = client.get("/api/expenses", params={"month": 8, "year": 2026})
    assert r2.status_code == 200
    assert len(r2.json()) == 1
    assert r2.json()[0]["title"] == "Coffee"

def test_user_cannot_see_or_edit_another_users_expense(client):
    register(client, "b@test.com")
    r = client.post("/api/expenses", json={
        "title": "Private", "amount": 500, "category": "Shopping", "date": "2026-08-19",
    })
    exp_id = r.json()["id"]

    other = TestClient(app)
    register(other, "c@test.com")

    r2 = other.get("/api/expenses", params={"month": 8, "year": 2026})
    assert r2.status_code == 200
    assert len(r2.json()) == 0

    r3 = other.put(f"/api/expenses/{exp_id}", json={"title": "Hacked"})
    assert r3.status_code == 404

    r4 = other.delete(f"/api/expenses/{exp_id}")
    assert r4.status_code == 404

def test_search_filter_matches_title(client):
    register(client, "d@test.com")
    client.post("/api/expenses", json={"title": "Uber ride", "amount": 200, "category": "Travel", "date": "2026-08-19"})
    client.post("/api/expenses", json={"title": "Groceries", "amount": 800, "category": "Shopping", "date": "2026-08-19"})

    r = client.get("/api/expenses", params={"search": "uber"})
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Uber ride"

def test_amount_range_filter(client):
    register(client, "e@test.com")
    client.post("/api/expenses", json={"title": "Cheap", "amount": 50,  "category": "Other", "date": "2026-08-19"})
    client.post("/api/expenses", json={"title": "Expensive", "amount": 5000, "category": "Other", "date": "2026-08-19"})

    r = client.get("/api/expenses", params={"min_amount": 1000})
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Expensive"