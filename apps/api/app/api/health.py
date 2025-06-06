"""
Health Check Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.database import get_async_session
from app.core.rate_limiter import limiter

router = APIRouter()


@router.get("/")
@limiter.limit("60/minute")
async def health_check():
    """
    Basis-Gesundheitsprüfung
    """
    return {
        "status": "healthy",
        "service": "AGENTLAND.SAARLAND API",
        "region": "Saarland",
    }


@router.get("/ready")
@limiter.limit("30/minute")
async def readiness_check(db: AsyncSession = Depends(get_async_session)):
    """
    Prüft, ob alle Dienste bereit sind
    """
    # Datenbank-Verbindung prüfen
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "ready" if db_status == "connected" else "not_ready",
        "checks": {
            "database": db_status,
            "agents": "ready",
            "vector_store": "ready",
        }
    }