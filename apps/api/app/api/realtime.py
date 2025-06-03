"""
Real-Time Data API Endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Depends, Request
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

from app.services.real_data import (
    SaarlandDataService,
    AnalyticsService,
    SaarlandPLZService,
    MapsService
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



@router.get("/plz/{plz}")
async def get_plz_info(plz: str):
    """Gibt Informationen und zuständige Behörden für eine PLZ zurück"""
    try:
        plz_service = SaarlandPLZService()
        info = plz_service.get_nearest_services(plz)
        
        if "error" in info:
            raise HTTPException(status_code=404, detail=f"PLZ {plz} nicht gefunden")
        
        return {
            "status": "success",
            "data": info,
            "source": "real_time"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/plz/{plz}/behoerde/{service_type}")
async def get_behoerde_for_plz(plz: str, service_type: str):
    """Gibt die zuständige Behörde für eine PLZ und einen Service-Typ zurück"""
    try:
        plz_service = SaarlandPLZService()
        behoerde = plz_service.get_behoerde_by_plz(plz, service_type)
        
        if not behoerde:
            raise HTTPException(
                status_code=404, 
                detail=f"Keine {service_type} für PLZ {plz} gefunden"
            )
        
        # Füge Maps-Integration hinzu
        maps_service = MapsService()
        if behoerde.get("koordinaten"):
            lat, lon = behoerde["koordinaten"]["lat"], behoerde["koordinaten"]["lon"]
            behoerde["map_url"] = maps_service.generate_static_map_url(
                [{"lat": lat, "lon": lon}]
            )
            behoerde["directions"] = maps_service.get_route_url(
                49.2354, 6.9969,  # Beispiel-Startpunkt
                lat, lon
            )
        
        return {
            "status": "success",
            "data": behoerde,
            "source": "real_time"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plz/search")
async def search_plz(query: str = Query(..., description="PLZ oder Stadtname")):
    """Sucht nach PLZ oder Stadtnamen"""
    try:
        plz_service = SaarlandPLZService()
        results = plz_service.search_plz(query)
        
        return {
            "status": "success",
            "data": {
                "query": query,
                "results": results,
                "count": len(results)
            },
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/maps/config")
async def get_map_config():
    """Gibt Kartenkonfiguration für das Saarland zurück"""
    try:
        maps_service = MapsService()
        config = maps_service.get_map_config()
        
        return {
            "status": "success",
            "data": config,
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/maps/pois")
async def get_points_of_interest(
    category: Optional[str] = Query(None, description="POI-Kategorie")
):
    """Gibt Points of Interest zurück"""
    try:
        maps_service = MapsService()
        
        if category:
            pois = maps_service.get_pois_by_category(category)
        else:
            pois = maps_service.get_all_pois()
        
        return {
            "status": "success",
            "data": pois,
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/maps/event/{event_id}")
async def get_event_location(event_id: str):
    """Gibt Standort- und Ticket-Informationen für ein Event zurück"""
    try:
        maps_service = MapsService()
        location = maps_service.get_event_location(event_id)
        
        if not location:
            raise HTTPException(status_code=404, detail="Event-Location nicht gefunden")
        
        return {
            "status": "success",
            "data": location,
            "source": "real_time"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/maps/parking")
async def get_parking_nearby(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Gibt Parkplätze in der Nähe zurück"""
    try:
        maps_service = MapsService()
        parking = maps_service.get_nearby_parking(lat, lon)
        
        return {
            "status": "success",
            "data": {
                "location": {"lat": lat, "lon": lon},
                "parking": parking,
                "count": len(parking)
            },
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/maps/emergency")
async def get_emergency_services(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Gibt Notdienste in der Nähe zurück"""
    try:
        maps_service = MapsService()
        services = maps_service.get_emergency_services(lat, lon)
        
        return {
            "status": "success",
            "data": services,
            "source": "real_time"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
