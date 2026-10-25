from fastapi.testclient import TestClient
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
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

def test_search_requires_login(client: TestClient) -> None:
    response = client.get("/api/vehicles/search?make=Tata")

    assert response.status_code == 401


@pytest.mark.parametrize(
    ("filters", "expected_models"),
    [
        ({"make": "tAtA"}, ["Nexon"]),
        ({"model": "nEx"}, ["Nexon"]),
        ({"category": "sUv"}, ["Nexon", "Thar"]),
        (
            {"min_price": "1499999.00", "max_price": "1800000.00"},
            ["Nexon", "Thar"],
        ),
        (
            {"category": "SUV", "max_price": "1499999.00"},
            ["Nexon"],
        ),
    ],
)
def test_search_filters_vehicles(
    client: TestClient,
    admin_headers: dict[str, str],
    filters: dict[str, str],
    expected_models: list[str],
) -> None:
    vehicles = [
        VALID_VEHICLE,
        {
            "make": "Hyundai",
            "model": "i20",
            "category": "Hatchback",
            "price": "800000.00",
            "quantity": 2,
        },
        {
            "make": "Mahindra",
            "model": "Thar",
            "category": "SUV",
            "price": "1800000.00",
            "quantity": 1,
        },
    ]
    for vehicle in vehicles:
        created = client.post(
            "/api/vehicles",
            headers=admin_headers,
            json=vehicle,
        )
        assert created.status_code == 201

    response = client.get(
        "/api/vehicles/search",
        headers=admin_headers,
        params=filters,
    )

    assert response.status_code == 200
    assert [vehicle["model"] for vehicle in response.json()] == expected_models


@pytest.mark.parametrize(
    "filters",
    [
        {"min_price": "-1"},
        {"min_price": "2000000", "max_price": "1000000"},
    ],
)
def test_search_rejects_invalid_price_range(
    client: TestClient,
    admin_headers: dict[str, str],
    filters: dict[str, str],
) -> None:
    response = client.get(
        "/api/vehicles/search",
        headers=admin_headers,
        params=filters,
    )

    assert response.status_code == 422    

def test_admin_can_update_a_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

    changes = {
        **VALID_VEHICLE,
        "category": "Crossover",
        "price": "1399999.50",
        "quantity": 5,
    }
    response = client.put(
        f"/api/vehicles/{created['id']}",
        headers=admin_headers,
        json=changes,
    )

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]
    assert response.json()["category"] == "Crossover"
    assert response.json()["price"] == "1399999.50"
    assert response.json()["quantity"] == 5

    inventory = client.get("/api/vehicles", headers=admin_headers).json()
    assert inventory == [response.json()]


def test_customer_cannot_update_a_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

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
    customer_headers = {
        "Authorization": f"Bearer {login.json()['access_token']}"
    }

    response = client.put(
        f"/api/vehicles/{created['id']}",
        headers=customer_headers,
        json=VALID_VEHICLE,
    )

    assert response.status_code == 403


def test_update_requires_login(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

    response = client.put(
        f"/api/vehicles/{created['id']}",
        json=VALID_VEHICLE,
    )

    assert response.status_code == 401


def test_update_reports_unknown_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.put(
        "/api/vehicles/999999",
        headers=admin_headers,
        json=VALID_VEHICLE,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Vehicle not found"


def test_update_rejects_invalid_quantity(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

    response = client.put(
        f"/api/vehicles/{created['id']}",
        headers=admin_headers,
        json={**VALID_VEHICLE, "quantity": -1},
    )

    assert response.status_code == 422

def test_admin_can_delete_a_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

    response = client.delete(
        f"/api/vehicles/{created['id']}",
        headers=admin_headers,
    )

    assert response.status_code == 204
    assert response.content == b""
    assert client.get("/api/vehicles", headers=admin_headers).json() == []


def test_customer_cannot_delete_a_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

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

    response = client.delete(
        f"/api/vehicles/{created['id']}",
        headers={
            "Authorization": f"Bearer {login.json()['access_token']}"
        },
    )

    assert response.status_code == 403


def test_delete_requires_login(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

    response = client.delete(f"/api/vehicles/{created['id']}")

    assert response.status_code == 401


def test_delete_reports_unknown_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.delete(
        "/api/vehicles/999999",
        headers=admin_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Vehicle not found"

def test_customer_purchase_decreases_stock(
    client: TestClient,
    admin_headers: dict[str, str],
    customer_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={**VALID_VEHICLE, "quantity": 2},
    ).json()

    response = client.post(
        f"/api/vehicles/{created['id']}/purchase",
        headers=customer_headers,
    )

    assert response.status_code == 200
    assert response.json()["quantity"] == 1

    inventory = client.get("/api/vehicles", headers=customer_headers).json()
    assert inventory[0]["quantity"] == 1


def test_purchase_rejects_sold_out_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
    customer_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={**VALID_VEHICLE, "quantity": 0},
    ).json()

    response = client.post(
        f"/api/vehicles/{created['id']}/purchase",
        headers=customer_headers,
    )

    assert response.status_code == 409
    assert client.get(
        "/api/vehicles", headers=customer_headers
    ).json()[0]["quantity"] == 0


def test_purchase_reports_unknown_vehicle(
    client: TestClient,
    customer_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/vehicles/999999/purchase",
        headers=customer_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Vehicle not found"


def test_purchase_requires_login(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=VALID_VEHICLE,
    ).json()

    response = client.post(f"/api/vehicles/{created['id']}/purchase")

    assert response.status_code == 401

def test_only_one_customer_can_buy_the_last_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
    customer_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json={**VALID_VEHICLE, "quantity": 1},
    ).json()
    purchase_url = f"/api/vehicles/{created['id']}/purchase"
    start_together = Barrier(2)

    def buy() -> int:
        start_together.wait(timeout=10)
        return client.post(
            purchase_url,
            headers=customer_headers,
        ).status_code

    with ThreadPoolExecutor(max_workers=2) as executor:
        attempts = [executor.submit(buy) for _ in range(2)]
        statuses = [attempt.result(timeout=20) for attempt in attempts]

    assert sorted(statuses) == [200, 409]

    inventory = client.get("/api/vehicles", headers=customer_headers).json()
    assert inventory[0]["quantity"] == 0