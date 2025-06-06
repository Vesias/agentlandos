import asyncio
import os
import sys

import pytest
pytest_plugins = "pytest_asyncio"

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api import saartasks

class MockSaarHandler(saartasks.handler):
    def __init__(self):
        pass

@pytest.mark.asyncio
async def test_saartasks_fallback(monkeypatch):
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    handler = MockSaarHandler()
    result = await handler.process_saartask("Hallo", "de")
    assert result["metadata"]["mode"] == "fallback"
    assert result["agent_id"] == "saartasks"
