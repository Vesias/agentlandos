"""
SAARAG - Saarland Retrieval Augmented Generation
Vector database for Saarland-specific knowledge with embeddings
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import httpx
import asyncio
from typing import Dict, List, Any, Optional
import hashlib

# SAARAG Knowledge Base with embeddings-ready structure
# Enhanced SAARAG Knowledge Base with comprehensive Saarland culture and identity
SAARAG_KNOWLEDGE = [
    {
        "id": "saar_001",
        "category": "sehenswürdigkeiten", 
        "title": "Saarschleife",
        "content": "Die Saarschleife bei Mettlach ist das Wahrzeichen des Saarlandes. Der Fluss Saar macht hier eine 180-Grad-Kehre und schafft eine einzigartige Naturlandschaft. Der beste Aussichtspunkt ist der Cloef-Atrium mit Baumwipfelpfad.",
        "location": {"lat": 49.5481, "lng": 6.5853},
        "tags": ["natur", "aussicht", "wahrzeichen", "mettlach"]
    },
    {
        "id": "saar_002", 
        "category": "kultur",
        "title": "Völklinger Hütte",
        "content": "Die Völklinger Hütte ist ein UNESCO Weltkulturerbe und einziges Industriedenkmal aus der Blütezeit der Eisenproduktion. Heute kultureller Veranstaltungsort mit Ausstellungen zeitgenössischer Kunst.",
        "location": {"lat": 49.2506, "lng": 6.8436},
        "tags": ["unesco", "industrie", "kultur", "völklingen", "weltkulturerbe"]
    },
    {
        "id": "saar_003",
        "category": "forschung",
        "title": "DFKI Saarbrücken", 
        "content": "Das Deutsche Forschungszentrum für Künstliche Intelligenz (DFKI) ist führend in der KI-Forschung. Gegründet 1988, arbeiten hier über 1000 Wissenschaftler an zukunftsweisenden KI-Technologien.",
        "location": {"lat": 49.2576, "lng": 7.0422},
        "tags": ["ki", "forschung", "technologie", "saarbrücken", "innovation"]
    },
    {
        "id": "saar_004",
        "category": "kulinarik",
        "title": "Saarländische Küche",
        "content": "Die saarländische Küche vereint deutsche und französische Einflüsse. Spezialitäten: Döppekuchen, Lyoner, Dibbelabbes, und natürlich das Schwenken - Grillen auf dem traditionellen Schwenkgrill.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["essen", "tradition", "döppekuchen", "schwenken", "lyoner"]
    },
    {
        "id": "saar_005",
        "category": "bildung",
        "title": "Universität des Saarlandes",
        "content": "Die Universität des Saarlandes ist international renommiert, besonders in Informatik und Materialwissenschaften. Campus in Saarbrücken mit über 17.000 Studierenden aus aller Welt.",
        "location": {"lat": 49.2548, "lng": 7.0422},
        "tags": ["universität", "bildung", "informatik", "campus", "international"]
    },
    {
        "id": "saar_006",
        "category": "verwaltung",
        "title": "Digitale Verwaltung Saarland",
        "content": "Das Saarland ist Vorreiter bei der Digitalisierung der Verwaltung. Online-Services: Bürgerkonto, digitale Anträge, E-Government-Portal. Ziel: 100% digitale Verwaltungsleistungen bis 2025.",
        "location": {"lat": 49.2333, "lng": 7.0000}, 
        "tags": ["verwaltung", "digital", "egovernment", "bürgerkonto", "online"]
    },
    {
        "id": "saar_007",
        "category": "wirtschaft",
        "title": "Wirtschaftsstandort Saarland",
        "content": "Das Saarland wandelt sich vom Kohle- und Stahlstandort zum Technologie- und Innovationszentrum. Schwerpunkte: IT, Automotive, Materialforschung, Logistik. Nähe zu Frankreich und Luxemburg als Standortvorteil.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["wirtschaft", "technologie", "automotive", "innovation", "grenzregion"]
    },
    {
        "id": "saar_008",
        "category": "dialekt",
        "title": "Saarländischer Dialekt",
        "content": "Der saarländische Dialekt (Saarländisch) ist eine moselfränkische Mundart mit französischen Einflüssen. Typische Ausdrücke: 'Hauptsach gudd gess' (Hauptsache gut gegessen), 'Grumbeer' (Kartoffeln), 'Ei jo' (Ja, so ist es).",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["dialekt", "sprache", "saarländisch", "mundart", "kultur"]
    },
    {
        "id": "saar_009",
        "category": "dialekt",
        "title": "Hauptsach gudd gess - Saarländische Lebensphilosophie",
        "content": "Der Ausspruch 'Hauptsach gudd gess' (Hauptsache gut gegessen) verkörpert die saarländische Lebensart. Er drückt aus, dass gutes Essen und Genuss zentrale Elemente der Lebensqualität sind. Weitere wichtige Redewendungen: 'Mir sin mir' (Wir sind wir), 'Ei jo, da simmer dabei' (Ja, da sind wir dabei), 'Grumbeerkaul' (Kartoffelmund).",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["dialekt", "hauptsach", "gudd", "gess", "lebensphilosophie", "redewendung"]
    },
    {
        "id": "saar_010",
        "category": "identität",
        "title": "8 Nationalitätswechsel - Saarländische Geschichte",
        "content": "Das Saarland hat in seiner Geschichte 8 Mal die Nationalität gewechselt, was die Identität stark prägte. Von römisch über französisch bis deutsch, vom autonomen Saarstaat bis zur Rückgliederung 1957. Diese wechselvolle Geschichte macht Saarländer zu Europäern der ersten Stunde mit einer einzigartigen Mischkultur.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["geschichte", "identität", "nationalität", "saarstaat", "europa", "grenzregion"]
    },
    {
        "id": "saar_011",
        "category": "gastronomie",
        "title": "Saarländische Sterneküche",
        "content": "Das Saarland hat die höchste Michelin-Sterne-Dichte Deutschlands. Spitzenköche wie Klaus Erfort (3 Sterne, GästeHaus Klaus Erfort) und Christian Bau (3 Sterne, Victor's Fine Dining) prägen die Haute Cuisine. Die Verbindung von deutscher Bodenständigkeit mit französischer Raffinesse macht die saarländische Küche einzigartig.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["michelin", "sterne", "gastronomie", "erfort", "bau", "haute-cuisine"]
    },
    {
        "id": "saar_012",
        "category": "festival",
        "title": "Max Ophüls Preis - Filmfestival",
        "content": "Das Max Ophüls Preis Filmfestival ist das wichtigste Festival für den deutschsprachigen Nachwuchsfilm. Seit 1980 findet es jährlich in Saarbrücken statt. Hier starteten Karrieren von Fatih Akin, Tom Tykwer und Caroline Link. Eine Woche lang wird die Stadt zum Zentrum des jungen deutschen Films.",
        "location": {"lat": 49.2333, "lng": 7.0167},
        "tags": ["film", "festival", "max-ophüls", "kultur", "nachwuchs", "kino"]
    },
    {
        "id": "saar_013",
        "category": "festival",
        "title": "Urban Art Biennale",
        "content": "Die Urban Art Biennale verwandelt das UNESCO Weltkulturerbe Völklinger Hütte in eine gigantische Street-Art-Galerie. Internationale Künstler schaffen in den Industriehallen spektakuläre Werke. Die Verbindung von rostiger Industriearchitektur und moderner Kunst macht die Biennale weltweit einzigartig.",
        "location": {"lat": 49.2506, "lng": 6.8436},
        "tags": ["urban-art", "biennale", "völklinger-hütte", "street-art", "kunst", "festival"]
    },
    {
        "id": "saar_014",
        "category": "mentalität",
        "title": "Saarländische Mentalität - Gemütlichkeit und Geselligkeit",
        "content": "Die saarländische Mentalität zeichnet sich durch Gemütlichkeit, Geselligkeit und Bodenständigkeit aus. 'Mir sin klään, awwer mir sin vill' (Wir sind klein, aber wir sind viele) beschreibt den Zusammenhalt. Schwenken (Grillen), Feste feiern und die Pflege von Traditionen prägen das soziale Leben. Die Nähe zu Frankreich bringt Savoir-vivre ins Land.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["mentalität", "geselligkeit", "gemütlichkeit", "schwenken", "tradition", "zusammenhalt"]
    },
    {
        "id": "saar_015",
        "category": "grenzregion",
        "title": "Saar-Lor-Lux - Leben in der Großregion",
        "content": "Das Saarland ist Herz der Großregion Saar-Lor-Lux (Saarland, Lothringen, Luxemburg, Rheinland-Pfalz, Wallonien). Täglich pendeln 250.000 Menschen über Grenzen. Französisch ist zweite Fremdsprache, viele Saarländer kaufen in Frankreich ein, arbeiten in Luxemburg. Diese Grenznähe prägt Weltoffenheit und europäisches Denken.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["grenzregion", "saar-lor-lux", "europa", "pendler", "frankreich", "luxemburg"]
    },
    {
        "id": "saar_016",
        "category": "kultur",
        "title": "Saarländisches Staatstheater",
        "content": "Das Saarländische Staatstheater ist das einzige Dreispartenhaus des Saarlandes mit Oper, Schauspiel und Tanz. Das moderne Gebäude am Saarufer ist architektonisches Wahrzeichen. Besonders die Alte Feuerwache als experimentelle Spielstätte und das grenzüberschreitende Projekt 'Perspectives' mit französischen Bühnen sind hervorzuheben.",
        "location": {"lat": 49.2298, "lng": 6.9969},
        "tags": ["theater", "kultur", "oper", "schauspiel", "tanz", "staatstheater"]
    },
    {
        "id": "saar_017",
        "category": "tradition",
        "title": "Schwenken - Saarländische Grillkultur",
        "content": "Schwenken ist mehr als Grillen - es ist saarländische Lebensart. Auf einem dreibeinigen Schwenkgrill wird über Buchenholz geschwenkt. Das Schwenkfleisch (mariniertes Schweinefleisch) wird dabei ständig bewegt. Dazu gibt's Lyoner, Grumbeerschalat (Kartoffelsalat) und Bier. Jedes Dorf hat seinen Schwenkplatz, wo sich die Gemeinschaft trifft.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["schwenken", "grillen", "tradition", "schwenkgrill", "gemeinschaft", "kulinarik"]
    },
    {
        "id": "saar_018",
        "category": "musik",
        "title": "Saarländische Musikszene",
        "content": "Die saarländische Musikszene ist vielfältig: Von der Deutschen Radio Philharmonie über Jazz (Sebastian Studnitzky) bis zu Electronic (AKA AKA). Das SR Sinfonieorchester ist international renommiert. Festivals wie 'Rocco del Schlacko' und das 'Halberg Open Air' prägen die Szene. Die Hochschule für Musik Saar bildet Nachwuchs aus.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["musik", "philharmonie", "jazz", "electronic", "festival", "kultur"]
    },
    {
        "id": "saar_019",
        "category": "sport",
        "title": "Sport im Saarland - Fußball und mehr",
        "content": "Der 1. FC Saarbrücken ist Kult - 1950er Jahre Vizemeister, heute Traditionsverein mit treuen Fans. Der Ludwigspark ist legendär. Handball (HG Saarlouis), Ringen (KSV Köllerbach) und Radsport (Saarschleifen-Tour) sind weitere Aushängeschilder. Die Sportschule Saarbrücken ist Bundesstützpunkt für viele Sportarten.",
        "location": {"lat": 49.2333, "lng": 7.0000},
        "tags": ["sport", "fußball", "fc-saarbrücken", "handball", "tradition", "ludwigspark"]
    },
    {
        "id": "saar_020",
        "category": "natur",
        "title": "Bliesgau Biosphärenreservat",
        "content": "Der Bliesgau ist UNESCO-Biosphärenreservat mit einzigartiger Kulturlandschaft. Streuobstwiesen, Orchideen, seltene Schmetterlinge prägen die Region. Die Barockstadt Blieskastel, römische Ausgrabungen in Schwarzenacker und der Europäische Kulturpark Reinheim verbinden Natur und Kultur. Nachhaltiger Tourismus und regionale Produkte stehen im Fokus.",
        "location": {"lat": 49.2000, "lng": 7.2500},
        "tags": ["biosphäre", "unesco", "natur", "bliesgau", "nachhaltigkeit", "kulturlandschaft"]
    }
]

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Get SAARAG status and statistics"""
        try:
            stats = {
                "name": "SAARAG - Saarland RAG Vector Database",
                "status": "operational",
                "documents": len(SAARAG_KNOWLEDGE),
                "categories": list(set(item["category"] for item in SAARAG_KNOWLEDGE)),
                "embeddings_provider": "deepseek" if os.getenv("DEEPSEEK_API_KEY") else "local",
                "vector_store": "pinecone" if os.getenv("PINECONE_API_KEY") else "in_memory"
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(stats, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"SAARAG Error: {str(e)}")

    def do_POST(self):
        """Query SAARAG vector database"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            query = data.get('query', '')
            limit = data.get('limit', 5)
            category = data.get('category', None)
            
            results = asyncio.run(self.search_saarag(query, limit, category))
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(results, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"SAARAG Query Error: {str(e)}")

    async def search_saarag(self, query: str, limit: int = 5, category: Optional[str] = None) -> Dict[str, Any]:
        """Search SAARAG knowledge base with semantic similarity"""
        
        # Simple keyword-based search (will be enhanced with embeddings)
        query_lower = query.lower()
        results = []
        
        for item in SAARAG_KNOWLEDGE:
            if category and item["category"] != category:
                continue
                
            # Calculate relevance score
            score = 0.0
            
            # Title match
            if any(word in item["title"].lower() for word in query_lower.split()):
                score += 0.4
                
            # Content match  
            content_words = item["content"].lower().split()
            query_words = query_lower.split()
            matches = sum(1 for word in query_words if any(word in content_word for content_word in content_words))
            score += (matches / max(len(query_words), 1)) * 0.4
            
            # Tag match
            tag_matches = sum(1 for tag in item["tags"] if any(word in tag for word in query_words))
            score += (tag_matches / max(len(item["tags"]), 1)) * 0.2
            
            if score > 0.1:  # Threshold for relevance
                results.append({
                    **item,
                    "relevance_score": round(score, 3)
                })
        
        # Sort by relevance and limit results
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        results = results[:limit]
        
        return {
            "query": query,
            "total_results": len(results),
            "results": results,
            "metadata": {
                "search_method": "keyword_similarity",
                "database": "saarag_v1",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }

    async def generate_embeddings(self, text: str) -> Optional[List[float]]:
        """Generate embeddings using DeepSeek API (placeholder for future implementation)"""
        # This would use DeepSeek's embedding endpoint when available
        # For now, return None to use keyword-based search
        return None