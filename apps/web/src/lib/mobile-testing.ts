// Mobile optimization testing and validation utilities

export interface MobileTestResult {
  test: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  score?: number
  details?: any
}

export interface MobileTestSuite {
  performance: MobileTestResult[]
  accessibility: MobileTestResult[]
  usability: MobileTestResult[]
  compatibility: MobileTestResult[]
  overall: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    summary: string
  }
}

class MobileTester {
  private results: MobileTestResult[] = []

  // Performance Tests
  async testPerformance(): Promise<MobileTestResult[]> {
    const performanceTests: MobileTestResult[] = []

    // Test 1: First Contentful Paint
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]
      
      if (fcp) {
        const fcpTime = fcp.startTime
        performanceTests.push({
          test: 'First Contentful Paint',
          status: fcpTime < 1800 ? 'pass' : fcpTime < 3000 ? 'warning' : 'fail',
          message: `FCP: ${Math.round(fcpTime)}ms ${fcpTime < 1800 ? '(Excellent)' : fcpTime < 3000 ? '(Good)' : '(Needs improvement)'}`,
          score: Math.max(0, 100 - (fcpTime / 30)),
          details: { value: fcpTime, threshold: 1800 }
        })
      }

      // Test 2: Load Event timing
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        performanceTests.push({
          test: 'Page Load Time',
          status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
          message: `Load time: ${Math.round(loadTime)}ms`,
          score: Math.max(0, 100 - (loadTime / 50)),
          details: { value: loadTime, threshold: 3000 }
        })
      }
    }

    // Test 3: Memory Usage
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / 1048576 // Convert to MB
      
      performanceTests.push({
        test: 'Memory Usage',
        status: memoryUsage < 50 ? 'pass' : memoryUsage < 100 ? 'warning' : 'fail',
        message: `Memory usage: ${Math.round(memoryUsage)}MB`,
        score: Math.max(0, 100 - memoryUsage),
        details: { value: memoryUsage, threshold: 50 }
      })
    }

    // Test 4: Network Quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const isSlowConnection = ['slow-2g', '2g'].includes(connection.effectiveType)
      
      performanceTests.push({
        test: 'Network Optimization',
        status: !isSlowConnection ? 'pass' : 'warning',
        message: `Connection: ${connection.effectiveType}`,
        score: isSlowConnection ? 60 : 100,
        details: { effectiveType: connection.effectiveType }
      })
    }

    return performanceTests
  }

  // Accessibility Tests
  testAccessibility(): MobileTestResult[] {
    const accessibilityTests: MobileTestResult[] = []

    // Test 1: Touch Target Size
    const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]')
    let smallTargets = 0
    let totalTargets = buttons.length

    buttons.forEach(button => {
      const rect = button.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        smallTargets++
      }
    })

    const touchTargetScore = totalTargets > 0 ? ((totalTargets - smallTargets) / totalTargets) * 100 : 100
    accessibilityTests.push({
      test: 'Touch Target Size',
      status: touchTargetScore > 95 ? 'pass' : touchTargetScore > 80 ? 'warning' : 'fail',
      message: `${smallTargets}/${totalTargets} targets below 44px minimum`,
      score: touchTargetScore,
      details: { smallTargets, totalTargets, threshold: 44 }
    })

    // Test 2: Font Size
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
    let smallText = 0
    let totalText = 0

    textElements.forEach(element => {
      const style = window.getComputedStyle(element)
      const fontSize = parseInt(style.fontSize)
      if (fontSize > 0) {
        totalText++
        if (fontSize < 16) {
          smallText++
        }
      }
    })

    const fontSizeScore = totalText > 0 ? ((totalText - smallText) / totalText) * 100 : 100
    accessibilityTests.push({
      test: 'Font Size',
      status: fontSizeScore > 90 ? 'pass' : fontSizeScore > 70 ? 'warning' : 'fail',
      message: `${smallText}/${totalText} elements below 16px minimum`,
      score: fontSizeScore,
      details: { smallText, totalText, threshold: 16 }
    })

    // Test 3: Color Contrast
    const hasHighContrastCSS = document.querySelector('style, link[rel="stylesheet"]')
    const supportsHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    accessibilityTests.push({
      test: 'High Contrast Support',
      status: hasHighContrastCSS ? 'pass' : 'warning',
      message: hasHighContrastCSS ? 'High contrast styles detected' : 'No high contrast styles found',
      score: hasHighContrastCSS ? 100 : 70,
      details: { supportsHighContrast }
    })

    // Test 4: Reduced Motion Support
    const supportsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasReducedMotionCSS = Array.from(document.styleSheets).some(sheet => {
      try {
        return Array.from(sheet.cssRules).some(rule => 
          rule.cssText.includes('prefers-reduced-motion')
        )
      } catch (e) {
        return false
      }
    })

    accessibilityTests.push({
      test: 'Reduced Motion Support',
      status: hasReducedMotionCSS ? 'pass' : 'warning',
      message: hasReducedMotionCSS ? 'Reduced motion styles detected' : 'No reduced motion support found',
      score: hasReducedMotionCSS ? 100 : 70,
      details: { supportsReducedMotion }
    })

    return accessibilityTests
  }

  // Usability Tests
  testUsability(): MobileTestResult[] {
    const usabilityTests: MobileTestResult[] = []

    // Test 1: Viewport Meta Tag
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    const hasProperViewport = viewportMeta && viewportMeta.content.includes('width=device-width')
    
    usabilityTests.push({
      test: 'Viewport Meta Tag',
      status: hasProperViewport ? 'pass' : 'fail',
      message: hasProperViewport ? 'Proper viewport meta tag found' : 'Missing or incorrect viewport meta tag',
      score: hasProperViewport ? 100 : 0,
      details: { content: viewportMeta?.content }
    })

    // Test 2: Input Zoom Prevention
    const inputs = document.querySelectorAll('input, select, textarea')
    let inputsWithProperSize = 0

    inputs.forEach(input => {
      const style = window.getComputedStyle(input)
      const fontSize = parseInt(style.fontSize)
      if (fontSize >= 16) {
        inputsWithProperSize++
      }
    })

    const inputZoomScore = inputs.length > 0 ? (inputsWithProperSize / inputs.length) * 100 : 100
    usabilityTests.push({
      test: 'Input Zoom Prevention',
      status: inputZoomScore > 90 ? 'pass' : inputZoomScore > 70 ? 'warning' : 'fail',
      message: `${inputsWithProperSize}/${inputs.length} inputs have proper font size`,
      score: inputZoomScore,
      details: { inputsWithProperSize, totalInputs: inputs.length }
    })

    // Test 3: Safe Area Support
    const hasSafeAreaSupport = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') !== ''
    
    usabilityTests.push({
      test: 'Safe Area Support',
      status: hasSafeAreaSupport ? 'pass' : 'warning',
      message: hasSafeAreaSupport ? 'Safe area insets detected' : 'No safe area support found',
      score: hasSafeAreaSupport ? 100 : 80,
      details: { hasSafeAreaSupport }
    })

    // Test 4: Touch Manipulation
    const elementsWithTouchManipulation = document.querySelectorAll('[style*="touch-action"], .touch-manipulation')
    
    usabilityTests.push({
      test: 'Touch Manipulation',
      status: elementsWithTouchManipulation.length > 0 ? 'pass' : 'warning',
      message: `${elementsWithTouchManipulation.length} elements optimized for touch`,
      score: elementsWithTouchManipulation.length > 0 ? 100 : 70,
      details: { count: elementsWithTouchManipulation.length }
    })

    return usabilityTests
  }

  // Compatibility Tests
  testCompatibility(): MobileTestResult[] {
    const compatibilityTests: MobileTestResult[] = []

    // Test 1: PWA Manifest
    const manifestLink = document.querySelector('link[rel="manifest"]')
    
    compatibilityTests.push({
      test: 'PWA Manifest',
      status: manifestLink ? 'pass' : 'warning',
      message: manifestLink ? 'PWA manifest found' : 'No PWA manifest detected',
      score: manifestLink ? 100 : 70
    })

    // Test 2: Service Worker
    const hasServiceWorker = 'serviceWorker' in navigator
    
    compatibilityTests.push({
      test: 'Service Worker Support',
      status: hasServiceWorker ? 'pass' : 'warning',
      message: hasServiceWorker ? 'Service Worker API available' : 'Service Worker not supported',
      score: hasServiceWorker ? 100 : 80
    })

    // Test 3: WebP Support
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    
    compatibilityTests.push({
      test: 'WebP Support',
      status: supportsWebP ? 'pass' : 'warning',
      message: supportsWebP ? 'WebP format supported' : 'WebP format not supported',
      score: supportsWebP ? 100 : 80
    })

    // Test 4: Intersection Observer
    const hasIntersectionObserver = 'IntersectionObserver' in window
    
    compatibilityTests.push({
      test: 'Intersection Observer',
      status: hasIntersectionObserver ? 'pass' : 'warning',
      message: hasIntersectionObserver ? 'Intersection Observer available' : 'Intersection Observer not supported',
      score: hasIntersectionObserver ? 100 : 60
    })

    return compatibilityTests
  }

  // Run all tests
  async runAllTests(): Promise<MobileTestSuite> {
    const performance = await this.testPerformance()
    const accessibility = this.testAccessibility()
    const usability = this.testUsability()
    const compatibility = this.testCompatibility()

    // Calculate overall score
    const allTests = [...performance, ...accessibility, ...usability, ...compatibility]
    const totalScore = allTests.reduce((sum, test) => sum + (test.score || 0), 0)
    const averageScore = totalScore / allTests.length

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F'
    if (averageScore >= 90) grade = 'A'
    else if (averageScore >= 80) grade = 'B'
    else if (averageScore >= 70) grade = 'C'
    else if (averageScore >= 60) grade = 'D'
    else grade = 'F'

    // Generate summary
    const failedTests = allTests.filter(test => test.status === 'fail').length
    const warningTests = allTests.filter(test => test.status === 'warning').length
    const passedTests = allTests.filter(test => test.status === 'pass').length

    let summary = `${passedTests} tests passed`
    if (warningTests > 0) summary += `, ${warningTests} warnings`
    if (failedTests > 0) summary += `, ${failedTests} failed`

    return {
      performance,
      accessibility,
      usability,
      compatibility,
      overall: {
        score: Math.round(averageScore),
        grade,
        summary
      }
    }
  }

  // Generate detailed report
  generateReport(results: MobileTestSuite): string {
    let report = `\n# Mobile Optimization Report\n\n`
    report += `**Overall Score: ${results.overall.score}/100 (Grade ${results.overall.grade})**\n`
    report += `${results.overall.summary}\n\n`

    const categories = [
      { name: 'Performance', tests: results.performance },
      { name: 'Accessibility', tests: results.accessibility },
      { name: 'Usability', tests: results.usability },
      { name: 'Compatibility', tests: results.compatibility }
    ]

    categories.forEach(category => {
      report += `## ${category.name}\n\n`
      category.tests.forEach(test => {
        const icon = test.status === 'pass' ? '✅' : test.status === 'warning' ? '⚠️' : '❌'
        report += `${icon} **${test.test}**: ${test.message}\n`
        if (test.score !== undefined) {
          report += `   Score: ${Math.round(test.score)}/100\n`
        }
      })
      report += '\n'
    })

    return report
  }

  // Quick mobile check
  static quickCheck(): { isMobileOptimized: boolean; issues: string[] } {
    const issues: string[] = []

    // Quick viewport check
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    if (!viewportMeta || !viewportMeta.content.includes('width=device-width')) {
      issues.push('Missing or incorrect viewport meta tag')
    }

    // Quick touch target check
    const buttons = document.querySelectorAll('button, a')
    let smallTargets = 0
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        smallTargets++
      }
    })
    if (smallTargets > 0) {
      issues.push(`${smallTargets} touch targets smaller than 44px`)
    }

    // Quick font size check
    const rootFontSize = parseInt(getComputedStyle(document.documentElement).fontSize)
    if (rootFontSize < 16) {
      issues.push('Root font size smaller than 16px')
    }

    return {
      isMobileOptimized: issues.length === 0,
      issues
    }
  }
}

// Export the tester
export const mobileTester = new MobileTester()

// Convenience functions
export const runMobileTests = () => mobileTester.runAllTests()
export const quickMobileCheck = () => MobileTester.quickCheck()
export const generateMobileReport = (results: MobileTestSuite) => mobileTester.generateReport(results)

// Automated testing on page load (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', async () => {
    // Wait a bit for the page to fully load
    setTimeout(async () => {
      const quickCheck = quickMobileCheck()
      if (!quickCheck.isMobileOptimized) {
        console.group('🔍 Mobile Optimization Issues')
        quickCheck.issues.forEach(issue => console.warn('⚠️', issue))
        console.groupEnd()
      } else {
        console.log('✅ Basic mobile optimization checks passed')
      }
    }, 2000)
  })
}

export default MobileTester