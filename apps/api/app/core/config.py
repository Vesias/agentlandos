"""
Konfiguration für die AGENTLAND.SAARLAND API
"""

from typing import List, Union

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Anwendungseinstellungen mit Unterstützung für Umgebungsvariablen
    """

    # API Konfiguration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AGENTLAND.SAARLAND"
    
    # Sicherheit - KRITISCH: Niemals Standardwerte in Produktion verwenden
    SECRET_KEY: str = "MUST-BE-CHANGED-IN-PRODUCTION-GENERATE-WITH-OPENSSL"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Rate Limiting - Schutz vor DoS-Attacken
    MAX_REQUESTS_PER_MINUTE: int = 100
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15
    
    # Datenbank - WARNUNG: Schwache Standardpasswörter in Produktion ändern
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "agentland"
    POSTGRES_PASSWORD: str = "CHANGE-WEAK-PASSWORD-IN-PRODUCTION"  # SICHERHEITSRISIKO
    POSTGRES_DB: str = "agentland_saarland"
    DATABASE_URL: str = ""
    DATABASE_SSL: bool = True  # Verschlüsselung für Produktionsumgebung
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    # KI-Modelle
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    DEFAULT_AI_MODEL: str = "deepseek-chat"
    DEEPSEEK_API_URL: str = "https://api.deepseek.com/v1"
    
    # Regionale Einstellungen
    DEFAULT_LANGUAGE: str = "de"
    SUPPORTED_LANGUAGES: List[str] = ["de", "fr", "en"]
    SAARLAND_DIALECT_ENABLED: bool = True
    
    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379"
    
    # External APIs
    OPENWEATHER_API_KEY: str = ""
    
    # Vector Store
    VECTOR_DIMENSION: int = 1536
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str, values) -> str:
        if v:
            return v
        postgres_server = values.data.get("POSTGRES_SERVER", "localhost")
        postgres_user = values.data.get("POSTGRES_USER", "agentland")
        postgres_password = values.data.get("POSTGRES_PASSWORD", "saarland2024")
        postgres_db = values.data.get("POSTGRES_DB", "agentland_saarland")
        return f"postgresql+asyncpg://{postgres_user}:{postgres_password}@{postgres_server}/{postgres_db}"


settings = Settings()