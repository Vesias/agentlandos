"""
Haupteinstiegspunkt für die AGENTLAND.SAARLAND API
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from app.core.rate_limiter import limiter, RateLimitExceeded, _rate_limit_exceeded_handler

from app.core.config import settings
from app.db.database import create_db_and_tables, engine
from app.api import (
    agents_router,
    auth,
    health,
    users,
    enhanced_agents,
    realtime,
    performance,
    cross_border,
)
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

# Rate Limiting mit SlowAPI
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

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

# API-Router einbinden
app.include_router(health.router, prefix="/api/health", tags=["Gesundheit"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentifizierung"])
app.include_router(users.router, prefix="/api/users", tags=["Benutzer"])
app.include_router(agents_router.router, prefix="/api/v1", tags=["KI-Agenten"])
app.include_router(enhanced_agents.router, tags=["Enhanced KI-Agenten"])
app.include_router(realtime.router, tags=["Echtzeit-Daten"])
app.include_router(performance.router, tags=["Performance-Monitoring"])
app.include_router(cross_border.router, tags=["Cross-Border"])


@app.get("/", tags=["Root"])
@limiter.limit("100/minute")
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