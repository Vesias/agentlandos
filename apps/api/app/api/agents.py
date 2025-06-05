"""
KI-Agenten API Endpoints
"""

from typing import List
from uuid import UUID, uuid4, uuid5, NAMESPACE_DNS

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_async_session
from app.models.agent import Agent as AgentModel
from app.models.feedback import Feedback
from app.api.auth import get_current_user, TokenData
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
async def get_agent(
    agent_id: str,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Gibt Informationen über einen spezifischen Agenten zurück
    """
    result = await session.execute(
        select(AgentModel).where(AgentModel.agent_id == agent_id)
    )
    agent_row = result.scalar_one_or_none()

    if agent_row:
        return AgentInfo(
            agent_id=agent_row.agent_id,
            name=agent_row.name,
            description=agent_row.description,
            capabilities=agent_row.capabilities,
            is_active=agent_row.is_active,
        )

    if agent_id == "navigator":
        return AgentInfo(
            agent_id="navigator",
            name="NavigatorAgent",
            description="Zentraler KI-Assistent für das Saarland",
            capabilities=navigator.capabilities,
            is_active=True,
        )

    raise HTTPException(status_code=404, detail="Agent nicht gefunden")


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(
    request: ChatRequest,
    current_user: TokenData = Depends(get_current_user),
):
    """
    Sendet eine Nachricht an den KI-Agenten
    """
    # Kontext erstellen mit stabiler user_id (bevorzugt) oder Fallback
    if current_user.user_id:
        user_uuid = UUID(current_user.user_id)
    else:
        # Fallback für Legacy-Authentifizierung
        user_uuid = uuid5(NAMESPACE_DNS, current_user.username)
    
    context = AgentContext(
        user_id=user_uuid,
        session_id=request.session_id or uuid4(),
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
    current_user: TokenData = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Feedback für eine Agent-Interaktion einreichen
    """
    # Use stable user_id (bevorzugt) oder Fallback für Legacy-Authentifizierung
    if current_user.user_id:
        user_uuid = UUID(current_user.user_id)
    else:
        # Fallback für Legacy-Authentifizierung
        user_uuid = uuid5(NAMESPACE_DNS, current_user.username)
    
    feedback = Feedback(
        agent_id=agent_id,
        message_id=message_id,
        user_id=user_uuid,
        rating=rating,
        comment=comment,
    )
    session.add(feedback)
    await session.commit()
    await session.refresh(feedback)

    return {
        "status": "success",
        "message": "Vielen Dank für Ihr Feedback!",
        "feedback_id": str(feedback.id),
        "user_id": str(user_uuid),
    }