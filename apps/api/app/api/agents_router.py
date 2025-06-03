"""
Enhanced Chat API endpoints for AGENT_LAND_SAARLAND
Handles agent communication and routing
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

# This would import from your actual agent implementations
# from ...agents.specialized.navigator_agent import NavigatorAgent
# from ...agents.agent_registry import AgentRegistry

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/agents", tags=["agents"])


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    language: str = "de"
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    message: str
    agent_name: str
    confidence: float
    sources: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None


class AgentInfo(BaseModel):
    """Agent information model"""
    name: str
    description: str
    capabilities: List[str]
    status: str
    language_support: List[str]


# Mock agent registry for demo
MOCK_AGENTS = {
    "NavigatorAgent": {
        "name": "NavigatorAgent",
        "description": "Zentraler KI-Assistent für das Saarland",
        "capabilities": ["routing", "general_help", "emergency_response"],
        "status": "active",
        "language_support": ["de", "fr", "en", "saar"]
    },
    "TourismAgent": {
        "name": "TourismAgent",
        "description": "Experte für Tourismus und Sehenswürdigkeiten",
        "capabilities": ["attractions", "events", "restaurants", "hotels"],
        "status": "active",
        "language_support": ["de", "fr", "en"]
    },
    "AdminAgent": {
        "name": "AdminAgent",
        "description": "Hilft bei Verwaltungsangelegenheiten",
        "capabilities": ["documents", "appointments", "online_services"],
        "status": "active",
        "language_support": ["de", "fr"]
    },
    "BusinessAgent": {
        "name": "BusinessAgent",
        "description": "Berater für Wirtschaft und Förderungen",
        "capabilities": ["funding", "startups", "business_advice"],
        "status": "active",
        "language_support": ["de", "en"]
    }
}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return agent response
    """
    try:
        logger.info(f"Chat request: {request.message[:50]}...")
        
        # In production, this would use the actual NavigatorAgent
        # For demo, return mock responses based on keywords
        
        message_lower = request.message.lower()
        
        # Determine which agent should respond
        if any(word in message_lower for word in ["sehenswürdigkeiten", "tourismus", "ausflug", "hotel"]):
            agent_name = "TourismAgent"
            response_message = generate_tourism_response(request.message, request.language)
            sources = ["Tourismus Zentrale Saarland", "Saarland Card Partner"]
        elif any(word in message_lower for word in ["behörde", "ausweis", "verwaltung", "amt"]):
            agent_name = "AdminAgent"
            response_message = generate_admin_response(request.message, request.language)
            sources = ["Bürgerserviceportal Saarland", "service.saarland.de"]
        elif any(word in message_lower for word in ["förderung", "startup", "gründung", "unternehmen"]):
            agent_name = "BusinessAgent"
            response_message = generate_business_response(request.message, request.language)
            sources = ["saaris", "Wirtschaftsförderung Saarland"]
        else:
            agent_name = "NavigatorAgent"
            response_message = generate_navigator_response(request.message, request.language)
            sources = ["AGENT_LAND_SAARLAND Knowledge Base"]
        
        # Generate suggestions based on context
        suggestions = generate_suggestions(agent_name, request.language)
        
        return ChatResponse(
            message=response_message,
            agent_name=agent_name,
            confidence=0.85 + (0.1 if request.context else 0),
            sources=sources,
            metadata={
                "response_time_ms": 150,
                "language": request.language,
                "intent_detected": agent_name.replace("Agent", "").lower()
            },
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Error processing chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/list", response_model=List[AgentInfo])
async def list_agents():
    """
    List all available agents
    """
    return [AgentInfo(**agent) for agent in MOCK_AGENTS.values()]


@router.get("/{agent_name}", response_model=AgentInfo)
async def get_agent(agent_name: str):
    """
    Get information about a specific agent
    """
    if agent_name not in MOCK_AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")
    
    return AgentInfo(**MOCK_AGENTS[agent_name])


@router.post("/{agent_name}/direct", response_model=ChatResponse)
async def direct_agent_chat(agent_name: str, request: ChatRequest):
    """
    Send a message directly to a specific agent
    """
    if agent_name not in MOCK_AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")
    
    # Process with specific agent
    # In production, this would route to the actual agent
    
    return ChatResponse(
        message=f"Direct response from {agent_name}",
        agent_name=agent_name,
        confidence=0.9,
        sources=["Direct Agent Query"],
        metadata={"direct_query": True}
    )


# Helper functions for generating responses
def generate_tourism_response(query: str, language: str) -> str:
    """Generate tourism-related responses"""
    responses = {
        "de": """Das Saarland bietet viele wunderschöne Sehenswürdigkeiten:

🌊 **Saarschleife bei Mettlach** - Unser Wahrzeichen mit spektakulärem Ausblick
🏭 **Völklinger Hütte** - UNESCO-Weltkulturerbe der Industriekultur
🏰 **Saarbrücker Schloss** - Barocke Architektur im Herzen der Hauptstadt
🌲 **Bostalsee** - Perfekt für Wassersport und Erholung

Möchten Sie mehr über eine bestimmte Attraktion erfahren?""",
        
        "fr": """La Sarre offre de nombreuses attractions magnifiques:

🌊 **Saarschleife à Mettlach** - Notre emblème avec vue spectaculaire
🏭 **Völklinger Hütte** - Patrimoine mondial UNESCO
🏰 **Château de Sarrebruck** - Architecture baroque

Souhaitez-vous plus d'informations?""",
        
        "en": """Saarland offers many beautiful attractions:

🌊 **Saar Loop at Mettlach** - Our landmark with spectacular views
🏭 **Völklingen Ironworks** - UNESCO World Heritage Site
🏰 **Saarbrücken Castle** - Baroque architecture

Would you like to know more about a specific attraction?"""
    }
    return responses.get(language, responses["de"])


def generate_admin_response(query: str, language: str) -> str:
    """Generate administrative responses"""
    responses = {
        "de": """Für Verwaltungsangelegenheiten stehe ich Ihnen gerne zur Verfügung:

📋 **Online-Services**: Die meisten Anträge können Sie unter service.saarland.de stellen
🏛️ **Öffnungszeiten**: Mo-Fr 8:30-12:00, Do zusätzlich 14:00-18:00
📅 **Terminvereinbarung**: Online-Terminbuchung für alle Bürgerämter verfügbar

Welchen Service benötigen Sie konkret?""",
        
        "fr": """Pour les affaires administratives:

📋 **Services en ligne**: service.saarland.de
🏛️ **Heures d'ouverture**: Lun-Ven 8h30-12h00
📅 **Rendez-vous**: Réservation en ligne disponible""",
        
        "en": """For administrative matters:

📋 **Online Services**: Most applications at service.saarland.de
🏛️ **Opening Hours**: Mon-Fri 8:30-12:00
📅 **Appointments**: Online booking available"""
    }
    return responses.get(language, responses["de"])


def generate_business_response(query: str, language: str) -> str:
    """Generate business-related responses"""
    responses = {
        "de": """Das Saarland unterstützt Unternehmen mit vielfältigen Programmen:

💰 **Gründerstipendium**: Bis zu 2.000€/Monat für Startups
🚀 **Innovationsgutscheine**: Förderung für F&E-Projekte
🏢 **Standortvorteile**: Zentrale Lage in Europa, günstige Gewerbeflächen

Kontakt: saaris - Tel: 0681/9520-470

In welcher Branche möchten Sie gründen?""",
        
        "en": """Saarland supports businesses with various programs:

💰 **Founder Scholarship**: Up to 2,000€/month
🚀 **Innovation Vouchers**: Support for R&D
🏢 **Location Benefits**: Central European location

Which industry are you interested in?"""
    }
    return responses.get(language, responses["de"])


def generate_navigator_response(query: str, language: str) -> str:
    """Generate general navigation responses"""
    responses = {
        "de": """Ich bin Ihr KI-Assistent für das Saarland. Ich kann Ihnen helfen bei:

🏛️ **Tourismus** - Sehenswürdigkeiten und Veranstaltungen
📋 **Verwaltung** - Behördengänge und Online-Services
💼 **Wirtschaft** - Förderungen und Gründerberatung
🎓 **Bildung** - Schulen, Unis und Weiterbildung
🎭 **Kultur** - Events, Museen und Traditionen

Womit kann ich Ihnen konkret helfen?""",
        
        "fr": """Je suis votre assistant IA pour la Sarre. Je peux vous aider avec:

🏛️ **Tourisme** - Attractions et événements
📋 **Administration** - Services publics
💼 **Économie** - Subventions et conseils

Comment puis-je vous aider?""",
        
        "en": """I'm your AI assistant for Saarland. I can help you with:

🏛️ **Tourism** - Attractions and events
📋 **Administration** - Public services
💼 **Business** - Funding and advice
🎓 **Education** - Schools and training

How can I help you specifically?"""
    }
    return responses.get(language, responses["de"])


def generate_suggestions(agent_name: str, language: str) -> List[str]:
    """Generate contextual suggestions based on agent type"""
    suggestions_map = {
        "TourismAgent": {
            "de": [
                "Hotels in der Nähe zeigen",
                "Restaurants empfehlen",
                "Veranstaltungen diese Woche",
                "Wanderrouten vorschlagen"
            ],
            "en": [
                "Show nearby hotels",
                "Recommend restaurants",
                "Events this week",
                "Suggest hiking trails"
            ]
        },
        "AdminAgent": {
            "de": [
                "Termin vereinbaren",
                "Formulare herunterladen",
                "Öffnungszeiten anzeigen",
                "Online-Antrag starten"
            ]
        },
        "BusinessAgent": {
            "de": [
                "Förderberatung buchen",
                "Businessplan-Vorlage",
                "Netzwerk-Events",
                "Standortanalyse"
            ]
        },
        "NavigatorAgent": {
            "de": [
                "Tourismus-Infos",
                "Behördengänge",
                "Wirtschaftsförderung",
                "Kulturprogramm"
            ]
        }
    }
    
    agent_suggestions = suggestions_map.get(agent_name, suggestions_map["NavigatorAgent"])
    return agent_suggestions.get(language, agent_suggestions.get("de", []))


@router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """
    Health check endpoint for the agent system
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_agents": len(MOCK_AGENTS),
        "version": "1.0.0"
    }
