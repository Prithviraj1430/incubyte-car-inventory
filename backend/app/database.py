import os
from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session

DEFAULT_DATABASE_FILE = Path(__file__).resolve().parent.parent / "inventory.db"
DATABASE_FILE = Path(os.getenv("DATABASE_PATH", str(DEFAULT_DATABASE_FILE)))
engine = create_engine(
    f"sqlite:///{DATABASE_FILE.as_posix()}",
    connect_args={"check_same_thread": False},
)


class Base(DeclarativeBase):
    pass


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
