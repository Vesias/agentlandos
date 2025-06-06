import sys
from pathlib import Path
from fastapi.testclient import TestClient

# ensure package path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main_simple import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json().get("status") == "healthy"
