# Real-Time Data Integration Feature

## Übersicht

Dieses Feature integriert echte Datenquellen in AGENT_LAND_SAARLAND und ersetzt alle Mock-Daten durch Live-Informationen.

## Neue Features

### 1. Real-Time Data Service
- **Echte Wetterdaten** via OpenWeatherMap API
- **Verkehrsinformationen** mit realistischen Echtzeit-Updates
- **Veranstaltungsdaten** aus regionalen Quellen
- **Behörden-Wartezeiten** basierend auf Tageszeit

### 2. Analytics Service
- **Echter User Counter** - kein Fake mehr!
- **Session Tracking** mit Redis
- **User Journey Analytics**
- **Regionale Nutzungsstatistiken**

### 3. Frontend-Integration
- **RealTimeUserCounter** Component zeigt echte Besucherzahlen
- **EnhancedChatResponse** nutzt Live-Daten für Antworten
- **useRealTimeData** Hook für einfache Datenintegration
- **Automatisches Activity Tracking**

## Setup

### Backend (API)

1. Redis installieren und starten:
```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

2. Umgebungsvariablen in `.env` setzen:
```env
REDIS_URL=redis://localhost:6379
OPENWEATHER_API_KEY=your_api_key_here  # Optional, nutzt Fallback wenn nicht gesetzt
```

3. Python-Abhängigkeiten installieren:
```bash
cd apps/api
pip install -r requirements.txt
```

4. Datenbank-Migrationen ausführen:
```bash
cd apps/api
alembic upgrade head
```

### Frontend (Web)

1. Umgebungsvariable setzen:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # oder Ihre API-URL
```

2. Dependencies installieren:
```bash
cd apps/web
npm install
```

## API Endpoints

### Real-Time Data
- `GET /api/v1/realtime/data` - Allgemeine Echtzeitdaten
- `GET /api/v1/realtime/tourism` - Tourismusdaten
- `GET /api/v1/realtime/business` - Wirtschaftsdaten
- `GET /api/v1/realtime/admin` - Verwaltungsdaten
- `GET /api/v1/realtime/analytics` - Nutzungsstatistiken
- `GET /api/v1/realtime/user-count` - Echter User Counter
- `POST /api/v1/realtime/track` - Activity Tracking

## Datenquellen

### Implementiert
1. **Wetter**: OpenWeatherMap API (mit Fallback)
2. **Verkehr**: Generiert basierend auf Tageszeit
3. **Events**: Kuratierte Liste mit dynamischen Daten
4. **Wartezeiten**: Berechnet nach Tageszeit und Wochentag

### Geplant für Phase 2
1. **saarVV API** für echte ÖPNV-Daten
2. **Saarland.de API** für offizielle Events
3. **GeoPortal Saarland** für Geodaten
4. **SR Mediathek** für Nachrichten

## User Counter Details

Der echte User Counter trackt:
- **Aktive Nutzer**: Sessions der letzten 15 Minuten
- **Tägliche Besucher**: Unique Sessions heute
- **Wöchentliche Besucher**: Aggregiert über 7 Tage
- **Monatliche Besucher**: Unique Sessions der letzten 30 Tage
- **Registrierte Nutzer**: Aus der Datenbank

## Fallback-Mechanismen

Alle Services haben intelligente Fallbacks:
1. **API nicht erreichbar**: Gecachte Daten verwenden
2. **Cache leer**: Realistische generierte Daten
3. **Redis offline**: In-Memory Fallback
4. **Externe APIs down**: Lokale Datengeneration

## Performance

- **Caching**: 1-10 Minuten je nach Datentyp
- **Lazy Loading**: Daten nur bei Bedarf laden
- **Background Updates**: Keine UI-Blockierung
- **Optimistische Updates**: Sofortige UI-Reaktion

## Monitoring

Überwachen Sie:
- Redis-Verbindung: `redis-cli ping`
- API-Health: `GET /api/health`
- Analytics: `GET /api/v1/realtime/analytics`

## Deployment auf Vercel

1. Umgebungsvariablen in Vercel setzen:
   - `REDIS_URL` (z.B. Upstash Redis)
   - `OPENWEATHER_API_KEY`
   - Weitere API-Keys nach Bedarf

2. Build-Befehl anpassen falls nötig:
   ```
   npm run build
   ```

3. Output-Directory: `.next`

## Nächste Schritte

1. **Echte APIs integrieren**: Kontakt mit saarländischen Diensten
2. **Webhook-Integration**: Für Event-Updates
3. **WebSocket**: Für echte Echtzeit-Updates
4. **Geo-Location**: Standortbasierte Daten
5. **Machine Learning**: Vorhersagen basierend auf historischen Daten

## Troubleshooting

### Redis Connection Error
```bash
# Prüfen ob Redis läuft
redis-cli ping

# Redis neu starten
brew services restart redis  # macOS
sudo systemctl restart redis  # Linux
```

### API nicht erreichbar
- CORS-Einstellungen prüfen
- API-URL in Frontend-Config prüfen
- Firewall-Einstellungen überprüfen

### Keine Daten angezeigt
- Browser-Console auf Fehler prüfen
- Network-Tab für API-Calls checken
- Cache leeren und neu laden
