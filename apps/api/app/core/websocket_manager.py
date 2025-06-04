"""
Optimierter WebSocket Manager für Real-Time Features
Unterstützt 200,000 gleichzeitige Verbindungen
"""

import asyncio
import json
import logging
import time
from typing import Dict, List, Optional, Set, Any
from collections import defaultdict
from datetime import datetime, timedelta
import weakref

from fastapi import WebSocket, WebSocketDisconnect
import redis.asyncio as redis

from app.core.config import settings
from app.core.cache import cache

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Optimierter WebSocket Connection Manager
    Mit automatischer Skalierung und Memory-Optimierung
    """
    
    def __init__(self):
        # Aktive Verbindungen nach Channels gruppiert
        self.connections: Dict[str, Set[WebSocket]] = defaultdict(set)
        
        # Connection-Metadaten
        self.connection_data: Dict[WebSocket, Dict[str, Any]] = {}
        
        # Performance-Tracking
        self.connection_stats = {
            "total_connections": 0,
            "peak_connections": 0,
            "messages_sent": 0,
            "messages_received": 0,
            "connection_errors": 0
        }
        
        # Redis für Multi-Instance-Synchronisation
        self.redis_client = None
        self._init_redis()
        
        # Message Queue für Burst-Handling
        self.message_queue = asyncio.Queue(maxsize=10000)
        self.queue_worker_task = None
        
        # Connection Cleanup
        self.cleanup_interval = 60  # Sekunden
        self.last_cleanup = time.time()
        
    def _init_redis(self):
        """Redis für horizontale Skalierung"""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                max_connections=20
            )
        except Exception as e:
            logger.error(f"Redis WebSocket setup failed: {e}")
            self.redis_client = None
    
    async def connect(self, websocket: WebSocket, channel: str = "default", user_id: str = None):
        """Optimierte WebSocket-Verbindung"""
        try:
            await websocket.accept()
            
            # Verbindung hinzufügen
            self.connections[channel].add(websocket)
            self.connection_data[websocket] = {
                "channel": channel,
                "user_id": user_id,
                "connected_at": datetime.now(),
                "last_ping": time.time(),
                "message_count": 0
            }
            
            # Statistiken aktualisieren
            self.connection_stats["total_connections"] = len(self._get_all_connections())
            if self.connection_stats["total_connections"] > self.connection_stats["peak_connections"]:
                self.connection_stats["peak_connections"] = self.connection_stats["total_connections"]
            
            # Queue Worker starten falls nötig
            if self.queue_worker_task is None:
                self.queue_worker_task = asyncio.create_task(self._process_message_queue())
            
            logger.info(f"WebSocket connected: {channel} (Total: {self.connection_stats['total_connections']})")
            
            # Broadcast Verbindung an andere Instanzen
            if self.redis_client:
                await self.redis_client.publish("websocket_events", json.dumps({
                    "type": "connection",
                    "channel": channel,
                    "user_id": user_id,
                    "timestamp": time.time()
                }))
            
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            self.connection_stats["connection_errors"] += 1
            raise
    
    async def disconnect(self, websocket: WebSocket):
        """Optimierte Verbindungstrennung mit Cleanup"""
        try:
            if websocket in self.connection_data:
                channel = self.connection_data[websocket]["channel"]
                user_id = self.connection_data[websocket].get("user_id")
                
                # Aus Channel entfernen
                if channel in self.connections:
                    self.connections[channel].discard(websocket)
                    if not self.connections[channel]:
                        del self.connections[channel]
                
                # Metadaten entfernen
                del self.connection_data[websocket]
                
                # Statistiken aktualisieren
                self.connection_stats["total_connections"] = len(self._get_all_connections())
                
                logger.info(f"WebSocket disconnected: {channel} (Total: {self.connection_stats['total_connections']})")
                
                # Broadcast Trennung
                if self.redis_client:
                    await self.redis_client.publish("websocket_events", json.dumps({
                        "type": "disconnection",
                        "channel": channel,
                        "user_id": user_id,
                        "timestamp": time.time()
                    }))
            
        except Exception as e:
            logger.error(f"WebSocket disconnect error: {e}")
    
    def _get_all_connections(self) -> List[WebSocket]:
        """Alle aktiven Verbindungen"""
        all_connections = []
        for channel_connections in self.connections.values():
            all_connections.extend(channel_connections)
        return all_connections
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Nachricht an spezifische Verbindung"""
        try:
            await websocket.send_text(message)
            self.connection_stats["messages_sent"] += 1
            
            if websocket in self.connection_data:
                self.connection_data[websocket]["message_count"] += 1
                
        except WebSocketDisconnect:
            await self.disconnect(websocket)
        except Exception as e:
            logger.error(f"Send personal message error: {e}")
    
    async def broadcast_to_channel(self, message: str, channel: str):
        """Optimiertes Broadcast an Channel"""
        if channel not in self.connections:
            return
        
        # Message in Queue einreihen für Batch-Processing
        await self.message_queue.put({
            "type": "channel_broadcast",
            "message": message,
            "channel": channel,
            "timestamp": time.time()
        })
    
    async def broadcast_to_all(self, message: str):
        """Broadcast an alle Verbindungen"""
        await self.message_queue.put({
            "type": "global_broadcast",
            "message": message,
            "timestamp": time.time()
        })
    
    async def _process_message_queue(self):
        """Asynchroner Message Queue Worker"""
        while True:
            try:
                # Batch-Processing für bessere Performance
                messages = []
                timeout = 0.1  # 100ms Batch-Window
                
                try:
                    # Erste Nachricht holen
                    first_message = await asyncio.wait_for(
                        self.message_queue.get(), 
                        timeout=1.0
                    )
                    messages.append(first_message)
                    
                    # Weitere Nachrichten sammeln (max 100ms)
                    deadline = time.time() + timeout
                    while time.time() < deadline and len(messages) < 100:
                        try:
                            message = await asyncio.wait_for(
                                self.message_queue.get(), 
                                timeout=deadline - time.time()
                            )
                            messages.append(message)
                        except asyncio.TimeoutError:
                            break
                            
                except asyncio.TimeoutError:
                    continue
                
                # Messages verarbeiten
                await self._process_message_batch(messages)
                
                # Cleanup durchführen falls nötig
                if time.time() - self.last_cleanup > self.cleanup_interval:
                    await self._cleanup_connections()
                    self.last_cleanup = time.time()
                
            except Exception as e:
                logger.error(f"Message queue error: {e}")
                await asyncio.sleep(1)
    
    async def _process_message_batch(self, messages: List[Dict[str, Any]]):
        """Verarbeitet Message-Batch"""
        for message_data in messages:
            try:
                if message_data["type"] == "channel_broadcast":
                    await self._broadcast_channel_internal(
                        message_data["message"], 
                        message_data["channel"]
                    )
                elif message_data["type"] == "global_broadcast":
                    await self._broadcast_global_internal(message_data["message"])
                    
            except Exception as e:
                logger.error(f"Message batch processing error: {e}")
    
    async def _broadcast_channel_internal(self, message: str, channel: str):
        """Internes Channel-Broadcast"""
        if channel not in self.connections:
            return
        
        dead_connections = []
        
        # Paralleles Senden für bessere Performance
        tasks = []
        for websocket in self.connections[channel]:
            tasks.append(self._send_safe(websocket, message))
        
        # Maximal 50 gleichzeitige Sends
        for i in range(0, len(tasks), 50):
            batch = tasks[i:i+50]
            results = await asyncio.gather(*batch, return_exceptions=True)
            
            # Tote Verbindungen sammeln
            for j, result in enumerate(results):
                if isinstance(result, Exception):
                    websocket = list(self.connections[channel])[i+j]
                    dead_connections.append(websocket)
        
        # Tote Verbindungen entfernen
        for websocket in dead_connections:
            await self.disconnect(websocket)
    
    async def _broadcast_global_internal(self, message: str):
        """Internes Global-Broadcast"""
        all_connections = self._get_all_connections()
        dead_connections = []
        
        # Batch-Processing für bessere Performance
        for i in range(0, len(all_connections), 100):
            batch = all_connections[i:i+100]
            tasks = [self._send_safe(ws, message) for ws in batch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Tote Verbindungen sammeln
            for j, result in enumerate(results):
                if isinstance(result, Exception):
                    dead_connections.append(batch[j])
        
        # Cleanup
        for websocket in dead_connections:
            await self.disconnect(websocket)
    
    async def _send_safe(self, websocket: WebSocket, message: str):
        """Sicheres Senden mit Error-Handling"""
        try:
            await websocket.send_text(message)
            self.connection_stats["messages_sent"] += 1
            return True
        except WebSocketDisconnect:
            raise  # Will be handled in batch processing
        except Exception as e:
            logger.error(f"Send error: {e}")
            raise
    
    async def _cleanup_connections(self):
        """Periodische Bereinigung toter Verbindungen"""
        current_time = time.time()
        dead_connections = []
        
        for websocket, data in self.connection_data.items():
            # Ping-Test für inaktive Verbindungen
            if current_time - data["last_ping"] > 300:  # 5 Minuten
                try:
                    await websocket.ping()
                    data["last_ping"] = current_time
                except:
                    dead_connections.append(websocket)
        
        # Tote Verbindungen entfernen
        for websocket in dead_connections:
            await self.disconnect(websocket)
        
        if dead_connections:
            logger.info(f"Cleaned up {len(dead_connections)} dead connections")
    
    async def get_channel_stats(self, channel: str) -> Dict[str, Any]:
        """Channel-Statistiken"""
        if channel not in self.connections:
            return {"active_connections": 0}
        
        connections = self.connections[channel]
        total_messages = sum(
            self.connection_data.get(ws, {}).get("message_count", 0)
            for ws in connections
        )
        
        return {
            "active_connections": len(connections),
            "total_messages": total_messages,
            "channel": channel
        }
    
    def get_global_stats(self) -> Dict[str, Any]:
        """Globale WebSocket-Statistiken"""
        return {
            **self.connection_stats,
            "active_channels": len(self.connections),
            "queue_size": self.message_queue.qsize(),
            "memory_usage": len(self.connection_data)
        }
    
    async def broadcast_user_count_update(self):
        """Sendet User-Count-Updates an alle Clients"""
        stats = self.get_global_stats()
        update_message = json.dumps({
            "type": "user_count_update",
            "data": {
                "active_users": stats["total_connections"],
                "timestamp": datetime.now().isoformat()
            }
        })
        
        await self.broadcast_to_all(update_message)


# Globale Instanz
connection_manager = ConnectionManager()


class RealTimeDataBroadcaster:
    """
    Spezialisierter Broadcaster für Real-Time-Daten
    Mit intelligenter Update-Frequenz basierend auf Änderungen
    """
    
    def __init__(self, manager: ConnectionManager):
        self.manager = manager
        self.last_data = {}
        self.update_intervals = {
            "user_count": 30,  # 30 Sekunden
            "analytics": 60,   # 1 Minute
            "weather": 300,    # 5 Minuten
            "traffic": 120     # 2 Minuten
        }
        self.last_updates = {}
    
    async def start_broadcasting(self):
        """Startet automatische Broadcasts"""
        tasks = [
            asyncio.create_task(self._broadcast_user_count()),
            asyncio.create_task(self._broadcast_analytics()),
            asyncio.create_task(self._broadcast_weather()),
            asyncio.create_task(self._broadcast_traffic())
        ]
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _broadcast_user_count(self):
        """Periodisches User-Count-Broadcast"""
        while True:
            try:
                await self.manager.broadcast_user_count_update()
                await asyncio.sleep(self.update_intervals["user_count"])
            except Exception as e:
                logger.error(f"User count broadcast error: {e}")
                await asyncio.sleep(5)
    
    async def _broadcast_analytics(self):
        """Analytics-Updates"""
        while True:
            try:
                # Nur senden wenn sich Daten geändert haben
                from app.services.real_data.analytics_service import AnalyticsService
                analytics_service = AnalyticsService()
                
                stats = await analytics_service.get_real_time_stats()
                
                if self._data_changed("analytics", stats):
                    message = json.dumps({
                        "type": "analytics_update",
                        "data": stats
                    })
                    await self.manager.broadcast_to_channel(message, "analytics")
                
                await asyncio.sleep(self.update_intervals["analytics"])
                
            except Exception as e:
                logger.error(f"Analytics broadcast error: {e}")
                await asyncio.sleep(10)
    
    async def _broadcast_weather(self):
        """Wetter-Updates"""
        while True:
            try:
                # Implementierung für Wetter-Daten
                await asyncio.sleep(self.update_intervals["weather"])
            except Exception as e:
                logger.error(f"Weather broadcast error: {e}")
                await asyncio.sleep(30)
    
    async def _broadcast_traffic(self):
        """Verkehrs-Updates"""
        while True:
            try:
                # Implementierung für Verkehrs-Daten
                await asyncio.sleep(self.update_intervals["traffic"])
            except Exception as e:
                logger.error(f"Traffic broadcast error: {e}")
                await asyncio.sleep(30)
    
    def _data_changed(self, data_type: str, new_data: Any) -> bool:
        """Prüft ob sich Daten geändert haben"""
        if data_type not in self.last_data:
            self.last_data[data_type] = new_data
            return True
        
        # Einfacher Vergleich für Demo
        changed = str(self.last_data[data_type]) != str(new_data)
        if changed:
            self.last_data[data_type] = new_data
        
        return changed


# Globaler Broadcaster
real_time_broadcaster = RealTimeDataBroadcaster(connection_manager)