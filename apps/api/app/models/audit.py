from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.database import Base

class AuditLog(Base):
    """Audit log entry for security relevant actions"""
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    ip_address = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
