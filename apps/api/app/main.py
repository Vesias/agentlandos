"""
Haupteinstiegspunkt für die AGENTLAND.SAARLAND API
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import create_db_and_tables, engine
from app.api import agents_router, auth, health, users, enhanced_agents, realtime


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

# CORS-Konfiguration für regionale Zugriffe
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API-Router einbinden
app.include_router(health.router, prefix="/api/health", tags=["Gesundheit"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentifizierung"])
app.include_router(users.router, prefix="/api/users", tags=["Benutzer"])
app.include_router(agents_router.router, prefix="/api/v1", tags=["KI-Agenten"])
app.include_router(enhanced_agents.router, tags=["Enhanced KI-Agenten"])
app.include_router(realtime.router, tags=["Echtzeit-Daten"])


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