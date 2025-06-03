"""
Maps Service - Integration von echten Karten für das Saarland
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json


class MapsService:
    """Service für Kartenintegration und Standortdienste"""
    
    def __init__(self):
        # Wichtige Orte im Saarland
        self.poi_database = {
            "sehenswuerdigkeiten": [
                {
                    "id": "saarschleife",
                    "name": "Saarschleife",
                    "kategorie": "Naturwahrzeichen",
                    "lat": 49.6479,
                    "lon": 6.5569,
                    "beschreibung": "Das Wahrzeichen des Saarlandes",
                    "url": "https://www.saarschleife.de",
                    "bild": "https://www.saarschleife.de/images/saarschleife.jpg",
                    "oeffnungszeiten": "Jederzeit zugänglich",
                    "eintritt": "Kostenlos",
                    "adresse": "Cloef-Atrium, 66693 Mettlach-Orscholz"
                },
                {
                    "id": "voelklinger_huette",
                    "name": "Völklinger Hütte",
                    "kategorie": "UNESCO Welterbe",
                    "lat": 49.2494,
                    "lon": 6.8472,
                    "beschreibung": "UNESCO-Weltkulturerbe und Industriedenkmal",
                    "url": "https://www.voelklinger-huette.org",
                    "bild": "https://www.voelklinger-huette.org/images/header.jpg",
                    "oeffnungszeiten": "Täglich 10:00-19:00 Uhr",
                    "eintritt": "Erwachsene 15€, ermäßigt 12€",
                    "adresse": "Rathausstraße 75-79, 66333 Völklingen"
                },
                {
                    "id": "bostalsee",
                    "name": "Bostalsee",
                    "kategorie": "Freizeitsee",
                    "lat": 49.5547,
                    "lon": 7.0731,
                    "beschreibung": "Größter Freizeitsee im Südwesten",
                    "url": "https://www.bostalsee.de",
                    "oeffnungszeiten": "Jederzeit zugänglich",
                    "eintritt": "Strand: 8€ Tageskarte",
                    "adresse": "Am Seehafen 1, 66625 Nohfelden-Bosen"
                }
            ],
            "veranstaltungsorte": [
                {
                    "id": "saarlandhalle",
                    "name": "Saarlandhalle",
                    "kategorie": "Veranstaltungshalle",
                    "lat": 49.2354,
                    "lon": 6.9969,
                    "beschreibung": "Größte Veranstaltungshalle im Saarland",
                    "url": "https://www.saarlandhalle.de",
                    "kapazitaet": 5500,
                    "adresse": "An der Saarlandhalle 1, 66113 Saarbrücken"
                },
                {
                    "id": "congresshalle",
                    "name": "Congresshalle Saarbrücken",
                    "kategorie": "Kongresszentrum",
                    "lat": 49.2401,
                    "lon": 6.9900,
                    "url": "https://www.ccsaar.de",
                    "adresse": "Hafenstraße 12, 66111 Saarbrücken"
                }
            ],
            "museen": [
                {
                    "id": "moderne_galerie",
                    "name": "Moderne Galerie",
                    "kategorie": "Kunstmuseum",
                    "lat": 49.2333,
                    "lon": 6.9967,
                    "beschreibung": "Museum für moderne und zeitgenössische Kunst",
                    "url": "https://www.kulturbesitz.de",
                    "oeffnungszeiten": "Di-So 10:00-18:00, Mi bis 20:00",
                    "eintritt": "8€, ermäßigt 5€",
                    "adresse": "Bismarckstraße 11-15, 66111 Saarbrücken"
                }
            ],
            "parks": [
                {
                    "id": "deutsch_franz_garten",
                    "name": "Deutsch-Französischer Garten",
                    "kategorie": "Park",
                    "lat": 49.2292,
                    "lon": 6.9475,
                    "beschreibung": "50 Hektar großer Park mit See",
                    "url": "https://www.saarbruecken.de/dfg",
                    "oeffnungszeiten": "April-Oktober: 7:00-21:00",
                    "eintritt": "2€, Kinder frei",
                    "adresse": "Deutschmühlental, 66117 Saarbrücken"
                }
            ]
        }
        
        # Event-Locations mit Ticket-Links
        self.event_locations = {
            "saarland_open_air": {
                "name": "Saarland Open Air Festival",
                "location": "Messegelände Saarbrücken",
                "lat": 49.2469,
                "lon": 6.9733,
                "ticket_url": "https://www.ticket-regional.de/saarland-open-air",
                "website": "https://www.saarland-open-air.de",
                "anfahrt": {
                    "auto": "A620, Ausfahrt Messegelände",
                    "oepnv": "Saarbahn Linie 1, Haltestelle Messegelände",
                    "parkplaetze": "5000 kostenlose Parkplätze"
                }
            },
            "jazz_unter_sternen": {
                "name": "Jazz unter Sternen",
                "location": "Alte Feuerwache Saarbrücken",
                "lat": 49.2347,
                "lon": 7.0011,
                "ticket_url": "https://www.ticket-regional.de/jazz-unter-sternen",
                "website": "https://www.altefeuerwache.com"
            },
            "theater_saarbruecken": {
                "name": "Saarländisches Staatstheater",
                "location": "Schillerplatz 1, Saarbrücken",
                "lat": 49.2308,
                "lon": 6.9956,
                "ticket_url": "https://www.staatstheater.saarland",
                "website": "https://www.staatstheater.saarland"
            }
        }
    
    def get_map_config(self) -> Dict[str, Any]:
        """Gibt Konfiguration für Kartenintegration zurück"""
        return {
            "center": {"lat": 49.3833, "lon": 6.9167},  # Zentrum Saarland
            "zoom": 10,
            "tile_layer": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "attribution": "© OpenStreetMap contributors",
            "bounds": {
                "north": 49.6395,
                "south": 49.1121,
                "east": 7.4037,
                "west": 6.3569
            }
        }
    
    def get_pois_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Gibt Points of Interest einer Kategorie zurück"""
        return self.poi_database.get(category, [])
    
    def get_all_pois(self) -> Dict[str, List[Dict[str, Any]]]:
        """Gibt alle Points of Interest zurück"""
        return self.poi_database
    
    def get_event_location(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Gibt Informationen zu einer Event-Location zurück"""
        return self.event_locations.get(event_id)
    
    def get_route_url(self, start_lat: float, start_lon: float, 
                      end_lat: float, end_lon: float, 
                      mode: str = "driving") -> str:
        """Generiert URL für Routenplanung"""
        # OpenStreetMap Directions
        osm_url = f"https://www.openstreetmap.org/directions?from={start_lat},{start_lon}&to={end_lat},{end_lon}"
        
        # Google Maps als Alternative
        google_url = f"https://www.google.com/maps/dir/{start_lat},{start_lon}/{end_lat},{end_lon}"
        
        return {
            "openstreetmap": osm_url,
            "google_maps": google_url,
            "mode": mode
        }
    
    def get_public_transport_route(self, start: str, end: str) -> Dict[str, Any]:
        """Gibt ÖPNV-Routeninformationen zurück"""
        # saarVV Integration (Phase 2)
        return {
            "provider": "saarVV",
            "website": "https://www.saarvv.de",
            "app_ios": "https://apps.apple.com/de/app/saarvv/id1234567890",
            "app_android": "https://play.google.com/store/apps/details?id=de.saarvv",
            "hotline": "06898 500 4000",
            "info": "Nutzen Sie die saarVV-App für aktuelle Verbindungen"
        }
    
    def get_nearby_parking(self, lat: float, lon: float) -> List[Dict[str, Any]]:
        """Gibt Parkplätze in der Nähe zurück"""
        # Beispiel-Parkplätze für Saarbrücken
        if 49.20 <= lat <= 49.27 and 6.95 <= lon <= 7.05:
            return [
                {
                    "name": "Parkhaus Europa-Galerie",
                    "lat": 49.2354,
                    "lon": 6.9969,
                    "plaetze_gesamt": 1200,
                    "plaetze_frei": 456,
                    "preis_stunde": 2.00,
                    "max_tagespreis": 12.00,
                    "oeffnungszeiten": "Mo-Sa 7:00-23:00",
                    "adresse": "Trierer Straße 1, 66111 Saarbrücken"
                },
                {
                    "name": "Parkplatz Tbilisser Platz",
                    "lat": 49.2367,
                    "lon": 6.9947,
                    "plaetze_gesamt": 450,
                    "plaetze_frei": 123,
                    "preis_stunde": 1.50,
                    "max_tagespreis": 8.00,
                    "oeffnungszeiten": "24/7",
                    "adresse": "Tbilisser Platz, 66111 Saarbrücken"
                }
            ]
        return []
    
    def generate_static_map_url(self, markers: List[Dict[str, Any]], 
                               width: int = 600, height: int = 400) -> str:
        """Generiert URL für statische Karte"""
        # OpenStreetMap Static Map
        base_url = "https://www.openstreetmap.org/export/embed.html"
        
        # Berechne Bounding Box
        if markers:
            lats = [m['lat'] for m in markers]
            lons = [m['lon'] for m in markers]
            bbox = f"{min(lons)},{min(lats)},{max(lons)},{max(lats)}"
            return f"{base_url}?bbox={bbox}&layer=mapnik"
        
        # Fallback: Ganz Saarland
        return f"{base_url}?bbox=6.3569,49.1121,7.4037,49.6395&layer=mapnik"
    
    def get_emergency_services(self, lat: float, lon: float) -> Dict[str, Any]:
        """Gibt Notdienste in der Nähe zurück"""
        return {
            "polizei": {
                "notruf": "110",
                "nicht_dringend": "0681 962-0",
                "online_wache": "https://www.saarland.de/polizei/onlinewache"
            },
            "feuerwehr_rettungsdienst": {
                "notruf": "112"
            },
            "aerztlicher_bereitschaftsdienst": {
                "telefon": "116117",
                "website": "https://www.116117.de"
            },
            "apotheken_notdienst": {
                "telefon": "0800 00 22833",
                "website": "https://www.aponet.de/apotheke/notdienstsuche"
            },
            "giftnotruf": {
                "telefon": "06841 19240",
                "name": "Giftnotruf Homburg/Saar"
            }
        }
