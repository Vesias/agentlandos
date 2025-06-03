"""
Tourism Connector - Tourism and cultural data connector for Saarland
Integrates tourism information, events, attractions, and cultural sites
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from functools import wraps
import hashlib
from urllib.parse import urlencode, quote
import backoff
from circuitbreaker import circuit
from dataclasses import dataclass, asdict
from enum import Enum

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configuration
TOURISM_BASE_URL = "https://www.tourismus.saarland"
TOURISM_API_URL = f"{TOURISM_BASE_URL}/api/v1"
EVENTS_API_URL = "https://www.saarland-veranstaltungen.de/api"
CULTURE_API_URL = "https://www.kulturbesitz.saarland.de/api"

# OpenData endpoints
OPENDATA_BASE_URL = "https://www.saarland.de/opendata"
TOURISM_OPENDATA_URL = f"{OPENDATA_BASE_URL}/tourismus"

# Cache configuration
CACHE_TTL = {
    "attractions": 86400,  # 24 hours for attractions
    "events": 3600,  # 1 hour for events
    "accommodations": 43200,  # 12 hours for accommodations
    "restaurants": 43200,  # 12 hours for restaurants
    "trails": 86400,  # 24 hours for hiking/biking trails
}

# Circuit breaker configuration
CIRCUIT_FAILURE_THRESHOLD = 5
CIRCUIT_RECOVERY_TIMEOUT = 60
CIRCUIT_EXPECTED_EXCEPTION = (aiohttp.ClientError, asyncio.TimeoutError)


class TourismCategory(Enum):
    """Tourism categories"""
    NATURE = "nature"
    CULTURE = "culture"
    GASTRONOMY = "gastronomy"
    ACCOMMODATION = "accommodation"
    ACTIVITY = "activity"
    WELLNESS = "wellness"
    FAMILY = "family"
    INDUSTRIAL_HERITAGE = "industrial_heritage"


class EventCategory(Enum):
    """Event categories"""
    CONCERT = "concert"
    THEATER = "theater"
    EXHIBITION = "exhibition"
    FESTIVAL = "festival"
    MARKET = "market"
    SPORT = "sport"
    FAMILY = "family"
    WORKSHOP = "workshop"


@dataclass
class GeoLocation:
    """Geographic location"""
    lat: float
    lon: float
    address: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None


@dataclass
class OpeningHours:
    """Opening hours information"""
    monday: Optional[str] = None
    tuesday: Optional[str] = None
    wednesday: Optional[str] = None
    thursday: Optional[str] = None
    friday: Optional[str] = None
    saturday: Optional[str] = None
    sunday: Optional[str] = None
    holidays: Optional[str] = None
    special_notes: Optional[str] = None


class TourismCache:
    """Specialized cache for tourism data"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
        self._popularity = {}  # Track popular items
    
    def get(self, key: str, category: str = "default") -> Optional[Any]:
        """Get value from cache if not expired"""
        if key in self._cache:
            timestamp = self._timestamps.get(key, 0)
            ttl = CACHE_TTL.get(category, 3600)
            
            if datetime.now().timestamp() - timestamp < ttl:
                # Track popularity
                self._popularity[key] = self._popularity.get(key, 0) + 1
                logger.debug(f"Cache hit for key: {key}")
                return self._cache[key]
            else:
                # Remove expired entry
                del self._cache[key]
                del self._timestamps[key]
                if key in self._popularity:
                    del self._popularity[key]
                logger.debug(f"Cache expired for key: {key}")
        
        return None
    
    def set(self, key: str, value: Any):
        """Set value in cache"""
        self._cache[key] = value
        self._timestamps[key] = datetime.now().timestamp()
        logger.debug(f"Cache set for key: {key}")
    
    def get_popular_items(self, limit: int = 10) -> List[str]:
        """Get most popular cached items"""
        sorted_items = sorted(
            self._popularity.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [item[0] for item in sorted_items[:limit]]


class TourismConnector:
    """Connector for Saarland tourism and cultural data"""
    
    def __init__(self, session: Optional[aiohttp.ClientSession] = None):
        self.session = session
        self._owns_session = session is None
        self.cache = TourismCache()
        self.request_count = 0
        self.error_count = 0
        
    async def __aenter__(self):
        if self._owns_session:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers={
                    "User-Agent": "AgentLand/1.0 (Tourism Connector)",
                    "Accept": "application/json",
                    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8"
                }
            )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._owns_session and self.session:
            await self.session.close()
    
    def _generate_cache_key(self, method: str, params: Dict[str, Any]) -> str:
        """Generate cache key from method and parameters"""
        param_str = json.dumps(params, sort_keys=True)
        return hashlib.md5(f"{method}:{param_str}".encode()).hexdigest()
    
    @backoff.on_exception(
        backoff.expo,
        CIRCUIT_EXPECTED_EXCEPTION,
        max_tries=3,
        max_time=30
    )
    @circuit(
        failure_threshold=CIRCUIT_FAILURE_THRESHOLD,
        recovery_timeout=CIRCUIT_RECOVERY_TIMEOUT,
        expected_exception=CIRCUIT_EXPECTED_EXCEPTION
    )
    async def _make_request(
        self, 
        url: str, 
        method: str = "GET", 
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Make HTTP request with circuit breaker and retry logic"""
        self.request_count += 1
        
        try:
            logger.info(f"Making {method} request to: {url}")
            
            async with self.session.request(
                method=method,
                url=url,
                params=params,
                json=data if method == "POST" else None,
                headers=headers
            ) as response:
                response.raise_for_status()
                return await response.json()
                    
        except aiohttp.ClientError as e:
            self.error_count += 1
            logger.error(f"Request failed: {str(e)}")
            raise
        except Exception as e:
            self.error_count += 1
            logger.error(f"Unexpected error: {str(e)}")
            raise
    
    async def get_attractions(
        self,
        category: Optional[TourismCategory] = None,
        location: Optional[GeoLocation] = None,
        radius: float = 10.0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get tourist attractions
        
        Args:
            category: Filter by tourism category
            location: Center point for geographic search
            radius: Search radius in kilometers
            limit: Maximum number of results
            
        Returns:
            List of tourist attractions
        """
        cache_key = self._generate_cache_key("attractions", {
            "category": category.value if category else None,
            "location": asdict(location) if location else None,
            "radius": radius,
            "limit": limit
        })
        
        cached_result = self.cache.get(cache_key, "attractions")
        if cached_result:
            return cached_result
        
        params = {
            "limit": limit,
            "lang": "de"
        }
        
        if category:
            params["category"] = category.value
            
        if location:
            params["lat"] = location.lat
            params["lon"] = location.lon
            params["radius"] = radius
        
        try:
            result = await self._make_request(
                url=f"{TOURISM_API_URL}/attractions",
                params=params
            )
            
            attractions = []
            for item in result.get("data", []):
                attraction = {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "description": item.get("description"),
                    "category": item.get("category"),
                    "location": {
                        "lat": item.get("location", {}).get("lat"),
                        "lon": item.get("location", {}).get("lon"),
                        "address": item.get("address"),
                        "city": item.get("city"),
                        "postal_code": item.get("postal_code")
                    },
                    "opening_hours": self._parse_opening_hours(item.get("opening_hours")),
                    "contact": {
                        "phone": item.get("phone"),
                        "email": item.get("email"),
                        "website": item.get("website")
                    },
                    "images": item.get("images", []),
                    "ratings": {
                        "average": item.get("rating", 0),
                        "count": item.get("rating_count", 0)
                    },
                    "accessibility": item.get("accessibility", {}),
                    "amenities": item.get("amenities", []),
                    "tags": item.get("tags", [])
                }
                attractions.append(attraction)
            
            # Cache results
            self.cache.set(cache_key, attractions)
            
            logger.info(f"Retrieved {len(attractions)} attractions")
            return attractions
            
        except Exception as e:
            logger.error(f"Failed to get attractions: {str(e)}")
            return []
    
    async def get_events(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[EventCategory] = None,
        location: Optional[GeoLocation] = None,
        radius: float = 20.0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get upcoming events
        
        Args:
            start_date: Start date for event search
            end_date: End date for event search
            category: Filter by event category
            location: Center point for geographic search
            radius: Search radius in kilometers
            limit: Maximum number of results
            
        Returns:
            List of events
        """
        start_date = start_date or datetime.now()
        end_date = end_date or (start_date + timedelta(days=30))
        
        cache_key = self._generate_cache_key("events", {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "category": category.value if category else None,
            "location": asdict(location) if location else None
        })
        
        cached_result = self.cache.get(cache_key, "events")
        if cached_result:
            return cached_result
        
        params = {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "limit": limit,
            "lang": "de"
        }
        
        if category:
            params["category"] = category.value
            
        if location:
            params["lat"] = location.lat
            params["lon"] = location.lon
            params["radius"] = radius
        
        try:
            result = await self._make_request(
                url=f"{EVENTS_API_URL}/events",
                params=params
            )
            
            events = []
            for item in result.get("data", []):
                event = {
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "category": item.get("category"),
                    "start_time": item.get("start_time"),
                    "end_time": item.get("end_time"),
                    "location": {
                        "name": item.get("venue", {}).get("name"),
                        "address": item.get("venue", {}).get("address"),
                        "city": item.get("venue", {}).get("city"),
                        "coordinates": {
                            "lat": item.get("venue", {}).get("lat"),
                            "lon": item.get("venue", {}).get("lon")
                        }
                    },
                    "organizer": {
                        "name": item.get("organizer", {}).get("name"),
                        "contact": item.get("organizer", {}).get("contact")
                    },
                    "tickets": {
                        "available": item.get("tickets_available", True),
                        "price_range": item.get("price_range"),
                        "booking_url": item.get("booking_url")
                    },
                    "images": item.get("images", []),
                    "tags": item.get("tags", []),
                    "accessibility": item.get("accessibility", {}),
                    "cancelled": item.get("cancelled", False)
                }
                events.append(event)
            
            # Sort by start time
            events.sort(key=lambda x: x.get("start_time", ""))
            
            # Cache results
            self.cache.set(cache_key, events)
            
            logger.info(f"Retrieved {len(events)} events")
            return events
            
        except Exception as e:
            logger.error(f"Failed to get events: {str(e)}")
            return []
    
    async def get_accommodations(
        self,
        location: Optional[GeoLocation] = None,
        check_in: Optional[datetime] = None,
        check_out: Optional[datetime] = None,
        accommodation_type: Optional[str] = None,
        min_rating: float = 0.0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get accommodation options
        
        Args:
            location: Search location
            check_in: Check-in date
            check_out: Check-out date
            accommodation_type: Type (hotel, pension, ferienwohnung, etc.)
            min_rating: Minimum rating filter
            limit: Maximum number of results
            
        Returns:
            List of accommodations
        """
        cache_key = self._generate_cache_key("accommodations", {
            "location": asdict(location) if location else None,
            "type": accommodation_type,
            "min_rating": min_rating
        })
        
        cached_result = self.cache.get(cache_key, "accommodations")
        if cached_result:
            return cached_result
        
        params = {
            "limit": limit,
            "lang": "de"
        }
        
        if location:
            params["lat"] = location.lat
            params["lon"] = location.lon
            params["radius"] = 10
            
        if accommodation_type:
            params["type"] = accommodation_type
            
        if min_rating > 0:
            params["min_rating"] = min_rating
        
        try:
            result = await self._make_request(
                url=f"{TOURISM_API_URL}/accommodations",
                params=params
            )
            
            accommodations = []
            for item in result.get("data", []):
                accommodation = {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "type": item.get("type"),
                    "description": item.get("description"),
                    "location": {
                        "address": item.get("address"),
                        "city": item.get("city"),
                        "postal_code": item.get("postal_code"),
                        "coordinates": {
                            "lat": item.get("lat"),
                            "lon": item.get("lon")
                        }
                    },
                    "ratings": {
                        "average": item.get("rating", 0),
                        "count": item.get("rating_count", 0),
                        "stars": item.get("stars")
                    },
                    "amenities": item.get("amenities", []),
                    "room_types": item.get("room_types", []),
                    "price_range": item.get("price_range"),
                    "contact": {
                        "phone": item.get("phone"),
                        "email": item.get("email"),
                        "website": item.get("website")
                    },
                    "images": item.get("images", []),
                    "certifications": item.get("certifications", []),
                    "accessibility": item.get("accessibility", {}),
                    "sustainability": item.get("sustainability", {})
                }
                accommodations.append(accommodation)
            
            # Sort by rating
            accommodations.sort(
                key=lambda x: x["ratings"]["average"],
                reverse=True
            )
            
            # Cache results
            self.cache.set(cache_key, accommodations)
            
            logger.info(f"Retrieved {len(accommodations)} accommodations")
            return accommodations
            
        except Exception as e:
            logger.error(f"Failed to get accommodations: {str(e)}")
            return []
    
    async def get_restaurants(
        self,
        location: Optional[GeoLocation] = None,
        cuisine_type: Optional[str] = None,
        price_level: Optional[int] = None,
        vegetarian: bool = False,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get restaurant information
        
        Args:
            location: Search location
            cuisine_type: Type of cuisine
            price_level: Price level (1-4)
            vegetarian: Include vegetarian options
            limit: Maximum number of results
            
        Returns:
            List of restaurants
        """
        cache_key = self._generate_cache_key("restaurants", {
            "location": asdict(location) if location else None,
            "cuisine": cuisine_type,
            "price_level": price_level,
            "vegetarian": vegetarian
        })
        
        cached_result = self.cache.get(cache_key, "restaurants")
        if cached_result:
            return cached_result
        
        params = {
            "limit": limit,
            "lang": "de"
        }
        
        if location:
            params["lat"] = location.lat
            params["lon"] = location.lon
            params["radius"] = 10
            
        if cuisine_type:
            params["cuisine"] = cuisine_type
            
        if price_level:
            params["price_level"] = price_level
            
        if vegetarian:
            params["vegetarian"] = True
        
        try:
            result = await self._make_request(
                url=f"{TOURISM_API_URL}/restaurants",
                params=params
            )
            
            restaurants = []
            for item in result.get("data", []):
                restaurant = {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "cuisine": item.get("cuisine_type"),
                    "description": item.get("description"),
                    "location": {
                        "address": item.get("address"),
                        "city": item.get("city"),
                        "postal_code": item.get("postal_code"),
                        "coordinates": {
                            "lat": item.get("lat"),
                            "lon": item.get("lon")
                        }
                    },
                    "opening_hours": self._parse_opening_hours(item.get("opening_hours")),
                    "price_level": item.get("price_level"),
                    "ratings": {
                        "average": item.get("rating", 0),
                        "count": item.get("rating_count", 0)
                    },
                    "specialties": item.get("specialties", []),
                    "dietary_options": {
                        "vegetarian": item.get("vegetarian", False),
                        "vegan": item.get("vegan", False),
                        "gluten_free": item.get("gluten_free", False)
                    },
                    "contact": {
                        "phone": item.get("phone"),
                        "email": item.get("email"),
                        "website": item.get("website")
                    },
                    "reservation": {
                        "required": item.get("reservation_required", False),
                        "online": item.get("online_reservation", False)
                    },
                    "images": item.get("images", []),
                    "certifications": item.get("certifications", [])
                }
                restaurants.append(restaurant)
            
            # Cache results
            self.cache.set(cache_key, restaurants)
            
            logger.info(f"Retrieved {len(restaurants)} restaurants")
            return restaurants
            
        except Exception as e:
            logger.error(f"Failed to get restaurants: {str(e)}")
            return []
    
    async def get_hiking_trails(
        self,
        location: Optional[GeoLocation] = None,
        difficulty: Optional[str] = None,
        min_length: float = 0,
        max_length: float = 50,
        circular: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        Get hiking trail information
        
        Args:
            location: Starting location
            difficulty: Trail difficulty (easy, medium, hard)
            min_length: Minimum trail length in km
            max_length: Maximum trail length in km
            circular: Only circular trails
            
        Returns:
            List of hiking trails
        """
        cache_key = self._generate_cache_key("trails", {
            "location": asdict(location) if location else None,
            "difficulty": difficulty,
            "length_range": (min_length, max_length),
            "circular": circular
        })
        
        cached_result = self.cache.get(cache_key, "trails")
        if cached_result:
            return cached_result
        
        params = {
            "type": "hiking",
            "lang": "de"
        }
        
        if location:
            params["lat"] = location.lat
            params["lon"] = location.lon
            params["radius"] = 25
            
        if difficulty:
            params["difficulty"] = difficulty
            
        if min_length > 0:
            params["min_length"] = min_length
            
        if max_length < 50:
            params["max_length"] = max_length
            
        if circular is not None:
            params["circular"] = circular
        
        try:
            result = await self._make_request(
                url=f"{TOURISM_API_URL}/trails",
                params=params
            )
            
            trails = []
            for item in result.get("data", []):
                trail = {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "description": item.get("description"),
                    "difficulty": item.get("difficulty"),
                    "length_km": item.get("length"),
                    "duration_hours": item.get("duration"),
                    "elevation_gain": item.get("elevation_gain"),
                    "circular": item.get("circular", False),
                    "start_point": {
                        "name": item.get("start_point", {}).get("name"),
                        "coordinates": {
                            "lat": item.get("start_point", {}).get("lat"),
                            "lon": item.get("start_point", {}).get("lon")
                        },
                        "parking": item.get("start_point", {}).get("parking")
                    },
                    "highlights": item.get("highlights", []),
                    "surface": item.get("surface_types", []),
                    "waymarks": item.get("waymarks"),
                    "gpx_url": item.get("gpx_url"),
                    "map_url": item.get("map_url"),
                    "images": item.get("images", []),
                    "suitable_for": item.get("suitable_for", []),
                    "best_season": item.get("best_season", [])
                }
                trails.append(trail)
            
            # Cache results
            self.cache.set(cache_key, trails)
            
            logger.info(f"Retrieved {len(trails)} hiking trails")
            return trails
            
        except Exception as e:
            logger.error(f"Failed to get hiking trails: {str(e)}")
            return []
    
    def _parse_opening_hours(self, hours_data: Any) -> OpeningHours:
        """Parse opening hours data into structured format"""
        if not hours_data:
            return OpeningHours()
        
        if isinstance(hours_data, dict):
            return OpeningHours(**hours_data)
        
        # Handle string format
        return OpeningHours(special_notes=str(hours_data))
    
    async def get_cultural_sites(
        self,
        site_type: Optional[str] = None,
        location: Optional[GeoLocation] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get cultural heritage sites
        
        Args:
            site_type: Type of site (museum, monument, church, etc.)
            location: Search location
            limit: Maximum number of results
            
        Returns:
            List of cultural sites
        """
        params = {
            "limit": limit,
            "lang": "de"
        }
        
        if site_type:
            params["type"] = site_type
            
        if location:
            params["lat"] = location.lat
            params["lon"] = location.lon
            params["radius"] = 20
        
        try:
            result = await self._make_request(
                url=f"{CULTURE_API_URL}/sites",
                params=params
            )
            
            sites = []
            for item in result.get("data", []):
                site = {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "type": item.get("type"),
                    "description": item.get("description"),
                    "historical_period": item.get("period"),
                    "location": {
                        "address": item.get("address"),
                        "city": item.get("city"),
                        "coordinates": {
                            "lat": item.get("lat"),
                            "lon": item.get("lon")
                        }
                    },
                    "opening_hours": self._parse_opening_hours(item.get("opening_hours")),
                    "admission": {
                        "adults": item.get("admission", {}).get("adults"),
                        "children": item.get("admission", {}).get("children"),
                        "groups": item.get("admission", {}).get("groups"),
                        "free_days": item.get("admission", {}).get("free_days", [])
                    },
                    "guided_tours": item.get("guided_tours", False),
                    "audio_guide": item.get("audio_guide", False),
                    "accessibility": item.get("accessibility", {}),
                    "contact": {
                        "phone": item.get("phone"),
                        "email": item.get("email"),
                        "website": item.get("website")
                    },
                    "images": item.get("images", [])
                }
                sites.append(site)
            
            logger.info(f"Retrieved {len(sites)} cultural sites")
            return sites
            
        except Exception as e:
            logger.error(f"Failed to get cultural sites: {str(e)}")
            return []
    
    async def get_popular_destinations(self) -> List[Dict[str, Any]]:
        """Get popular tourist destinations based on cache data"""
        popular_keys = self.cache.get_popular_items(limit=10)
        
        destinations = []
        for key in popular_keys:
            data = self.cache.get(key)
            if data and isinstance(data, list) and len(data) > 0:
                # Extract most relevant item from cached data
                item = data[0]
                if "name" in item:
                    destinations.append({
                        "name": item.get("name"),
                        "type": item.get("category") or item.get("type"),
                        "location": item.get("location"),
                        "popularity_score": len(data)
                    })
        
        return destinations
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get connector statistics"""
        return {
            "request_count": self.request_count,
            "error_count": self.error_count,
            "error_rate": self.error_count / max(self.request_count, 1),
            "cache_size": len(self.cache._cache),
            "popular_destinations": len(await self.get_popular_destinations()),
            "uptime": datetime.now().isoformat()
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on the connector"""
        try:
            # Try to get some attractions
            attractions = await self.get_attractions(limit=1)
            
            return {
                "status": "healthy" if attractions else "degraded",
                "timestamp": datetime.now().isoformat(),
                "statistics": await self.get_statistics()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "statistics": await self.get_statistics()
            }


# Example usage
if __name__ == "__main__":
    async def main():
        async with TourismConnector() as connector:
            # Get attractions
            attractions = await connector.get_attractions(
                category=TourismCategory.CULTURE,
                limit=5
            )
            print(f"Found {len(attractions)} cultural attractions")
            
            # Get upcoming events
            events = await connector.get_events(
                category=EventCategory.FESTIVAL,
                limit=10
            )
            print(f"Found {len(events)} upcoming festivals")
            
            # Get hiking trails
            trails = await connector.get_hiking_trails(
                difficulty="medium",
                min_length=5,
                max_length=15
            )
            print(f"Found {len(trails)} hiking trails")
            
            # Get restaurants
            location = GeoLocation(lat=49.2354, lon=6.9969)  # Saarbrücken
            restaurants = await connector.get_restaurants(
                location=location,
                vegetarian=True,
                limit=10
            )
            print(f"Found {len(restaurants)} vegetarian-friendly restaurants")
            
            # Health check
            health = await connector.health_check()
            print(f"Health status: {health['status']}")
    
    asyncio.run(main())