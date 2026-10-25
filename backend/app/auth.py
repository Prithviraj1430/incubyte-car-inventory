from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import User
from app.security import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
password_hasher = PasswordHash.recommended()


class RegistrationRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"    


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    details: RegistrationRequest,
    session: Annotated[Session, Depends(get_session)],
) -> User:
    user = User(
        email=str(details.email).lower(),
        password_hash=password_hasher.hash(details.password),
        role="customer",
    )
    session.add(user)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        ) from None

    session.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    session: Annotated[Session, Depends(get_session)],
) -> TokenResponse:
    user = session.scalar(
        select(User).where(User.email == str(credentials.email).lower())
    )

    if user is None or not password_hasher.verify(
        credentials.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user
