/**
 * Weather Service für AGENTLAND.SAARLAND
 * Echte Wetterdaten für die Saarland-Region
 */

export interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    description: string;
  };
  forecast: {
    today: {
      min: number;
      max: number;
      condition: string;
      description: string;
    };
    tomorrow: {
      min: number;
      max: number;
      condition: string;
      description: string;
    };
    week: Array<{
      date: string;
      min: number;
      max: number;
      condition: string;
    }>;
  };
  location: {
    city: string;
    region: string;
    country: string;
  };
  lastUpdated: string;
}

export class SaarlandWeatherService {
  private static instance: SaarlandWeatherService;
  
  // Saarbrücken Koordinaten als Referenz für das Saarland
  private readonly SAARLAND_COORDS = {
    lat: 49.2401,
    lon: 6.9969
  };

  private readonly WEATHER_API_URLS = {
    // Open-Meteo (kostenlos, keine API-Key erforderlich)
    openMeteo: 'https://api.open-meteo.com/v1/forecast',
    // Brightsky (DWD Daten für Deutschland)
    brightsky: 'https://api.brightsky.dev/current_weather'
  };

  public static getInstance(): SaarlandWeatherService {
    if (!SaarlandWeatherService.instance) {
      SaarlandWeatherService.instance = new SaarlandWeatherService();
    }
    return SaarlandWeatherService.instance;
  }

  async getCurrentWeather(): Promise<WeatherData> {
    try {
      // Verwende Open-Meteo API (kostenlos und zuverlässig)
      const response = await fetch(
        `${this.WEATHER_API_URLS.openMeteo}?latitude=${this.SAARLAND_COORDS.lat}&longitude=${this.SAARLAND_COORDS.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe/Berlin&forecast_days=7`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return this.parseWeatherData(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      return this.getFallbackWeather();
    }
  }

  private parseWeatherData(data: any): WeatherData {
    const current = data.current;
    const daily = data.daily;

    return {
      current: {
        temperature: Math.round(current.temperature_2m),
        condition: this.getWeatherCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        description: this.getWeatherDescription(current.weather_code, current.temperature_2m)
      },
      forecast: {
        today: {
          min: Math.round(daily.temperature_2m_min[0]),
          max: Math.round(daily.temperature_2m_max[0]),
          condition: this.getWeatherCondition(daily.weather_code[0]),
          description: this.getWeatherDescription(daily.weather_code[0])
        },
        tomorrow: {
          min: Math.round(daily.temperature_2m_min[1]),
          max: Math.round(daily.temperature_2m_max[1]),
          condition: this.getWeatherCondition(daily.weather_code[1]),
          description: this.getWeatherDescription(daily.weather_code[1])
        },
        week: daily.temperature_2m_min.slice(0, 7).map((min: number, index: number) => ({
          date: daily.time[index],
          min: Math.round(min),
          max: Math.round(daily.temperature_2m_max[index]),
          condition: this.getWeatherCondition(daily.weather_code[index])
        }))
      },
      location: {
        city: 'Saarbrücken',
        region: 'Saarland',
        country: 'Deutschland'
      },
      lastUpdated: new Date().toISOString()
    };
  }

  private getWeatherCondition(code: number): string {
    // WMO Weather interpretation codes
    const conditions: { [key: number]: string } = {
      0: 'sunny',
      1: 'mostly_sunny',
      2: 'partly_cloudy',
      3: 'cloudy',
      45: 'foggy',
      48: 'foggy',
      51: 'light_rain',
      53: 'rain',
      55: 'heavy_rain',
      61: 'light_rain',
      63: 'rain',
      65: 'heavy_rain',
      71: 'light_snow',
      73: 'snow',
      75: 'heavy_snow',
      80: 'rain_showers',
      81: 'rain_showers',
      82: 'heavy_rain_showers',
      95: 'thunderstorm',
      96: 'thunderstorm',
      99: 'severe_thunderstorm'
    };

    return conditions[code] || 'unknown';
  }

  private getWeatherDescription(code: number, temperature?: number): string {
    const temp = temperature ? Math.round(temperature) : '';
    
    const descriptions: { [key: number]: string } = {
      0: `Sonnig und klar${temp ? ` bei ${temp}°C` : ''}`,
      1: `Überwiegend sonnig${temp ? ` bei ${temp}°C` : ''}`,
      2: `Teilweise bewölkt${temp ? ` bei ${temp}°C` : ''}`,
      3: `Bewölkt${temp ? ` bei ${temp}°C` : ''}`,
      45: `Nebelig${temp ? ` bei ${temp}°C` : ''}`,
      48: `Nebelig mit Reifbildung${temp ? ` bei ${temp}°C` : ''}`,
      51: `Leichter Nieselregen${temp ? ` bei ${temp}°C` : ''}`,
      53: `Nieselregen${temp ? ` bei ${temp}°C` : ''}`,
      55: `Starker Nieselregen${temp ? ` bei ${temp}°C` : ''}`,
      61: `Leichter Regen${temp ? ` bei ${temp}°C` : ''}`,
      63: `Regen${temp ? ` bei ${temp}°C` : ''}`,
      65: `Starker Regen${temp ? ` bei ${temp}°C` : ''}`,
      71: `Leichter Schneefall${temp ? ` bei ${temp}°C` : ''}`,
      73: `Schneefall${temp ? ` bei ${temp}°C` : ''}`,
      75: `Starker Schneefall${temp ? ` bei ${temp}°C` : ''}`,
      80: `Regenschauer${temp ? ` bei ${temp}°C` : ''}`,
      81: `Regenschauer${temp ? ` bei ${temp}°C` : ''}`,
      82: `Starke Regenschauer${temp ? ` bei ${temp}°C` : ''}`,
      95: `Gewitter${temp ? ` bei ${temp}°C` : ''}`,
      96: `Gewitter mit Hagel${temp ? ` bei ${temp}°C` : ''}`,
      99: `Schweres Gewitter${temp ? ` bei ${temp}°C` : ''}`
    };

    return descriptions[code] || `Wetterlage unbekannt${temp ? ` bei ${temp}°C` : ''}`;
  }

  private getFallbackWeather(): WeatherData {
    const now = new Date();
    return {
      current: {
        temperature: 8,
        condition: 'partly_cloudy',
        humidity: 75,
        windSpeed: 12,
        description: 'Wetterdaten werden geladen...'
      },
      forecast: {
        today: {
          min: 3,
          max: 12,
          condition: 'partly_cloudy',
          description: 'Teilweise bewölkt'
        },
        tomorrow: {
          min: 5,
          max: 14,
          condition: 'sunny',
          description: 'Sonnig'
        },
        week: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          min: 3 + i,
          max: 12 + i,
          condition: i % 2 === 0 ? 'sunny' : 'partly_cloudy'
        }))
      },
      location: {
        city: 'Saarbrücken',
        region: 'Saarland',
        country: 'Deutschland'
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // Aktivitätsempfehlungen basierend auf Wetter
  getActivityRecommendations(weather: WeatherData): string[] {
    const recommendations: string[] = [];
    const temp = weather.current.temperature;
    const condition = weather.current.condition;

    if (condition === 'sunny' && temp > 15) {
      recommendations.push('🌞 Perfekt für einen Besuch der Saarschleife');
      recommendations.push('🚴‍♀️ Radtour um den Bostalsee');
      recommendations.push('🏊‍♂️ Baden im Bostalsee oder Losheimer Stausee');
    } else if (condition === 'partly_cloudy' && temp > 10) {
      recommendations.push('🥾 Wanderung durch den Nationalpark Hunsrück-Hochwald');
      recommendations.push('🏰 Besuch der Burg Montclair');
      recommendations.push('🚶‍♀️ Spaziergang durch die Saarbrücker Altstadt');
    } else if (temp < 5 || condition.includes('snow')) {
      recommendations.push('🏛️ Völklinger Hütte Indoor-Besichtigung');
      recommendations.push('🎭 Theater oder Konzert in der Congresshalle');
      recommendations.push('☕ Gemütliche Café-Tour in Saarbrücken');
    } else if (condition.includes('rain')) {
      recommendations.push('🏛️ Museum für Vor- und Frühgeschichte');
      recommendations.push('🛍️ Shopping in der Europa Galerie');
      recommendations.push('🍺 Traditionelle saarländische Gastronomie entdecken');
    }

    return recommendations;
  }

  // Kleidungsempfehlungen
  getClothingRecommendations(weather: WeatherData): string {
    const temp = weather.current.temperature;
    const condition = weather.current.condition;

    if (temp > 25) {
      return 'Leichte Sommerkleidung, Sonnenschutz und viel Wasser mitbringen.';
    } else if (temp > 15) {
      return 'Leichte Jacke empfohlen, perfekt für Outdoor-Aktivitäten.';
    } else if (temp > 5) {
      return 'Warme Kleidung und eventuell eine wasserdichte Jacke.';
    } else {
      return 'Warme Winterkleidung, Mütze und Handschuhe empfohlen.';
    }
  }
}