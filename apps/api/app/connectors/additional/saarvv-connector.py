"""
SaarVV Connector - Public transport data connector for Saarland
Integrates with saarVV (Saarländischer Verkehrsverbund) for real-time transit data
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
import xml.etree.ElementTree as ET

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configuration
SAARVV_BASE_URL = "https://www.saarfahrplan.de"
SAARVV_API_URL = f"{SAARVV_BASE_URL}/hafas/mgate.exe"
SAARVV_GTFS_URL = f"{SAARVV_BASE_URL}/gtfs/saarvv-gtfs.zip"
SAARVV_REALTIME_URL = f"{SAARVV_BASE_URL}/hafas/stboard.exe/dn"

# VDV API endpoints (if available)
VDV_BASE_URL = "https://api.saarvv.de/vdv"
VDV_STOPS_URL = f"{VDV_BASE_URL}/stops"
VDV_DEPARTURES_URL = f"{VDV_BASE_URL}/departures"

# Cache configuration
CACHE_TTL = {
    "stops": 86400,  # 24 hours for stop data
    "routes": 3600,  # 1 hour for route data
    "departures": 60,  # 1 minute for real-time departures
    "journey": 300,  # 5 minutes for journey plans
}

# Circuit breaker configuration
CIRCUIT_FAILURE_THRESHOLD = 5
CIRCUIT_RECOVERY_TIMEOUT = 60
CIRCUIT_EXPECTED_EXCEPTION = (aiohttp.ClientError, asyncio.TimeoutError)


class TransitDataCache:
    """Specialized cache for transit data with TTL support"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
        self._hit_count = 0
        self._miss_count = 0
    
    def get(self, key: str, ttl_override: Optional[int] = None) -> Optional[Any]:
        """Get value from cache if not expired"""
        if key in self._cache:
            timestamp = self._timestamps.get(key, 0)
            ttl = ttl_override or CACHE_TTL.get("departures", 60)
            
            if datetime.now().timestamp() - timestamp < ttl:
                self._hit_count += 1
                logger.debug(f"Cache hit for key: {key}")
                return self._cache[key]
            else:
                # Remove expired entry
                del self._cache[key]
                del self._timestamps[key]
                logger.debug(f"Cache expired for key: {key}")
        
        self._miss_count += 1
        return None
    
    def set(self, key: str, value: Any):
        """Set value in cache"""
        self._cache[key] = value
        self._timestamps[key] = datetime.now().timestamp()
        logger.debug(f"Cache set for key: {key}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total = self._hit_count + self._miss_count
        hit_rate = self._hit_count / max(total, 1)
        
        return {
            "hit_count": self._hit_count,
            "miss_count": self._miss_count,
            "hit_rate": hit_rate,
            "size": len(self._cache)
        }


class SaarVVConnector:
    """Connector for SaarVV public transport data"""
    
    def __init__(self, session: Optional[aiohttp.ClientSession] = None):
        self.session = session
        self._owns_session = session is None
        self.cache = TransitDataCache()
        self.request_count = 0
        self.error_count = 0
        
    async def __aenter__(self):
        if self._owns_session:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers={
                    "User-Agent": "AgentLand/1.0 (SaarVV Connector)",
                    "Accept": "application/json,application/xml,text/plain",
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
        data: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Any:
        """Make HTTP request with circuit breaker and retry logic"""
        self.request_count += 1
        
        try:
            logger.info(f"Making {method} request to: {url}")
            
            async with self.session.request(
                method=method,
                url=url,
                params=params,
                data=data,
                headers=headers
            ) as response:
                response.raise_for_status()
                
                content_type = response.headers.get("Content-Type", "")
                if "json" in content_type:
                    return await response.json()
                elif "xml" in content_type:
                    text = await response.text()
                    return ET.fromstring(text)
                else:
                    return await response.text()
                    
        except aiohttp.ClientError as e:
            self.error_count += 1
            logger.error(f"Request failed: {str(e)}")
            raise
        except Exception as e:
            self.error_count += 1
            logger.error(f"Unexpected error: {str(e)}")
            raise
    
    async def search_stops(
        self, 
        query: str, 
        limit: int = 10,
        coordinates: Optional[Tuple[float, float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for public transport stops
        
        Args:
            query: Search query for stop name
            limit: Maximum number of results
            coordinates: Optional (lat, lon) for proximity search
            
        Returns:
            List of stop information
        """
        cache_key = self._generate_cache_key("search_stops", {
            "query": query,
            "limit": limit,
            "coordinates": coordinates
        })
        
        cached_result = self.cache.get(cache_key, CACHE_TTL["stops"])
        if cached_result:
            return cached_result
        
        # HAFAS-style parameters
        params = {
            "input": query,
            "type": "S",  # S for stops
            "max": limit,
            "coordOutputFormat": "WGS84",
            "locationServerActive": 1
        }
        
        if coordinates:
            params["coord"] = f"{coordinates[1]},{coordinates[0]}"  # lon,lat
        
        try:
            result = await self._make_request(
                url=f"{SAARVV_BASE_URL}/hafas/ajax-getstop.exe/dn",
                params=params
            )
            
            stops = []
            if isinstance(result, str):
                # Parse HAFAS response (usually JSON or custom format)
                try:
                    data = json.loads(result)
                    if "stops" in data:
                        for stop in data["stops"]:
                            stops.append({
                                "id": stop.get("extId", stop.get("id")),
                                "name": stop.get("name"),
                                "coordinates": {
                                    "lat": stop.get("lat"),
                                    "lon": stop.get("lon")
                                },
                                "products": stop.get("products", []),
                                "distance": stop.get("dist") if coordinates else None
                            })
                except json.JSONDecodeError:
                    # Handle legacy format
                    logger.warning("Non-JSON response format")
            
            # Cache results
            self.cache.set(cache_key, stops)
            
            logger.info(f"Found {len(stops)} stops for query: {query}")
            return stops
            
        except Exception as e:
            logger.error(f"Stop search failed: {str(e)}")
            return []
    
    async def get_departures(
        self,
        stop_id: str,
        time: Optional[datetime] = None,
        duration: int = 60,
        products: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get real-time departures from a stop
        
        Args:
            stop_id: Stop ID
            time: Start time (default: now)
            duration: Time window in minutes
            products: Filter by product types (bus, tram, train)
            
        Returns:
            List of departures with real-time data
        """
        time = time or datetime.now()
        
        cache_key = self._generate_cache_key("departures", {
            "stop_id": stop_id,
            "time": time.isoformat(),
            "duration": duration
        })
        
        cached_result = self.cache.get(cache_key, CACHE_TTL["departures"])
        if cached_result:
            return cached_result
        
        # Format parameters for departure board
        params = {
            "id": stop_id,
            "date": time.strftime("%d.%m.%Y"),
            "time": time.strftime("%H:%M"),
            "duration": duration,
            "rt": 1,  # Include real-time data
            "output": "json"
        }
        
        if products:
            # Map product types to HAFAS product codes
            product_map = {
                "bus": "B",
                "tram": "T",
                "train": "R",
                "sbahn": "S"
            }
            product_filter = "".join(product_map.get(p, "") for p in products)
            if product_filter:
                params["products"] = product_filter
        
        try:
            result = await self._make_request(
                url=SAARVV_REALTIME_URL,
                params=params
            )
            
            departures = []
            if isinstance(result, dict) and "departures" in result:
                for dep in result["departures"]:
                    departure = {
                        "id": dep.get("id"),
                        "line": {
                            "name": dep.get("line"),
                            "type": dep.get("product"),
                            "operator": dep.get("operator")
                        },
                        "direction": dep.get("direction"),
                        "scheduled_time": dep.get("scheduledTime"),
                        "real_time": dep.get("realTime"),
                        "delay": dep.get("delay", 0),
                        "platform": dep.get("platform"),
                        "cancelled": dep.get("cancelled", False),
                        "messages": dep.get("messages", [])
                    }
                    departures.append(departure)
            
            # Sort by time
            departures.sort(key=lambda x: x.get("real_time") or x.get("scheduled_time"))
            
            # Cache results
            self.cache.set(cache_key, departures)
            
            logger.info(f"Retrieved {len(departures)} departures for stop {stop_id}")
            return departures
            
        except Exception as e:
            logger.error(f"Failed to get departures: {str(e)}")
            return []
    
    async def plan_journey(
        self,
        origin: Union[str, Tuple[float, float]],
        destination: Union[str, Tuple[float, float]],
        time: Optional[datetime] = None,
        arrival: bool = False,
        max_transfers: int = 3,
        products: Optional[List[str]] = None,
        accessibility: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Plan a journey between two points
        
        Args:
            origin: Start point (stop ID or coordinates)
            destination: End point (stop ID or coordinates)
            time: Travel time (departure or arrival based on 'arrival' flag)
            arrival: If True, time is arrival time, else departure time
            max_transfers: Maximum number of transfers
            products: Allowed product types
            accessibility: Require accessible vehicles
            
        Returns:
            List of journey options
        """
        time = time or datetime.now()
        
        cache_key = self._generate_cache_key("journey", {
            "origin": str(origin),
            "destination": str(destination),
            "time": time.isoformat(),
            "arrival": arrival
        })
        
        cached_result = self.cache.get(cache_key, CACHE_TTL["journey"])
        if cached_result:
            return cached_result
        
        # Prepare journey planning parameters
        params = {
            "date": time.strftime("%d.%m.%Y"),
            "time": time.strftime("%H:%M"),
            "searchForArrival": int(arrival),
            "numJourneys": 6,
            "maxTransfers": max_transfers,
            "output": "json"
        }
        
        # Handle origin/destination format
        if isinstance(origin, tuple):
            params["originCoord"] = f"{origin[1]},{origin[0]}"  # lon,lat
        else:
            params["originId"] = origin
            
        if isinstance(destination, tuple):
            params["destCoord"] = f"{destination[1]},{destination[0]}"  # lon,lat
        else:
            params["destId"] = destination
        
        if accessibility:
            params["barrier"] = 0  # Barrier-free
        
        try:
            # Make journey planning request
            result = await self._make_request(
                url=f"{SAARVV_BASE_URL}/hafas/query.exe/dn",
                method="POST",
                data=params
            )
            
            journeys = []
            if isinstance(result, dict) and "journeys" in result:
                for journey in result["journeys"]:
                    journeys.append(self._parse_journey(journey))
            
            # Cache results
            self.cache.set(cache_key, journeys)
            
            logger.info(f"Found {len(journeys)} journey options")
            return journeys
            
        except Exception as e:
            logger.error(f"Journey planning failed: {str(e)}")
            return []
    
    def _parse_journey(self, journey_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse journey data into standardized format"""
        legs = []
        
        for leg in journey_data.get("legs", []):
            legs.append({
                "type": leg.get("type"),  # walk, bus, train, etc.
                "line": leg.get("line"),
                "direction": leg.get("direction"),
                "departure": {
                    "stop": leg.get("origin", {}).get("name"),
                    "time": leg.get("departure"),
                    "platform": leg.get("departurePlatform")
                },
                "arrival": {
                    "stop": leg.get("destination", {}).get("name"),
                    "time": leg.get("arrival"),
                    "platform": leg.get("arrivalPlatform")
                },
                "duration": leg.get("duration"),
                "distance": leg.get("distance"),
                "polyline": leg.get("polyline")  # For map display
            })
        
        return {
            "id": journey_data.get("id"),
            "duration": journey_data.get("duration"),
            "transfers": journey_data.get("transfers", 0),
            "departure": journey_data.get("departure"),
            "arrival": journey_data.get("arrival"),
            "price": journey_data.get("price"),
            "legs": legs,
            "accessibility": journey_data.get("barrierFree", False),
            "co2": journey_data.get("co2", 0)  # Environmental data
        }
    
    async def get_line_info(
        self,
        line_id: str,
        direction: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get detailed information about a transit line
        
        Args:
            line_id: Line identifier
            direction: Optional direction filter
            
        Returns:
            Line information including stops and schedule
        """
        cache_key = self._generate_cache_key("line_info", {
            "line_id": line_id,
            "direction": direction
        })
        
        cached_result = self.cache.get(cache_key, CACHE_TTL["routes"])
        if cached_result:
            return cached_result
        
        try:
            # Get line details
            params = {
                "lineId": line_id,
                "output": "json"
            }
            
            if direction:
                params["direction"] = direction
            
            result = await self._make_request(
                url=f"{SAARVV_BASE_URL}/hafas/lineinfo.exe/dn",
                params=params
            )
            
            line_info = {
                "id": line_id,
                "name": result.get("name"),
                "type": result.get("product"),
                "operator": result.get("operator"),
                "color": result.get("color"),
                "stops": result.get("stops", []),
                "schedule": result.get("schedule"),
                "accessibility": result.get("accessible", False)
            }
            
            # Cache results
            self.cache.set(cache_key, line_info)
            
            return line_info
            
        except Exception as e:
            logger.error(f"Failed to get line info: {str(e)}")
            return {}
    
    async def get_disruptions(
        self,
        lines: Optional[List[str]] = None,
        stops: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get service disruptions and alerts
        
        Args:
            lines: Filter by line IDs
            stops: Filter by stop IDs
            
        Returns:
            List of active disruptions
        """
        try:
            params = {
                "output": "json",
                "active": 1  # Only active disruptions
            }
            
            if lines:
                params["lines"] = ",".join(lines)
            if stops:
                params["stops"] = ",".join(stops)
            
            result = await self._make_request(
                url=f"{SAARVV_BASE_URL}/hafas/himinfo.exe/dn",
                params=params
            )
            
            disruptions = []
            if isinstance(result, dict) and "messages" in result:
                for msg in result["messages"]:
                    disruption = {
                        "id": msg.get("id"),
                        "title": msg.get("title"),
                        "description": msg.get("text"),
                        "severity": msg.get("priority", "info"),
                        "start": msg.get("validFrom"),
                        "end": msg.get("validTo"),
                        "affected_lines": msg.get("lines", []),
                        "affected_stops": msg.get("stops", []),
                        "updated": msg.get("updated")
                    }
                    disruptions.append(disruption)
            
            logger.info(f"Retrieved {len(disruptions)} disruptions")
            return disruptions
            
        except Exception as e:
            logger.error(f"Failed to get disruptions: {str(e)}")
            return []
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get connector statistics"""
        return {
            "request_count": self.request_count,
            "error_count": self.error_count,
            "error_rate": self.error_count / max(self.request_count, 1),
            "cache_stats": self.cache.get_stats(),
            "uptime": datetime.now().isoformat()
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on the connector"""
        try:
            # Try to search for a common stop
            stops = await self.search_stops("Hauptbahnhof", limit=1)
            
            return {
                "status": "healthy" if stops else "degraded",
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
        async with SaarVVConnector() as connector:
            # Search for stops
            stops = await connector.search_stops("Saarbrücken Hauptbahnhof")
            print(f"Found {len(stops)} stops")
            
            if stops:
                # Get departures from first stop
                stop_id = stops[0]["id"]
                departures = await connector.get_departures(stop_id, duration=30)
                print(f"Next {len(departures)} departures")
                
                # Plan a journey
                if len(stops) > 1:
                    journeys = await connector.plan_journey(
                        origin=stops[0]["id"],
                        destination=stops[1]["id"]
                    )
                    print(f"Found {len(journeys)} journey options")
            
            # Check for disruptions
            disruptions = await connector.get_disruptions()
            print(f"Active disruptions: {len(disruptions)}")
            
            # Health check
            health = await connector.health_check()
            print(f"Health status: {health['status']}")
    
    asyncio.run(main())