from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    # Database (use your MySQL details)
    DATABASE_URL: str = os.getenv('DATABASE_URL')

    # Superadmin credentials (kept in env)
    ADMIN_EMAIL: str = os.getenv('ADMIN_EMAIL')
    ADMIN_PASSWD: str = os.getenv('ADMIN_PASSWD')
    ADMIN_ROLE: str = os.getenv('ADMIN_ROLE')

    # App settings
    APP_NAME: str = "FastAPI Auth"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
