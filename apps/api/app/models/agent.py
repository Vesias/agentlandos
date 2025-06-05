from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.database import Base

class Agent(Base):
    """Persisted agent metadata"""
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    capabilities = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
