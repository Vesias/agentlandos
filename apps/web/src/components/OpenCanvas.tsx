'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Send, 
  Download, 
  Copy, 
  Edit3, 
  Code, 
  FileText, 
  Wand2, 
  MoreHorizontal,
  Lightbulb,
  Zap,
  RefreshCw
} from 'lucide-react'

interface Artifact {
  id: string
  type: 'text' | 'code'
  title: string
  content: string
  language?: string
  created_at: number
  updated_at: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  artifact?: Artifact
  timestamp: number
}

interface OpenCanvasProps {
  initialPrompt?: string
  serviceCategory: 'tourism' | 'business' | 'education' | 'admin' | 'culture' | 'general'
  onArtifactGenerated?: (artifact: Artifact) => void
}

export default function OpenCanvas({ 
  initialPrompt = '', 
  serviceCategory, 
  onArtifactGenerated 
}: OpenCanvasProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState(initialPrompt)
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt)
    }
  }, [initialPrompt])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateArtifact = async (prompt: string, type: 'text' | 'code' = 'text'): Promise<Artifact> => {
    // Enhanced prompt based on service category
    const categoryContext = getCategoryContext(serviceCategory)
    const enhancedPrompt = `${categoryContext}\n\nUser Request: ${prompt}\n\nPlease generate ${type === 'code' ? 'functional code' : 'comprehensive content'} that specifically addresses Saarland context and requirements.`

    try {
      // Call our enhanced Canvas API
      const response = await fetch('/api/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          artifact_type: type,
          service_category: serviceCategory,
          context: categoryContext,
          language: 'de'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.content || generateFallbackContent(prompt, type, serviceCategory)
        
        return {
          id: Date.now().toString(),
          type,
          title: extractTitle(prompt, type) || `${type === 'code' ? 'Code' : 'Document'} - ${serviceCategory}`,
          content,
          language: type === 'code' ? detectLanguage(content) : undefined,
          created_at: Date.now(),
          updated_at: Date.now()
        }
      } else {
        throw new Error('DeepSeek API not available')
      }
    } catch (error) {
      console.error('Artifact generation error:', error)
      
      // Enhanced fallback with category-specific content
      const content = generateFallbackContent(prompt, type, serviceCategory)
      return {
        id: Date.now().toString(),
        type,
        title: extractTitle(prompt, type) || `${type === 'code' ? 'Code' : 'Document'} - ${serviceCategory}`,
        content,
        language: type === 'code' ? detectLanguage(content) : undefined,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    }
  }

  const getCategoryContext = (category: string): string => {
    const contexts = {
      tourism: 'SAARLAND TOURISM CONTEXT: Erstelle Inhalte für Saarland-Tourismus mit Fokus auf Saarschleife, Völklinger Hütte, Bostalsee, grenzüberschreitende Angebote zu Frankreich/Luxemburg, lokale Events und authentische Saarland-Erlebnisse.',
      business: 'SAARLAND BUSINESS CONTEXT: Fokussiere auf Saarland-Wirtschaft, KI-Förderungen, Cross-Border-Business DE/FR/LU, IHK Saarland Services, Startup-Ökosystem, Industrie 4.0 und regionale Wirtschaftsförderung.',
      education: 'SAARLAND BILDUNG CONTEXT: Erstelle Bildungsinhalte für Universität des Saarlandes, Hochschule für Technik und Wirtschaft, DFKI, KI-Studiengänge, grenzüberschreitende Bildungsprogramme und Weiterbildungsangebote.',
      admin: 'SAARLAND VERWALTUNG CONTEXT: Fokussiere auf Behördenservices, Bürgerdienste, Online-Anträge, Saarland-spezifische Verwaltungsprozesse und digitale Transformation der öffentlichen Verwaltung.',
      culture: 'SAARLAND KULTUR CONTEXT: Erstelle Kulturinhalte zu saarländischen Traditionen, Festivals, Musik, Theater, Museen, kulturelle Events und das einzigartige saarländische Kulturerbe.',
      general: 'SAARLAND ALLGEMEIN CONTEXT: Allgemeine Saarland-Informationen mit Fokus auf regionale Besonderheiten, Lebensqualität und Services für Bürger und Besucher.'
    }
    return contexts[category] || contexts.general
  }

  const generateFallbackContent = (prompt: string, type: 'text' | 'code', category: string): string => {
    if (type === 'code') {
      return generateCodeFallback(prompt, category)
    } else {
      return generateTextFallback(prompt, category)
    }
  }

  const generateCodeFallback = (prompt: string, category: string): string => {
    const keywords = prompt.toLowerCase()
    
    if (keywords.includes('react') || keywords.includes('component')) {
      return `import React, { useState } from 'react'

interface ${category.charAt(0).toUpperCase() + category.slice(1)}ComponentProps {
  title: string
  data?: any[]
}

export default function ${category.charAt(0).toUpperCase() + category.slice(1)}Component({ 
  title, 
  data = [] 
}: ${category.charAt(0).toUpperCase() + category.slice(1)}ComponentProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#003399' }}>
        {title}
      </h2>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded">
            <h3 className="font-semibold">{item.name || 'Saarland Service'}</h3>
            <p className="text-gray-600">{item.description || 'Beschreibung für ${category} Service'}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          style={{ backgroundColor: '#003399' }}
          onClick={() => setIsLoading(!isLoading)}
        >
          {isLoading ? 'Lädt...' : 'Saarland ${category.charAt(0).toUpperCase() + category.slice(1)} Action'}
        </button>
      </div>
    </div>
  )
}`
    }

    if (keywords.includes('python') || keywords.includes('api')) {
      return `#!/usr/bin/env python3
"""
Saarland ${category.charAt(0).toUpperCase() + category.slice(1)} API Service
Entwickelt für agentland.saarland
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional

class Saarland${category.charAt(0).toUpperCase() + category.slice(1)}Service:
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.base_url = "https://agentland.saarland/api"
    
    async def get_${category}_data(self, query: str) -> Dict:
        """Hole ${category}-spezifische Daten für das Saarland"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/${category}",
                params={"q": query, "region": "saarland"}
            ) as response:
                return await response.json()
    
    async def process_request(self, user_input: str) -> str:
        """Verarbeite Benutzeranfrage für ${category}"""
        # Enhanced processing for Saarland context
        data = await self.get_${category}_data(user_input)
        
        return f"Saarland ${category} Service Response: {data.get('result', 'Keine Daten verfügbar')}"

# Beispiel-Usage
async def main():
    service = Saarland${category.charAt(0).toUpperCase() + category.slice(1)}Service()
    result = await service.process_request("${prompt}")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())`
    }

    return `// Saarland ${category.charAt(0).toUpperCase() + category.slice(1)} Implementation
// Generated for: ${prompt}

const saarland${category.charAt(0).toUpperCase() + category.slice(1)}Config = {
  region: 'Saarland',
  language: 'de',
  services: [
    'Real-time data',
    'Cross-border integration',
    'AI-powered insights'
  ]
}

function process${category.charAt(0).toUpperCase() + category.slice(1)}Request(input) {
  const result = {
    query: input,
    region: 'Saarland',
    timestamp: new Date().toISOString(),
    data: generateSaarlandResponse(input)
  }
  
  return result
}

function generateSaarlandResponse(query) {
  // Enhanced ${category} processing for Saarland
  return \`Saarland ${category} service response for: \${query}\`
}

export { saarland${category.charAt(0).toUpperCase() + category.slice(1)}Config, process${category.charAt(0).toUpperCase() + category.slice(1)}Request }`
  }

  const generateTextFallback = (prompt: string, category: string): string => {
    const categoryTemplates = {
      tourism: `# Saarland Tourism Guide: ${extractTitle(prompt, 'text')}

## Übersicht
Das Saarland bietet einzigartige Erlebnisse zwischen Deutschland, Frankreich und Luxemburg.

## Highlights
- **Saarschleife**: Deutschlands schönster Flussabschnitt
- **Völklinger Hütte**: UNESCO-Weltkulturerbe
- **Bostalsee**: Wassersport und Erholung
- **Grenzüberschreitende Erlebnisse**: Deutsch-französische Kultur

## Praktische Informationen
- **Anreise**: Regional-Express bis Saarbrücken
- **Beste Reisezeit**: Mai bis Oktober
- **Sprachen**: Deutsch, Französisch
- **Währung**: Euro (grenzüberschreitend)

## Geheimtipps
Das Saarland verbindet deutsche Gründlichkeit mit französischem Savoir-vivre. Besuchen Sie lokale Märkte und probieren Sie die grenzüberschreitende Küche.`,

      business: `# Saarland Business Opportunities: ${extractTitle(prompt, 'text')}

## Wirtschaftsstandort Saarland
Das Saarland ist Ihr Gateway zu einem 65-Millionen-Markt in der Großregion.

## Förderungen & Unterstützung
- **KI-Förderungen**: Bis zu 250.000€ für innovative Projekte
- **Cross-Border Business**: EU-Förderungen für grenzüberschreitende Aktivitäten
- **Startup-Ökosystem**: DFKI, Universität, innovative Unternehmen

## Geschäftschancen
- **Industrie 4.0**: Automobilindustrie und Zulieferer
- **KI & Tech**: DFKI als Forschungspartner
- **Logistik**: Zentrale Lage in Europa

## Kontakte
- IHK Saarland: Erstberatung und Netzwerk
- saar.is: Innovation und Technologietransfer
- Wirtschaftsförderung: Ansiedlungsberatung`,

      education: `# Saarland Bildungslandschaft: ${extractTitle(prompt, 'text')}

## Hochschulstandort Saarland
Exzellente Bildung im Herzen Europas.

## Universitäten & Hochschulen
- **Universität des Saarlandes**: Forschungsuniversität mit internationalem Ruf
- **HTW Saar**: Praxisorientierte Hochschule
- **DFKI**: Weltführend in KI-Forschung

## Studienprogramme
- **KI & Informatik**: Deutschlandweit führend
- **Grenzüberschreitende Programme**: Deutsch-französische Studiengänge
- **Weiterbildung**: Lebenslanges Lernen

## Förderungen
- **Digital Stipendium**: 950€ für KI-Studiengänge
- **ERASMUS+**: Europäische Mobilität
- **Forschungsförderung**: EU und nationale Programme`,

      admin: `# Saarland Verwaltungsservices: ${extractTitle(prompt, 'text')}

## Digitale Verwaltung
Das Saarland modernisiert kontinuierlich seine Bürgerdienste.

## Online-Services
- **Bürgerportal**: Zentrale Anlaufstelle
- **Online-Anträge**: 24/7 verfügbar
- **Terminbuchung**: Express-Service verfügbar

## Wichtige Behörden
- **Landesverwaltung**: Zentrale Services
- **Bürgerbüros**: Vor-Ort-Service
- **Fachbehörden**: Spezialisierte Dienste

## Digitalisierungsinitiative
Das Saarland setzt auf KI-unterstützte Verwaltungsabläufe für besseren Bürgerservice.`,

      culture: `# Saarland Kulturleben: ${extractTitle(prompt, 'text')}

## Kulturelle Vielfalt
Das Saarland vereint deutsche und französische Kulturtraditionen.

## Highlights
- **Staatstheater Saarbrücken**: Oper, Schauspiel, Ballett
- **Saarland Museum**: Moderne und zeitgenössische Kunst
- **Festivals**: Filmfestival Max Ophüls Preis, Perspektiven

## Besonderheiten
- **Grenzüberschreitende Kultur**: Deutsch-französische Projekte
- **Industriekultur**: Völklinger Hütte und Montanindustrie
- **Musik**: Von Klassik bis Rock

## Veranstaltungen
Das ganze Jahr über finden kulturelle Events statt, die die einzigartige Position des Saarlandes in Europa widerspiegeln.`
    }

    return categoryTemplates[category] || `# Saarland Information: ${extractTitle(prompt, 'text')}

Umfassende Informationen zum Thema "${prompt}" im Saarland-Kontext.

## Übersicht
Das Saarland bietet einzigartige Möglichkeiten und Services.

## Details
Spezifische Informationen werden basierend auf Ihrer Anfrage bereitgestellt.

## Kontakt
Für weitere Informationen besuchen Sie agentland.saarland.`
  }

  const extractTitle = (prompt: string, type: 'text' | 'code'): string => {
    const words = prompt.split(' ').slice(0, 5).join(' ')
    return type === 'code' ? 
      `${words} - Code` : 
      `${words} - Dokument`
  }

  const detectLanguage = (content: string): string => {
    if (content.includes('import React') || content.includes('useState')) return 'tsx'
    if (content.includes('def ') || content.includes('import ')) return 'python'
    if (content.includes('function ') || content.includes('const ')) return 'javascript'
    if (content.includes('class ') && content.includes('public')) return 'java'
    return 'text'
  }

  const handleSendMessage = async (message?: string) => {
    const userMessage = message || inputValue.trim()
    if (!userMessage || isGenerating) return

    setIsGenerating(true)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')

    try {
      // Determine artifact type from user input
      const isCodeRequest = userMessage.toLowerCase().includes('code') || 
                           userMessage.toLowerCase().includes('component') ||
                           userMessage.toLowerCase().includes('function') ||
                           userMessage.toLowerCase().includes('script')

      const artifact = await generateArtifact(userMessage, isCodeRequest ? 'code' : 'text')
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ich habe ein ${artifact.type === 'code' ? 'Code-Artefakt' : 'Dokument'} für Ihre Anfrage erstellt. Es ist speziell für den ${serviceCategory}-Bereich im Saarland optimiert.`,
        artifact,
        timestamp: Date.now() + 1
      }

      setMessages(prev => [...prev, assistantMsg])
      setCurrentArtifact(artifact)
      
      if (onArtifactGenerated) {
        onArtifactGenerated(artifact)
      }

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entschuldigung, es gab einen Fehler bei der Generierung. Bitte versuchen Sie es erneut.',
        timestamp: Date.now() + 1
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsGenerating(false)
    }
  }

  const updateArtifact = async (newContent: string) => {
    if (!currentArtifact) return

    const updatedArtifact: Artifact = {
      ...currentArtifact,
      content: newContent,
      updated_at: Date.now()
    }

    setCurrentArtifact(updatedArtifact)
    
    // Update the message with the artifact
    setMessages(prev => prev.map(msg => 
      msg.artifact?.id === currentArtifact.id 
        ? { ...msg, artifact: updatedArtifact }
        : msg
    ))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const downloadArtifact = (artifact: Artifact) => {
    const extension = artifact.type === 'code' ? 
      (artifact.language === 'python' ? '.py' : 
       artifact.language === 'tsx' ? '.tsx' : '.js') : '.md'
    
    const blob = new Blob([artifact.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.title.replace(/[^a-zA-Z0-9]/g, '_')}${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold" style={{ color: '#003399' }}>
            🎨 Open Canvas - {serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}
          </h1>
          <p className="text-sm text-gray-600">
            KI-gestützte Inhaltserstellung für das Saarland
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Wand2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Willkommen bei Open Canvas
              </h3>
              <p className="text-gray-600 mb-4">
                Erstellen Sie Dokumente und Code für Saarland-Services mit KI-Unterstützung
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputValue('Erstelle eine React-Komponente für Saarland Tourismus')}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code erstellen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputValue('Schreibe einen Leitfaden für Saarland Business')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Dokument erstellen
                </Button>
              </div>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm">{message.content}</p>
                {message.artifact && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border text-xs">
                    <div className="flex items-center gap-2">
                      {message.artifact.type === 'code' ? (
                        <Code className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      <span className="font-medium">{message.artifact.title}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generiere Inhalt...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Beschreiben Sie, was Sie erstellen möchten..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isGenerating}
              style={{ backgroundColor: '#003399' }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Artifact Panel */}
      {currentArtifact && (
        <div className="w-2/3 bg-white border-l border-gray-200 flex flex-col">
          {/* Artifact Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentArtifact.type === 'code' ? (
                  <Code className="w-5 h-5 text-blue-600" />
                ) : (
                  <FileText className="w-5 h-5 text-green-600" />
                )}
                <h2 className="font-semibold">{currentArtifact.title}</h2>
                {currentArtifact.language && (
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                    {currentArtifact.language}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentArtifact.content)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadArtifact(currentArtifact)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Artifact Content */}
          <div className="flex-1 overflow-y-auto">
            {editMode ? (
              <textarea
                value={currentArtifact.content}
                onChange={(e) => updateArtifact(e.target.value)}
                className="w-full h-full p-4 border-none resize-none focus:ring-0 font-mono text-sm"
                placeholder="Bearbeiten Sie den Inhalt hier..."
              />
            ) : (
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-auto">
                {currentArtifact.content}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}