from pydantic_settings import BaseSettings
from datetime import datetime, timezone, timedelta

COL_TZ = timezone(timedelta(hours=-5))  # Zona horaria para Colombia (UTC-5)

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Sonyco Backend"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    STOCK_MINIMO: int = 5  # Valor por defecto para el stock mínimo


    class Config:
        env_file = ".env"

settings = Settings()