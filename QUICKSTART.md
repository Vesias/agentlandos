# AGENT_LAND_SAARLAND - Quick Setup Guide

## 🚀 Schnellstart

### 1. Dependencies installieren

```bash
# Im Hauptverzeichnis
chmod +x install-deps.sh
./install-deps.sh

# ODER manuell:
cd apps/web
npm install @radix-ui/react-tooltip framer-motion lucide-react clsx tailwind-merge
```

### 2. Einfache Chat-Version verwenden

Um Kompilierungsfehler zu vermeiden, können Sie die einfache Chat-Version verwenden:

```bash
# In apps/web/src/app/chat/page.tsx ersetzen Sie den Import:
import SimpleChatPage from './simple-page'
export default SimpleChatPage
```

### 3. Entwicklungsserver starten

```bash
# Frontend
cd apps/web
npm run dev

# Backend (in neuem Terminal)
cd apps/api
python -m uvicorn app.main:app --reload --port 8000
```

## 📦 Verfügbare Chat-Versionen

### 1. **Simple Chat** (`/chat/simple-page.tsx`)
- ✅ Keine zusätzlichen Dependencies
- ✅ Funktioniert sofort
- ✅ Demo-Responses
- ❌ Weniger Features

### 2. **Enhanced Chat** (`/components/ui/enhanced-chat.tsx`)
- ✅ Moderne UI mit Animationen
- ✅ Multi-Agent Support
- ✅ File Upload, Voice Input
- ❌ Benötigt zusätzliche Packages

## 🛠️ Fehlerbehebung

### "Cannot find module" Fehler

Installieren Sie die fehlenden Packages:

```bash
npm install --save-dev @tailwindcss/forms @tailwindcss/typography
# oder entfernen Sie diese aus tailwind.config.js
```

### Button/Card Komponenten fehlen

Die UI-Komponenten sind bereits im Projekt:
- `/components/ui/button.tsx`
- `/components/ui/card.tsx`
- `/components/ui/tooltip.tsx`

### API Connection Failed

Stellen Sie sicher, dass das Backend läuft:
```bash
cd apps/api
python -m uvicorn app.main:app --reload --port 8000
```

## 🎨 Anpassungen

### Farben ändern

In `tailwind.config.js`:
```javascript
colors: {
  'saarland-blue': '#003399',  // Ihre Farbe hier
  'warm-gold': '#FDB913',      // Ihre Farbe hier
}
```

### Neue Agenten hinzufügen

In `/api/app/api/agents_router.py`:
```python
MOCK_AGENTS = {
  "IhrAgent": {
    "name": "IhrAgent",
    "description": "Beschreibung",
    "capabilities": ["capability1", "capability2"],
    "status": "active",
    "language_support": ["de", "fr", "en"]
  }
}
```

## 📱 Features

### Implementiert
- ✅ Multi-linguale Unterstützung (DE, FR, EN, Saarländisch)
- ✅ Agent-basiertes Routing
- ✅ Quick Actions
- ✅ Responsive Design
- ✅ Demo-Modus

### Geplant
- 🔄 DeepSeek KI Integration
- 🔄 Datei-Upload
- 🔄 Spracheingabe
- 🔄 Persistente Konversationen
- 🔄 Benutzer-Authentifizierung

## 🤝 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Logs in der Browser-Konsole
2. Stellen Sie sicher, dass alle Dependencies installiert sind
3. Nutzen Sie die einfache Chat-Version als Fallback

---

**Viel Erfolg mit AGENT_LAND_SAARLAND!** 🚀