#!/bin/bash

# AGENT_LAND_SAARLAND - Vercel Deployment Helper
# ==============================================

echo "🚀 AGENT_LAND_SAARLAND - Deployment Vorbereitung"
echo "=============================================="

# Schritt 1: Überprüfe Node.js Version
echo "📌 Überprüfe Node.js Version..."
node_version=$(node -v)
if [[ ! $node_version =~ ^v18\.|^v20\. ]]; then
    echo "❌ Node.js 18+ wird benötigt. Aktuelle Version: $node_version"
    exit 1
fi
echo "✅ Node.js Version: $node_version"

# Schritt 2: Installiere Dependencies
echo "📦 Installiere Dependencies..."
if command -v pnpm &> /dev/null; then
    echo "✅ Verwende pnpm..."
    pnpm install
else
    echo "⚠️  pnpm nicht gefunden, verwende npm..."
    npm install
fi

# Schritt 3: Erstelle .env Datei wenn nicht vorhanden
if [ ! -f .env ]; then
    echo "📝 Erstelle .env Datei..."
    cp .env.example .env
    echo "⚠️  Bitte fülle die .env Datei mit den korrekten Werten aus!"
fi

# Schritt 4: Build Test
echo "🔨 Teste Build-Prozess..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build erfolgreich!"
else
    echo "❌ Build fehlgeschlagen!"
    exit 1
fi

echo ""
echo "✨ Deployment-Vorbereitung abgeschlossen!"
echo ""
echo "Nächste Schritte:"
echo "1. Stelle sicher, dass alle Umgebungsvariablen in Vercel konfiguriert sind:"
echo "   - OPENAI_API_KEY"
echo "   - DEEPSEEK_API_KEY"
echo "   - DATABASE_URL (PostgreSQL)"
echo "   - REDIS_URL"
echo ""
echo "2. Deploye mit: npx vercel --prod"
echo ""
echo "🌟 Viel Erfolg mit AGENT_LAND_SAARLAND!"
