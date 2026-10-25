from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import User, Vehicle
from app.security import get_current_user

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, Field

from app.security import get_current_user, require_admin
from fastapi import HTTPException, Query
from sqlalchemy import func
router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

class VehicleCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    quantity: int = Field(ge=0, strict=True)


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    make: str
    model: str
    category: str
    price: Decimal
    quantity: int

@router.get("/search", response_model=list[VehicleResponse])
def search_vehicles(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    make: Annotated[str | None, Query(min_length=1)] = None,
    model: Annotated[str | None, Query(min_length=1)] = None,
    category: Annotated[str | None, Query(min_length=1)] = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
) -> list[Vehicle]:
    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise HTTPException(
            status_code=422,
            detail="min_price cannot exceed max_price",
        )

    statement = select(Vehicle)

    for column, value in (
        (Vehicle.make, make),
        (Vehicle.model, model),
        (Vehicle.category, category),
    ):
        if value is not None:
            term = value.strip()
            if not term:
                raise HTTPException(
                    status_code=422,
                    detail="Search terms cannot be blank",
                )
            statement = statement.where(
                func.lower(column).contains(term.lower(), autoescape=True)
            )

    if min_price is not None:
        statement = statement.where(Vehicle.price >= min_price)
    if max_price is not None:
        statement = statement.where(Vehicle.price <= max_price)

    return list(session.scalars(statement.order_by(Vehicle.id)))

@router.get("", response_model=list[VehicleResponse])
def list_vehicles(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[Vehicle]:
    return list(session.scalars(select(Vehicle).order_by(Vehicle.id)))

@router.post(
    "",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vehicle(
    details: VehicleCreate,
    session: Annotated[Session, Depends(get_session)],
    admin: Annotated[User, Depends(require_admin)],
) -> Vehicle:
    vehicle = Vehicle(**details.model_dump())
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle