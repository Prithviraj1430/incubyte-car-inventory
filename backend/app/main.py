from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from app import models  # Registers SQLAlchemy models before creating tables.
from app.auth import router as auth_router
from app.database import Base, engine
from app.vehicles import router as vehicles_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Car Dealership Inventory API", lifespan=lifespan)
app.include_router(auth_router)
app.include_router(vehicles_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}