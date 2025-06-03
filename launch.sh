#!/bin/bash

# AGENTLAND.SAARLAND Launch Script
echo "🚀 Starte AGENTLAND.SAARLAND..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Erstelle .env Datei..."
    cp .env.example .env
    echo "⚠️  Bitte konfigurieren Sie die .env Datei mit Ihren API-Schlüsseln!"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert. Bitte installieren Sie Docker Desktop."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert. Bitte installieren Sie Docker Compose."
    exit 1
fi

# Start services
echo "🐳 Starte Docker Container..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Warte auf Services..."
sleep 10

# Check health
echo "🏥 Prüfe Service-Status..."
curl -s http://localhost:8000/api/health || echo "⚠️  API noch nicht bereit"
curl -s http://localhost:3000 || echo "⚠️  Frontend noch nicht bereit"

echo ""
echo "✅ AGENTLAND.SAARLAND ist gestartet!"
echo ""
echo "📍 Zugänge:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/api/docs"
echo "   Adminer:  http://localhost:8080"
echo ""
echo "🔑 Demo-Login:"
echo "   Username: demo"
echo "   Password: saarland2024"
echo ""
echo "💡 Zum Stoppen: docker-compose down"
echo ""