from fastapi.testclient import TestClient
from fastapi.testclient import TestClient


def test_register_creates_a_customer_without_exposing_password(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": "driver@example.com",
            "password": "SecurePass123!",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "driver@example.com"
    assert response.json()["role"] == "customer"
    assert "id" in response.json()
    assert "password" not in response.json()
    assert "password_hash" not in response.json()

def test_register_rejects_duplicate_email(client: TestClient) -> None:
    details = {
        "email": "driver@example.com",
        "password": "SecurePass123!",
    }

    first_response = client.post("/api/auth/register", json=details)
    second_response = client.post("/api/auth/register", json=details)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_register_rejects_invalid_email(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "SecurePass123!"},
    )

    assert response.status_code == 422


def test_login_returns_a_bearer_token_for_valid_credentials(
    client: TestClient,
) -> None:
    client.post(
        "/api/auth/register",
        json={
            "email": "driver@example.com",
            "password": "SecurePass123!",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "driver@example.com",
            "password": "SecurePass123!",
        },
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert isinstance(response.json()["access_token"], str)
    assert response.json()["access_token"]


def test_login_rejects_an_incorrect_password(
    client: TestClient,
) -> None:
    client.post(
        "/api/auth/register",
        json={
            "email": "driver@example.com",
            "password": "SecurePass123!",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "driver@example.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401

def test_me_requires_login(client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_returns_current_customer(client: TestClient) -> None:
    registration = client.post(
        "/api/auth/register",
        json={
            "email": "driver@example.com",
            "password": "SecurePass123!",
        },
    )
    login = client.post(
        "/api/auth/login",
        json={
            "email": "driver@example.com",
            "password": "SecurePass123!",
        },
    )

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {login.json()['access_token']}"
        },
    )

    assert response.status_code == 200
    assert response.json() == registration.json()
    assert response.json()["role"] == "customer"
    assert "password_hash" not in response.json()


def test_me_returns_admin_role(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.get("/api/auth/me", headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["role"] == "admin"    