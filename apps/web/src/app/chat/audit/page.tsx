'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Code, Database, Zap, Brain } from 'lucide-react'

interface AuditResult {
  component: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
  timestamp: string
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  threshold: number
  status: 'good' | 'warning' | 'critical'
}

export default function ChatAuditPage() {
  const [auditResults, setAuditResults] = useState<AuditResult[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastAudit, setLastAudit] = useState<Date | null>(null)

  const runComprehensiveAudit = async () => {
    setIsRunning(true)
    const startTime = Date.now()
    const results: AuditResult[] = []
    const metrics: PerformanceMetric[] = []

    try {
      // 1. Enhanced AI API Health Check
      try {
        const aiResponse = await fetch('/api/ai/enhanced?test=health', { method: 'GET' })
        const aiData = await aiResponse.json()
        
        results.push({
          component: 'Enhanced AI Service',
          status: aiResponse.ok ? 'pass' : 'fail',
          message: aiResponse.ok ? 'DeepSeek R1 + Gemini 2.5 operational' : 'AI service unavailable',
          details: JSON.stringify(aiData, null, 2),
          timestamp: new Date().toISOString()
        })

        if (aiResponse.ok && aiData.processing_time) {
          metrics.push({
            name: 'AI Response Time',
            value: aiData.processing_time,
            unit: 'ms',
            threshold: 500,
            status: aiData.processing_time < 500 ? 'good' : aiData.processing_time < 1000 ? 'warning' : 'critical'
          })
        }
      } catch (error) {
        results.push({
          component: 'Enhanced AI Service',
          status: 'fail',
          message: 'Failed to connect to AI service',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }

      // 2. Copilot Kit Backend Check
      try {
        const copilotResponse = await fetch('/api/copilot', { method: 'GET' })
        const copilotData = await copilotResponse.json()
        
        results.push({
          component: 'Copilot Kit Backend',
          status: copilotResponse.ok ? 'pass' : 'fail',
          message: copilotResponse.ok ? 'Copilot orchestration active' : 'Copilot backend error',
          details: JSON.stringify(copilotData, null, 2),
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        results.push({
          component: 'Copilot Kit Backend',
          status: 'fail',
          message: 'Copilot Kit backend unavailable',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }

      // 3. AG-UI Protocol Integration Check
      try {
        // Check if AG-UI packages are properly installed
        const agUICheck = await import('@ag-ui/core')
        results.push({
          component: 'AG-UI Protocol',
          status: 'pass',
          message: 'AG-UI core module loaded successfully',
          details: 'AG-UI packages: @ag-ui/core, @ag-ui/client, @ag-ui/encoder, @ag-ui/proto',
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        results.push({
          component: 'AG-UI Protocol',
          status: 'warning',
          message: 'AG-UI module load issue',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }

      // 4. Vector RAG System Check
      try {
        const ragResponse = await fetch('/api/ai/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Test RAG query for Saarland',
            mode: 'rag',
            category: 'general'
          })
        })
        
        const ragData = await ragResponse.json()
        
        results.push({
          component: 'Vector RAG System',
          status: ragResponse.ok ? 'pass' : 'fail',
          message: ragResponse.ok ? 'Vector RAG operational' : 'RAG system error',
          details: JSON.stringify(ragData, null, 2),
          timestamp: new Date().toISOString()
        })

        if (ragResponse.ok && ragData.processing_time) {
          metrics.push({
            name: 'RAG Query Time',
            value: ragData.processing_time,
            unit: 'ms',
            threshold: 800,
            status: ragData.processing_time < 800 ? 'good' : ragData.processing_time < 1500 ? 'warning' : 'critical'
          })
        }
      } catch (error) {
        results.push({
          component: 'Vector RAG System',
          status: 'fail',
          message: 'RAG system connection failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }

      // 5. Web Search Integration Check
      try {
        const webSearchResponse = await fetch('/api/ai/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Saarland weather test',
            mode: 'websearch',
            category: 'general'
          })
        })
        
        const webSearchData = await webSearchResponse.json()
        
        results.push({
          component: 'Web Search Integration',
          status: webSearchResponse.ok ? 'pass' : 'fail',
          message: webSearchResponse.ok ? 'Web search functional' : 'Web search error',
          details: JSON.stringify(webSearchData, null, 2),
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        results.push({
          component: 'Web Search Integration',
          status: 'warning',
          message: 'Web search integration issue',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }

      // 6. Real-time Data Services Check
      try {
        const realtimeResponse = await fetch('/api/realtime/analytics', { method: 'GET' })
        const realtimeData = await realtimeResponse.json()
        
        results.push({
          component: 'Real-time Data Services',
          status: realtimeResponse.ok ? 'pass' : 'fail',
          message: realtimeResponse.ok ? 'Real-time services active' : 'Real-time services error',
          details: JSON.stringify(realtimeData, null, 2),
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        results.push({
          component: 'Real-time Data Services',
          status: 'warning',
          message: 'Real-time data services issue',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }

      // 7. Analytics Integration Check
      try {
        const analyticsResponse = await fetch('/api/analytics/real-users', { method: 'GET' })
        const analyticsData = await analyticsResponse.json()
        
        results.push({
          component: 'Analytics Integration',
          status: analyticsResponse.ok ? 'pass' : 'fail',
          message: analyticsResponse.ok ? 'User analytics tracking active' : 'Analytics error',
          details: JSON.stringify(analyticsData, null, 2),
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        results.push({
          component: 'Analytics Integration',
          status: 'warning',
          message: 'Analytics integration issue',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }

      // 8. Mobile Optimization Check
      const mobileUtils = await import('@/lib/mobile-utils')
      const viewport = typeof window !== 'undefined' ? mobileUtils.enhancedMobileUtils.getViewport() : { width: 0, height: 0 }
      const isMobile = typeof window !== 'undefined' ? mobileUtils.enhancedMobileUtils.isMobile() : false
      
      results.push({
        component: 'Mobile Optimization',
        status: 'pass',
        message: 'Mobile utilities loaded and functional',
        details: `Viewport: ${viewport.width}x${viewport.height}, Mobile: ${isMobile}`,
        timestamp: new Date().toISOString()
      })

      // Add overall performance metrics
      const totalTime = Date.now() - startTime
      metrics.push({
        name: 'Total Audit Time',
        value: totalTime,
        unit: 'ms',
        threshold: 5000,
        status: totalTime < 5000 ? 'good' : totalTime < 10000 ? 'warning' : 'critical'
      })

      metrics.push({
        name: 'Components Tested',
        value: results.length,
        unit: 'components',
        threshold: 6,
        status: results.length >= 6 ? 'good' : 'warning'
      })

      const passedTests = results.filter(r => r.status === 'pass').length
      metrics.push({
        name: 'Success Rate',
        value: Math.round((passedTests / results.length) * 100),
        unit: '%',
        threshold: 80,
        status: (passedTests / results.length) >= 0.8 ? 'good' : (passedTests / results.length) >= 0.6 ? 'warning' : 'critical'
      })

    } catch (error) {
      results.push({
        component: 'Audit System',
        status: 'fail',
        message: 'Audit execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }

    setAuditResults(results)
    setPerformanceMetrics(metrics)
    setLastAudit(new Date())
    setIsRunning(false)
  }

  useEffect(() => {
    // Run initial audit on page load
    runComprehensiveAudit()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'fail':
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'good':
        return 'border-green-200 bg-green-50'
      case 'fail':
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Chat Bot Integration Audit
          </h1>
          <p className="text-gray-600 mb-4">
            Comprehensive testing of Copilot Kit + AG-UI + Enhanced AI integration
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {lastAudit && `Last audit: ${lastAudit.toLocaleString('de-DE')}`}
            </div>
            <Button 
              onClick={runComprehensiveAudit} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Audit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        {performanceMetrics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className={`${getStatusColor(metric.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{metric.name}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}{metric.unit}
                      </p>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Audit Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {auditResults.map((result, index) => (
            <Card key={index} className={`${getStatusColor(result.status)} border-l-4`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-3">
                    {result.component === 'Enhanced AI Service' && <Brain className="w-5 h-5 text-blue-500" />}
                    {result.component === 'Copilot Kit Backend' && <Zap className="w-5 h-5 text-purple-500" />}
                    {result.component === 'AG-UI Protocol' && <Code className="w-5 h-5 text-green-500" />}
                    {result.component === 'Vector RAG System' && <Database className="w-5 h-5 text-indigo-500" />}
                    {!['Enhanced AI Service', 'Copilot Kit Backend', 'AG-UI Protocol', 'Vector RAG System'].includes(result.component) && 
                      <AlertTriangle className="w-5 h-5 text-gray-500" />}
                    <span>{result.component}</span>
                  </div>
                  {getStatusIcon(result.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{result.message}</p>
                {result.details && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800 font-medium">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {result.details}
                    </pre>
                  </details>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(result.timestamp).toLocaleString('de-DE')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Summary */}
        {auditResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Integration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {auditResults.filter(r => r.status === 'pass').length}
                  </p>
                  <p className="text-sm text-gray-600">Components Passing</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {auditResults.filter(r => r.status === 'warning').length}
                  </p>
                  <p className="text-sm text-gray-600">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {auditResults.filter(r => r.status === 'fail').length}
                  </p>
                  <p className="text-sm text-gray-600">Failures</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Hybrid Chat Bot Architecture</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Copilot Kit:</strong> LLM orchestration and backend actions</li>
                  <li>• <strong>AG-UI Protocol:</strong> UI component communication</li>
                  <li>• <strong>Enhanced AI:</strong> DeepSeek R1 + Gemini 2.5 + Vector RAG</li>
                  <li>• <strong>Real-time Data:</strong> Live Saarland services integration</li>
                  <li>• <strong>Mobile Optimization:</strong> Enhanced mobile utilities</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}