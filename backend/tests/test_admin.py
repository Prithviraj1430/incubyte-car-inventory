import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.models import User


def test_created_admin_can_login_and_add_vehicle(
    client: TestClient,
    test_engine: Engine,
) -> None:
    from app.admin import create_admin

    with Session(test_engine) as session:
        admin = create_admin(
            session,
            email="admin@example.com",
            password="SecureAdmin123!",
        )
        assert admin.role == "admin"

    login = client.post(
        "/api/auth/login",
        json={
            "email": "admin@example.com",
            "password": "SecureAdmin123!",
        },
    )
    assert login.status_code == 200

    created = client.post(
        "/api/vehicles",
        headers={
            "Authorization": f"Bearer {login.json()['access_token']}"
        },
        json={
            "make": "Tata",
            "model": "Nexon",
            "category": "SUV",
            "price": "1499999.00",
            "quantity": 3,
        },
    )
    assert created.status_code == 201


def test_admin_setup_does_not_promote_an_existing_customer(
    client: TestClient,
    test_engine: Engine,
) -> None:
    from app.admin import create_admin

    client.post(
        "/api/auth/register",
        json={
            "email": "driver@example.com",
            "password": "SecurePass123!",
        },
    )

    with Session(test_engine) as session:
        with pytest.raises(ValueError, match="already exists"):
            create_admin(
                session,
                email="driver@example.com",
                password="SecureAdmin123!",
            )

        customer = session.scalar(
            select(User).where(User.email == "driver@example.com")
        )
        assert customer is not None
        assert customer.role == "customer"


def test_admin_setup_rejects_short_password(test_engine: Engine) -> None:
    from app.admin import create_admin

    with Session(test_engine) as session:
        with pytest.raises(ValueError, match="at least 12"):
            create_admin(
                session,
                email="admin@example.com",
                password="short",
            )