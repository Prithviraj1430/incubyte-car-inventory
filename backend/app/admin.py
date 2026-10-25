from getpass import getpass

from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import password_hasher
from app.database import Base, engine
from app.models import User


def create_admin(session: Session, email: str, password: str) -> User:
    normalized_email = str(
        TypeAdapter(EmailStr).validate_python(email.strip())
    ).lower()

    if len(password) < 12:
        raise ValueError("Password must have at least 12 characters")

    existing = session.scalar(
        select(User).where(User.email == normalized_email)
    )
    if existing is not None:
        raise ValueError("An account with this email already exists")

    admin = User(
        email=normalized_email,
        password_hash=password_hasher.hash(password),
        role="admin",
    )
    session.add(admin)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise ValueError(
            "An account with this email already exists"
        ) from None

    session.refresh(admin)
    return admin


def main() -> None:
    Base.metadata.create_all(bind=engine)

    email = input("Admin email: ")
    password = getpass("Admin password: ")
    confirmation = getpass("Confirm password: ")

    if password != confirmation:
        raise SystemExit("Passwords do not match")

    try:
        with Session(engine) as session:
            admin = create_admin(session, email, password)
            admin_email = admin.email
    except (ValueError, ValidationError) as error:
        raise SystemExit(str(error)) from None

    print(f"Admin account created: {admin_email}")


if __name__ == "__main__":
    main()