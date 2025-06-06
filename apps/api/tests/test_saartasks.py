import sys
import os
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api.saartasks import handler


def test_saartasks_fallback(monkeypatch):
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    inst = handler.__new__(handler)
    result = asyncio.run(inst.process_saartask("Hallo", "de"))
    assert result["metadata"]["mode"] == "fallback"
    assert result["agent_id"] == "saartasks"
