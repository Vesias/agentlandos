"""
Real-Time Data API Endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Depends, Request
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from app.services.real_data import (
    SaarlandDataService,
    AnalyticsService
)
from app.core.config import settings


router = APIRouter(
    prefix="/api/v1/realtime",
    tags=["realtime"],
    responses={404: {"description": "Not found"}},
)

# Service-Instanzen
saarland_service = SaarlandDataService()
analytics_service = AnalyticsService()


@router.get("/data")
async def get_real_time_data(
    data_types: Optional[List[str]] = Query(None, description="Specific data types to fetch"),
    category: Optional[str] = Query(None, description="Category filter")
):
    """
    Holt echte Echtzeit-Daten für das Saarland
    
    Verfügbare data_types:
    - weather: Aktuelles Wetter
    - traffic: Verkehrsinformationen
    - events: Veranstaltungen
    - news: Nachrichten
    """
    try:
        data = await saarland_service.get_real_time_data(data_types)
        return {
            "status": "success",
            "data": data,
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tourism")
async def get_tourism_data():
    """Echte Tourismusdaten mit Wetter und Events"""
    try:
        data = await saarland_service.get_tourism_data()
        return {
            "status": "success",
            "data": data,
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/business")
async def get_business_data():
    """Wirtschaftsdaten und Förderprogramme"""
    try:
        data = await saarland_service.get_business_data()
        return {
            "status": "success",
            "data": data,
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin")
async def get_admin_data():
    """Verwaltungsdaten und Wartezeiten"""
    try:
        data = await saarland_service.get_admin_data()
        return {
            "status": "success",
            "data": data,
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_analytics():
    """Echte Analytics und User-Statistiken"""
    try:
        stats = await analytics_service.get_real_time_stats()
        regional = await analytics_service.get_regional_analytics()
        
        return {
            "status": "success",
            "data": {
                "real_time_stats": stats,
                "regional_analytics": regional
            },
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/track")
async def track_activity(
    request: Request,
    activity_type: str = "page_view",
    page: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    """Trackt User-Aktivitäten für echte Analytics"""
    try:
        # Session-ID aus Cookie oder generieren
        session_id = request.cookies.get("session_id")
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Track activity
        success = await analytics_service.track_user_activity(
            session_id=session_id,
            activity_type=activity_type,
            metadata={
                "page": page,
                "user_agent": request.headers.get("user-agent"),
                **(metadata or {})
            }
        )
        
        response = {
            "status": "success" if success else "error",
            "session_id": session_id,
            "tracked": success
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-count")
async def get_user_count():
    """Echter User Counter - keine Mock-Daten!"""
    try:
        stats = await analytics_service.get_real_time_stats()
        
        return {
            "status": "success",
            "data": {
                "active_users": stats.get("active_users", 0),
                "daily_visitors": stats.get("daily_visitors", 0),
                "weekly_visitors": stats.get("weekly_visitors", 0),
                "monthly_visitors": stats.get("monthly_visitors", 0),
                "total_users": stats.get("total_users", 0),
                "timestamp": datetime.utcnow().isoformat()
            },
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
