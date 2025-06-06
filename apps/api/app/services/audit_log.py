"""Simple asynchronous audit logging utilities."""
from typing import Optional, Dict, Any



async def log_event(
    event_type: str,
    actor_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    session_maker=None,
    model_cls=None,
) -> None:
    """Persist an audit log entry."""
    if session_maker is None:
        from app.db.database import async_session_maker as session_maker  # type: ignore
    if model_cls is None:
        from app.models.audit import AuditLog as model_cls  # type: ignore
    async with session_maker() as session:
        entry = model_cls(
            event_type=event_type,
            actor_id=actor_id,
            ip_address=ip_address,
            metadata=metadata or {},
        )
        session.add(entry)
        await session.commit()
