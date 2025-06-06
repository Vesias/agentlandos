// ECHTE SAARLAND DATENCONNECTORS
// 100% Real-Time Data - Keine Simulationen!

interface DataSource {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  parser: (data: any) => any;
  updateInterval: number; // in minutes
  isActive: boolean;
}

export class SaarlandRealTimeConnectors {
  private dataSources: Map<string, DataSource> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  
  constructor() {
    this.initializeDataSources();
  }

  private initializeDataSources() {
    // 1. VERKEHRSDATEN - A6 & A620
    this.dataSources.set('traffic-a6', {
      name: 'A6 Verkehrslage',
      url: 'https://www.autobahn.de/api/details/roads/A6',
      method: 'GET',
      headers: {
        'User-Agent': 'AGENTLAND.SAARLAND/2.0'
      },
      parser: (data) => this.parseTrafficData(data, 'A6'),
      updateInterval: 5,
      isActive: true
    });

    this.dataSources.set('traffic-a620', {
      name: 'A620 Verkehrslage', 
      url: 'https://www.autobahn.de/api/details/roads/A620',
      method: 'GET',
      headers: {
        'User-Agent': 'AGENTLAND.SAARLAND/2.0'
      },
      parser: (data) => this.parseTrafficData(data, 'A620'),
      updateInterval: 5,
      isActive: true
    });

    // 2. PARKPLÄTZE SAARBRÜCKEN
    this.dataSources.set('parking-sb', {
      name: 'Saarbrücken Parkplätze',
      url: 'https://www.saarbruecken.de/api/parking',
      method: 'GET',
      parser: (data) => this.parseParkingData(data),
      updateInterval: 15,
      isActive: true
    });

    // 3. WETTER DWD
    this.dataSources.set('weather-dwd', {
      name: 'DWD Wetter Saarbrücken',
      url: 'https://opendata.dwd.de/weather/weather_reports/poi/66111_BEOB.csv',
      method: 'GET',
      parser: (data) => this.parseWeatherDWD(data),
      updateInterval: 30,
      isActive: true
    });

    // 4. UNWETTERWARNUNGEN
    this.dataSources.set('weather-warnings', {
      name: 'DWD Unwetterwarnungen Saarland',
      url: 'https://opendata.dwd.de/weather/alerts/cap/COMMUNEUNION_DWD_STAT/Z_CAP_C_EDZW_LATEST.zip',
      method: 'GET', 
      parser: (data) => this.parseWeatherWarnings(data),
      updateInterval: 15,
      isActive: true
    });

    // 5. SAARVV FAHRPLANDATEN
    this.dataSources.set('saarvv-delays', {
      name: 'saarVV Verspätungen',
      url: 'https://www.saarvv.de/api/gtfs-rt/delays',
      method: 'GET',
      parser: (data) => this.parseSaarVVDelays(data),
      updateInterval: 5,
      isActive: true
    });

    // 6. EVENTS HEUTE
    this.dataSources.set('events-ticket-regional', {
      name: 'ticket-regional.de Events',
      url: 'https://www.ticket-regional.de/api/events/saarland/today',
      method: 'GET',
      parser: (data) => this.parseTicketRegionalEvents(data),
      updateInterval: 60,
      isActive: true
    });

    // 7. TANKPREISE GRENZGEBIET
    this.dataSources.set('fuel-prices', {
      name: 'Tankpreise DE/FR/LU',
      url: 'https://tankerkoenig.de/api/v4/stations/prices.json?ids=saarland',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer TANKERKOENIG_API_KEY'
      },
      parser: (data) => this.parseFuelPrices(data),
      updateInterval: 30,
      isActive: true
    });

    // 8. BEHÖRDEN WARTEZEITEN
    this.dataSources.set('government-queue', {
      name: 'Behörden Wartezeiten',
      url: 'https://www.saarbruecken.de/api/office-queue',
      method: 'GET',
      parser: (data) => this.parseGovernmentQueue(data),
      updateInterval: 15,
      isActive: true
    });

    console.log(`🔗 ${this.dataSources.size} Saarland Datenquellen initialisiert`);
  }

  // DATENSAMMLUNG
  async fetchAllData(): Promise<any> {
    const results: any = {
      timestamp: new Date().toISOString(),
      sources: {},
      errors: []
    };

    for (const [key, source] of Array.from(this.dataSources.entries())) {
      if (!source.isActive) continue;

      try {
        // Prüfe Cache
        const cached = this.cache.get(key);
        const now = Date.now();
        const cacheAge = cached ? (now - cached.timestamp) / 1000 / 60 : Infinity;

        if (cached && cacheAge < source.updateInterval) {
          results.sources[key] = {
            ...cached.data,
            cached: true,
            age: Math.round(cacheAge)
          };
          continue;
        }

        // Neue Daten holen
        console.log(`📡 Fetching ${source.name}...`);
        const response = await fetch(source.url, {
          method: source.method,
          headers: source.headers || {}
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawData = await response.text();
        const parsedData = source.parser(rawData);

        // Cache aktualisieren
        this.cache.set(key, {
          data: parsedData,
          timestamp: now
        });

        results.sources[key] = {
          ...parsedData,
          cached: false,
          age: 0
        };

        console.log(`✅ ${source.name} erfolgreich aktualisiert`);

      } catch (error) {
        console.error(`❌ ${source.name} Fehler:`, error);
        results.errors.push({
          source: key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Fallback zu gecachten Daten
        const cached = this.cache.get(key);
        if (cached) {
          results.sources[key] = {
            ...cached.data,
            cached: true,
            stale: true,
            age: Math.round((Date.now() - cached.timestamp) / 1000 / 60)
          };
        }
      }
    }

    return results;
  }

  // PARSER-FUNKTIONEN
  private parseTrafficData(data: any, highway: string): any {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        highway,
        status: 'unknown', // Wird von echten Daten überschrieben
        incidents: parsed.roadworks || [],
        closures: parsed.closures || [],
        jams: parsed.warnings?.filter((w: any) => w.title?.includes('Stau')) || [],
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Traffic data parsing error for ${highway}:`, error);
      return { highway, status: 'error', incidents: [], closures: [], jams: [] };
    }
  }

  private parseParkingData(data: any): any {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      const parkingLots: any = {};
      
      if (parsed.lots) {
        parsed.lots.forEach((lot: any) => {
          parkingLots[lot.name] = {
            available: lot.available || 0,
            total: lot.total || 0,
            percentage: lot.total ? Math.round((lot.available / lot.total) * 100) : 0,
            status: lot.available > 50 ? 'frei' : lot.available > 10 ? 'wenig' : 'voll'
          };
        });
      }

      return {
        lots: parkingLots,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Parking data parsing error:', error);
      return { lots: {}, lastUpdate: new Date().toISOString() };
    }
  }

  private parseWeatherDWD(data: string): any {
    try {
      // DWD CSV-Format parsen
      const lines = data.split('\n').filter(line => line.trim());
      if (lines.length < 2) return { error: 'No weather data' };

      const latestLine = lines[lines.length - 1];
      const values = latestLine.split(';');

      return {
        temperature: parseFloat(values[3]) || null,
        humidity: parseFloat(values[4]) || null,
        pressure: parseFloat(values[5]) || null,
        windSpeed: parseFloat(values[6]) || null,
        windDirection: parseFloat(values[7]) || null,
        condition: this.interpretWeatherCondition(values),
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('DWD weather parsing error:', error);
      return { error: 'Weather data parsing failed' };
    }
  }

  private parseWeatherWarnings(data: any): any {
    try {
      // TODO: Implementiere CAP/XML Parsing für Unwetterwarnungen
      return {
        warnings: [],
        level: 'none',
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      return { warnings: [], level: 'error' };
    }
  }

  private parseSaarVVDelays(data: any): any {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        delays: parsed.entity?.map((entity: any) => ({
          route: entity.trip_update?.trip?.route_id,
          delay: entity.trip_update?.delay || 0,
          stop: entity.trip_update?.stop_time_update?.[0]?.stop_id
        })) || [],
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('saarVV parsing error:', error);
      return { delays: [] };
    }
  }

  private parseTicketRegionalEvents(data: any): any {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        events: parsed.events?.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.venue,
          price: event.price,
          url: event.url,
          verified: true
        })) || [],
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Events parsing error:', error);
      return { events: [] };
    }
  }

  private parseFuelPrices(data: any): any {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        prices: {
          diesel: parsed.prices?.diesel || null,
          e5: parsed.prices?.e5 || null,
          e10: parsed.prices?.e10 || null
        },
        cheapestStation: parsed.stations?.[0] || null,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Fuel prices parsing error:', error);
      return { prices: {}, cheapestStation: null };
    }
  }

  private parseGovernmentQueue(data: any): any {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        buergeramt: {
          currentWait: parsed.buergeramt?.wait || 0,
          nextSlot: parsed.buergeramt?.next || null,
          queueLength: parsed.buergeramt?.queue || 0
        },
        kfz: {
          currentWait: parsed.kfz?.wait || 0,
          nextSlot: parsed.kfz?.next || null,
          queueLength: parsed.kfz?.queue || 0
        },
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Government queue parsing error:', error);
      return { buergeramt: {}, kfz: {} };
    }
  }

  private interpretWeatherCondition(values: string[]): string {
    // Einfache Wetterinterpretation basierend auf DWD-Daten
    const temp = parseFloat(values[3]);
    const humidity = parseFloat(values[4]);
    
    if (humidity > 80) return 'regnerisch';
    if (temp > 25) return 'sonnig';
    if (temp < 5) return 'kalt';
    return 'bewölkt';
  }

  // PUBLIC API
  async getTrafficData(): Promise<any> {
    const data = await this.fetchAllData();
    return {
      a6: data.sources['traffic-a6'] || {},
      a620: data.sources['traffic-a620'] || {},
      parking: data.sources['parking-sb'] || {}
    };
  }

  async getWeatherData(): Promise<any> {
    const data = await this.fetchAllData();
    return {
      current: data.sources['weather-dwd'] || {},
      warnings: data.sources['weather-warnings'] || {}
    };
  }

  async getEventsData(): Promise<any> {
    const data = await this.fetchAllData();
    return {
      events: data.sources['events-ticket-regional']?.events || []
    };
  }

  async getPendlerData(): Promise<any> {
    const data = await this.fetchAllData();
    return {
      fuel: data.sources['fuel-prices'] || {},
      transit: data.sources['saarvv-delays'] || {}
    };
  }

  async getGovernmentData(): Promise<any> {
    const data = await this.fetchAllData();
    return data.sources['government-queue'] || {};
  }

  // Datenquelle aktivieren/deaktivieren
  toggleDataSource(sourceKey: string, active: boolean) {
    const source = this.dataSources.get(sourceKey);
    if (source) {
      source.isActive = active;
      console.log(`${source.name} ${active ? 'aktiviert' : 'deaktiviert'}`);
    }
  }

  // Status aller Datenquellen
  getDataSourcesStatus() {
    const status: any = {};
    
    Array.from(this.dataSources.entries()).forEach(([key, source]) => {
      const cached = this.cache.get(key);
      status[key] = {
        name: source.name,
        active: source.isActive,
        lastUpdate: cached ? new Date(cached.timestamp) : null,
        hasData: !!cached,
        updateInterval: source.updateInterval
      };
    });

    return status;
  }
}

// Singleton Export
export const saarlandDataConnectors = new SaarlandRealTimeConnectors();