# AGENTLAND.SAARLAND 🚀

> Souveräne KI-Technologie aus dem Saarland – für ein intelligentes Morgen

## 🎯 Über das Projekt

AGENTLAND.SAARLAND ist eine innovative KI-Plattform, die modernste Agententechnologie mit regionaler Identität verbindet. Wir schaffen technische Souveränität durch lokale KI-Lösungen, die speziell auf die Bedürfnisse des Saarlandes zugeschnitten sind.

## 🏗️ Architektur

- **Multi-Agenten-System** mit spezialiserten Agenten für verschiedene Domänen
- **Technische Souveränität** durch lokale Datenhaltung und Verarbeitung
- **Regionale Integration** mit Anbindung an saarländische Datenquellen
- **Moderne Tech-Stack**: Next.js, FastAPI, PostgreSQL, LangChain

## 🚀 Schnellstart

### Voraussetzungen

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.11
- PostgreSQL >= 15
- Docker & Docker Compose

### Installation

```bash
# Repository klonen
git clone https://github.com/agentland-saarland/platform.git
cd agentland-saarland

# Dependencies installieren
pnpm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local

# Entwicklungsserver starten
pnpm dev
```

### Docker-Setup

```bash
# Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

## 📁 Projektstruktur

```
agentland-saarland/
├── apps/
│   ├── web/              # Next.js Frontend
│   ├── api/              # FastAPI Backend
│   └── agents/           # KI-Agenten Services
├── packages/
│   ├── ui/               # Gemeinsame UI-Komponenten
│   ├── database/         # Datenbankschema & Migrationen
│   ├── shared/           # Gemeinsame Typen & Utils
│   └── agents-sdk/       # Agenten-SDK
└── infrastructure/       # Docker & Deployment Configs
```

## 🤝 Mitwirken

Wir freuen uns über Beiträge! Bitte lesen Sie unsere [Entwicklungsrichtlinien](./agentland-saarland-rules.md) und [Brand Guidelines](./brand-book.md).

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz mit zusätzlichen Bedingungen für regionale Nutzung.

## 🌟 Features

- ✅ Mehrsprachige Unterstützung (DE, FR, Saarländisch)
- ✅ Privacy-by-Design & Ethics-by-Design
- ✅ Regionale Datenintegration
- ✅ Demokratische KI-Governance
- ✅ Barrierefreie Benutzeroberfläche

## 📞 Kontakt

- Website: [agentland.saarland](https://agentland.saarland)
- E-Mail: info@agentland.saarland
- GitHub: [@agentland-saarland](https://github.com/agentland-saarland)

---

**Von Saarbrücken in die Welt** 🌍