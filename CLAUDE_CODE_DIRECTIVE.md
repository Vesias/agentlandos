# CLAUDE CODE ANWEISUNG: agentland.saarland DeepSeek-R1 Integration

## SOFORTMASSNAHMEN FÜR PRODUKTIONSREIFE PLATTFORM

Du implementierst JETZT die Transformation von agentland.saarland mit DeepSeek-R1-0528. Die Recherche zeigt: 200.000 Grenzpendler brauchen ECHTE Lösungen, keine Demos.

## 1. DEEPSEEK-R1 CLIENT (HEUTE)

```bash
cd /Users/deepsleeping/agentlandos
pnpm add axios zod @types/node
```

Erstelle `/packages/deepseek-client/index.ts`:

```typescript
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

export class DeepSeekClient {
  private contextCache = new Map<string, any>();
  
  async reasoning(prompt: string, contextId?: string) {
    // Context Caching spart 74% Kosten!
    const cached = contextId ? this.contextCache.get(contextId) : null;
    
    const response = await axios.post(`${DEEPSEEK_API_URL}/chat/completions`, {
      model: 'deepseek-reasoner',
      messages: [{role: 'user', content: prompt}],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      ...(cached && { context: cached })
    });
    
    // Cache für nächste Anfrage
    if (contextId) {
      this.contextCache.set(contextId, response.data.context);
    }
    
    return {
      response: response.data.choices[0].message.content,
      reasoning: response.data.choices[0].reasoning_steps,
      cost: response.data.usage.total_tokens * 0.0014 / 1000 // $1.4/Million
    };
  }
}
```

## 2. KRITISCHE AGENTEN (TAG 1-3)

### NavigatorAgent - `/apps/agents/navigator.ts`
```typescript
export class NavigatorAgent {
  async route(query: string, language: 'de'|'fr'|'en' = 'de') {
    const intent = await this.deepseek.reasoning(
      `Analysiere: "${query}". Welcher Agent? 
       Optionen: grenzpendler, dokumente, termine, tourismus`
    );
    
    switch(intent.agent) {
      case 'grenzpendler': return this.crossBorderAgent.handle(query);
      case 'dokumente': return this.documentAgent.handle(query);
      // ...
    }
  }
}
```

### CrossBorderAgent - `/apps/agents/cross-border.ts`
```typescript
export class CrossBorderAgent {
  async calculateTax(income: number, workCountry: string, residenceCountry: string) {
    const prompt = `Berechne Steuern für Grenzpendler:
      Einkommen: ${income}€
      Arbeitsland: ${workCountry}
      Wohnland: ${residenceCountry}
      Berücksichtige Doppelbesteuerungsabkommen`;
    
    return await this.deepseek.reasoning(prompt, 'tax-calculation');
  }
}
```

## 3. ECHTZEIT-DATEN INTEGRATION

### API Endpoints - `/api/`

**realtime-transit.py**:
```python
async def handler(request):
    """saarVV Echtzeitdaten"""
    # Web Scraping da keine offene API
    transit_data = await scrape_saarvv(request.query.get('stop'))
    return {
        'departures': transit_data,
        'lastUpdate': datetime.now().isoformat()
    }
```

**geo-portal.py**:
```python
async def handler(request):
    """GeoPortal Saarland WMS Integration"""
    params = {
        'SERVICE': 'WFS',
        'VERSION': '2.0.0',
        'REQUEST': 'GetFeature',
        'TYPENAME': request.query.get('layer', 'administrative_boundaries')
    }
    return await fetch_geoportal(params)
```

## 4. FRONTEND KOMPONENTEN

### Haupt-Chat Interface - `/apps/web/src/components/AgentChat.tsx`
```tsx
export function AgentChat() {
  const [agent, setAgent] = useState('navigator');
  const [showCost, setShowCost] = useState(true);
  
  const sendMessage = async (text: string) => {
    const res = await fetch('/api/agent-chat', {
      method: 'POST',
      body: JSON.stringify({ 
        message: text, 
        agent, 
        language: localStorage.getItem('language') || 'de' 
      })
    });
    
    const data = await res.json();
    // Zeige Reasoning-Schritte transparent
    if (data.reasoning) {
      setReasoningSteps(data.reasoning);
    }
    
    // Kostenanzeige (wichtig für Transparenz!)
    setCost(prev => prev + data.cost);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <LanguageSelector />
      <Messages />
      <Input onSend={sendMessage} />
      {showCost && <CostTracker cost={cost} budget={100} />}
    </div>
  );
}
```

### Grenzpendler Dashboard - `/apps/web/src/components/CrossBorder.tsx`
```tsx
export function CrossBorderDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <TaxCalculator countries={['DE', 'LU', 'FR']} />
      <DoctorSearch crossBorder={true} />
      <ApostilleHelper />
      <EmergencyNumbers allCountries={true} />
    </div>
  );
}
```

## 5. RAG MIT QDRANT (TAG 4-5)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

```typescript
// /packages/rag/index.ts
import { QdrantClient } from '@qdrant/js-client';

export class SaarlandKnowledge {
  private qdrant = new QdrantClient({ url: 'http://localhost:6333' });
  
  async indexDocument(doc: Document) {
    const embedding = await this.embed(doc.content); // jina-embeddings-v2-base-de
    
    await this.qdrant.upsert('saarland-docs', {
      points: [{
        id: doc.id,
        vector: embedding,
        payload: {
          source: doc.source,
          language: doc.language,
          category: doc.category
        }
      }]
    });
  }
  
  async search(query: string, k = 5) {
    const queryEmbedding = await this.embed(query);
    return await this.qdrant.search('saarland-docs', {
      vector: queryEmbedding,
      limit: k
    });
  }
}
```

## 6. KRITISCHE ENV VARIABLEN

```env
# DeepSeek (PFLICHT!)
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_CONTEXT_CACHE=true

# Datenquellen
GEOPORTAL_URL=https://geoportal.saarland.de/mapbender/php/mod_inspireDownload.php
DWD_API_KEY=xxx # Wetter
BRIGHTSKY_API=https://api.brightsky.dev/

# DSGVO
DATA_RETENTION_DAYS=30
ENCRYPTION_KEY=xxx # AES-256
```

## 7. DEPLOYMENT CHECKLISTE

- [ ] DeepSeek API Key in Vercel Env
- [ ] Qdrant auf deutschem Server (Hetzner/IONOS)
- [ ] Redis Cache aktiviert
- [ ] CORS für grenzüberschreitende Nutzung
- [ ] Monitoring Dashboard (Kosten!)
- [ ] Fallback bei API-Ausfall

## METRIKEN DIE ZÄHLEN

1. **Kosteneffizienz**: <30€/Monat bei 10k Anfragen
2. **Performance**: <2 Sekunden Antwortzeit
3. **Adoption**: 40% der Saarländer in 2 Jahren
4. **Grenzpendler**: 60% Nutzung in 12 Monaten

## JETZT UMSETZEN!

```bash
# 1. Dependencies installieren
cd /Users/deepsleeping/agentlandos
pnpm install

# 2. DeepSeek Client bauen
mkdir -p packages/deepseek-client
# Code von oben einfügen

# 3. Agenten implementieren
mkdir -p apps/agents/src
# NavigatorAgent + CrossBorderAgent

# 4. Frontend updaten
cd apps/web
# Komponenten einbauen

# 5. Testen mit echten Daten!
pnpm dev
```

Die Plattform MUSS funktionieren. Keine Ausreden. Die 200.000 Grenzpendler warten!
