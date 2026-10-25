from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

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


# A production build can be served from the same origin as the API. During
# backend-only development and tests, Vite serves the frontend separately.
frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
