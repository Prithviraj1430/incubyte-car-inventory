from fastapi.testclient import TestClient
import pytest


def test_inventory_requires_login(client: TestClient) -> None:
    response = client.get("/api/vehicles")

    assert response.status_code == 401


def test_customer_can_view_empty_inventory(client: TestClient) -> None:
    client.post(
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
    token = login.json()["access_token"]

    response = client.get(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json() == []


def test_inventory_rejects_invalid_token(client: TestClient) -> None:
    response = client.get(
        "/api/vehicles",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401

VALID_VEHICLE = {
    "make": "Tata",
    "model": "Nexon",
    "category": "SUV",
    "price": "1499999.00",
    "quantity": 3,
}


def test_customer_cannot_add_vehicle(client: TestClient) -> None:
    client.post(
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

    response = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {login.json()['access_token']}"},
        json=VALID_VEHICLE,
    )

    assert response.status_code == 403


def test_admin_can_add_vehicle_and_see_it_in_inventory(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    )

    assert created.status_code == 201
    assert created.json()["id"] > 0
    assert created.json()["make"] == "Tata"
    assert created.json()["price"] == "1499999.00"
    assert created.json()["quantity"] == 3

    inventory = client.get("/api/vehicles", headers=admin_headers)
    assert inventory.status_code == 200
    assert inventory.json() == [created.json()]


@pytest.mark.parametrize(
    "invalid_value",
    [
        {"price": "0"},
        {"quantity": -1},
        {"make": ""},
    ],
)
def test_admin_cannot_add_invalid_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
    invalid_value: dict[str, object],
) -> None:
    response = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={**VALID_VEHICLE, **invalid_value},
    )

    assert response.status_code == 422    