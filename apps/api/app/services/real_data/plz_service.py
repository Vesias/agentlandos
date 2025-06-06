"""
PLZ Service für Saarland - Zuordnung von Postleitzahlen zu Behörden und Services
"""

from typing import Dict, List, Optional, Any
from datetime import datetime


class SaarlandPLZService:
    """Service für PLZ-basierte Behördenzuordnung im Saarland"""
    
    def __init__(self):
        # Vollständige PLZ-Datenbank für das Saarland
        self.plz_database = {
            # Regionalverband Saarbrücken
            "66111": {"stadt": "Saarbrücken", "kreis": "Regionalverband Saarbrücken", "lat": 49.2354, "lon": 6.9969},
            "66113": {"stadt": "Saarbrücken", "kreis": "Regionalverband Saarbrücken", "lat": 49.2401, "lon": 7.0000},
            "66115": {"stadt": "Saarbrücken", "kreis": "Regionalverband Saarbrücken", "lat": 49.2333, "lon": 6.9833},
            "66117": {"stadt": "Saarbrücken", "kreis": "Regionalverband Saarbrücken", "lat": 49.2411, "lon": 6.9947},
            "66119": {"stadt": "Saarbrücken", "kreis": "Regionalverband Saarbrücken", "lat": 49.2267, "lon": 6.9967},
            "66121": {"stadt": "Saarbrücken", "kreis": "Regionalverband Saarbrücken", "lat": 49.2478, "lon": 7.0225},
            "66123": {"stadt": "Saarbrücken", "kreis": "Regionalverband Saarbrücken", "lat": 49.2531, "lon": 7.0419},
            "66125": {"stadt": "Saarbrücken-Dudweiler", "kreis": "Regionalverband Saarbrücken", "lat": 49.2764, "lon": 7.0411},
            "66126": {"stadt": "Saarbrücken-Altenkessel", "kreis": "Regionalverband Saarbrücken", "lat": 49.2858, "lon": 6.9742},
            "66127": {"stadt": "Saarbrücken-Burbach", "kreis": "Regionalverband Saarbrücken", "lat": 49.2678, "lon": 6.9442},
            "66128": {"stadt": "Saarbrücken-Fechingen", "kreis": "Regionalverband Saarbrücken", "lat": 49.2819, "lon": 7.0847},
            "66129": {"stadt": "Saarbrücken-Brebach", "kreis": "Regionalverband Saarbrücken", "lat": 49.2556, "lon": 7.0603},
            "66130": {"stadt": "Saarbrücken-Güdingen", "kreis": "Regionalverband Saarbrücken", "lat": 49.2111, "lon": 7.0503},
            "66131": {"stadt": "Saarbrücken-Bübingen", "kreis": "Regionalverband Saarbrücken", "lat": 49.2000, "lon": 7.0667},
            "66132": {"stadt": "Saarbrücken-Ensheim", "kreis": "Regionalverband Saarbrücken", "lat": 49.2069, "lon": 7.1069},
            "66133": {"stadt": "Saarbrücken-Scheidt", "kreis": "Regionalverband Saarbrücken", "lat": 49.2300, "lon": 7.0833},
            
            # Völklingen
            "66333": {"stadt": "Völklingen", "kreis": "Regionalverband Saarbrücken", "lat": 49.2494, "lon": 6.8639},
            
            # Sulzbach
            "66280": {"stadt": "Sulzbach", "kreis": "Regionalverband Saarbrücken", "lat": 49.3000, "lon": 7.0667},
            
            # St. Ingbert
            "66386": {"stadt": "St. Ingbert", "kreis": "Saarpfalz-Kreis", "lat": 49.2769, "lon": 7.1147},
            
            # Homburg
            "66424": {"stadt": "Homburg", "kreis": "Saarpfalz-Kreis", "lat": 49.3228, "lon": 7.3358},
            
            # Neunkirchen
            "66538": {"stadt": "Neunkirchen", "kreis": "Landkreis Neunkirchen", "lat": 49.3472, "lon": 7.1797},
            "66539": {"stadt": "Neunkirchen", "kreis": "Landkreis Neunkirchen", "lat": 49.3422, "lon": 7.1822},
            "66540": {"stadt": "Neunkirchen-Wiebelskirchen", "kreis": "Landkreis Neunkirchen", "lat": 49.3583, "lon": 7.1833},
            
            # St. Wendel
            "66606": {"stadt": "St. Wendel", "kreis": "Landkreis St. Wendel", "lat": 49.4672, "lon": 7.1675},
            
            # Merzig
            "66663": {"stadt": "Merzig", "kreis": "Landkreis Merzig-Wadern", "lat": 49.4439, "lon": 6.6397},
            
            # Saarlouis
            "66740": {"stadt": "Saarlouis", "kreis": "Landkreis Saarlouis", "lat": 49.3133, "lon": 6.7528},

            # Cross‑Border: Frankreich
            "57200": {"stadt": "Sarreguemines", "kreis": "Moselle (FR)", "lat": 49.1100, "lon": 7.0700},

            # Cross‑Border: Luxemburg
            "4110": {"stadt": "Esch-sur-Alzette", "kreis": "Luxembourg (LU)", "lat": 49.4950, "lon": 5.9800},

            # Weitere wichtige PLZ...
        }
        
        # Behörden-Mapping nach Kreis
        self.behoerden_mapping = {
            "Regionalverband Saarbrücken": {
                "buergeramt": {
                    "name": "Bürgeramt Saarbrücken",
                    "adresse": "Gerberstraße 4, 66111 Saarbrücken",
                    "telefon": "0681 905-0",
                    "email": "buergerservice@saarbruecken.de",
                    "online_services": "https://www.saarbruecken.de/rathaus/buergerservice/online_services",
                    "oeffnungszeiten": {
                        "Mo-Fr": "08:00-18:00",
                        "Sa": "09:00-13:00"
                    },
                    "services": [
                        "Personalausweis",
                        "Reisepass",
                        "Führungszeugnis",
                        "Meldebescheinigung",
                        "An-/Abmeldung"
                    ]
                },
                "kfz_zulassung": {
                    "name": "KFZ-Zulassungsstelle Saarbrücken",
                    "adresse": "Lebacher Straße 6-8, 66113 Saarbrücken",
                    "telefon": "0681 506-5150",
                    "online_services": "https://www.saarland.de/kfz-online",
                    "oeffnungszeiten": {
                        "Mo-Fr": "07:30-15:30",
                        "Sa": "08:00-12:00"
                    }
                },
                "finanzamt": {
                    "name": "Finanzamt Saarbrücken",
                    "adresse": "Am Stadtgraben 2-4, 66111 Saarbrücken",
                    "telefon": "0681 3000-0",
                    "online_services": "https://finanzamt.saarland.de/elster"
                }
            },
            "Saarpfalz-Kreis": {
                "buergeramt": {
                    "name": "Bürgerbüro Homburg",
                    "adresse": "Am Forum 1, 66424 Homburg",
                    "telefon": "06841 104-0",
                    "email": "buergerbuero@homburg.de",
                    "online_services": "https://www.homburg.de/buergerservice/online",
                    "oeffnungszeiten": {
                        "Mo-Fr": "08:00-17:00",
                        "Sa": "09:00-12:00"
                    }
                },
                "kfz_zulassung": {
                    "name": "KFZ-Zulassungsstelle Homburg",
                    "adresse": "Talstraße 57a, 66424 Homburg",
                    "telefon": "06841 104-7171",
                    "online_services": "https://www.saarland.de/kfz-online"
                }
            },
            "Landkreis Neunkirchen": {
                "buergeramt": {
                    "name": "Bürgerbüro Neunkirchen",
                    "adresse": "Oberer Markt 16, 66538 Neunkirchen",
                    "telefon": "06821 202-0",
                    "email": "buergerbuero@neunkirchen.de",
                    "online_services": "https://www.neunkirchen.de/buergerservice",
                    "oeffnungszeiten": {
                        "Mo-Fr": "08:00-16:00",
                        "Do": "08:00-18:00"
                    }
                }
            },
            "Landkreis St. Wendel": {
                "buergeramt": {
                    "name": "Bürgerbüro St. Wendel",
                    "adresse": "Mommstraße 21-31, 66606 St. Wendel",
                    "telefon": "06851 801-0",
                    "email": "info@sankt-wendel.de",
                    "online_services": "https://www.sankt-wendel.de/buergerservice"
                }
            },
            "Landkreis Merzig-Wadern": {
                "buergeramt": {
                    "name": "Bürgerbüro Merzig",
                    "adresse": "Brauerstraße 5, 66663 Merzig",
                    "telefon": "06861 85-0",
                    "email": "info@merzig.de",
                    "online_services": "https://www.merzig.de/buergerservice"
                }
            },
            "Landkreis Saarlouis": {
                "buergeramt": {
                    "name": "Bürgerbüro Saarlouis",
                    "adresse": "Großer Markt 1, 66740 Saarlouis",
                    "telefon": "06831 443-0",
                    "email": "buergerbuero@saarlouis.de",
                    "online_services": "https://www.saarlouis.de/buergerservice"
                }
            },
            "Moselle (FR)": {
                "buergeramt": {
                    "name": "Mairie de Sarreguemines",
                    "adresse": "Hôtel de Ville, 57200 Sarreguemines, France",
                    "telefon": "+33 3 87 98 93 00",
                    "online_services": "https://www.sarreguemines.fr",
                    "oeffnungszeiten": {"Mo-Fr": "08:00-12:00 / 13:30-17:00"}
                }
            },
            "Luxembourg (LU)": {
                "buergeramt": {
                    "name": "Bierger-Center Luxemburg",
                    "adresse": "44 Place Guillaume II, 2090 Luxembourg",
                    "telefon": "+352 4796-2200",
                    "online_services": "https://www.vdl.lu",
                    "oeffnungszeiten": {"Mo-Fr": "08:00-17:00"}
                }
            }
        }
        
        # Online-Services (landesweit verfügbar)
        self.online_services = {
            "personalausweis": {
                "name": "Personalausweis online beantragen",
                "url": "https://www.personalausweisportal.de",
                "beschreibung": "Beantragen Sie Ihren Personalausweis online"
            },
            "fuehrungszeugnis": {
                "name": "Führungszeugnis online",
                "url": "https://www.fuehrungszeugnis.bund.de",
                "beschreibung": "Führungszeugnis online beantragen"
            },
            "kfz_online": {
                "name": "KFZ-Online Saarland",
                "url": "https://www.saarland.de/kfz-online",
                "beschreibung": "KFZ-Zulassung, Ummeldung und Abmeldung online"
            },
            "elster": {
                "name": "ELSTER - Elektronische Steuererklärung",
                "url": "https://www.elster.de",
                "beschreibung": "Steuererklärung online einreichen"
            },
            "serviceportal": {
                "name": "Serviceportal Saarland",
                "url": "https://service.saarland.de",
                "beschreibung": "Zentrale Anlaufstelle für Online-Verwaltungsleistungen"
            }
        }
    
    def get_info_by_plz(self, plz: str) -> Optional[Dict[str, Any]]:
        """Gibt Informationen zu einer PLZ zurück"""
        return self.plz_database.get(plz)
    
    def get_behoerde_by_plz(self, plz: str, service_type: str = "buergeramt") -> Optional[Dict[str, Any]]:
        """Gibt die zuständige Behörde für eine PLZ zurück"""
        plz_info = self.get_info_by_plz(plz)
        if not plz_info:
            return None
        
        kreis = plz_info["kreis"]
        if kreis in self.behoerden_mapping:
            behoerde = self.behoerden_mapping[kreis].get(service_type)
            if behoerde:
                return {
                    **behoerde,
                    "plz": plz,
                    "stadt": plz_info["stadt"],
                    "kreis": kreis,
                    "koordinaten": {
                        "lat": plz_info["lat"],
                        "lon": plz_info["lon"]
                    }
                }
        return None
    
    def get_nearest_services(self, plz: str) -> Dict[str, Any]:
        """Gibt alle verfügbaren Services für eine PLZ zurück"""
        plz_info = self.get_info_by_plz(plz)
        if not plz_info:
            return {"error": "PLZ nicht gefunden"}
        
        kreis = plz_info["kreis"]
        services = {
            "plz": plz,
            "stadt": plz_info["stadt"],
            "kreis": kreis,
            "koordinaten": {
                "lat": plz_info["lat"],
                "lon": plz_info["lon"]
            },
            "behoerden": self.behoerden_mapping.get(kreis, {}),
            "online_services": self.online_services,
            "notdienste": self._get_notdienste(plz_info["stadt"])
        }
        
        return services
    
    def _get_notdienste(self, stadt: str) -> Dict[str, Any]:
        """Gibt Notdienste für eine Stadt zurück"""
        return {
            "apotheken_notdienst": {
                "name": "Apotheken-Notdienstfinder",
                "url": "https://www.aponet.de/apotheke/notdienstsuche",
                "telefon": "0800 00 22833"
            },
            "aerztlicher_notdienst": {
                "name": "Ärztlicher Bereitschaftsdienst",
                "telefon": "116117",
                "info": "Kassenärztlicher Notdienst außerhalb der Sprechzeiten"
            },
            "notaufnahmen": self._get_krankenhaeuser(stadt)
        }
    
    def _get_krankenhaeuser(self, stadt: str) -> List[Dict[str, Any]]:
        """Gibt Krankenhäuser für eine Stadt zurück"""
        krankenhaeuser = {
            "Saarbrücken": [
                {
                    "name": "Universitätsklinikum des Saarlandes",
                    "adresse": "Kirrberger Straße 100, 66421 Homburg",
                    "telefon": "06841 16-0",
                    "notaufnahme": True
                },
                {
                    "name": "Klinikum Saarbrücken",
                    "adresse": "Winterberg 1, 66119 Saarbrücken",
                    "telefon": "0681 963-0",
                    "notaufnahme": True
                }
            ],
            "Homburg": [
                {
                    "name": "Universitätsklinikum des Saarlandes",
                    "adresse": "Kirrberger Straße 100, 66421 Homburg",
                    "telefon": "06841 16-0",
                    "notaufnahme": True
                }
            ]
        }
        
        # Fallback auf Saarbrücken wenn Stadt nicht gefunden
        return krankenhaeuser.get(stadt, krankenhaeuser.get("Saarbrücken", []))
    
    def search_plz(self, query: str) -> List[Dict[str, Any]]:
        """Sucht nach PLZ oder Stadtnamen"""
        results = []
        query_lower = query.lower()
        
        for plz, info in self.plz_database.items():
            if query in plz or query_lower in info["stadt"].lower():
                results.append({
                    "plz": plz,
                    "stadt": info["stadt"],
                    "kreis": info["kreis"],
                    "lat": info["lat"],
                    "lon": info["lon"]
                })
        
        return results
