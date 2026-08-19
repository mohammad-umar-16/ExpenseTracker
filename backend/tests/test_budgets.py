def register(client, email):
    client.post("/api/auth/register", json={"name": "User", "email": email, "password": "password123"})


def test_set_and_get_budget(client):
    register(client, "budget1@test.com")
    r = client.put("/api/budgets", json={"category": "Food & Drinks", "monthly_limit": 5000})
    assert r.status_code == 200

    r2 = client.get("/api/budgets")
    assert r2.status_code == 200
    assert len(r2.json()) == 1
    assert r2.json()[0]["monthly_limit"] == 5000

def test_updating_budget_overwrites_not_duplicates(client):
    register(client, "budget2@test.com")
    client.put("/api/budgets", json={"category": "Travel", "monthly_limit": 2000})
    client.put("/api/budgets", json={"category": "Travel", "monthly_limit": 3000})

    r = client.get("/api/budgets")
    rows = [b for b in r.json() if b["category"] == "Travel"]
    assert len(rows) == 1
    assert rows[0]["monthly_limit"] == 3000

def test_delete_budget(client):
    register(client, "budget3@test.com")
    client.put("/api/budgets", json={"category": "Shopping", "monthly_limit": 1000})
    r = client.delete("/api/budgets/Shopping")
    assert r.status_code == 204

    r2 = client.get("/api/budgets")
    assert len(r2.json()) == 0