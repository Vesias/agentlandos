'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Smartphone, Tablet, Monitor, Wifi, Battery, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useMobileOptimization from '@/hooks/useMobileOptimization'
import { mobileUtils } from '@/lib/mobile-utils'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  score?: number
}

export default function MobileTestSuite() {
  const [isVisible, setIsVisible] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallScore, setOverallScore] = useState(0)

  const {
    isMobile,
    isOnline,
    connectionType,
    isSlowConnection,
    batteryLevel,
    isLowBattery,
    viewport,
    safeAreaInsets,
    performanceScore,
    shouldReduceMotion,
    recommendedImageQuality
  } = useMobileOptimization()

  // Only show test suite in development or when explicitly triggered
  useEffect(() => {
    const showTests = process.env.NODE_ENV === 'development' || 
                     new URLSearchParams(window.location.search).has('mobile-test')
    setIsVisible(showTests)
  }, [])

  const runMobileTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test 1: Viewport Configuration
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    const viewportContent = viewportMeta?.getAttribute('content') || ''
    results.push({
      name: 'Viewport Meta Tag',
      status: viewportContent.includes('width=device-width') ? 'pass' : 'fail',
      message: viewportContent.includes('width=device-width') 
        ? 'Viewport is properly configured' 
        : 'Missing or incorrect viewport meta tag',
      score: viewportContent.includes('width=device-width') ? 10 : 0
    })

    // Test 2: Touch Target Size
    const touchTargets = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]')
    let touchTargetScore = 0
    let validTargets = 0

    touchTargets.forEach(element => {
      const rect = element.getBoundingClientRect()
      const minSize = Math.min(rect.width, rect.height)
      if (minSize >= 44) validTargets++
    })

    touchTargetScore = (validTargets / touchTargets.length) * 10
    results.push({
      name: 'Touch Target Size',
      status: touchTargetScore >= 8 ? 'pass' : touchTargetScore >= 5 ? 'warning' : 'fail',
      message: `${validTargets}/${touchTargets.length} touch targets meet 44px minimum`,
      score: touchTargetScore
    })

    // Test 3: Font Size
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label')
    let fontSizeScore = 0
    let validFontSizes = 0

    textElements.forEach(element => {
      const fontSize = parseFloat(getComputedStyle(element).fontSize)
      if (fontSize >= 16) validFontSizes++
    })

    fontSizeScore = Math.min(10, (validFontSizes / textElements.length) * 20)
    results.push({
      name: 'Font Size Accessibility',
      status: fontSizeScore >= 8 ? 'pass' : fontSizeScore >= 5 ? 'warning' : 'fail',
      message: `${Math.round((validFontSizes / textElements.length) * 100)}% of text is 16px or larger`,
      score: fontSizeScore
    })

    // Test 4: Mobile-Specific Features
    const hasMobileFeatures = document.querySelector('[data-mobile-feature]') !== null ||
                              document.querySelector('.touch-target') !== null
    results.push({
      name: 'Mobile-Specific Features',
      status: hasMobileFeatures ? 'pass' : 'warning',
      message: hasMobileFeatures 
        ? 'Mobile-specific features detected' 
        : 'Consider adding mobile-specific features',
      score: hasMobileFeatures ? 10 : 5
    })

    // Test 5: PWA Manifest
    const manifestLink = document.querySelector('link[rel="manifest"]')
    results.push({
      name: 'PWA Manifest',
      status: manifestLink ? 'pass' : 'warning',
      message: manifestLink ? 'PWA manifest found' : 'PWA manifest missing',
      score: manifestLink ? 10 : 5
    })

    // Test 6: Safe Area Support
    const hasSafeAreaSupport = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') !== ''
    results.push({
      name: 'Safe Area Support',
      status: hasSafeAreaSupport ? 'pass' : 'warning',
      message: hasSafeAreaSupport 
        ? 'Safe area insets are supported' 
        : 'Safe area insets not configured',
      score: hasSafeAreaSupport ? 10 : 7
    })

    // Test 7: Image Optimization
    const images = document.querySelectorAll('img')
    let optimizedImages = 0
    images.forEach(img => {
      if (img.loading === 'lazy' || img.getAttribute('loading') === 'lazy') {
        optimizedImages++
      }
    })
    const imageScore = images.length > 0 ? (optimizedImages / images.length) * 10 : 10
    results.push({
      name: 'Image Optimization',
      status: imageScore >= 8 ? 'pass' : imageScore >= 5 ? 'warning' : 'fail',
      message: `${optimizedImages}/${images.length} images have lazy loading`,
      score: imageScore
    })

    // Test 8: Network Awareness
    const networkAware = isSlowConnection !== undefined && connectionType !== 'unknown'
    results.push({
      name: 'Network Awareness',
      status: networkAware ? 'pass' : 'warning',
      message: networkAware 
        ? `Connection type detected: ${connectionType}` 
        : 'Network awareness not implemented',
      score: networkAware ? 10 : 5
    })

    // Test 9: Performance
    let performanceStatus: 'pass' | 'warning' | 'fail' = 'warning'
    let performanceMessage = 'Performance not measured yet'
    let performanceScoreValue = 5

    if (performanceScore !== null) {
      if (performanceScore >= 80) {
        performanceStatus = 'pass'
        performanceScoreValue = 10
      } else if (performanceScore >= 60) {
        performanceStatus = 'warning'
        performanceScoreValue = 7
      } else {
        performanceStatus = 'fail'
        performanceScoreValue = 3
      }
      performanceMessage = `Performance score: ${performanceScore}/100`
    }

    results.push({
      name: 'Performance Score',
      status: performanceStatus,
      message: performanceMessage,
      score: performanceScoreValue
    })

    // Test 10: Accessibility
    const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0
    const hasAriaDescriptions = document.querySelectorAll('[aria-describedby]').length > 0
    const accessibilityScore = (hasAriaLabels ? 5 : 0) + (hasAriaDescriptions ? 5 : 0)
    
    results.push({
      name: 'Mobile Accessibility',
      status: accessibilityScore >= 8 ? 'pass' : accessibilityScore >= 5 ? 'warning' : 'fail',
      message: `ARIA labels: ${hasAriaLabels ? '✓' : '✗'}, Descriptions: ${hasAriaDescriptions ? '✓' : '✗'}`,
      score: accessibilityScore
    })

    // Calculate overall score
    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0)
    const maxScore = results.length * 10
    const finalScore = Math.round((totalScore / maxScore) * 100)

    setTestResults(results)
    setOverallScore(finalScore)
    setIsRunning(false)
  }

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDeviceIcon = () => {
    if (viewport.width < 768) return <Smartphone className="w-5 h-5" />
    if (viewport.width < 1024) return <Tablet className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <Card className="p-4 bg-white shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mobile Test Suite</h3>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Device Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            {getDeviceIcon()}
            <span>{viewport.width} × {viewport.height}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
            <span className="capitalize">{connectionType}</span>
          </div>
          {batteryLevel !== null && (
            <div className="flex items-center gap-2">
              <Battery className={`w-4 h-4 ${isLowBattery ? 'text-red-600' : 'text-green-600'}`} />
              <span>{batteryLevel}%</span>
            </div>
          )}
          {performanceScore !== null && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Performance: {performanceScore}</span>
            </div>
          )}
        </div>

        {/* Run Tests Button */}
        <Button
          onClick={runMobileTests}
          disabled={isRunning}
          className="w-full mb-4 touch-target"
        >
          {isRunning ? 'Running Tests...' : 'Run Mobile Tests'}
        </Button>

        {/* Overall Score */}
        {testResults.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </span>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {testResults.map((result, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {getStatusIcon(result.status)}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">
                  {result.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {result.message}
                </div>
                {result.score !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">
                    Score: {result.score}/10
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {testResults.some(r => r.status === 'fail' || r.status === 'warning') && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              {testResults
                .filter(r => r.status === 'fail' || r.status === 'warning')
                .slice(0, 3)
                .map((result, index) => (
                  <li key={index}>• {result.name}: {result.message}</li>
                ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}