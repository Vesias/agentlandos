import sys
from pathlib import Path
import pytest

# ensure package path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class DummySession:
    def __init__(self):
        self.added = None
        self.committed = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        pass

    def add(self, obj):
        self.added = obj

    async def commit(self):
        self.committed = True

class DummyCM:
    def __init__(self, session):
        self.session = session

    async def __aenter__(self):
        return self.session

    async def __aexit__(self, exc_type, exc, tb):
        pass


def dummy_session_maker(session):
    def maker():
        return DummyCM(session)
    return maker


@pytest.mark.asyncio
async def test_log_event(monkeypatch):
    from app.services import audit_log

    class DummyModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

    session = DummySession()
    await audit_log.log_event(
        "test_event",
        actor_id="u1",
        ip_address="127.0.0.1",
        session_maker=dummy_session_maker(session),
        model_cls=DummyModel,
    )

    assert session.added.event_type == "test_event"
    assert session.added.actor_id == "u1"
    assert session.added.ip_address == "127.0.0.1"
    assert session.committed
