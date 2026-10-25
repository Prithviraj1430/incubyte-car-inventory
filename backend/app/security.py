import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated

import jwt
from dotenv import load_dotenv

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import User

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

TOKEN_LIFETIME = timedelta(minutes=30)
ALGORITHM = "HS256"


def create_access_token(user_id: int) -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET must be configured")

    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "sub": str(user_id),
            "iat": now,
            "exp": now + TOKEN_LIFETIME,
        },
        secret,
        algorithm=ALGORITHM,
    )

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    session: Annotated[Session, Depends(get_session)],
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET must be configured")

    try:
        payload = jwt.decode(
            credentials.credentials,
            secret,
            algorithms=[ALGORITHM],
        )
        subject = payload.get("sub")
        if not isinstance(subject, str) or not subject.isdecimal():
            raise unauthorized
    except jwt.InvalidTokenError:
        raise unauthorized from None

    user = session.get(User, int(subject))
    if user is None:
        raise unauthorized

    return user


def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
