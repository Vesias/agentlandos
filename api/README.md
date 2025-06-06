# AGENT_LAND_SAARLAND API Functions

Diese Vercel Serverless Functions bilden das Backend für AGENT_LAND_SAARLAND.

## Verfügbare Endpoints

### `/api/health`
- **Methode**: GET
- **Beschreibung**: Health-Check Endpoint
- **Response**: `{"status": "healthy", "service": "AGENT_LAND_SAARLAND"}`

### `/api/saartasks`
- **Methode**: GET, POST
- **Beschreibung**: Task-Management für saarländische Agenten
- **Features**: 
  - Task-Erstellung
  - Status-Updates
  - Priorisierung

### `/api/saarag`
- **Methode**: POST
- **Beschreibung**: RAG-System für saarländisches Wissen
- **Features**:
  - Semantische Suche
  - Kontextbasierte Antworten
  - Multilinguale Unterstützung (DE/FR)

## Deployment

Diese Funktionen werden automatisch von Vercel als Serverless Functions deployed.
