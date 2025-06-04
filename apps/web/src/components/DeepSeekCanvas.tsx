'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Pen, Eraser, Square, Circle, Type, ArrowRight, Download, Trash2, Settings, Lightbulb, Target, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CanvasElement {
  id: string
  type: 'rectangle' | 'circle' | 'text' | 'arrow' | 'idea' | 'goal' | 'task'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  text?: string
  color: string
  status?: 'pending' | 'completed' | 'in-progress'
}

interface DeepSeekCanvasProps {
  planningPrompt: string
  serviceCategory: 'tourism' | 'business' | 'education' | 'admin' | 'culture' | 'general'
  onPlanGenerated?: (plan: any) => void
}

export default function DeepSeekCanvas({ planningPrompt, serviceCategory, onPlanGenerated }: DeepSeekCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'rectangle' | 'circle' | 'text' | 'arrow' | 'idea' | 'goal' | 'task'>('pen')
  const [currentColor, setCurrentColor] = useState('#003399')
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [textInput, setTextInput] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [planningSteps, setPlanningSteps] = useState<string[]>([])

  const colors = ['#003399', '#009FE3', '#FDB913', '#dc2626', '#16a34a', '#9333ea', '#ea580c']

  useEffect(() => {
    drawCanvas()
  }, [elements])

  useEffect(() => {
    if (planningPrompt) {
      generateInitialPlan()
    }
  }, [planningPrompt, serviceCategory])

  const generateInitialPlan = async () => {
    setIsGeneratingPlan(true)
    
    try {
      // Try to call DeepSeek API with service-specific prompts
      const response = await fetch('/api/agents/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: planningPrompt,
          service: serviceCategory,
          mode: 'canvas_planning',
          context: getCategoryContext(serviceCategory),
          format: 'structured_steps'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const steps = data.planning_steps || await generatePlanningSteps(planningPrompt, getCategoryContext(serviceCategory))
        setPlanningSteps(steps)
        
        // Create AI-enhanced canvas elements
        const initialElements = createInitialElements(steps)
        setElements(initialElements)
        
        if (onPlanGenerated) {
          onPlanGenerated({
            category: serviceCategory,
            prompt: planningPrompt,
            steps: steps,
            elements: initialElements,
            ai_enhanced: true,
            deepseek_response: data
          })
        }
      } else {
        throw new Error('DeepSeek API not available')
      }
    } catch (error) {
      console.error('DeepSeek API error, using enhanced fallback:', error)
      
      // Enhanced fallback with service-specific intelligence
      const categoryContext = getCategoryContext(serviceCategory)
      const steps = await generatePlanningSteps(planningPrompt, categoryContext)
      setPlanningSteps(steps)
      
      // Create initial canvas elements based on planning steps
      const initialElements = createInitialElements(steps)
      setElements(initialElements)
      
      if (onPlanGenerated) {
        onPlanGenerated({
          category: serviceCategory,
          prompt: planningPrompt,
          steps: steps,
          elements: initialElements,
          ai_enhanced: false,
          fallback_mode: true
        })
      }
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const getCategoryContext = (category: string): string => {
    const contexts = {
      tourism: 'Saarland Tourism Planning: Ausflüge, Sehenswürdigkeiten, Events, Buchungen',
      business: 'Business Development Saarland: Förderungen, Gründung, Networking, Märkte',
      education: 'Bildungsplanung Saarland: Studium, Weiterbildung, Stipendien, Kurse',
      admin: 'Verwaltungsservices: Anträge, Termine, Dokumente, Behördengänge',
      culture: 'Kulturplanung Saarland: Events, Theater, Musik, Festivals',
      general: 'Allgemeine Planung: Services, Termine, Recherche, Organisation'
    }
    return contexts[category] || contexts.general
  }

  const generatePlanningSteps = async (prompt: string, context: string): Promise<string[]> => {
    // Intelligente Analyse des Prompts für spezifische Planung
    const keywords = prompt.toLowerCase()
    
    // Tourism-spezifische Planung
    if (serviceCategory === 'tourism') {
      if (keywords.includes('sommer') || keywords.includes('wetter') || keywords.includes('outdoor')) {
        return [
          'Wetter & beste Tageszeit prüfen',
          'Outdoor-Aktivitäten in der Nähe finden',
          'Sommer-Events & Open Air recherchieren',
          'Transport & Anfahrt planen',
          'Backup bei schlechtem Wetter'
        ]
      }
      if (keywords.includes('familie') || keywords.includes('kinder')) {
        return [
          'Familienfreundliche Attraktionen finden',
          'Altersgerechte Aktivitäten auswählen',
          'Kosten für Familie kalkulieren',
          'Pausenplätze & Restaurants einplanen',
          'Alternative bei schlechtem Wetter'
        ]
      }
      return [
        'Reiseziele & Sehenswürdigkeiten recherchieren',
        'Termine & Öffnungszeiten prüfen',
        'Kosten & Buchungen kalkulieren',
        'Route & Transport planen',
        'Backup-Optionen definieren'
      ]
    }

    // Business-spezifische Planung
    if (serviceCategory === 'business') {
      if (keywords.includes('ki') || keywords.includes('digital') || keywords.includes('tech')) {
        return [
          'KI-Förderprogramme mit 50% Bonus prüfen',
          'Digitalisierungsbonus Plus beantragen',
          'Green Tech & KI Hybrid Förderung',
          'Deadline 31.08.2025 im Kalender',
          'Schnellverfahren für KI-Projekte nutzen'
        ]
      }
      if (keywords.includes('gründ') || keywords.includes('startup')) {
        return [
          'Startup Saarland Boost beantragen',
          'Kostenlose Erstberatung buchen',
          'Business Plan mit KI-Marktanalyse',
          'Rechtsform & Gewerbeanmeldung',
          'Finanzierung & Fördermittel'
        ]
      }
      return [
        'Förderprogramme identifizieren',
        'Antragsvoraussetzungen prüfen',
        'Business Plan erstellen',
        'Termine & Deadlines planen',
        'Umsetzung & Monitoring'
      ]
    }

    // Education-spezifische Planung
    if (serviceCategory === 'education') {
      if (keywords.includes('ki') || keywords.includes('master') || keywords.includes('studium')) {
        return [
          'KI-Master UdS: Bewerbung bis 15.07.2025',
          'Online-Assessment bis 30.06. absolvieren',
          'Saarland Digital Stipendium 950€ beantragen',
          'KI-Excellence Stipendium 1.200€ prüfen',
          'DFKI-Praxispartner kontaktieren'
        ]
      }
      if (keywords.includes('stipendium') || keywords.includes('finanzierung')) {
        return [
          'Erhöhtes Digital Stipendium 950€ beantragen',
          'KI-Excellence Stipendium 1.200€ prüfen',
          'DFKI-Forschungsstipendien recherchieren',
          'Weitere Finanzierungsoptionen',
          'Bewerbungsunterlagen vorbereiten'
        ]
      }
      return [
        'Bildungsangebote recherchieren',
        'Bewerbungsvoraussetzungen prüfen',
        'Finanzierung & Stipendien',
        'Zeitplan & Deadlines',
        'Backup-Optionen'
      ]
    }

    // Admin-spezifische Planung
    if (serviceCategory === 'admin') {
      if (keywords.includes('gewerbe') || keywords.includes('anmeld')) {
        return [
          'Online-Gewerbeanmeldung vorbereiten',
          'Benötigte Dokumente checken',
          'KI-unterstützte Antragsberatung nutzen',
          'Express-Termin über App buchen',
          'Digitale Unterschrift aktivieren'
        ]
      }
      return [
        'Benötigte Dokumente sammeln',
        'Express-Termin über neue App buchen',
        'KI-Assistent 24/7 nutzen',
        'Digitale Services bevorzugen',
        'Live-Tracking für Termine nutzen'
      ]
    }

    // Culture-spezifische Planung
    if (serviceCategory === 'culture') {
      if (keywords.includes('sommer') || keywords.includes('juni') || keywords.includes('open air')) {
        return [
          'Saarland Open Air Festival 07.-09.06.',
          'Tickets für Shakespeare im Park buchen',
          'Jazz unter Sternen Samstag 21:00',
          'Digital Art Festival mit KI besuchen',
          'Wetter-Backup für Open Air Events'
        ]
      }
      return [
        'Events & Termine recherchieren',
        'Tickets & Reservierungen',
        'Transport & Logistics',
        'Budget & Kosten',
        'Alternativen planen'
      ]
    }

    // General fallback
    return [
      'Ziele & Anforderungen definieren',
      'Ressourcen & Services identifizieren',
      'Zeitplan & Termine erstellen',
      'Umsetzung & Durchführung',
      'Ergebnisse & Erfolg messen'
    ]
  }

  const getFallbackSteps = (category: string): string[] => {
    return generatePlanningSteps('', getCategoryContext(category)).then(steps => steps).catch(() => [
      'Planung starten',
      'Schritte definieren',
      'Umsetzung beginnen'
    ]) as any
  }

  const createInitialElements = (steps: string[]): CanvasElement[] => {
    const elements: CanvasElement[] = []
    const startX = 50
    const startY = 80
    const stepHeight = 80

    steps.forEach((step, index) => {
      // Goal element
      elements.push({
        id: `goal-${index}`,
        type: 'goal',
        x: startX,
        y: startY + (index * stepHeight),
        width: 300,
        height: 60,
        text: step,
        color: '#003399',
        status: 'pending'
      })

      // Arrow to next step
      if (index < steps.length - 1) {
        elements.push({
          id: `arrow-${index}`,
          type: 'arrow',
          x: startX + 150,
          y: startY + (index * stepHeight) + 60,
          width: 0,
          height: 20,
          color: '#009FE3'
        })
      }
    })

    return elements
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    drawGrid(ctx)

    // Draw elements
    elements.forEach(element => {
      drawElement(ctx, element)
    })
  }

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1

    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, ctx.canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ctx.canvas.width, y)
      ctx.stroke()
    }
  }

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.fillStyle = element.color
    ctx.strokeStyle = element.color
    ctx.lineWidth = 2

    switch (element.type) {
      case 'rectangle':
        ctx.fillRect(element.x, element.y, element.width || 100, element.height || 60)
        break

      case 'circle':
        ctx.beginPath()
        ctx.arc(element.x, element.y, element.radius || 30, 0, 2 * Math.PI)
        ctx.fill()
        break

      case 'text':
        ctx.font = '16px Arial'
        ctx.fillText(element.text || '', element.x, element.y)
        break

      case 'arrow':
        drawArrow(ctx, element.x, element.y, element.x, element.y + (element.height || 40))
        break

      case 'idea':
        drawIdeaBulb(ctx, element.x, element.y, element.width || 80, element.height || 60)
        if (element.text) {
          ctx.font = '12px Arial'
          ctx.fillStyle = '#333'
          ctx.fillText(element.text, element.x - 30, element.y + 80)
        }
        break

      case 'goal':
        drawGoalBox(ctx, element)
        break

      case 'task':
        drawTaskBox(ctx, element)
        break
    }
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 10
    const angle = Math.atan2(toY - fromY, toX - fromX)

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  const drawIdeaBulb = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.fillStyle = '#FDB913'
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, 2 * Math.PI)
    ctx.fill()
    
    // Bulb details
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - 8, y + 15)
    ctx.lineTo(x + 8, y + 15)
    ctx.moveTo(x - 6, y + 20)
    ctx.lineTo(x + 6, y + 20)
    ctx.stroke()
  }

  const drawGoalBox = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const { x, y, width = 300, height = 60, text, status } = element
    
    // Box background
    ctx.fillStyle = status === 'completed' ? '#16a34a' : status === 'in-progress' ? '#009FE3' : '#003399'
    ctx.fillRect(x, y, width, height)
    
    // Border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    // Text
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px Arial'
    const textX = x + 40
    const textY = y + height / 2 + 5
    ctx.fillText(text || '', textX, textY)
    
    // Status icon
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    const iconX = x + 10
    const iconY = y + height / 2 + 5
    const icon = status === 'completed' ? '✓' : status === 'in-progress' ? '⚡' : '🎯'
    ctx.fillText(icon, iconX, iconY)
  }

  const drawTaskBox = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const { x, y, width = 250, height = 50, text, status } = element
    
    // Box background
    ctx.fillStyle = status === 'completed' ? '#dcfce7' : '#f8fafc'
    ctx.fillRect(x, y, width, height)
    
    // Border
    ctx.strokeStyle = status === 'completed' ? '#16a34a' : '#e2e8f0'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    // Text
    ctx.fillStyle = status === 'completed' ? '#166534' : '#334155'
    ctx.font = '12px Arial'
    const textX = x + 30
    const textY = y + height / 2 + 4
    ctx.fillText(text || '', textX, textY)
    
    // Checkbox
    const checkboxX = x + 8
    const checkboxY = y + height / 2 - 8
    ctx.strokeStyle = status === 'completed' ? '#16a34a' : '#94a3b8'
    ctx.strokeRect(checkboxX, checkboxY, 16, 16)
    
    if (status === 'completed') {
      ctx.fillStyle = '#16a34a'
      ctx.fillText('✓', checkboxX + 2, checkboxY + 12)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (currentTool === 'text') {
      setTextPosition({ x, y })
      setShowTextInput(true)
      return
    }

    // Check if clicked on existing element
    const clickedElement = elements.find(el => {
      if (el.type === 'goal' || el.type === 'task') {
        return x >= el.x && x <= el.x + (el.width || 300) && 
               y >= el.y && y <= el.y + (el.height || 60)
      }
      return false
    })

    if (clickedElement && (clickedElement.type === 'goal' || clickedElement.type === 'task')) {
      // Toggle task completion
      setElements(prev => prev.map(el => 
        el.id === clickedElement.id 
          ? { ...el, status: el.status === 'completed' ? 'pending' : 'completed' }
          : el
      ))
      return
    }

    if (currentTool === 'idea') {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'idea',
        x,
        y,
        width: 80,
        height: 60,
        color: currentColor,
        text: 'Neue Idee'
      }
      setElements(prev => [...prev, newElement])
    }

    if (currentTool === 'goal') {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'goal',
        x,
        y,
        width: 300,
        height: 60,
        color: currentColor,
        text: 'Neues Ziel',
        status: 'pending'
      }
      setElements(prev => [...prev, newElement])
    }

    if (currentTool === 'task') {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'task',
        x,
        y,
        width: 250,
        height: 50,
        color: currentColor,
        text: 'Neue Aufgabe',
        status: 'pending'
      }
      setElements(prev => [...prev, newElement])
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        text: textInput,
        color: currentColor
      }
      setElements(prev => [...prev, newElement])
    }
    setTextInput('')
    setShowTextInput(false)
  }

  const clearCanvas = () => {
    setElements([])
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `saarland-plan-${serviceCategory}-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: '#003399' }}>
            🎯 DeepSeek Planner - {serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}
          </h3>
          <div className="flex items-center gap-2">
            <Button onClick={clearCanvas} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-1" />
              Löschen
            </Button>
            <Button onClick={downloadCanvas} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Prompt */}
        {planningPrompt && (
          <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
            <strong>Planungsaufgabe:</strong> {planningPrompt}
          </div>
        )}

        {/* Tools */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {[
            { tool: 'pen', icon: Pen, label: 'Zeichnen' },
            { tool: 'text', icon: Type, label: 'Text' },
            { tool: 'rectangle', icon: Square, label: 'Rechteck' },
            { tool: 'circle', icon: Circle, label: 'Kreis' },
            { tool: 'arrow', icon: ArrowRight, label: 'Pfeil' },
            { tool: 'idea', icon: Lightbulb, label: 'Idee' },
            { tool: 'goal', icon: Target, label: 'Ziel' },
            { tool: 'task', icon: CheckCircle, label: 'Aufgabe' }
          ].map(({ tool, icon: Icon, label }) => (
            <Button
              key={tool}
              onClick={() => setCurrentTool(tool as any)}
              variant={currentTool === tool ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Farbe:</span>
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-6 h-6 rounded-full border-2 ${currentColor === color ? 'border-gray-800' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
        />

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h4 className="text-lg font-semibold mb-4">Text hinzufügen</h4>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Text eingeben..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleTextSubmit} size="sm">
                  Hinzufügen
                </Button>
                <Button onClick={() => setShowTextInput(false)} variant="outline" size="sm">
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isGeneratingPlan && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">KI-Plan wird generiert...</p>
            </div>
          </div>
        )}
      </div>

      {/* Planning Steps Sidebar */}
      {planningSteps.length > 0 && (
        <div className="w-64 border-l border-gray-200 p-4 bg-gray-50">
          <h4 className="font-semibold mb-3" style={{ color: '#003399' }}>📋 Planungsschritte</h4>
          <div className="space-y-2">
            {planningSteps.map((step, index) => (
              <div key={index} className="text-sm p-2 bg-white rounded border border-gray-200">
                <span className="font-medium" style={{ color: '#009FE3' }}>{index + 1}.</span> {step}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}