"""
Security Middleware für AGENTLAND.SAARLAND
Implementiert Rate Limiting, Request Validation und Security Headers
"""

import time
import redis
from typing import Dict, Optional
from fastapi import HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
import logging
from datetime import datetime, timedelta
import hashlib
import json

logger = logging.getLogger(__name__)


class SecurityMiddleware:
    """
    Zentrales Security Middleware für API-Schutz
    """
    
    def __init__(self, redis_client: redis.Redis, config: dict):
        self.redis = redis_client
        self.config = config
        self.rate_limits = {
            'default': {'requests': 100, 'window': 60},  # 100 req/min
            'auth': {'requests': 5, 'window': 60},       # 5 login attempts/min
            'chat': {'requests': 30, 'window': 60},      # 30 chat req/min
            'api_key': {'requests': 1000, 'window': 60}, # 1000 req/min für API keys
        }
        
    async def __call__(self, request: Request, call_next):
        """
        Middleware Hauptlogik
        """
        try:
            # 1. Rate Limiting prüfen
            await self._check_rate_limit(request)
            
            # 2. Request Validation
            await self._validate_request(request)
            
            # 3. Request verarbeiten
            response = await call_next(request)
            
            # 4. Security Headers hinzufügen
            self._add_security_headers(response)
            
            # 5. Response logging
            await self._log_request(request, response)
            
            return response
            
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": e.detail,
                    "timestamp": datetime.utcnow().isoformat(),
                    "path": str(request.url.path)
                }
            )
        except Exception as e:
            logger.error(f"Security middleware error: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal security error",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
    
    async def _check_rate_limit(self, request: Request):
        """
        Rate Limiting basierend auf IP und Endpoint
        """
        client_ip = self._get_client_ip(request)
        endpoint = request.url.path
        
        # Rate Limit Kategorie bestimmen
        category = self._get_rate_limit_category(endpoint)
        limit_config = self.rate_limits.get(category, self.rate_limits['default'])
        
        # Redis Key für Rate Limiting
        key = f"rate_limit:{client_ip}:{category}"
        
        try:
            # Aktuelle Anfragen zählen
            current_requests = await self._get_request_count(key, limit_config['window'])
            
            if current_requests >= limit_config['requests']:
                logger.warning(f"Rate limit exceeded for {client_ip} on {endpoint}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "message": "Rate limit exceeded",
                        "limit": limit_config['requests'],
                        "window": limit_config['window'],
                        "retry_after": await self._get_retry_after(key, limit_config['window'])
                    }
                )
            
            # Request zählen
            await self._increment_request_count(key, limit_config['window'])
            
        except redis.RedisError as e:
            logger.error(f"Redis error in rate limiting: {str(e)}")
            # Bei Redis-Fehler: Request durchlassen aber loggen
            
    async def _validate_request(self, request: Request):
        """
        Request Validation für Security
        """
        # Content-Length prüfen (DoS Schutz)
        if hasattr(request, 'content_length') and request.content_length:
            max_size = 10 * 1024 * 1024  # 10MB
            if request.content_length > max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Request too large"
                )
        
        # User-Agent prüfen (Bot Detection)
        user_agent = request.headers.get('user-agent', '')
        if self._is_suspicious_user_agent(user_agent):
            logger.warning(f"Suspicious user agent: {user_agent}")
            # Optional: Request blockieren
        
        # SQL Injection Patterns in Query Parameters
        for param, value in request.query_params.items():
            if self._contains_sql_injection(str(value)):
                logger.error(f"SQL injection attempt detected: {param}={value}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request parameters"
                )
    
    def _get_client_ip(self, request: Request) -> str:
        """
        Echte Client IP ermitteln (hinter Proxy/Load Balancer)
        """
        # Prüfe X-Forwarded-For Header (Proxy)
        forwarded_for = request.headers.get('x-forwarded-for')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        # Prüfe X-Real-IP Header (Nginx)
        real_ip = request.headers.get('x-real-ip')
        if real_ip:
            return real_ip
        
        # Fallback: Direkte IP
        return request.client.host if request.client else 'unknown'
    
    def _get_rate_limit_category(self, endpoint: str) -> str:
        """
        Rate Limit Kategorie basierend auf Endpoint
        """
        if '/auth/' in endpoint:
            return 'auth'
        elif '/chat' in endpoint or '/agents/' in endpoint:
            return 'chat'
        elif '/api/v1/' in endpoint:
            return 'api_key'
        else:
            return 'default'
    
    async def _get_request_count(self, key: str, window: int) -> int:
        """
        Aktuelle Request-Anzahl aus Redis
        """
        try:
            count = self.redis.get(key)
            return int(count) if count else 0
        except:
            return 0
    
    async def _increment_request_count(self, key: str, window: int):
        """
        Request-Counter in Redis erhöhen
        """
        try:
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, window)
            pipe.execute()
        except:
            pass  # Redis Fehler ignorieren für Verfügbarkeit
    
    async def _get_retry_after(self, key: str, window: int) -> int:
        """
        Retry-After Zeit für Rate Limiting
        """
        try:
            ttl = self.redis.ttl(key)
            return max(ttl, 1) if ttl > 0 else window
        except:
            return window
    
    def _add_security_headers(self, response: Response):
        """
        Security Headers zu Response hinzufügen
        """
        response.headers.update({
            # XSS Protection
            'X-XSS-Protection': '1; mode=block',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            
            # HTTPS Enforcement
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            
            # Content Security Policy
            'Content-Security-Policy': (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://api.deepseek.com"
            ),
            
            # Cache Control für sensible Daten
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            
            # Server Information verstecken
            'Server': 'AGENTLAND.SAARLAND'
        })
    
    async def _log_request(self, request: Request, response: Response):
        """
        Security Logging für Audit Trail
        """
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'client_ip': self._get_client_ip(request),
            'method': request.method,
            'path': str(request.url.path),
            'status_code': response.status_code,
            'user_agent': request.headers.get('user-agent', ''),
            'content_length': getattr(response, 'content_length', 0)
        }
        
        # Kritische Events extra loggen
        if response.status_code >= 400:
            logger.warning(f"HTTP Error: {json.dumps(log_data)}")
        elif request.url.path.startswith('/auth/'):
            logger.info(f"Auth Request: {json.dumps(log_data)}")
    
    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """
        Suspicious User-Agent Detection
        """
        suspicious_patterns = [
            'sqlmap', 'nikto', 'nmap', 'masscan',
            'wget', 'curl', 'python-requests',
            'bot', 'crawler', 'spider'
        ]
        
        user_agent_lower = user_agent.lower()
        return any(pattern in user_agent_lower for pattern in suspicious_patterns)
    
    def _contains_sql_injection(self, value: str) -> bool:
        """
        Einfache SQL Injection Detection
        """
        sql_patterns = [
            'union select', 'drop table', 'insert into',
            'update set', 'delete from', '--', ';',
            'script>', '<iframe', 'javascript:',
            'onload=', 'onerror='
        ]
        
        value_lower = value.lower()
        return any(pattern in value_lower for pattern in sql_patterns)


class IPWhitelist:
    """
    IP Whitelist für vertrauenswürdige Quellen
    """
    
    def __init__(self, whitelist: list = None):
        self.whitelist = whitelist or [
            '127.0.0.1',    # Localhost
            '::1',          # IPv6 Localhost
            # Füge vertrauenswürdige IPs hinzu
        ]
    
    def is_whitelisted(self, ip: str) -> bool:
        """
        Prüft ob IP auf Whitelist steht
        """
        return ip in self.whitelist


class APIKeyValidator:
    """
    API Key Validation für Service-to-Service Kommunikation
    """
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    async def validate_api_key(self, api_key: str) -> bool:
        """
        API Key validieren
        """
        if not api_key:
            return False
            
        # Hash für sichere Speicherung
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        try:
            # Prüfe in Redis Cache
            is_valid = self.redis.get(f"api_key:{key_hash}")
            return bool(is_valid)
        except:
            return False
    
    async def register_api_key(self, api_key: str, metadata: dict = None):
        """
        Neuen API Key registrieren
        """
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        try:
            data = {
                'created_at': datetime.utcnow().isoformat(),
                'metadata': metadata or {}
            }
            self.redis.setex(
                f"api_key:{key_hash}", 
                86400 * 365,  # 1 Jahr gültig
                json.dumps(data)
            )
        except Exception as e:
            logger.error(f"Failed to register API key: {str(e)}")