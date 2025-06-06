'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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

  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const isSupported = !!SpeechRecognition

    setState(prev => ({ ...prev, isSupported }))

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
        const errorMessage = getErrorMessage(event.error)
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
  }, [language, continuous, interimResults, maxAlternatives])

  // Start listening
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      const error = 'Speech recognition is not supported in this browser'
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

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    changeLanguage
  }
}

// Error message mapping
function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'Keine Sprache erkannt. Bitte versuchen Sie es erneut.'
    case 'audio-capture':
      return 'Audio-Aufnahme fehlgeschlagen. Überprüfen Sie Ihr Mikrofon.'
    case 'not-allowed':
      return 'Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff.'
    case 'network':
      return 'Netzwerkfehler bei der Spracherkennung.'
    case 'aborted':
      return 'Spracherkennung wurde abgebrochen.'
    case 'bad-grammar':
      return 'Spracherkennungsgrammatik-Fehler.'
    case 'language-not-supported':
      return 'Ausgewählte Sprache wird nicht unterstützt.'
    default:
      return `Spracherkennungsfehler: ${error}`
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