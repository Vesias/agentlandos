"""
NavigatorAgent - Zentraler Orchestrierungs-Agent für AGENTLAND.SAARLAND
"""

from typing import Dict, List, Optional

from langchain.schema import HumanMessage, SystemMessage

from app.agents.base_agent import AgentContext, AgentResponse, BaseAgent
from app.core.config import settings


class NavigatorAgent(BaseAgent):
    """
    Der NavigatorAgent ist der zentrale Einstiegspunkt für alle Nutzeranfragen.
    Er analysiert die Anfrage und leitet sie an den passenden Spezial-Agenten weiter.
    """
    
    def __init__(self):
        super().__init__(
            agent_id="navigator",
            name="NavigatorAgent",
            description="Zentraler KI-Assistent für das Saarland - Ihr Wegweiser durch die digitale Region",
            capabilities=[
                "Anfragen verstehen und weiterleiten",
                "Kontext analysieren",
                "Mehrsprachige Kommunikation",
                "Regionale Expertise koordinieren",
            ],
        )
        self.specialized_agents: Dict[str, BaseAgent] = {}
        
    def register_agent(self, agent: BaseAgent) -> None:
        """
        Registriert einen spezialisierten Agenten
        """
        self.specialized_agents[agent.agent_id] = agent
        
    async def think(
        self,
        query: str,
        context: AgentContext,
    ) -> List[str]:
        """
        Chain-of-Thought Prozess des NavigatorAgent
        """
        thoughts = []
        
        # Schritt 1: Sprache erkennen
        thoughts.append(f"Erkenne Sprache der Anfrage: {context.language}")
        
        # Schritt 2: Intent analysieren
        thoughts.append("Analysiere die Intention der Anfrage...")
        
        # Schritt 3: Passenden Agenten identifizieren
        suitable_agents = []
        for agent_id, agent in self.specialized_agents.items():
            if agent.can_handle(query):
                suitable_agents.append(agent.name)
        
        if suitable_agents:
            thoughts.append(f"Gefundene spezialisierte Agenten: {', '.join(suitable_agents)}")
        else:
            thoughts.append("Keine spezialisierten Agenten gefunden, beantworte selbst")
            
        # Schritt 4: Regionalen Kontext berücksichtigen
        if context.location:
            thoughts.append("Berücksichtige Standortinformationen für lokale Relevanz")
            
        return thoughts
    
    async def process(
        self,
        query: str,
        context: AgentContext,
    ) -> AgentResponse:
        """
        Verarbeitet die Anfrage und koordiniert mit anderen Agenten
        """
        # Chain-of-Thought ausführen
        thought_process = await self.think(query, context)
        
        # Passenden Agenten finden
        selected_agent: Optional[BaseAgent] = None
        for agent_id, agent in self.specialized_agents.items():
            if agent.can_handle(query):
                selected_agent = agent
                break
                
        if selected_agent:
            # Anfrage an spezialisierten Agenten weiterleiten
            response = await selected_agent.process(query, context)
            response.thought_process = thought_process + response.thought_process
            return response
        
        # Selbst antworten, wenn kein spezialisierter Agent passt
        return AgentResponse(
            agent_id=self.agent_id,
            agent_name=self.name,
            message=self._generate_default_response(query, context),
            confidence=0.8,
            thought_process=thought_process,
            regional_context="Saarland",
            metadata={
                "handled_by": "navigator",
                "language": context.language,
            },
        )
    
    def _generate_default_response(
        self,
        query: str,
        context: AgentContext,
    ) -> str:
        """
        Generiert eine Standard-Antwort
        """
        if context.language == "de":
            return (
                "Guten Tag! Ich bin Ihr persönlicher KI-Assistent für das Saarland. "
                "Ich kann Ihnen bei verschiedenen Themen helfen - von Tourismus über "
                "Verwaltung bis hin zu Wirtschaft und Bildung. Wie kann ich Ihnen "
                "heute behilflich sein?"
            )
        elif context.language == "fr":
            return (
                "Bonjour! Je suis votre assistant IA personnel pour la Sarre. "
                "Je peux vous aider sur différents sujets - du tourisme à "
                "l'administration, en passant par l'économie et l'éducation. "
                "Comment puis-je vous aider aujourd'hui?"
            )
        else:
            return (
                "Hello! I'm your personal AI assistant for Saarland. "
                "I can help you with various topics - from tourism to "
                "administration, business, and education. How can I "
                "assist you today?"
            )