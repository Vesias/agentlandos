// Browser compatibility utilities for speech recognition and other web APIs
'use client'

import { mobileUtils } from './mobile-utils'

export interface BrowserInfo {
  name: string
  version: string
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  supportsWebkitSpeech: boolean
  supportsMozillaSpeech: boolean
  supportsMediaDevices: boolean
  supportsAudioContext: boolean
  supportsWebGL: boolean
  supportsServiceWorker: boolean
}

export interface CompatibilityCheck {
  compatible: boolean
  message: string
  recommendations: string[]
  level: 'excellent' | 'good' | 'limited' | 'none'
}

export interface FeatureSupport {
  speechRecognition: CompatibilityCheck
  mediaRecording: CompatibilityCheck
  audioProcessing: CompatibilityCheck
  notifications: CompatibilityCheck
  storage: CompatibilityCheck
}

// Comprehensive browser detection
export const detectBrowser = (): BrowserInfo => {
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      version: '0',
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      supportsWebkitSpeech: false,
      supportsMozillaSpeech: false,
      supportsMediaDevices: false,
      supportsAudioContext: false,
      supportsWebGL: false,
      supportsServiceWorker: false
    }
  }

  const userAgent = navigator.userAgent
  const isMobile = mobileUtils.isMobile()
  const isIOS = mobileUtils.isIOS()
  const isAndroid = mobileUtils.isAndroid()
  
  let browserName = 'unknown'
  let browserVersion = '0'
  
  // Browser detection with more accuracy
  if (userAgent.includes('Edg/')) {
    browserName = 'edge'
    const match = userAgent.match(/Edg\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Chrome/') && !userAgent.includes('Chromium/')) {
    browserName = 'chrome'
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    browserName = 'safari'
    const match = userAgent.match(/Version\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Firefox/')) {
    browserName = 'firefox'
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) {
    browserName = 'opera'
    const match = userAgent.match(/(Opera|OPR)\/(\d+\.\d+)/)
    browserVersion = match ? match[2] : '0'
  } else if (userAgent.includes('Chromium/')) {
    browserName = 'chromium'
    const match = userAgent.match(/Chromium\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : '0'
  }
  
  // Feature detection
  const supportsWebkitSpeech = !!(window as any).webkitSpeechRecognition
  const supportsMozillaSpeech = !!(window as any).SpeechRecognition && !supportsWebkitSpeech
  const supportsMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const supportsAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext)
  const supportsWebGL = (() => {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch (e) {
      return false
    }
  })()
  const supportsServiceWorker = !!('serviceWorker' in navigator)
  
  return {
    name: browserName,
    version: browserVersion,
    isMobile,
    isIOS,
    isAndroid,
    supportsWebkitSpeech,
    supportsMozillaSpeech,
    supportsMediaDevices,
    supportsAudioContext,
    supportsWebGL,
    supportsServiceWorker
  }
}

// Speech recognition compatibility check
export const checkSpeechRecognitionSupport = (browserInfo: BrowserInfo): CompatibilityCheck => {
  const { name, version, isMobile, isIOS, supportsWebkitSpeech } = browserInfo
  
  if (supportsWebkitSpeech) {
    let level: 'excellent' | 'good' | 'limited' | 'none' = 'excellent'
    let message = ''
    const recommendations: string[] = []
    
    switch (name) {
      case 'chrome':
        if (parseFloat(version) >= 33) {
          level = 'excellent'
          message = '🟢 Chrome bietet vollständige Spracherkennungsunterstützung'
          recommendations.push('Optimale Browserumgebung für Spracherkennung')
        } else {
          level = 'limited'
          message = '🟡 Chrome-Version zu alt für optimale Spracherkennung'
          recommendations.push('Aktualisieren Sie auf Chrome 33+ für beste Ergebnisse')
        }
        break
        
      case 'edge':
        if (parseFloat(version) >= 79) {
          level = 'excellent'
          message = '🔷 Edge (Chromium) bietet vollständige Spracherkennungsunterstützung'
        } else {
          level = 'limited'
          message = '🟡 Edge Legacy hat eingeschränkte Spracherkennungsunterstützung'
          recommendations.push('Aktualisieren Sie auf die neue Edge-Version (Chromium-basiert)')
        }
        break
        
      case 'safari':
        if (isIOS) {
          level = 'good'
          message = '🍎 Safari iOS bietet grundlegende Spracherkennungsunterstützung'
          recommendations.push(
            'Stellen Sie sicher, dass HTTPS verwendet wird',
            'Mikrofonberechtigungen in iOS-Einstellungen aktivieren'
          )
        } else {
          level = 'good'
          message = '🍎 Safari macOS bietet grundlegende Spracherkennungsunterstützung'
          recommendations.push('Chrome bietet zuverlässigere Spracherkennung')
        }
        break
        
      case 'opera':
        level = 'good'
        message = '🔴 Opera bietet grundlegende Spracherkennungsunterstützung'
        recommendations.push('Chrome wird für beste Spracherkennungsergebnisse empfohlen')
        break
        
      default:
        level = 'good'
        message = '✅ Ihr Browser unterstützt Spracherkennung'
    }
    
    // Add mobile-specific recommendations
    if (isMobile) {
      recommendations.push(
        'Sprechen Sie in ruhiger Umgebung',
        'Halten Sie das Gerät nah am Mund',
        'Verwenden Sie ein externes Mikrofon für beste Qualität'
      )
    }
    
    return {
      compatible: true,
      message,
      recommendations,
      level
    }
  }
  
  // No speech recognition support
  let message = ''
  const recommendations: string[] = []
  
  switch (name) {
    case 'firefox':
      message = '🦊 Firefox unterstützt derzeit keine Web Speech API'
      recommendations.push(
        'Verwenden Sie Chrome für Sprachfunktionen',
        'Firefox arbeitet an der Implementierung',
        'Alternativ: Safari oder Edge verwenden'
      )
      break
      
    case 'safari':
      if (parseFloat(version) < 14.1) {
        message = '🍎 Ihre Safari-Version ist zu alt für Spracherkennung'
        recommendations.push(
          'Aktualisieren Sie Safari auf Version 14.1+',
          'Oder verwenden Sie Chrome/Edge'
        )
      } else {
        message = '🍎 Safari-Spracherkennung möglicherweise nicht verfügbar'
        recommendations.push('Versuchen Sie Chrome für bessere Kompatibilität')
      }
      break
      
    default:
      message = '❌ Ihr Browser unterstützt keine Spracherkennung'
      recommendations.push(
        'Installieren Sie Chrome (empfohlen)',
        'Oder verwenden Sie Safari/Edge als Alternative'
      )
  }
  
  return {
    compatible: false,
    message,
    recommendations,
    level: 'none'
  }
}

// Media recording compatibility check
export const checkMediaRecordingSupport = (browserInfo: BrowserInfo): CompatibilityCheck => {
  const { name, supportsMediaDevices } = browserInfo
  
  if (supportsMediaDevices && 'MediaRecorder' in window) {
    return {
      compatible: true,
      message: '✅ Audio-Aufnahme wird vollständig unterstützt',
      recommendations: [
        'Mikrofonzugriff erlauben wenn gefragt',
        'Für beste Qualität externes Mikrofon verwenden'
      ],
      level: 'excellent'
    }
  }
  
  const recommendations: string[] = []
  let message = ''
  
  if (!supportsMediaDevices) {
    message = '❌ Gerätezugriff (Mikrofon) wird nicht unterstützt'
    recommendations.push(
      'HTTPS verwenden (erforderlich für Mikrofonzugriff)',
      'Browser aktualisieren'
    )
  } else {
    message = '❌ Audio-Aufnahme wird nicht unterstützt'
    recommendations.push('Modernen Browser verwenden (Chrome, Firefox, Safari)')
  }
  
  return {
    compatible: false,
    message,
    recommendations,
    level: 'none'
  }
}

// Comprehensive feature support check
export const checkAllFeatureSupport = (browserInfo: BrowserInfo): FeatureSupport => {
  return {
    speechRecognition: checkSpeechRecognitionSupport(browserInfo),
    mediaRecording: checkMediaRecordingSupport(browserInfo),
    audioProcessing: {
      compatible: browserInfo.supportsAudioContext,
      message: browserInfo.supportsAudioContext 
        ? '✅ Audio-Verarbeitung unterstützt' 
        : '❌ Audio-Verarbeitung nicht verfügbar',
      recommendations: browserInfo.supportsAudioContext 
        ? ['Audio-Features funktionieren optimal']
        : ['Browser aktualisieren für Audio-Features'],
      level: browserInfo.supportsAudioContext ? 'excellent' : 'none'
    },
    notifications: {
      compatible: 'Notification' in window,
      message: 'Notification' in window 
        ? '✅ Browser-Benachrichtigungen verfügbar' 
        : '❌ Benachrichtigungen nicht unterstützt',
      recommendations: 'Notification' in window 
        ? ['Benachrichtigungen erlauben für beste Erfahrung']
        : ['Modernen Browser für Benachrichtigungen verwenden'],
      level: 'Notification' in window ? 'excellent' : 'none'
    },
    storage: {
      compatible: 'localStorage' in window && 'sessionStorage' in window,
      message: '✅ Browser-Speicher verfügbar',
      recommendations: ['Daten werden lokal gespeichert'],
      level: 'excellent'
    }
  }
}

// Get browser-specific recommendations
export const getBrowserRecommendations = (browserInfo: BrowserInfo): string[] => {
  const { name, version, isMobile } = browserInfo
  const recommendations: string[] = []
  
  switch (name) {
    case 'chrome':
      if (parseFloat(version) < 90) {
        recommendations.push('🔄 Chrome aktualisieren für neueste Features')
      }
      recommendations.push('✅ Optimaler Browser für alle Features')
      break
      
    case 'firefox':
      recommendations.push(
        '🦊 Firefox: Keine Spracherkennung verfügbar',
        '💡 Tipp: Chrome für Sprachfeatures verwenden'
      )
      break
      
    case 'safari':
      if (isMobile) {
        recommendations.push(
          '🍎 Safari iOS: Grundfunktionen verfügbar',
          '💡 Tipp: Chrome iOS für bessere Kompatibilität'
        )
      } else {
        recommendations.push(
          '🍎 Safari macOS: Grundfunktionen verfügbar',
          '💡 Tipp: Chrome für erweiterte Features'
        )
      }
      break
      
    case 'edge':
      if (parseFloat(version) >= 79) {
        recommendations.push('✅ Edge (Chromium): Vollständige Unterstützung')
      } else {
        recommendations.push('🔄 Edge auf Chromium-Version aktualisieren')
      }
      break
      
    default:
      recommendations.push(
        '❌ Unbekannter Browser',
        '💡 Chrome, Safari oder Edge empfohlen'
      )
  }
  
  // Mobile-specific recommendations
  if (isMobile) {
    recommendations.push(
      '📱 Mobile Optimierungen aktiv',
      '🔇 In ruhiger Umgebung für beste Ergebnisse'
    )
  }
  
  return recommendations
}

// Export the browser info as a singleton
let cachedBrowserInfo: BrowserInfo | null = null

export const getBrowserInfo = (): BrowserInfo => {
  if (!cachedBrowserInfo) {
    cachedBrowserInfo = detectBrowser()
  }
  return cachedBrowserInfo
}

// Utility to display compatibility status
export const getCompatibilityEmoji = (level: CompatibilityCheck['level']): string => {
  switch (level) {
    case 'excellent': return '🟢'
    case 'good': return '🟡'
    case 'limited': return '🟠'
    case 'none': return '🔴'
    default: return '⚪'
  }
}

// Export commonly used functions
export const browserCompatibility = {
  detectBrowser,
  checkSpeechRecognitionSupport,
  checkMediaRecordingSupport,
  checkAllFeatureSupport,
  getBrowserRecommendations,
  getBrowserInfo,
  getCompatibilityEmoji
}

export default browserCompatibility