# AGENTLAND.SAARLAND Entwicklungsleitfaden

## 🚀 MVP Features

Das MVP (Minimum Viable Product) bietet:

### ✅ Implementierte Features

1. **Multi-Agenten-Architektur**
   - NavigatorAgent als zentraler Orchestrator
   - Basis-Framework für spezialisierte Agenten
   - Chain-of-Thought Transparenz

2. **Moderne Tech-Stack**
   - Next.js 14 Frontend mit TypeScript
   - FastAPI Backend mit async/await
   - PostgreSQL mit pgvector für Vektor-Speicherung
   - Docker-basierte Entwicklungsumgebung

3. **Regionale Identität**
   - Saarland-spezifisches Branding
   - Mehrsprachige Unterstützung (DE/FR/EN)
   - Regionale Datenintegration vorbereitet

4. **Benutzeroberfläche**
   - Responsive Landing Page
   - Chat-Interface für Agenten-Interaktion
   - Brand-konforme UI-Komponenten

5. **API & Authentifizierung**
   - RESTful API mit OpenAPI Dokumentation
   - JWT-basierte Authentifizierung
   - Benutzer-Management Endpoints

## 🔧 Entwicklungsumgebung einrichten

### Voraussetzungen

- Node.js >= 18.0.0
- Python >= 3.11
- Docker & Docker Compose
- pnpm (empfohlen) oder npm

### Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/agentland-saarland/platform.git
cd agentland-saarland

# 2. Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeiten Sie .env und fügen Sie Ihre API-Keys ein

# 3. Services starten
./launch.sh

# Alternative: Manueller Start
docker-compose up -d
```

### Lokale Entwicklung ohne Docker

#### Frontend (Next.js)
```bash
cd apps/web
pnpm install
pnpm dev
# Läuft auf http://localhost:3000
```

#### Backend (FastAPI)
```bash
cd apps/api
poetry install
poetry run uvicorn app.main:app --reload
# Läuft auf http://localhost:8000
```

## 📁 Projektstruktur

```
agentland-saarland/
├── apps/
│   ├── web/              # Next.js Frontend
│   ├── api/              # FastAPI Backend  
│   └── agents/           # KI-Agenten Services (TODO)
├── packages/
│   ├── ui/               # Gemeinsame UI-Komponenten (TODO)
│   ├── database/         # DB Schema & Migrationen (TODO)
│   ├── shared/           # Gemeinsame Typen & Utils (TODO)
│   └── agents-sdk/       # Agenten-SDK (TODO)
└── infrastructure/
    └── docker/           # Docker Konfigurationen
```

## 🏗️ Nächste Entwicklungsschritte

### Phase 1: Core Features (1-2 Wochen)
- [ ] Spezialisierte Agenten implementieren (Tourismus, Verwaltung)
- [ ] Vector Store Integration für RAG
- [ ] Echtzeit-Updates mit WebSockets
- [ ] Verbesserte Error Handling

### Phase 2: Erweiterte Features (2-3 Wochen)
- [ ] Sprachmodell-Integration (Claude/GPT)
- [ ] Regionale Datenquellen anbinden
- [ ] Erweiterte Authentifizierung (OAuth, SAML)
- [ ] Admin-Dashboard

### Phase 3: Production-Ready (3-4 Wochen)
- [ ] Monitoring & Logging (Prometheus, Grafana)
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Kubernetes Deployment
- [ ] Performance Optimierung
- [ ] Sicherheits-Audit

## 🧪 Testing

### Unit Tests
```bash
# Frontend
cd apps/web && pnpm test

# Backend
cd apps/api && poetry run pytest
```

### E2E Tests
```bash
# TODO: Cypress oder Playwright Setup
```

## 🔐 Sicherheit

- Alle API-Endpoints sind durch JWT gesichert
- CORS ist konfiguriert für erlaubte Origins
- Passwörter werden mit bcrypt gehasht
- Environment-Variablen für sensitive Daten

## 🌐 Deployment

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes (Coming Soon)
```bash
kubectl apply -f infrastructure/k8s/
```

## 🤝 Beitragen

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📚 Weitere Ressourcen

- [Brand Guidelines](./brand-book.md)
- [Entwicklungsrichtlinien](./agentland-saarland-rules.md)
- [API Dokumentation](http://localhost:8000/api/docs)
- [TypeScript Style Guide](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)

## 🆘 Hilfe & Support

- GitHub Issues: [github.com/agentland-saarland/platform/issues](https://github.com/agentland-saarland/platform/issues)
- E-Mail: dev@agentland.saarland
- Community Chat: [Discord/Slack Link]

---

**Von Entwicklern für Entwickler - Made with ❤️ im Saarland**