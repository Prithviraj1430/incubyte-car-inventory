from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session

DATABASE_FILE = Path(__file__).resolve().parent.parent / "inventory.db"
engine = create_engine(
    f"sqlite:///{DATABASE_FILE.as_posix()}",
    connect_args={"check_same_thread": False},
)


class Base(DeclarativeBase):
    pass


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session