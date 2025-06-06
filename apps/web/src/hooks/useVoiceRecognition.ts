'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { mobileUtils } from '@/lib/mobile-utils'

interface UseVoiceRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

interface VoiceRecognitionState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  browserInfo: {
    name: string
    version: string
    isMobile: boolean
    supportsWebkitSpeech: boolean
    supportsMozillaSpeech: boolean
  }
}

interface BrowserInfo {
  name: string
  version: string
  isMobile: boolean
  supportsWebkitSpeech: boolean
  supportsMozillaSpeech: boolean
}

// Browser detection utilities
const detectBrowser = (): BrowserInfo => {
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      version: '0',
      isMobile: false,
      supportsWebkitSpeech: false,
      supportsMozillaSpeech: false
    }
  }

  const userAgent = navigator.userAgent
  const isMobile = mobileUtils.isMobile()
  
  let browserName = 'unknown'
  let browserVersion = '0'
  
  // Browser detection
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'safari'
    const match = userAgent.match(/Version\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Edg')) {
    browserName = 'edge'
    const match = userAgent.match(/Edg\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Firefox')) {
    browserName = 'firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    browserVersion = match ? match[1] : '0'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browserName = 'opera'
    const match = userAgent.match(/(Opera|OPR)\/(\d+)/)
    browserVersion = match ? match[2] : '0'
  }
  
  // Check speech recognition support
  const supportsWebkitSpeech = !!window.webkitSpeechRecognition
  const supportsMozillaSpeech = !!window.SpeechRecognition && !window.webkitSpeechRecognition
  
  return {
    name: browserName,
    version: browserVersion,
    isMobile,
    supportsWebkitSpeech,
    supportsMozillaSpeech
  }
}

// Get the best available Speech Recognition constructor
const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null
  
  // Prefer webkit implementation (Chrome, Safari, Edge)
  if (window.webkitSpeechRecognition) {
    return window.webkitSpeechRecognition
  }
  
  // Fallback to standard implementation (Firefox in future)
  if (window.SpeechRecognition) {
    return window.SpeechRecognition
  }
  
  return null
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    language = 'de-DE', // Default to German for Saarland
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    onResult,
    onError,
    onStart,
    onEnd
  } = options

  const browserInfo = detectBrowser()
  
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    browserInfo
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')

  // Store callbacks in refs to avoid useEffect dependencies
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  const onStartRef = useRef(onStart)
  const onEndRef = useRef(onEnd)

  // Update refs when callbacks change
  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
    onStartRef.current = onStart
    onEndRef.current = onEnd
  })

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    const isSupported = !!SpeechRecognition
    
    // Log browser compatibility for debugging
    console.log('🎤 Voice Recognition Browser Support:', {
      browser: browserInfo.name,
      version: browserInfo.version,
      mobile: browserInfo.isMobile,
      webkitSupport: browserInfo.supportsWebkitSpeech,
      mozillaSupport: browserInfo.supportsMozillaSpeech,
      isSupported
    })

    setState(prev => ({ ...prev, isSupported, browserInfo }))

    if (isSupported) {
      const recognition = new SpeechRecognition()
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = language
      recognition.maxAlternatives = maxAlternatives

      // Handle speech recognition results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = finalTranscriptRef.current

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        finalTranscriptRef.current = finalTranscript

        setState(prev => ({
          ...prev,
          transcript: finalTranscript,
          interimTranscript: interimTranscript
        }))

        // Call onResult callback if provided
        if (onResultRef.current) {
          onResultRef.current(finalTranscript || interimTranscript, !!finalTranscript)
        }
      }

      // Handle recognition start
      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }))
        onStartRef.current?.()
      }

      // Handle recognition end
      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
        onEndRef.current?.()
      }

      // Handle recognition errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage = getErrorMessage(event.error, browserInfo)
        console.error('🎤 Speech Recognition Error:', {
          error: event.error,
          message: event.message,
          browser: browserInfo.name,
          mobile: browserInfo.isMobile
        })
        
        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage
        }))
        onErrorRef.current?.(errorMessage)
      }

      // Handle no speech detected
      recognition.onspeechend = () => {
        recognition.stop()
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, continuous, interimResults, maxAlternatives, browserInfo.name])

  // Start listening
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      const error = getBrowserSpecificErrorMessage(browserInfo)
      setState(prev => ({ ...prev, error }))
      onError?.(error)
      return
    }

    if (!recognitionRef.current || state.isListening) {
      return
    }

    // Clear previous results
    finalTranscriptRef.current = ''
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null
    }))

    try {
      recognitionRef.current.start()
    } catch (error) {
      const errorMessage = 'Failed to start speech recognition'
      setState(prev => ({ ...prev, error: errorMessage }))
      onError?.(errorMessage)
    }
  }, [state.isSupported, state.isListening, onError])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop()
    }
  }, [state.isListening])

  // Reset transcript
  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = ''
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null
    }))
  }, [])

  // Change language
  const changeLanguage = useCallback((newLanguage: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLanguage
    }
  }, [])

  // Browser compatibility check function
  const checkCompatibility = useCallback((): { compatible: boolean, message: string, recommendations: string[] } => {
    const { name, version, isMobile, supportsWebkitSpeech } = browserInfo
    
    if (supportsWebkitSpeech) {
      return {
        compatible: true,
        message: `✅ ${name.charAt(0).toUpperCase() + name.slice(1)} unterstützt Spracherkennung vollständig.`,
        recommendations: [
          'Erlauben Sie Mikrofonzugriff wenn gefragt',
          'Sprechen Sie deutlich und in normaler Lautstärke',
          'Stellen Sie sicher, dass Ihr Mikrofon funktioniert'
        ]
      }
    }
    
    const recommendations: string[] = []
    let message = ''
    
    switch (name) {
      case 'firefox':
        message = '⚠️ Firefox unterstützt derzeit keine Web Speech API.'
        recommendations.push(
          'Verwenden Sie Chrome für beste Spracherkennungsergebnisse',
          'Alternativ können Sie Safari oder Edge verwenden',
          'Firefox arbeitet an der Implementierung für zukünftige Versionen'
        )
        break
        
      case 'safari':
        if (isMobile) {
          message = '⚠️ Safari Mobile hat eingeschränkte Spracherkennungsunterstützung.'
          recommendations.push(
            'Stellen Sie sicher, dass Sie HTTPS verwenden',
            'Erlauben Sie Mikrofonzugriff in den Safari-Einstellungen',
            'Chrome Mobile bietet bessere Spracherkennungsleistung'
          )
        } else {
          message = '⚠️ Safari Desktop hat grundlegende Spracherkennungsunterstützung.'
          recommendations.push(
            'Chrome bietet zuverlässigere Spracherkennung',
            'Stellen Sie sicher, dass macOS-Mikrofonberechtigungen gewährt sind'
          )
        }
        break
        
      default:
        message = '❌ Ihr Browser unterstützt keine Spracherkennung.'
        recommendations.push(
          'Verwenden Sie Chrome (empfohlen)',
          'Safari und Edge bieten grundlegende Unterstützung',
          'Firefox unterstützt derzeit keine Spracherkennung'
        )
    }
    
    return {
      compatible: false,
      message,
      recommendations
    }
  }, [browserInfo])
  
  // Request microphone permission
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately after getting permission
      return true
    } catch (error) {
      console.error('Microphone permission denied:', error)
      return false
    }
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    changeLanguage,
    checkCompatibility,
    requestMicrophonePermission,
    browserInfo
  }
}

// Browser-specific error messages
function getBrowserSpecificErrorMessage(browserInfo: BrowserInfo): string {
  const { name, version, isMobile } = browserInfo
  
  switch (name) {
    case 'firefox':
      return `🦊 Firefox unterstützt derzeit keine Spracherkennung. Bitte verwenden Sie Chrome, Safari oder Edge für Sprachfunktionen.`
    
    case 'safari':
      if (isMobile) {
        return `🍎 Safari Mobile: Spracherkennung ist nur über HTTPS verfügbar. Bitte stellen Sie sicher, dass Sie eine sichere Verbindung verwenden.`
      }
      return `🍎 Safari Desktop: Spracherkennung ist verfügbar, aber möglicherweise eingeschränkt. Chrome wird für beste Ergebnisse empfohlen.`
    
    case 'chrome':
      if (parseInt(version) < 25) {
        return `🟢 Ihr Chrome-Browser (v${version}) ist zu alt. Bitte aktualisieren Sie auf Chrome 25+ für Sprachfunktionen.`
      }
      return `🟢 Chrome unterstützt Spracherkennung. Bitte erlauben Sie Mikrofonzugriff wenn gefragt.`
    
    case 'edge':
      if (parseInt(version) < 79) {
        return `🔷 Ihr Edge-Browser (v${version}) unterstützt möglicherweise keine Spracherkennung. Bitte aktualisieren Sie auf Edge 79+.`
      }
      return `🔷 Edge unterstützt Spracherkennung. Bitte erlauben Sie Mikrofonzugriff wenn gefragt.`
    
    case 'opera':
      return `🔴 Opera: Spracherkennung ist möglicherweise eingeschränkt. Chrome wird für beste Ergebnisse empfohlen.`
    
    default:
      if (isMobile) {
        return `📱 Mobile Browser: Spracherkennung wird in diesem Browser nicht unterstützt. Versuchen Sie Chrome Mobile oder Safari.`
      }
      return `🌐 Unbekannter Browser: Spracherkennung wird nicht unterstützt. Bitte verwenden Sie Chrome, Safari oder Edge.`
  }
}

// Enhanced error message mapping
function getErrorMessage(error: string, browserInfo: BrowserInfo): string {
  const { name, isMobile } = browserInfo
  
  switch (error) {
    case 'no-speech':
      return 'Keine Sprache erkannt. Sprechen Sie deutlicher und versuchen Sie es erneut.'
    
    case 'audio-capture':
      if (isMobile) {
        return 'Mikrofon nicht verfügbar. Prüfen Sie die App-Berechtigungen in den Einstellungen.'
      }
      return 'Audio-Aufnahme fehlgeschlagen. Überprüfen Sie Ihr Mikrofon und dessen Anschluss.'
    
    case 'not-allowed':
      if (name === 'safari' && isMobile) {
        return 'Mikrofon-Zugriff blockiert. Tippen Sie auf das Mikrofon-Symbol in der Adressleiste und erlauben Sie den Zugriff.'
      }
      return 'Mikrofon-Zugriff verweigert. Klicken Sie auf das Mikrofon-Symbol in der Adressleiste und erlauben Sie den Zugriff.'
    
    case 'network':
      return 'Netzwerkfehler bei der Spracherkennung. Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
    
    case 'aborted':
      return 'Spracherkennung wurde unterbrochen. Versuchen Sie es erneut.'
    
    case 'bad-grammar':
      return 'Spracherkennungsgrammatik-Fehler. Versuchen Sie eine andere Sprache oder sprechen Sie deutlicher.'
    
    case 'language-not-supported':
      return 'Die ausgewählte Sprache wird nicht unterstützt. Wählen Sie Deutsch, Englisch oder Französisch.'
    
    case 'service-not-allowed':
      return 'Spracherkennungsdienst nicht verfügbar. Prüfen Sie Ihre Internetverbindung.'
    
    default:
      return `Spracherkennungsfehler: ${error}. Versuchen Sie es erneut oder verwenden Sie einen anderen Browser.`
  }
}

// TypeScript declarations for Speech Recognition API
declare global {
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message?: string
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative
    length: number
    isFinal: boolean
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult
    length: number
  }

  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    start(): void
    stop(): void
    abort(): void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onstart: (() => void) | null
    onend: (() => void) | null
    onspeechend: (() => void) | null
  }

  interface SpeechRecognitionConstructor {
    new(): SpeechRecognition
  }

  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}