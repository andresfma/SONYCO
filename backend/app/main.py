from fastapi import FastAPI
from app.api.v1.router import router
from app.core.config import settings
from app.db.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"], 
)


@app.on_event("startup")
def on_startup():
    init_db()

# Incluye los router
app.include_router(router, prefix=settings.API_V1_STR)
