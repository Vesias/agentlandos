"""
KI-Agenten API Endpoints
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.agents.navigator_agent import NavigatorAgent
from app.agents.base_agent import AgentContext, AgentResponse

router = APIRouter()

# Global Navigator Agent Instance
navigator = NavigatorAgent()


class ChatRequest(BaseModel):
    """
    Anfrage für Chat mit Agenten
    """
    message: str
    language: str = "de"
    session_id: UUID | None = None
    location: dict[str, float] | None = None


class AgentInfo(BaseModel):
    """
    Informationen über einen Agenten
    """
    agent_id: str
    name: str
    description: str
    capabilities: List[str]
    is_active: bool


@router.get("/", response_model=List[AgentInfo])
async def list_agents():
    """
    Listet alle verfügbaren Agenten auf
    """
    agents = [
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
            description="Spezialist für Tourismus und Sehenswürdigkeiten im Saarland",
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
            description="Unterstützung bei Behördengängen und Verwaltungsfragen",
            capabilities=[
                "Formulare erklären",
                "Prozesse beschreiben",
                "Zuständigkeiten klären",
                "Termine vereinbaren",
            ],
            is_active=True,
        ),
    ]
    return agents


@router.get("/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: str):
    """
    Gibt Informationen über einen spezifischen Agenten zurück
    """
    # TODO: Aus Datenbank laden
    if agent_id == "navigator":
        return AgentInfo(
            agent_id="navigator",
            name="NavigatorAgent",
            description="Zentraler KI-Assistent für das Saarland",
            capabilities=navigator.capabilities,
            is_active=True,
        )
    else:
        raise HTTPException(status_code=404, detail="Agent nicht gefunden")


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Sendet eine Nachricht an den KI-Agenten
    """
    # Kontext erstellen
    context = AgentContext(
        user_id=UUID("00000000-0000-0000-0000-000000000000"),  # TODO: Aus Auth
        session_id=request.session_id or UUID("00000000-0000-0000-0000-000000000001"),
        language=request.language,
        location=request.location,
    )
    
    # Anfrage verarbeiten
    try:
        response = await navigator.process(request.message, context)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Verarbeitung: {str(e)}"
        )


@router.post("/feedback")
async def submit_feedback(
    agent_id: str,
    message_id: UUID,
    rating: int,
    comment: str | None = None,
):
    """
    Feedback für eine Agent-Interaktion einreichen
    """
    # TODO: In Datenbank speichern
    return {
        "status": "success",
        "message": "Vielen Dank für Ihr Feedback!",
    }