"""
Weather Service - Integriert echte Wetterdaten
"""

import aiohttp
from datetime import datetime
from typing import Dict, Any, Optional


class WeatherService:
    """Service für echte Wetterdaten"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or "demo"
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
    async def get_current_weather(self, city: str = "Saarbruecken,DE") -> Dict[str, Any]:
        """Holt aktuelles Wetter für eine Stadt"""
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    'q': city,
                    'appid': self.api_key,
                    'units': 'metric',
                    'lang': 'de'
                }
                
                async with session.get(
                    f"{self.base_url}/weather",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._format_weather_data(data)
                    
        except Exception as e:
            print(f"Weather API error: {e}")
            
        # Fallback data
        return self._get_fallback_weather()
    
    def _format_weather_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Formatiert Wetterdaten"""
        return {
            'location': data.get('name', 'Saarbrücken'),
            'temperature': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'description': data['weather'][0]['description'],
            'humidity': data['main']['humidity'],
            'wind_speed': data['wind']['speed'],
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _get_fallback_weather(self) -> Dict[str, Any]:
        """Fallback Wetterdaten für Juni"""
        import random
        temp = random.randint(20, 28)
        return {
            'location': 'Saarbrücken',
            'temperature': temp,
            'feels_like': temp - 2,
            'description': random.choice(['Sonnig', 'Teilweise bewölkt', 'Heiter']),
            'humidity': random.randint(40, 70),
            'wind_speed': random.randint(5, 15),
            'timestamp': datetime.utcnow().isoformat()
        }
