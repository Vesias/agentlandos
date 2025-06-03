"""
SAARTASKS - Saarland-specific AI agent for Vercel deployment
Integrates DeepSeek AI with SAARAG vector database
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import httpx
import asyncio
from typing import Dict, List, Any

# Saarland Knowledge Base
SAARLAND_CONTEXT = {
    "sehenswürdigkeiten": [
        "Saarschleife bei Mettlach - Das Wahrzeichen des Saarlandes",
        "Völklinger Hütte - UNESCO Weltkulturerbe der Industriekultur", 
        "Ludwigskirche in Saarbrücken - Barocke Architektur von Friedrich Joachim Stengel",
        "Römische Villa Borg - Rekonstruierte römische Villenanlage",
        "Schloss Dagstuhl - Internationales Zentrum für Informatik",
        "Bostalsee - Größter Freizeitsee im Saarland",
        "Hunnenring bei Otzenhausen - Keltische Ringwallanlage"
    ],
    "kultur": [
        "Saarländisches Staatstheater - Oper, Schauspiel, Ballett",
        "Moderne Galerie des Saarlandmuseums",
        "Weltkulturerbe Völklinger Hütte mit Kulturveranstaltungen",
        "Filmfestival Max Ophüls Preis",
        "Perspectives - Festival für neue Musik",
        "Rocco del Schlacko - Rockfestival"
    ],
    "forschung": [
        "DFKI - Deutsches Forschungszentrum für Künstliche Intelligenz",
        "Max-Planck-Institut für Informatik", 
        "Max-Planck-Institut für Softwaresysteme",
        "Universität des Saarlandes - Excellence in Computer Science",
        "htw saar - Hochschule für Technik und Wirtschaft",
        "CISPA - Helmholtz-Zentrum für Informationssicherheit"
    ],
    "dialekt": {
        "begrüßung": ["Hallo", "Salü", "Mojen"],
        "verabschiedung": ["Ade", "Tschüss", "Bis bald"],
        "typisch": ["Hauptsach gudd gess", "Ei jo", "Des is jo", "Grumbeer"]
    },
    "kulinarik": [
        "Döppekuchen - Traditioneller Kartoffelauflauf",
        "Lyoner Wurst - Saarländische Spezialität", 
        "Flönz - Blutwurst auf saarländische Art",
        "Dibbelabbes - Kartoffelreibekuchen",
        "Schwenker - Grillspezialität vom Schwenkgrill"
    ]
}

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'https://agentland-saarland.vercel.app')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            # Parse request
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Extract query
            query = data.get('message', '')
            language = data.get('language', 'de')
            
            # Process with SAARAG
            response = asyncio.run(self.process_saartask(query, language))
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', 'https://agentland-saarland.vercel.app')
            self.end_headers()
            
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', 'https://agentland-saarland.vercel.app')
            self.end_headers()
            
            error_response = {
                "agent_id": "saartasks",
                "agent_name": "SAARTASKS Agent",
                "message": f"Entschuldigung, es gab einen Fehler: {str(e)}",
                "confidence": 0.1,
                "regional_context": "Saarland"
            }
            
            self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))

    async def process_saartask(self, query: str, language: str) -> Dict[str, Any]:
        """Process SAARTASK with DeepSeek AI and SAARAG context"""
        
        # Get relevant Saarland context
        relevant_context = self.get_saarland_context(query)
        
        # Check if DeepSeek API is available
        deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        if not deepseek_key:
            return self.fallback_response(query, relevant_context, language)
        
        # Build enhanced prompt with Saarland context
        system_prompt = self.build_saarland_prompt(relevant_context, language)
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {deepseek_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": query}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000,
                        "stream": False
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    ai_message = result["choices"][0]["message"]["content"]
                    
                    return {
                        "agent_id": "saartasks",
                        "agent_name": "SAARTASKS Agent",
                        "message": ai_message,
                        "confidence": 0.95,
                        "thought_process": [
                            "Saarland-Kontext analysiert",
                            "DeepSeek AI konsultiert", 
                            "Regionale Expertise angewendet"
                        ],
                        "regional_context": "Saarland",
                        "metadata": {
                            "model": "deepseek-chat",
                            "language": language,
                            "context_used": list(relevant_context.keys())
                        }
                    }
                else:
                    return self.fallback_response(query, relevant_context, language)
                    
        except Exception as e:
            return self.fallback_response(query, relevant_context, language)

    def get_saarland_context(self, query: str) -> Dict[str, List[str]]:
        """Retrieve relevant Saarland context based on query"""
        query_lower = query.lower()
        relevant = {}
        
        # Simple keyword matching for SAARAG simulation
        if any(word in query_lower for word in ["sehenswürdigkeit", "besichtigen", "tourist", "visit"]):
            relevant["sehenswürdigkeiten"] = SAARLAND_CONTEXT["sehenswürdigkeiten"]
            
        if any(word in query_lower for word in ["kultur", "theater", "museum", "festival"]):
            relevant["kultur"] = SAARLAND_CONTEXT["kultur"]
            
        if any(word in query_lower for word in ["forschung", "universität", "dfki", "ki", "ai"]):
            relevant["forschung"] = SAARLAND_CONTEXT["forschung"]
            
        if any(word in query_lower for word in ["essen", "food", "küche", "restaurant"]):
            relevant["kulinarik"] = SAARLAND_CONTEXT["kulinarik"]
            
        if any(word in query_lower for word in ["dialekt", "sprache", "saarländisch"]):
            relevant["dialekt"] = SAARLAND_CONTEXT["dialekt"]
            
        # If no specific context, return overview
        if not relevant:
            relevant = {
                "overview": SAARLAND_CONTEXT["sehenswürdigkeiten"][:3] + 
                           SAARLAND_CONTEXT["forschung"][:2]
            }
            
        return relevant

    def build_saarland_prompt(self, context: Dict[str, List], language: str) -> str:
        """Build system prompt with Saarland context"""
        
        context_text = ""
        for category, items in context.items():
            context_text += f"\n{category.upper()}:\n"
            for item in items[:5]:  # Limit to avoid token limits
                context_text += f"- {item}\n"
        
        if language == "de":
            return f"""Du bist SAARTASKS, ein spezialisierter KI-Assistent für das Saarland. 
Du kennst dich bestens mit der saarländischen Kultur, Geschichte, Sehenswürdigkeiten und regionalen Besonderheiten aus.

SAARLAND KONTEXT:{context_text}

Deine Aufgaben:
- Beantworte Fragen über das Saarland mit konkreten, hilfreichen Informationen
- Nutze den bereitgestellten Kontext, aber ergänze mit deinem Wissen
- Sei stolz auf die Region, aber objektiv und hilfreich
- Verwende gelegentlich saarländische Ausdrücke, wenn passend
- Bei Tourismus-Fragen gib praktische Tipps
- Bei Forschungs-Fragen erwähne die excellente KI-Landschaft

Antworte auf Deutsch, sei freundlich und kompetent."""

        else:
            return f"""You are SAARTASKS, a specialized AI assistant for Saarland, Germany.
You have extensive knowledge about Saarland's culture, history, attractions, and regional specifics.

SAARLAND CONTEXT:{context_text}

Your tasks:
- Answer questions about Saarland with concrete, helpful information
- Use the provided context but supplement with your knowledge
- Be proud of the region but objective and helpful
- For tourism questions, provide practical tips
- For research questions, mention the excellent AI landscape

Respond in {language}, be friendly and competent."""

    def fallback_response(self, query: str, context: Dict[str, List], language: str) -> Dict[str, Any]:
        """Fallback response when DeepSeek is not available"""
        
        if language == "de":
            message = f"Ihre Frage zum Saarland ist interessant! "
            if "sehenswürdigkeiten" in context:
                message += f"Ich empfehle Ihnen besonders: {context['sehenswürdigkeiten'][0]}. "
            message += "Für detailliertere Informationen steht Ihnen bald die vollständige SAARTASKS-KI zur Verfügung."
        else:
            message = f"Your question about Saarland is interesting! "
            if "sehenswürdigkeiten" in context:
                message += f"I especially recommend: {context['sehenswürdigkeiten'][0]}. "
            message += "For more detailed information, the full SAARTASKS AI will be available soon."
        
        return {
            "agent_id": "saartasks",
            "agent_name": "SAARTASKS Agent (Demo)",
            "message": message,
            "confidence": 0.7,
            "thought_process": ["Demo-Modus aktiv", "Saarland-Basis-Kontext verwendet"],
            "regional_context": "Saarland",
            "metadata": {
                "mode": "fallback",
                "language": language
            }
        }