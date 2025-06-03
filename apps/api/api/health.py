"""
Health Check API for Vercel deployment
"""
from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "healthy",
            "service": "AGENTLAND.SAARLAND API",
            "region": "Saarland",
            "deployment": "vercel",
            "deepseek_configured": bool(os.getenv("DEEPSEEK_API_KEY")),
            "vectordb_configured": bool(os.getenv("PINECONE_API_KEY")),
        }
        
        self.wfile.write(json.dumps(response).encode())
        return