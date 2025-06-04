"""
Performance Optimization Middleware für AGENTLAND.SAARLAND
Ziel: <300ms API Response Zeit, <2s Chat Response Zeit
"""

import asyncio
import time
import json
import gzip
import logging
from typing import Callable, Dict, Any, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.types import ASGIApp
import redis.asyncio as redis

from app.core.config import settings
from app.core.cache import cache, performance_monitor

logger = logging.getLogger(__name__)


class PerformanceMiddleware(BaseHTTPMiddleware):
    """
    Umfassendes Performance-Middleware mit:
    - Response-Zeit-Tracking
    - Automatische Kompression
    - Request-Deduplication
    - Rate Limiting
    - Memory-Optimierung
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.redis_client = None
        self._init_redis()
        
        # Performance-Ziele
        self.api_target_ms = 300  # 300ms für API
        self.chat_target_ms = 2000  # 2s für Chat
        
        # Request-Deduplication
        self.pending_requests = {}
        
        # Statistiken
        self.stats = {
            "total_requests": 0,
            "fast_requests": 0,  # <300ms
            "slow_requests": 0,  # >300ms
            "cached_responses": 0,
            "compressed_responses": 0
        }
    
    def _init_redis(self):
        """Redis für verteiltes Rate Limiting"""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                max_connections=10
            )
        except Exception as e:
            logger.error(f"Performance middleware Redis error: {e}")
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Hauptverarbeitung mit Performance-Optimierungen"""
        start_time = time.time()
        
        # Request-Fingerprint für Deduplication
        request_key = self._generate_request_key(request)
        
        try:
            # Rate Limiting prüfen
            if await self._check_rate_limit(request):
                return JSONResponse(
                    status_code=429,
                    content={"error": "Rate limit exceeded"}
                )
            
            # Request Deduplication für identische Anfragen
            if request_key in self.pending_requests:
                logger.info(f"Request deduplication: {request_key}")
                # Warte auf bereits laufende Anfrage
                return await self.pending_requests[request_key]
            
            # Cache-Check für GET-Requests
            if request.method == "GET":
                cached_response = await self._get_cached_response(request)
                if cached_response:
                    response_time = time.time() - start_time
                    self._record_metrics(response_time, True)
                    return cached_response
            
            # Request ausführen
            future = asyncio.Future()
            self.pending_requests[request_key] = future
            
            try:
                response = await call_next(request)
                
                # Response optimieren
                response = await self._optimize_response(request, response)
                
                # Cache für GET-Requests
                if request.method == "GET" and response.status_code == 200:
                    await self._cache_response(request, response)
                
                future.set_result(response)
                
            except Exception as e:
                future.set_exception(e)
                raise
            finally:
                self.pending_requests.pop(request_key, None)
            
            # Metriken aufzeichnen
            response_time = time.time() - start_time
            self._record_metrics(response_time, False)
            
            # Performance-Warnung bei langsamen Requests
            target_time = self._get_target_time(request)
            if response_time > target_time:
                logger.warning(
                    f"Slow request: {request.url.path} took {response_time*1000:.1f}ms "
                    f"(target: {target_time*1000:.1f}ms)"
                )
            
            return response
            
        except Exception as e:
            response_time = time.time() - start_time
            self._record_metrics(response_time, False)
            logger.error(f"Request error: {e}")
            raise
    
    def _generate_request_key(self, request: Request) -> str:
        """Generiert eindeutigen Request-Key für Deduplication"""
        import hashlib
        
        key_data = {
            "method": request.method,
            "url": str(request.url),
            "headers": dict(request.headers)
        }
        
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    async def _check_rate_limit(self, request: Request) -> bool:
        """Überprüft Rate Limiting"""
        if not self.redis_client:
            return False
        
        try:
            client_ip = request.client.host
            
            # Verschiedene Limits je nach Endpoint
            if "/api/v1/chat" in request.url.path:
                limit = 10  # 10 Chat-Requests pro Minute
                window = 60
            elif "/api/v1/realtime" in request.url.path:
                limit = 60  # 60 Realtime-Requests pro Minute
                window = 60
            else:
                limit = 100  # 100 normale Requests pro Minute
                window = 60
            
            key = f"rate_limit:{client_ip}:{request.url.path.split('/')[1]}"
            
            # Current count
            current = await self.redis_client.get(key)
            if current and int(current) >= limit:
                return True
            
            # Increment
            pipe = self.redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, window)
            await pipe.execute()
            
            return False
            
        except Exception as e:
            logger.error(f"Rate limit check error: {e}")
            return False
    
    async def _get_cached_response(self, request: Request) -> Optional[Response]:
        """Holt gecachte Response"""
        try:
            cache_key = f"response:{self._generate_request_key(request)}"
            cached_data = await cache.get(cache_key)
            
            if cached_data:
                self.stats["cached_responses"] += 1
                return Response(
                    content=cached_data["content"],
                    status_code=cached_data["status_code"],
                    headers=cached_data["headers"],
                    media_type=cached_data["media_type"]
                )
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        
        return None
    
    async def _cache_response(self, request: Request, response: Response):
        """Cached Response für spätere Verwendung"""
        try:
            # Nur bestimmte Responses cachen
            if response.status_code != 200:
                return
            
            # Response-Body lesen
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            # Cache-TTL basierend auf Endpoint
            ttl = 300  # 5 Minuten default
            if "/api/v1/realtime" in request.url.path:
                ttl = 60  # 1 Minute für Realtime
            elif "/api/v1/analytics" in request.url.path:
                ttl = 120  # 2 Minuten für Analytics
            
            cache_key = f"response:{self._generate_request_key(request)}"
            cache_data = {
                "content": body.decode() if body else "",
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "media_type": response.media_type
            }
            
            await cache.set(cache_key, cache_data, ttl)
            
            # Response neu erstellen
            response = Response(
                content=body,
                status_code=response.status_code,
                headers=response.headers,
                media_type=response.media_type
            )
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    async def _optimize_response(self, request: Request, response: Response) -> Response:
        """Optimiert Response (Kompression, Headers, etc.)"""
        try:
            # Accept-Encoding prüfen
            accept_encoding = request.headers.get("accept-encoding", "")
            
            # Gzip-Kompression für große Responses
            if ("gzip" in accept_encoding and 
                response.status_code == 200 and
                hasattr(response, 'body')):
                
                # Response-Body lesen
                body = b""
                if hasattr(response, 'body_iterator'):
                    async for chunk in response.body_iterator:
                        body += chunk
                else:
                    body = response.body if isinstance(response.body, bytes) else response.body.encode()
                
                # Komprimieren wenn größer als 1KB
                if len(body) > 1024:
                    compressed_body = gzip.compress(body)
                    
                    # Nur verwenden wenn Kompression sinnvoll
                    if len(compressed_body) < len(body) * 0.9:
                        self.stats["compressed_responses"] += 1
                        
                        headers = dict(response.headers)
                        headers["content-encoding"] = "gzip"
                        headers["content-length"] = str(len(compressed_body))
                        
                        response = Response(
                            content=compressed_body,
                            status_code=response.status_code,
                            headers=headers,
                            media_type=response.media_type
                        )
            
            # Performance-Headers hinzufügen
            response.headers["X-Response-Time"] = str(int(time.time() * 1000))
            response.headers["X-Cache-Status"] = "MISS"
            
            return response
            
        except Exception as e:
            logger.error(f"Response optimization error: {e}")
            return response
    
    def _get_target_time(self, request: Request) -> float:
        """Gibt Ziel-Response-Zeit für Request zurück"""
        if "/api/v1/chat" in request.url.path:
            return self.chat_target_ms / 1000
        else:
            return self.api_target_ms / 1000
    
    def _record_metrics(self, response_time: float, from_cache: bool):
        """Zeichnet Performance-Metriken auf"""
        self.stats["total_requests"] += 1
        
        if from_cache:
            self.stats["cached_responses"] += 1
            self.stats["fast_requests"] += 1
        else:
            performance_monitor.record_response_time(response_time)
            
            if response_time < self.api_target_ms / 1000:
                self.stats["fast_requests"] += 1
            else:
                self.stats["slow_requests"] += 1
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Performance-Statistiken"""
        total = self.stats["total_requests"]
        if total == 0:
            return self.stats
        
        return {
            **self.stats,
            "fast_request_percentage": (self.stats["fast_requests"] / total) * 100,
            "cache_hit_rate": (self.stats["cached_responses"] / total) * 100,
            "compression_rate": (self.stats["compressed_responses"] / total) * 100
        }


class MemoryOptimizationMiddleware(BaseHTTPMiddleware):
    """
    Memory-Optimierung für große Datenmengen
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.memory_threshold = 100 * 1024 * 1024  # 100MB
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Memory-optimierte Verarbeitung"""
        import psutil
        import gc
        
        # Memory-Check vor Request
        memory_before = psutil.virtual_memory().used
        
        try:
            response = await call_next(request)
            
            # Memory-Check nach Request
            memory_after = psutil.virtual_memory().used
            memory_used = memory_after - memory_before
            
            # Garbage Collection bei hohem Memory-Verbrauch
            if memory_used > self.memory_threshold:
                logger.info(f"High memory usage detected: {memory_used/1024/1024:.1f}MB")
                gc.collect()
            
            return response
            
        except Exception as e:
            # Cleanup bei Fehler
            gc.collect()
            raise


class DatabaseOptimizationMiddleware(BaseHTTPMiddleware):
    """
    Database-Performance-Optimierung
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.slow_query_threshold = 1.0  # 1 Sekunde
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Database-optimierte Verarbeitung"""
        
        # Query-Performance-Tracking würde hier implementiert
        # Momentan Placeholder für spätere Implementierung
        
        response = await call_next(request)
        return response


# Globale Middleware-Instanzen
performance_middleware = PerformanceMiddleware
memory_middleware = MemoryOptimizationMiddleware
database_middleware = DatabaseOptimizationMiddleware