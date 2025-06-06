"""
AGENTLAND.SAARLAND API - Simplified Version with DeepSeek
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import redis
from app.middleware.security import SecurityMiddleware
from pydantic import BaseModel
import httpx
import os
from typing import List, Optional
from datetime import datetime

app = FastAPI(
    title="AGENTLAND.SAARLAND API",
    description="Souveräne KI-Technologie aus dem Saarland",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
try:
    redis_client = redis.from_url(redis_url, decode_responses=True)
except Exception:
    redis_client = None

security = SecurityMiddleware(redis_client, {})

@app.middleware("http")
async def apply_security(request: Request, call_next):
    return await security(request, call_next)

# DeepSeek Configuration
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Models
class ChatRequest(BaseModel):
    message: str
    language: str = "de"
    session_id: Optional[str] = None
    location: Optional[dict] = None

class AgentResponse(BaseModel):
    agent_id: str
    agent_name: str
    message: str
    confidence: float = 0.9
    metadata: dict = {}
    thought_process: List[str] = []
    regional_context: Optional[str] = "Saarland"

class AgentInfo(BaseModel):
    agent_id: str
    name: str
    description: str
    capabilities: List[str]
    is_active: bool

# System Prompt for Saarland Context
SAARLAND_SYSTEM_PROMPT = """Du bist ein KI-Assistent für das Saarland. 
Du kennst dich bestens mit der Region aus - von der Saarschleife über die Völklinger Hütte bis zum DFKI.
Du sprichst Deutsch, Französisch und optional Saarländisch.
Deine Aufgabe ist es, Menschen bei Fragen zum Saarland zu helfen - sei es Tourismus, Verwaltung, Bildung oder Wirtschaft.
Sei freundlich, kompetent und stolz auf die Region."""

@app.get("/")
async def root():
    return {
        "message": "Willkommen bei AGENTLAND.SAARLAND",
        "version": "0.1.0",
        "region": "Saarland",
        "status": "operational",
        "tagline": "Souveräne KI-Technologie aus dem Saarland",
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AGENTLAND.SAARLAND API",
        "region": "Saarland",
        "ai_model": "deepseek" if DEEPSEEK_API_KEY else "demo",
    }

@app.get("/api/agents", response_model=List[AgentInfo])
async def list_agents():
    return [
        AgentInfo(
            agent_id="navigator",
            name="NavigatorAgent",
            description="Zentraler KI-Assistent für das Saarland",
            capabilities=[
                "Anfragen verstehen und weiterleiten",
                "Kontext analysieren",
                "Mehrsprachige Kommunikation",
                "Regionale Expertise koordinieren",
            ],
            is_active=True,
        ),
        AgentInfo(
            agent_id="tourism",
            name="TourismusAgent",
            description="Spezialist für Tourismus im Saarland",
            capabilities=[
                "Sehenswürdigkeiten empfehlen",
                "Veranstaltungen finden",
                "Routen planen",
                "Lokale Tipps geben",
            ],
            is_active=True,
        ),
        AgentInfo(
            agent_id="administration",
            name="VerwaltungsAgent",
            description="Unterstützung bei Behördengängen",
            capabilities=[
                "Formulare erklären",
                "Prozesse beschreiben",
                "Zuständigkeiten klären",
                "Termine vereinbaren",
            ],
            is_active=True,
        ),
    ]

@app.post("/api/agents/chat", response_model=AgentResponse)
async def chat_with_agent(request: ChatRequest):
    """Chat with AGENTLAND.SAARLAND AI Agent"""
    
    # Demo Mode if no API key
    if not DEEPSEEK_API_KEY:
        return AgentResponse(
            agent_id="navigator",
            agent_name="NavigatorAgent (Demo)",
            message=f"Demo-Antwort: Ich würde Ihnen gerne bei '{request.message}' helfen. In der Vollversion kann ich mit DeepSeek KI detaillierte Antworten zum Saarland geben.",
            confidence=0.5,
            thought_process=["Demo-Modus aktiv", "Keine KI-Verbindung"],
            regional_context="Saarland",
        )
    
    # Call DeepSeek API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": SAARLAND_SYSTEM_PROMPT},
                        {"role": "user", "content": request.message}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000,
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data["choices"][0]["message"]["content"]
                
                return AgentResponse(
                    agent_id="navigator",
                    agent_name="NavigatorAgent",
                    message=ai_response,
                    confidence=0.9,
                    thought_process=[
                        "Anfrage analysiert",
                        "Saarland-Kontext berücksichtigt",
                        "Antwort generiert",
                    ],
                    regional_context="Saarland",
                    metadata={
                        "model": "deepseek-chat",
                        "language": request.language,
                    }
                )
            else:
                raise HTTPException(status_code=response.status_code, detail="DeepSeek API Error")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)