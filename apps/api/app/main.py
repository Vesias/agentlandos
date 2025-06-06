"""
Haupteinstiegspunkt für die AGENTLAND.SAARLAND API
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import redis

from app.middleware.security import SecurityMiddleware

from app.core.config import settings
from app.db.database import create_db_and_tables, engine
from app.api import agents_router, auth, health, users, enhanced_agents, realtime, performance
from app.middleware.performance import PerformanceMiddleware, MemoryOptimizationMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Verwaltet den Lebenszyklus der Anwendung
    """
    # Startup
    print("🚀 Starte AGENTLAND.SAARLAND API...")
    await create_db_and_tables()
    print("✅ Datenbank initialisiert")
    
    yield
    
    # Shutdown
    print("👋 Fahre AGENTLAND.SAARLAND API herunter...")
    await engine.dispose()


app = FastAPI(
    title="AGENTLAND.SAARLAND API",
    description="Souveräne KI-Technologie aus dem Saarland – für ein intelligentes Morgen",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# SICHERHEITS-KONFIGURATION für regionale Zugriffe
# KRITISCH: Restriktive CORS-Policy für Produktionsumgebung
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://agentland.saarland",
        "https://www.agentland.saarland",
        "http://localhost:3000"  # Nur für Entwicklung
    ] if settings.BACKEND_CORS_ORIGINS else ["https://agentland.saarland"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Spezifische Methoden
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language", 
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ],  # Spezifische Headers
    expose_headers=["X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# PERFORMANCE MIDDLEWARE - OPTIMIERT FÜR 200K USERS
app.add_middleware(PerformanceMiddleware)
app.add_middleware(MemoryOptimizationMiddleware)

# Security Middleware
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
try:
    redis_client = redis.from_url(redis_url, decode_responses=True)
except Exception:
    redis_client = None

security = SecurityMiddleware(redis_client, {})

@app.middleware("http")
async def apply_security(request: Request, call_next):
    return await security(request, call_next)

# API-Router einbinden
app.include_router(health.router, prefix="/api/health", tags=["Gesundheit"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentifizierung"])
app.include_router(users.router, prefix="/api/users", tags=["Benutzer"])
app.include_router(agents_router.router, prefix="/api/v1", tags=["KI-Agenten"])
app.include_router(enhanced_agents.router, tags=["Enhanced KI-Agenten"])
app.include_router(realtime.router, tags=["Echtzeit-Daten"])
app.include_router(performance.router, tags=["Performance-Monitoring"])


@app.get("/", tags=["Root"])
async def root():
    """
    Wurzel-Endpunkt der API
    """
    return {
        "message": "Willkommen bei AGENTLAND.SAARLAND",
        "version": "0.1.0",
        "region": "Saarland",
        "status": "operational",
        "tagline": "Souveräne KI-Technologie aus dem Saarland",
    }