# CLAUDE CODE: agentland.saarland DeepSeek-R1 Integration

## AUSGANGSLAGE
- Ort: `/Users/deepsleeping/agentlandos`  
- Ziel: 200.000 Grenzpendler mit KI helfen
- Tool: DeepSeek-R1 (90% günstiger als GPT-4)

## SCHRITT 1: DeepSeek Client
```bash
mkdir -p packages/deepseek
```

Erstelle `packages/deepseek/index.ts` mit Context-Caching für 74% Kostenersparnis.

## SCHRITT 2: Kritische APIs
- `/api/grenzpendler.py` - Steuerberechnung DE/LU/FR
- `/api/echtzeit.py` - GeoPortal, saarVV, Wetter
- `/api/agent-chat.py` - Multi-Agent Koordination

## SCHRITT 3: Frontend
- `AgentChat.tsx` - Hauptinterface mit Kostentracking
- `GrenzpendlerDashboard.tsx` - Steuer, Ärzte, Dokumente
- Mehrsprachig: DE/FR/EN

## SCHRITT 4: Environment
```env
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_CACHE=true
GEOPORTAL_URL=https://geoportal.saarland.de
```

## SCHRITT 5: Deploy
```bash
pnpm build && npx vercel --prod
```

## ERFOLGSMETRIKEN
- <30€/Monat bei 10k Anfragen
- <2 Sekunden Antwortzeit
- 60% Grenzpendler-Adoption

Details siehe: IMPLEMENTATION_DETAILS.md
