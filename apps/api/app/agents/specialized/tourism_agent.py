"""
Tourism Agent für AGENT_LAND_SAARLAND
Spezialisiert auf Tourismus, Sehenswürdigkeiten und Freizeitaktivitäten
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from ..base_agent import BaseAgent, AgentResponse
from ...connectors.saarland_connectors import (
    TourismusSaarlandConnector,
    GeoPortalSaarlandConnector,
    SaarVVConnector
)
from ...services.deepseek_service import DeepSeekService
from ...services.rag_service import SaarlandRAGService

logger = logging.getLogger(__name__)


class TourismAgent(BaseAgent):
    """
    Agent für Tourismus-Anfragen im Saarland
    Kombiniert verschiedene Datenquellen für umfassende Tourismusinfos
    """
    
    def __init__(self, llm_service: DeepSeekService, rag_service: SaarlandRAGService):
        super().__init__(
            name="TourismAgent",
            description="Experte für Tourismus, Sehenswürdigkeiten und Freizeitaktivitäten im Saarland",
            capabilities=[
                "attractions_info",
                "event_recommendations", 
                "restaurant_suggestions",
                "route_planning",
                "accommodation_search",
                "activity_suggestions"
            ]
        )
        self.llm = llm_service
        self.rag = rag_service
        self.tourism_connector = TourismusSaarlandConnector()
        self.geo_connector = GeoPortalSaarlandConnector()
        self.transport_connector = SaarVVConnector()
        
        # System-Prompt für Tourismus-Kontext
        self.system_prompt = """Du bist ein freundlicher und kompetenter Tourismus-Experte für das Saarland. 
        Du kennst alle wichtigen Sehenswürdigkeiten, Veranstaltungen, Restaurants und Freizeitaktivitäten.
        
        Deine Aufgaben:
        - Empfehle passende Sehenswürdigkeiten basierend auf Interessen
        - Informiere über aktuelle Veranstaltungen
        - Schlage Restaurants und lokale Spezialitäten vor
        - Plane Tagesausflüge und Routen
        - Gib praktische Tipps für Besucher
        
        Wichtige Sehenswürdigkeiten im Saarland:
        - Saarschleife (Wahrzeichen, Baumwipfelpfad)
        - Völklinger Hütte (UNESCO Weltkulturerbe)
        - Saarbrücker Schloss
        - Bostalsee (Freizeitsee)
        - Römische Villa Borg
        - Bergbaumuseum Bexbach
        
        Regionale Spezialitäten:
        - Schwenkbraten (vom Schwenker)
        - Dibbelabbes (Kartoffelauflauf)
        - Lyoner (Fleischwurst)
        - Gefillde (gefüllte Klöße)
        
        Antworte immer freundlich, enthusiastisch und informativ. 
        Nutze die bereitgestellten Echtzeitdaten für aktuelle Informationen."""
        
    async def process_query(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> AgentResponse:
        """
        Verarbeitet Tourismus-bezogene Anfragen
        """
        try:
            # Analysiere Anfrage-Typ
            query_type = await self._analyze_query_type(query)
            
            # Hole relevante Daten basierend auf Anfrage-Typ
            relevant_data = await self._gather_relevant_data(query, query_type, context)
            
            # RAG-Suche für zusätzlichen Kontext
            rag_results = await self.rag.search(
                query, 
                filter_category="tourism",
                limit=5
            )
            
            # Erstelle erweiterten Kontext
            enhanced_context = self._build_enhanced_context(
                query=query,
                query_type=query_type,
                live_data=relevant_data,
                rag_results=rag_results,
                user_context=context
            )
            
            # Generiere Antwort mit DeepSeek
            response = await self.llm.generate_response(
                system_prompt=self.system_prompt,
                user_prompt=query,
                context=enhanced_context,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Extrahiere Quellen und Confidence
            sources = self._extract_sources(relevant_data, rag_results)
            confidence = self._calculate_confidence(query_type, relevant_data)
            
            return AgentResponse(
                content=response,
                agent_name=self.name,
                confidence=confidence,
                sources=sources,
                metadata={
                    "query_type": query_type,
                    "data_points": len(relevant_data),
                    "suggestions": self._generate_suggestions(query_type, relevant_data)
                }
            )
            
        except Exception as e:
            logger.error(f"Error in TourismAgent: {str(e)}")
            return self._generate_fallback_response(query, str(e))
    
    async def _analyze_query_type(self, query: str) -> str:
        """Analysiert den Typ der Tourismusanfrage"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['sehenswürdigkeit', 'besichtigen', 'anschauen', 'besuchen']):
            return 'attractions'
        elif any(word in query_lower for word in ['veranstaltung', 'event', 'fest', 'konzert', 'theater']):
            return 'events'
        elif any(word in query_lower for word in ['restaurant', 'essen', 'speisen', 'gastro']):
            return 'restaurants'
        elif any(word in query_lower for word in ['hotel', 'übernachtung', 'unterkunft', 'pension']):
            return 'accommodation'
        elif any(word in query_lower for word in ['route', 'tour', 'ausflug', 'tagesplan']):
            return 'route_planning'
        elif any(word in query_lower for word in ['wandern', 'radfahren', 'sport', 'aktivität']):
            return 'activities'
        else:
            return 'general'
    
    async def _gather_relevant_data(
        self, 
        query: str, 
        query_type: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Sammelt relevante Daten basierend auf Anfrage-Typ"""
        data = {}
        
        try:
            if query_type == 'attractions':
                data['attractions'] = await self.tourism_connector.get_attractions()
                data['poi'] = await self.geo_connector.get_poi_data('tourism')
                
            elif query_type == 'events':
                start_date = context.get('date') if context else datetime.now()
                data['events'] = await self.tourism_connector.get_events(start_date)
                
            elif query_type == 'restaurants':
                location = context.get('location')
                cuisine = self._extract_cuisine_preference(query)
                data['restaurants'] = await self.tourism_connector.get_restaurants(
                    location=location,
                    cuisine=cuisine
                )
                
            elif query_type == 'route_planning':
                # Hole Sehenswürdigkeiten und Verkehrsinfos
                data['attractions'] = await self.tourism_connector.get_attractions()
                if context and context.get('start_location'):
                    data['transport'] = await self._get_transport_options(
                        context.get('start_location'),
                        data['attractions'][0]['location'] if data['attractions'] else None
                    )
                    
            else:
                # Für allgemeine Anfragen hole Basis-Infos
                data['attractions'] = await self.tourism_connector.get_attractions()[:3]
                data['events'] = await self.tourism_connector.get_events()[:3]
                
        except Exception as e:
            logger.warning(f"Error gathering data for {query_type}: {e}")
            
        return data
    
    def _build_enhanced_context(
        self,
        query: str,
        query_type: str,
        live_data: Dict[str, Any],
        rag_results: List[Dict],
        user_context: Dict[str, Any] = None
    ) -> str:
        """Erstellt erweiterten Kontext für LLM"""
        context_parts = []
        
        # Live-Daten
        if live_data:
            context_parts.append("=== AKTUELLE DATEN ===")
            for data_type, data in live_data.items():
                if data:
                    context_parts.append(f"\n{data_type.upper()}:")
                    if isinstance(data, list):
                        for item in data[:5]:  # Limitiere auf 5 Items
                            context_parts.append(self._format_data_item(item))
                    else:
                        context_parts.append(str(data))
        
        # RAG-Ergebnisse
        if rag_results:
            context_parts.append("\n=== WISSENSDATENBANK ===")
            for result in rag_results:
                context_parts.append(f"- {result.get('content', '')}")
        
        # Nutzer-Kontext
        if user_context:
            context_parts.append("\n=== NUTZERKONTEXT ===")
            if user_context.get('location'):
                context_parts.append(f"Standort: {user_context['location']}")
            if user_context.get('preferences'):
                context_parts.append(f"Präferenzen: {user_context['preferences']}")
            if user_context.get('date'):
                context_parts.append(f"Datum: {user_context['date']}")
        
        return "\n".join(context_parts)
    
    def _format_data_item(self, item: Dict) -> str:
        """Formatiert ein Datenelement für den Kontext"""
        if 'name' in item:
            parts = [f"• {item['name']}"]
            if 'description' in item:
                parts.append(f"  {item['description'][:100]}...")
            if 'location' in item:
                parts.append(f"  Ort: {item.get('location')}")
            if 'opening_hours' in item:
                parts.append(f"  Öffnungszeiten: {item['opening_hours']}")
            if 'rating' in item:
                parts.append(f"  Bewertung: {item['rating']}/5")
            return "\n".join(parts)
        return str(item)
    
    def _extract_cuisine_preference(self, query: str) -> Optional[str]:
        """Extrahiert Küchenpräferenz aus der Anfrage"""
        cuisines = {
            'italienisch': ['italienisch', 'pizza', 'pasta'],
            'asiatisch': ['asiatisch', 'chinesisch', 'japanisch', 'thai'],
            'regional': ['regional', 'saarländisch', 'deutsch'],
            'französisch': ['französisch', 'bistro']
        }
        
        query_lower = query.lower()
        for cuisine, keywords in cuisines.items():
            if any(keyword in query_lower for keyword in keywords):
                return cuisine
        return None
    
    async def _get_transport_options(self, start: str, destination: Dict) -> List[Dict]:
        """Holt Verkehrsoptionen zwischen zwei Punkten"""
        if not destination:
            return []
            
        try:
            connections = await self.transport_connector.search_connection(
                start=start,
                destination=destination.get('name', '')
            )
            return connections
        except Exception as e:
            logger.warning(f"Could not fetch transport options: {e}")
            return []
    
    def _extract_sources(self, live_data: Dict, rag_results: List[Dict]) -> List[str]:
        """Extrahiert Quellen aus den Daten"""
        sources = []
        
        # Live-Daten Quellen
        if live_data:
            if 'attractions' in live_data:
                sources.append("Tourismus Zentrale Saarland")
            if 'events' in live_data:
                sources.append("Veranstaltungskalender Saarland")
            if 'restaurants' in live_data:
                sources.append("Gastronomieführer Saarland")
        
        # RAG Quellen
        for result in rag_results:
            if source := result.get('source'):
                sources.append(source)
        
        return list(set(sources))  # Deduplizieren
    
    def _calculate_confidence(self, query_type: str, data: Dict) -> float:
        """Berechnet Confidence-Score basierend auf verfügbaren Daten"""
        base_confidence = 0.7
        
        # Erhöhe Confidence basierend auf Datenverfügbarkeit
        if data:
            data_points = sum(len(v) if isinstance(v, list) else 1 for v in data.values())
            if data_points > 10:
                base_confidence += 0.2
            elif data_points > 5:
                base_confidence += 0.1
        
        # Spezifische Query-Types haben höhere Confidence
        if query_type in ['attractions', 'events']:
            base_confidence += 0.05
        
        return min(base_confidence, 0.95)
    
    def _generate_suggestions(self, query_type: str, data: Dict) -> List[str]:
        """Generiert Folgevorschläge basierend auf Kontext"""
        suggestions = []
        
        if query_type == 'attractions':
            suggestions.extend([
                "Öffnungszeiten und Eintrittspreise anzeigen",
                "Route zur Sehenswürdigkeit planen",
                "Restaurants in der Nähe finden",
                "Weitere Sehenswürdigkeiten vorschlagen"
            ])
        elif query_type == 'events':
            suggestions.extend([
                "Tickets buchen",
                "Anfahrt planen",
                "Hotels in der Nähe",
                "Ähnliche Veranstaltungen"
            ])
        elif query_type == 'restaurants':
            suggestions.extend([
                "Tisch reservieren",
                "Speisekarte anzeigen",
                "Bewertungen lesen",
                "Wegbeschreibung"
            ])
        elif query_type == 'route_planning':
            suggestions.extend([
                "Route optimieren",
                "Zwischenstopps hinzufügen",
                "Öffentliche Verkehrsmittel",
                "Parkplätze finden"
            ])
        
        return suggestions[:4]  # Maximal 4 Vorschläge
    
    def _generate_fallback_response(self, query: str, error: str) -> AgentResponse:
        """Generiert Fallback-Antwort bei Fehlern"""
        fallback_content = f"""Entschuldigung, ich hatte Schwierigkeiten, aktuelle Informationen zu Ihrer Anfrage zu finden.

Hier sind einige allgemeine Empfehlungen für Tourismus im Saarland:

**Top-Sehenswürdigkeiten:**
• Saarschleife bei Mettlach - Das Wahrzeichen des Saarlandes
• Völklinger Hütte - UNESCO Weltkulturerbe
• Saarbrücker Schloss - Barocke Architektur
• Bostalsee - Größter See im Südwesten

**Weitere Informationen:**
- Offizielle Tourismus-Website: www.urlaub.saarland
- Tourist-Info Saarbrücken: +49 681 9590200

Kann ich Ihnen bei etwas Spezifischerem helfen?"""
        
        return AgentResponse(
            content=fallback_content,
            agent_name=self.name,
            confidence=0.5,
            sources=["Allgemeine Tourismusinformationen"],
            metadata={
                "error": error,
                "fallback": True
            }
        )
