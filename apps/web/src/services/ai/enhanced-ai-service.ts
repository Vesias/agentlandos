interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class EnhancedAIService {
  private deepseekApiKey: string
  private openaiApiKey: string

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || ''
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
  }

  private getSaarlandSystemPrompt(category: string): string {
    const basePrompt = `Du bist SAAR-GPT, der intelligente KI-Assistent für das Saarland. Du hilfst mit lokalen Informationen, Services und Dienstleistungen.

DEINE AUFGABE:
- Beantworte Fragen über das Saarland sachlich und hilfreich
- Gib konkrete, praktische Informationen
- Verwende aktuelle Daten wenn möglich
- Sei freundlich und professionell

SAARLAND WISSEN:
- Das Saarland hat 52 Gemeinden, Hauptstadt Saarbrücken
- Wichtige Städte: Saarbrücken, Neunkirchen, Homburg, Völklingen, Saarlouis
- Wahrzeichen: Saarschleife bei Mettlach, Völklinger Hütte (UNESCO)
- Grenzregion zu Frankreich und Luxemburg
- 1. FC Saarbrücken (3. Liga), SV Elversberg (2. Bundesliga)
- Bostalsee, Deutsch-Französischer Garten, Saarbrücker Zoo

KATEGORIE: ${category}

Antworte immer auf Deutsch und bleibe beim Thema Saarland.`

    return basePrompt
  }

  private async callDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
    try {
      if (!this.deepseekApiKey) {
        throw new Error('DeepSeek API key not configured')
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner-r1-0528',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DeepSeek API Error:', response.status, errorText)
        throw new Error(`DeepSeek API Error: ${response.status}`)
      }

      const data: DeepSeekResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from DeepSeek')
      }

      return data.choices[0].message.content || 'Keine Antwort erhalten.'
    } catch (error) {
      console.error('DeepSeek Error:', error)
      throw error
    }
  }

  async processQuery(
    prompt: string,
    mode: "chat" | "artifact",
    category: string,
    context?: any,
  ) {
    try {
      const systemPrompt = this.getSaarlandSystemPrompt(category)
      const messages: DeepSeekMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]

      const response = await this.callDeepSeek(messages)
      
      return { 
        response,
        success: true,
        model: 'deepseek-reasoner-r1-0528',
        category,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Enhanced AI Service Error:', error)
      
      // Fallback response for Saarland queries
      return {
        response: this.getSaarlandFallbackResponse(prompt, category),
        success: false,
        model: 'fallback',
        category,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private getSaarlandFallbackResponse(prompt: string, category: string): string {
    const keywords = prompt.toLowerCase()
    
    if (keywords.includes('wetter') || keywords.includes('temperatur')) {
      return `🌤️ Wetter im Saarland:
      
Das aktuelle Wetter kann ich momentan nicht abrufen. Für aktuelle Wetterdaten empfehle ich:
• SR Wetter: sr.de/wetter
• Deutscher Wetterdienst: dwd.de
• Wetter.de Saarland

Kann ich Ihnen bei etwas anderem helfen?`
    }
    
    if (keywords.includes('agentland') || keywords.includes('lohnt sich')) {
      return `🚀 AGENTLAND.SAARLAND lohnt sich definitiv!

**WAS MACHT UNS BESONDERS:**
• Erste KI-Agentur-Plattform im Saarland
• Modernste AI-Technologie (DeepSeek R1 + Gemini)
• Lokale Saarland-Expertise mit globaler KI-Power
• Premium Services ab €10/Monat

**FÜR UNTERNEHMEN:**
• 40-70% Kosteneinsparung durch KI-Automatisierung
• Prozessoptimierung mit speziellen Saarland-Agenten
• Cross-Border Services (DE/FR/LU)

**FÜR PRIVATNUTZER:**
• SAAR-GPT Chat mit lokalen Informationen
• Behördenfinder & Services
• Tourismus & Freizeit-Tipps
• Community Features (SAARBRETT)

Probieren Sie es kostenlos aus!`
    }
    
    if (keywords.includes('hey') || keywords.includes('hallo') || keywords.includes('hi')) {
      return `👋 Hallo! Willkommen bei SAAR-GPT!

Ich bin Ihr KI-Assistent für das Saarland und helfe gerne bei:

🌤️ **Wetter & Klima**
🏛️ **Behörden & Services**  
🎓 **Bildung & Nachhilfe**
⚽ **Sport & Vereine**
🏞️ **Tourismus & Freizeit**
💼 **Business & Förderung**

**Einfach fragen!** Zum Beispiel:
• "Wie ist das Wetter heute?"
• "Wo finde ich Nachhilfe in Saarbrücken?"
• "Was kann man am Bostalsee machen?"
• "Welche Behörden gibt es in Saarlouis?"

Was interessiert Sie?`
    }
    
    return `🤖 SAAR-GPT für das Saarland

Ich helfe Ihnen gerne mit Informationen über:
• Wetter & Klima
• Behörden & Services
• Bildung & Weiterbildung
• Sport & Vereine
• Tourismus & Freizeit
• Business & Wirtschaftsförderung

Die KI-Verbindung ist momentan eingeschränkt, aber ich kann trotzdem bei vielen Saarland-Themen helfen.

Stellen Sie einfach Ihre Frage!`
  }

  async ragQuery(prompt: string, options: { category: string }) {
    return this.processQuery(prompt, "chat", options.category);
  }
}

export const enhancedAI = new EnhancedAIService();
