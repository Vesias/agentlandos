import json
import os
import sys
from io import BytesIO

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api import health

class MockHealthHandler(health.handler):
    def __init__(self):
        self.wfile = BytesIO()

    def send_response(self, code):
        self.status_code = code

    def send_header(self, *args, **kwargs):
        pass

    def end_headers(self):
        pass

def test_health_handler():
    handler = MockHealthHandler()
    handler.do_GET()
    handler.wfile.seek(0)
    data = json.loads(handler.wfile.read().decode())
    assert handler.status_code == 200
    assert data["status"] == "healthy"
