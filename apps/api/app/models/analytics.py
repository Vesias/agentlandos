"""
Analytics Models für User Tracking
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, DateTime, JSON, Integer, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.database import Base


class UserActivity(Base):
    """Model für User-Aktivitäten"""
    __tablename__ = "user_activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    session_id = Column(String, nullable=False, index=True)
    activity_type = Column(String, nullable=False, index=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)


class PageView(Base):
    """Model für Seitenaufrufe"""
    __tablename__ = "page_views"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, nullable=False, index=True)
    page_path = Column(String, nullable=False)
    referrer = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    ip_hash = Column(String, nullable=True)  # Gehashte IP für Datenschutz
    duration_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)


class AgentInteraction(Base):
    """Model für Agent-Interaktionen"""
    __tablename__ = "agent_interactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, nullable=False, index=True)
    agent_type = Column(String, nullable=False)
    query = Column(String, nullable=False)
    response_confidence = Column(Float, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    user_satisfaction = Column(Integer, nullable=True)  # 1-5 Rating
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
