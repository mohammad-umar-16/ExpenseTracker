def test_register_sets_cookie(client):
    r = client.post("/api/auth/register", json={
        "name": "Alice", "email": "alice@test.com", "password": "password123",
    })
    assert r.status_code == 201
    assert "access_token" in r.cookies

def test_duplicate_email_rejected(client):
    payload = {"name": "Bob", "email": "dup@test.com", "password": "password123"}
    client.post("/api/auth/register", json=payload)
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 400

def test_wrong_password_rejected(client):
    client.post("/api/auth/register", json={
        "name": "Carl", "email": "carl@test.com", "password": "correctpass",
    })
    r = client.post("/api/auth/login", json={"email": "carl@test.com", "password": "wrongpass"})
    assert r.status_code == 401

def test_login_lockout_after_five_failed_attempts(client):
    client.post("/api/auth/register", json={
        "name": "Locky", "email": "locky@test.com", "password": "correctpass",
    })
    for _ in range(5):
        r = client.post("/api/auth/login", json={"email": "locky@test.com", "password": "wrongpass"})
        assert r.status_code == 401

    r = client.post("/api/auth/login", json={"email": "locky@test.com", "password": "correctpass"})
    assert r.status_code == 429

def test_me_requires_auth(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401