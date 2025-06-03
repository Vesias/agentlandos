"""
Administration Agent für AGENT_LAND_SAARLAND
Spezialisiert auf Behördengänge, Verwaltungsdienste und öffentliche Services
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, time
import logging
import re

from ..base_agent import BaseAgent, AgentResponse
from ...connectors.saarland_connectors import ServiceSaarlandConnector
from ...services.deepseek_service import DeepSeekService
from ...services.rag_service import SaarlandRAGService

logger = logging.getLogger(__name__)


class AdminAgent(BaseAgent):
    """
    Agent für Verwaltungsangelegenheiten im Saarland
    Hilft bei Behördengängen, Online-Services und administrativen Fragen
    """
    
    def __init__(self, llm_service: DeepSeekService, rag_service: SaarlandRAGService):
        super().__init__(
            name="AdminAgent",
            description="Experte für Verwaltung, Behördengänge und öffentliche Services im Saarland",
            capabilities=[
                "service_information",
                "document_requirements",
                "appointment_booking",
                "form_assistance",
                "office_locations",
                "processing_times",
                "fee_information"
            ]
        )
        self.llm = llm_service
        self.rag = rag_service
        self.service_connector = ServiceSaarlandConnector()
        
        # System-Prompt für Verwaltungskontext
        self.system_prompt = """Du bist ein kompetenter Verwaltungsexperte für das Saarland.
        Du hilfst Bürgern bei allen Fragen zu Behördengängen, Anträgen und öffentlichen Services.
        
        Deine Aufgaben:
        - Informiere über benötigte Dokumente und Voraussetzungen
        - Erkläre Antragsverfahren Schritt für Schritt
        - Gib Auskunft über Gebühren und Bearbeitungszeiten
        - Zeige Online-Services und digitale Alternativen auf
        - Nenne zuständige Ämter und Öffnungszeiten
        
        Wichtige Behörden im Saarland:
        - Landeshauptstadt Saarbrücken: Rathaus, Bürgerämter
        - Landesverwaltung: Ministerien und Landesämter
        - Regionalverband Saarbrücken
        - Kommunale Verwaltungen der Landkreise
        
        Online-Services:
        - service.saarland.de - Zentrales Serviceportal
        - Bürgerserviceportal mit Online-Anträgen
        - i-Kfz für Fahrzeugzulassungen
        - ELSTER für Steuererklärungen
        
        Antworte immer präzise, verständlich und bürgernah.
        Weise auf digitale Möglichkeiten hin, aber berücksichtige auch analoge Wege."""
        
        # Mapping von Services zu Kategorien
        self.service_categories = {
            'ausweise': ['personalausweis', 'reisepass', 'kinderreisepass'],
            'fahrzeuge': ['kfz-zulassung', 'führerschein', 'parkausweis'],
            'urkunden': ['geburtsurkunde', 'eheurkunde', 'sterbeurkunde'],
            'meldewesen': ['anmeldung', 'ummeldung', 'abmeldung'],
            'soziales': ['elterngeld', 'kindergeld', 'wohngeld'],
            'gewerbe': ['gewerbeanmeldung', 'gewerbeabmeldung'],
            'bauen': ['baugenehmigung', 'bauanzeige']
        }
        
    async def process_query(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> AgentResponse:
        """
        Verarbeitet verwaltungsbezogene Anfragen
        """
        try:
            # Analysiere Service-Typ
            service_type = await self._identify_service_type(query)
            
            # Hole relevante Service-Informationen
            service_data = await self._gather_service_data(query, service_type, context)
            
            # RAG-Suche für zusätzliche Verwaltungsinfos
            rag_results = await self.rag.search(
                query,
                filter_category="administration",
                limit=5
            )
            
            # Erstelle erweiterten Kontext
            enhanced_context = self._build_enhanced_context(
                query=query,
                service_type=service_type,
                service_data=service_data,
                rag_results=rag_results,
                user_context=context
            )
            
            # Generiere strukturierte Antwort
            response = await self.llm.generate_response(
                system_prompt=self.system_prompt,
                user_prompt=query,
                context=enhanced_context,
                temperature=0.3,  # Niedrige Temperatur für präzise Infos
                max_tokens=1200
            )
            
            # Extrahiere wichtige Informationen
            extracted_info = self._extract_key_information(response, service_data)
            
            # Generiere Handlungsempfehlungen
            recommendations = self._generate_recommendations(service_type, service_data)
            
            return AgentResponse(
                content=response,
                agent_name=self.name,
                confidence=self._calculate_confidence(service_type, service_data),
                sources=self._extract_sources(service_data, rag_results),
                metadata={
                    "service_type": service_type,
                    "key_info": extracted_info,
                    "recommendations": recommendations,
                    "online_available": self._check_online_availability(service_data)
                }
            )
            
        except Exception as e:
            logger.error(f"Error in AdminAgent: {str(e)}")
            return self._generate_fallback_response(query, str(e))
    
    async def _identify_service_type(self, query: str) -> str:
        """Identifiziert den angefragten Service-Typ"""
        query_lower = query.lower()
        
        # Prüfe bekannte Service-Kategorien
        for category, keywords in self.service_categories.items():
            if any(keyword in query_lower for keyword in keywords):
                return category
                
        # Spezifische Service-Erkennung
        if any(word in query_lower for word in ['ausweis', 'pass', 'dokument']):
            return 'ausweise'
        elif any(word in query_lower for word in ['auto', 'kfz', 'fahrzeug', 'führerschein']):
            return 'fahrzeuge'
        elif any(word in query_lower for word in ['geburt', 'heirat', 'ehe', 'urkunde']):
            return 'urkunden'
        elif any(word in query_lower for word in ['anmelden', 'ummelden', 'wohnsitz']):
            return 'meldewesen'
        elif any(word in query_lower for word in ['öffnungszeit', 'termin', 'amt']):
            return 'office_info'
        elif any(word in query_lower for word in ['online', 'digital', 'internet']):
            return 'online_services'
        else:
            return 'general'
    
    async def _gather_service_data(
        self,
        query: str,
        service_type: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Sammelt relevante Service-Daten"""
        data = {}
        
        try:
            # Hole allgemeine Service-Informationen
            if service_type in ['ausweise', 'fahrzeuge', 'urkunden', 'general']:
                services = await self.service_connector.get_services(
                    category=self._map_to_service_category(service_type)
                )
                data['services'] = services
                
            # Hole Behördenstandorte
            if context and context.get('location'):
                offices = await self.service_connector.get_offices(
                    location=context['location']
                )
                data['offices'] = offices
            else:
                # Standard: Saarbrücken
                offices = await self.service_connector.get_offices('Saarbrücken')
                data['offices'] = offices
                
            # Spezifische Daten für Service-Typen
            if service_type == 'ausweise':
                data['special_info'] = {
                    'express_available': True,
                    'express_fee': 32.00,
                    'biometric_photo_required': True,
                    'fingerprint_required': True
                }
            elif service_type == 'fahrzeuge':
                data['special_info'] = {
                    'online_zulassung': True,
                    'evb_required': True,
                    'sepa_required': True
                }
                
        except Exception as e:
            logger.warning(f"Error gathering service data: {e}")
            
        return data
    
    def _build_enhanced_context(
        self,
        query: str,
        service_type: str,
        service_data: Dict[str, Any],
        rag_results: List[Dict],
        user_context: Dict[str, Any] = None
    ) -> str:
        """Erstellt erweiterten Kontext für Verwaltungsanfragen"""
        context_parts = []
        
        # Service-Daten
        if service_data.get('services'):
            context_parts.append("=== VERFÜGBARE SERVICES ===")
            for service in service_data['services'][:3]:
                context_parts.append(f"\n{service['name']}:")
                context_parts.append(f"- Kategorie: {service.get('category', 'Allgemein')}")
                context_parts.append(f"- Online verfügbar: {'Ja' if service.get('online_available') else 'Nein'}")
                if service.get('documents_required'):
                    context_parts.append(f"- Benötigte Dokumente: {', '.join(service['documents_required'])}")
                if service.get('processing_time'):
                    context_parts.append(f"- Bearbeitungszeit: {service['processing_time']}")
                if service.get('fee'):
                    context_parts.append(f"- Gebühr: {service['fee']:.2f} €")
                    
        # Behördeninfos
        if service_data.get('offices'):
            context_parts.append("\n=== ZUSTÄNDIGE BEHÖRDEN ===")
            for office in service_data['offices'][:2]:
                context_parts.append(f"\n{office['name']}:")
                context_parts.append(f"- Adresse: {office['address']}")
                context_parts.append(f"- Telefon: {office['phone']}")
                if office.get('opening_hours'):
                    context_parts.append("- Öffnungszeiten:")
                    for day, hours in office['opening_hours'].items():
                        context_parts.append(f"  {day}: {hours}")
                        
        # Spezielle Informationen
        if service_data.get('special_info'):
            context_parts.append("\n=== BESONDERE HINWEISE ===")
            for key, value in service_data['special_info'].items():
                context_parts.append(f"- {key.replace('_', ' ').title()}: {value}")
                
        # RAG-Ergebnisse
        if rag_results:
            context_parts.append("\n=== ZUSÄTZLICHE INFORMATIONEN ===")
            for result in rag_results[:3]:
                context_parts.append(f"- {result.get('content', '')[:200]}...")
                
        # Nutzerkontext
        if user_context:
            context_parts.append("\n=== NUTZERKONTEXT ===")
            if user_context.get('location'):
                context_parts.append(f"Standort: {user_context['location']}")
            if user_context.get('urgency'):
                context_parts.append(f"Dringlichkeit: {user_context['urgency']}")
                
        return "\n".join(context_parts)
    
    def _extract_key_information(
        self,
        response: str,
        service_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Extrahiert wichtige Informationen aus der Antwort"""
        key_info = {}
        
        # Extrahiere Gebühren
        fee_pattern = r'(\d+(?:,\d+)?)\s*(?:€|EUR|Euro)'
        fees = re.findall(fee_pattern, response)
        if fees:
            key_info['fees'] = [float(fee.replace(',', '.')) for fee in fees]
            
        # Extrahiere Zeitangaben
        time_pattern = r'(\d+(?:-\d+)?)\s*(?:Wochen?|Tage?|Werktage?)'
        times = re.findall(time_pattern, response)
        if times:
            key_info['processing_times'] = times
            
        # Extrahiere Telefonnummern
        phone_pattern = r'(?:Tel\.?|Telefon:?)\s*([\d\s\-/]+)'
        phones = re.findall(phone_pattern, response)
        if phones:
            key_info['phone_numbers'] = phones
            
        # Online-Verfügbarkeit
        if 'online' in response.lower() and any(word in response.lower() for word in ['möglich', 'verfügbar', 'können']):
            key_info['online_available'] = True
            
        return key_info
    
    def _generate_recommendations(
        self,
        service_type: str,
        service_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert Handlungsempfehlungen"""
        recommendations = []
        
        # Allgemeine Empfehlungen
        if service_data.get('services'):
            for service in service_data['services']:
                if service.get('online_available'):
                    recommendations.append(f"Online-Antrag für {service['name']} möglich")
                    
        # Service-spezifische Empfehlungen
        if service_type == 'ausweise':
            recommendations.extend([
                "Biometrisches Passfoto mitbringen",
                "Online-Terminvereinbarung nutzen",
                "Express-Service verfügbar (Aufpreis)"
            ])
        elif service_type == 'fahrzeuge':
            recommendations.extend([
                "i-Kfz für Online-Zulassung nutzen",
                "eVB-Nummer vorab besorgen",
                "Kennzeichen online reservieren"
            ])
        elif service_type == 'meldewesen':
            recommendations.extend([
                "Wohnungsgeberbestätigung nicht vergessen",
                "Innerhalb von 14 Tagen ummelden",
                "Personalausweis mitbringen"
            ])
            
        # Öffnungszeiten-Empfehlung
        if service_data.get('offices'):
            office = service_data['offices'][0]
            if office.get('appointment_required'):
                recommendations.append("Terminvereinbarung erforderlich")
                
        return recommendations[:5]  # Maximal 5 Empfehlungen
    
    def _check_online_availability(self, service_data: Dict[str, Any]) -> bool:
        """Prüft, ob Services online verfügbar sind"""
        if service_data.get('services'):
            return any(service.get('online_available', False) 
                      for service in service_data['services'])
        return False
    
    def _map_to_service_category(self, service_type: str) -> str:
        """Mappt internen Service-Typ zu Connector-Kategorie"""
        mapping = {
            'ausweise': 'Ausweise & Dokumente',
            'fahrzeuge': 'Verkehr',
            'urkunden': 'Standesamt',
            'meldewesen': 'Einwohnermeldeamt',
            'soziales': 'Sozialleistungen',
            'gewerbe': 'Gewerbeamt',
            'bauen': 'Bauamt'
        }
        return mapping.get(service_type, 'Allgemein')
    
    def _calculate_confidence(
        self,
        service_type: str,
        service_data: Dict[str, Any]
    ) -> float:
        """Berechnet Konfidenz basierend auf verfügbaren Daten"""
        confidence = 0.7
        
        # Erhöhe Konfidenz für gut dokumentierte Services
        if service_type in ['ausweise', 'fahrzeuge', 'meldewesen']:
            confidence += 0.1
            
        # Erhöhe bei verfügbaren Service-Daten
        if service_data.get('services'):
            confidence += 0.1
            
        # Erhöhe bei Behördeninfos
        if service_data.get('offices'):
            confidence += 0.05
            
        return min(confidence, 0.95)
    
    def _extract_sources(
        self,
        service_data: Dict[str, Any],
        rag_results: List[Dict]
    ) -> List[str]:
        """Extrahiert Quellen"""
        sources = ['service.saarland.de']
        
        if service_data.get('services'):
            sources.append('Bürgerserviceportal Saarland')
            
        if service_data.get('offices'):
            sources.append('Behördenverzeichnis Saarland')
            
        # RAG-Quellen
        for result in rag_results:
            if source := result.get('source'):
                sources.append(source)
                
        return list(set(sources))
    
    def _generate_fallback_response(
        self,
        query: str,
        error: str
    ) -> AgentResponse:
        """Generiert Fallback-Antwort"""
        fallback_content = f"""Entschuldigung, ich konnte keine spezifischen Informationen zu Ihrer Anfrage finden.

Hier sind allgemeine Informationen zu Behördengängen im Saarland:

**Online-Services:**
• service.saarland.de - Zentrale Anlaufstelle für Online-Dienste
• Viele Anträge können digital gestellt werden
• Online-Terminvereinbarung für persönliche Besuche

**Wichtige Behörden:**
• Bürgeramt Ihrer Gemeinde - für Ausweise, Meldewesen
• Landesamt für Zentrale Dienste - für Führerschein, KFZ
• Standesamt - für Urkunden

**Allgemeine Tipps:**
• Prüfen Sie vorab, welche Dokumente benötigt werden
• Vereinbaren Sie wenn möglich einen Termin
• Nutzen Sie Online-Services für schnellere Bearbeitung

**Kontakt:**
• Behördenrufnummer: 115 (Mo-Fr 8-18 Uhr)
• Online: service.saarland.de

Kann ich Ihnen bei einem spezifischen Anliegen weiterhelfen?"""
        
        return AgentResponse(
            content=fallback_content,
            agent_name=self.name,
            confidence=0.5,
            sources=["Allgemeine Verwaltungsinformationen"],
            metadata={
                "error": error,
                "fallback": True
            }
        )
