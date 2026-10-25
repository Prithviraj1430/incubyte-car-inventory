from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.database import Base, get_session
from app.main import app
from app.models import User


@pytest.fixture
def test_engine(tmp_path: Path) -> Iterator[Engine]:
    engine = create_engine(
        f"sqlite:///{(tmp_path / 'test.db').as_posix()}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture
def client(
    test_engine: Engine,
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[TestClient]:
    monkeypatch.setenv("JWT_SECRET", "test-only-secret-for-inventory-tests")

    def test_session() -> Iterator[Session]:
        with Session(test_engine) as session:
            yield session

    app.dependency_overrides[get_session] = test_session
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def admin_headers(client: TestClient, test_engine: Engine) -> dict[str, str]:
    registration = client.post(
        "/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "SecurePass123!",
        },
    )
    assert registration.status_code == 201

    with Session(test_engine) as session:
        admin = session.scalar(
            select(User).where(User.email == "admin@example.com")
        )
        assert admin is not None
        admin.role = "admin"
        session.commit()

    login = client.post(
        "/api/auth/login",
        json={
            "email": "admin@example.com",
            "password": "SecurePass123!",
        },
    )
    assert login.status_code == 200

    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.fixture
def customer_headers(client: TestClient) -> dict[str, str]:
    registration = client.post(
        "/api/auth/register",
        json={
            "email": "customer@example.com",
            "password": "SecurePass123!",
        },
    )
    assert registration.status_code == 201

    login = client.post(
        "/api/auth/login",
        json={
            "email": "customer@example.com",
            "password": "SecurePass123!",
        },
    )
    assert login.status_code == 200

    return {"Authorization": f"Bearer {login.json()['access_token']}"}