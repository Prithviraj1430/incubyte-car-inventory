from decimal import Decimal

from sqlalchemy import CheckConstraint, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="customer")

class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        CheckConstraint("price > 0", name="price_positive"),
        CheckConstraint("quantity >= 0", name="quantity_nonnegative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    make: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(100))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    quantity: Mapped[int] = mapped_column(default=0)    
