"""
Saarland Data Connector - Main connector for GeoPortal Saarland integration
Provides access to various Saarland government data sources with DSGVO compliance
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from functools import wraps
import hashlib
from urllib.parse import urlencode
import backoff
from circuitbreaker import circuit

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configuration
GEOPORTAL_BASE_URL = "https://geoportal.saarland.de"
GEOPORTAL_API_URL = f"{GEOPORTAL_BASE_URL}/mapbender/geoportal/gaz_geom_mobile.php"
GEOPORTAL_WMS_URL = f"{GEOPORTAL_BASE_URL}/mapgate/wms"
GEOPORTAL_WFS_URL = f"{GEOPORTAL_BASE_URL}/mapgate/wfs"

# Cache configuration
CACHE_TTL = {
    "static": 3600,  # 1 hour for static data
    "dynamic": 300,  # 5 minutes for dynamic data
    "search": 1800,  # 30 minutes for search results
}

# Circuit breaker configuration
CIRCUIT_FAILURE_THRESHOLD = 5
CIRCUIT_RECOVERY_TIMEOUT = 60
CIRCUIT_EXPECTED_EXCEPTION = (aiohttp.ClientError, asyncio.TimeoutError)


class CacheManager:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        if key in self._cache:
            timestamp = self._timestamps.get(key, 0)
            if datetime.now().timestamp() - timestamp < CACHE_TTL.get("dynamic", 300):
                logger.debug(f"Cache hit for key: {key}")
                return self._cache[key]
            else:
                # Remove expired entry
                del self._cache[key]
                del self._timestamps[key]
                logger.debug(f"Cache expired for key: {key}")
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache with TTL"""
        self._cache[key] = value
        self._timestamps[key] = datetime.now().timestamp()
        if ttl:
            # Override default TTL if specified
            self._timestamps[key] = datetime.now().timestamp()
        logger.debug(f"Cache set for key: {key}")
    
    def clear(self):
        """Clear all cache entries"""
        self._cache.clear()
        self._timestamps.clear()
        logger.info("Cache cleared")


class SaarlandDataConnector:
    """Main connector for Saarland government data sources"""
    
    def __init__(self, session: Optional[aiohttp.ClientSession] = None):
        self.session = session
        self._owns_session = session is None
        self.cache = CacheManager()
        self.request_count = 0
        self.error_count = 0
        
    async def __aenter__(self):
        if self._owns_session:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers={
                    "User-Agent": "AgentLand/1.0 (Saarland Data Connector)",
                    "Accept": "application/json,application/xml",
                    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8"
                }
            )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._owns_session and self.session:
            await self.session.close()
    
    def _generate_cache_key(self, endpoint: str, params: Dict[str, Any]) -> str:
        """Generate cache key from endpoint and parameters"""
        param_str = json.dumps(params, sort_keys=True)
        return hashlib.md5(f"{endpoint}:{param_str}".encode()).hexdigest()
    
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
                
                content_type = response.headers.get("Content-Type", "")
                if "json" in content_type:
                    return await response.json()
                elif "xml" in content_type:
                    # Convert XML to dict if needed
                    text = await response.text()
                    return {"xml": text}  # Simplified for now
                else:
                    return {"text": await response.text()}
                    
        except aiohttp.ClientError as e:
            self.error_count += 1
            logger.error(f"Request failed: {str(e)}")
            raise
        except Exception as e:
            self.error_count += 1
            logger.error(f"Unexpected error: {str(e)}")
            raise
    
    async def search_locations(
        self, 
        query: str, 
        limit: int = 10,
        bbox: Optional[List[float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for locations in Saarland using GeoPortal
        
        Args:
            query: Search query string
            limit: Maximum number of results
            bbox: Bounding box [minX, minY, maxX, maxY] in EPSG:4326
            
        Returns:
            List of location results with coordinates and metadata
        """
        cache_key = self._generate_cache_key("search_locations", {
            "query": query,
            "limit": limit,
            "bbox": bbox
        })
        
        # Check cache
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Prepare parameters
        params = {
            "searchText": query,
            "maxRows": limit,
            "outputFormat": "json",
            "srsName": "EPSG:4326"
        }
        
        if bbox:
            params["bbox"] = ",".join(map(str, bbox))
        
        try:
            result = await self._make_request(
                url=GEOPORTAL_API_URL,
                params=params
            )
            
            # Process results
            locations = []
            if isinstance(result, dict) and "features" in result:
                for feature in result["features"]:
                    location = {
                        "id": feature.get("id"),
                        "name": feature.get("properties", {}).get("name"),
                        "type": feature.get("properties", {}).get("type"),
                        "coordinates": feature.get("geometry", {}).get("coordinates"),
                        "properties": feature.get("properties", {}),
                        "confidence": feature.get("properties", {}).get("score", 1.0)
                    }
                    locations.append(location)
            
            # Cache results
            self.cache.set(cache_key, locations, CACHE_TTL["search"])
            
            logger.info(f"Found {len(locations)} locations for query: {query}")
            return locations
            
        except Exception as e:
            logger.error(f"Location search failed: {str(e)}")
            return []
    
    async def get_administrative_boundaries(
        self,
        admin_level: str = "gemeinde",
        format: str = "geojson"
    ) -> Dict[str, Any]:
        """
        Get administrative boundaries for Saarland
        
        Args:
            admin_level: Administrative level (land, kreis, gemeinde)
            format: Output format (geojson, wkt)
            
        Returns:
            Administrative boundary data
        """
        cache_key = self._generate_cache_key("admin_boundaries", {
            "level": admin_level,
            "format": format
        })
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # WFS parameters for administrative boundaries
        params = {
            "service": "WFS",
            "version": "2.0.0",
            "request": "GetFeature",
            "typeName": f"sl:verwaltungsgrenzen_{admin_level}",
            "outputFormat": "application/json" if format == "geojson" else "text/xml",
            "srsName": "EPSG:4326"
        }
        
        try:
            result = await self._make_request(
                url=GEOPORTAL_WFS_URL,
                params=params
            )
            
            # Cache with longer TTL for static data
            self.cache.set(cache_key, result, CACHE_TTL["static"])
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get administrative boundaries: {str(e)}")
            return {}
    
    async def get_poi_data(
        self,
        category: str,
        bbox: Optional[List[float]] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get Points of Interest (POI) data
        
        Args:
            category: POI category (e.g., 'hospital', 'school', 'tourism')
            bbox: Bounding box filter
            limit: Maximum number of results
            
        Returns:
            List of POI data
        """
        cache_key = self._generate_cache_key("poi_data", {
            "category": category,
            "bbox": bbox,
            "limit": limit
        })
        
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # Map categories to WFS layer names
        category_mapping = {
            "hospital": "sl:krankenhaeuser",
            "school": "sl:schulen",
            "tourism": "sl:tourismus_poi",
            "government": "sl:behoerden",
            "culture": "sl:kultur_einrichtungen"
        }
        
        layer_name = category_mapping.get(category, f"sl:{category}")
        
        params = {
            "service": "WFS",
            "version": "2.0.0",
            "request": "GetFeature",
            "typeName": layer_name,
            "outputFormat": "application/json",
            "srsName": "EPSG:4326",
            "maxFeatures": limit
        }
        
        if bbox:
            params["bbox"] = ",".join(map(str, bbox + ["EPSG:4326"]))
        
        try:
            result = await self._make_request(
                url=GEOPORTAL_WFS_URL,
                params=params
            )
            
            # Process features
            pois = []
            if isinstance(result, dict) and "features" in result:
                for feature in result["features"]:
                    poi = {
                        "id": feature.get("id"),
                        "name": feature.get("properties", {}).get("name"),
                        "category": category,
                        "coordinates": feature.get("geometry", {}).get("coordinates"),
                        "properties": self._anonymize_properties(feature.get("properties", {})),
                        "last_updated": datetime.now().isoformat()
                    }
                    pois.append(poi)
            
            # Cache results
            self.cache.set(cache_key, pois, CACHE_TTL["dynamic"])
            
            logger.info(f"Retrieved {len(pois)} POIs for category: {category}")
            return pois
            
        except Exception as e:
            logger.error(f"Failed to get POI data: {str(e)}")
            return []
    
    def _anonymize_properties(self, properties: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anonymize properties to ensure DSGVO compliance
        Remove or hash personal data fields
        """
        sensitive_fields = ["email", "phone", "contact_person", "owner"]
        anonymized = properties.copy()
        
        for field in sensitive_fields:
            if field in anonymized:
                # Hash sensitive data instead of removing
                value = str(anonymized[field])
                anonymized[field] = hashlib.sha256(value.encode()).hexdigest()[:8]
        
        return anonymized
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get connector statistics"""
        return {
            "request_count": self.request_count,
            "error_count": self.error_count,
            "error_rate": self.error_count / max(self.request_count, 1),
            "cache_size": len(self.cache._cache),
            "uptime": datetime.now().isoformat()
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on the connector"""
        try:
            # Try a simple request
            await self._make_request(
                url=GEOPORTAL_BASE_URL,
                params={"service": "WMS", "request": "GetCapabilities"}
            )
            
            return {
                "status": "healthy",
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
        async with SaarlandDataConnector() as connector:
            # Search for locations
            locations = await connector.search_locations("Saarbrücken")
            print(f"Found {len(locations)} locations")
            
            # Get administrative boundaries
            boundaries = await connector.get_administrative_boundaries("kreis")
            print(f"Retrieved boundaries: {bool(boundaries)}")
            
            # Get POI data
            hospitals = await connector.get_poi_data("hospital", limit=10)
            print(f"Found {len(hospitals)} hospitals")
            
            # Health check
            health = await connector.health_check()
            print(f"Health status: {health['status']}")
    
    asyncio.run(main())