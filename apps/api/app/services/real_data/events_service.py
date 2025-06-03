"""
Events Service - Veranstaltungen im Saarland
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List


class EventsService:
    """Service für Veranstaltungsdaten"""
    
    async def get_upcoming_events(self, days: int = 7) -> List[Dict[str, Any]]:
        """Kommende Veranstaltungen"""
        today = datetime.now()
        
        events = [
            {
                'id': 'evt_001',
                'title': 'Saarland Open Air Festival',
                'date': (today + timedelta(days=4)).strftime('%Y-%m-%d'),
                'location': 'Messegelände Saarbrücken',
                'category': 'Festival',
                'price_range': '45-85€',
                'description': 'Größtes Open Air Festival im Saarland'
            },
            {
                'id': 'evt_002',
                'title': 'Jazz unter Sternen',
                'date': (today + timedelta(days=4)).strftime('%Y-%m-%d'),
                'location': 'Alte Feuerwache',
                'category': 'Konzert',
                'price_range': '28€',
                'description': 'Internationale Jazz-Künstler'
            },
            {
                'id': 'evt_003',
                'title': 'Kunst & KI Biennale',
                'date': today.strftime('%Y-%m-%d'),
                'location': 'Moderne Galerie',
                'category': 'Ausstellung',
                'price_range': '12€',
                'description': 'Interaktive KI-Kunstinstallationen'
            }
        ]
        
        # Filter by days
        cutoff_date = today + timedelta(days=days)
        filtered_events = [
            event for event in events
            if datetime.strptime(event['date'], '%Y-%m-%d') <= cutoff_date
        ]
        
        return filtered_events
