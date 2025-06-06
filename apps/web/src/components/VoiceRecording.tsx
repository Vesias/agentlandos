'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Languages, Square, Play, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import VoiceTroubleshooting from './VoiceTroubleshooting'

interface VoiceRecordingProps {
  onTranscript?: (text: string) => void
  onAudioData?: (audioBlob: Blob) => void
  onStart?: () => void
  onEnd?: () => void
  className?: string
  autoSend?: boolean
  showLanguageSelector?: boolean
  disabled?: boolean
}

const supportedLanguages = [
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'lb-LU', label: 'Lëtzebuergesch', flag: '🇱🇺' }
]

export default function VoiceRecording({
  onTranscript,
  onAudioData,
  onStart,
  onEnd,
  className = '',
  autoSend = false,
  showLanguageSelector = true,
  disabled = false
}: VoiceRecordingProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('de-DE')
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>(0)
  const chunksRef = useRef<Blob[]>([])

  // Voice recognition hook
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    changeLanguage,
    checkCompatibility,
    requestMicrophonePermission,
    browserInfo
  } = useVoiceRecognition({
    language: selectedLanguage,
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      console.log('Voice recognition result:', { text, isFinal, autoSend })
      if (isFinal && autoSend && text.trim()) {
        console.log('Auto-sending transcript:', text)
        onTranscript?.(text)
        resetTranscript()
      }
    },
    onStart: () => {
      console.log('Voice recognition started')
      setShowTranscript(true)
      onStart?.()
    },
    onEnd: () => {
      console.log('Voice recognition ended, transcript:', transcript)
      onEnd?.()
      if (!autoSend && transcript.trim()) {
        console.log('Sending final transcript:', transcript)
        onTranscript?.(transcript)
      }
    }
  })

  // Audio level visualization
  const updateAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    const normalizedLevel = Math.min(average / 128, 1)
    setAudioLevel(normalizedLevel)

    if (isRecording || isListening) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }

  // Start audio recording and speech recognition
  const startRecording = async () => {
    if (disabled) return

    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) {
      console.error('Microphone permission denied')
      return
    }

    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      audioStreamRef.current = stream

      // Set up audio context for visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Set up media recorder for audio capture
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setRecordedBlob(blob)
        onAudioData?.(blob)
      }

      mediaRecorderRef.current = mediaRecorder
      
      // Start recording
      mediaRecorder.start(1000) // Record in 1-second chunks
      setIsRecording(true)
      
      // Start speech recognition
      startListening()
      
      // Start audio level monitoring
      updateAudioLevel()

    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    stopListening()
    setIsRecording(false)
    setAudioLevel(0)
  }

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode)
    changeLanguage(langCode)
  }

  // Send transcript manually
  const sendTranscript = () => {
    if (transcript.trim()) {
      console.log('Manually sending transcript:', transcript)
      onTranscript?.(transcript)
      resetTranscript()
      setShowTranscript(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [])

  if (!isSupported) {
    const compatibility = checkCompatibility()
    
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <MicOff className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
          
          {/* Browser Info */}
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Browser: {browserInfo.name.charAt(0).toUpperCase() + browserInfo.name.slice(1)} {browserInfo.version}
              {browserInfo.isMobile && ' (Mobile)'}
            </div>
            <p className="text-sm text-yellow-700">{compatibility.message}</p>
          </div>
          
          {/* Recommendations */}
          <div className="text-left">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Empfehlungen:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {compatibility.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Download Links */}
          <div className="mt-3 pt-3 border-t border-yellow-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 justify-center">
                <a 
                  href="https://www.google.com/chrome/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  🔴 Chrome herunterladen
                </a>
                <a 
                  href="https://www.microsoft.com/edge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  🔷 Edge herunterladen
                </a>
              </div>
              <Button
                onClick={() => setShowTroubleshooting(true)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                Hilfe
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Language Selector */}
      {showLanguageSelector && (
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4 text-gray-500" />
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRecording || isListening}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center space-x-3">
        {/* Record Button */}
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          variant={isRecording ? "destructive" : "default"}
          size="sm"
          className="relative"
          title={`Spracherkennung ${isRecording ? 'stoppen' : 'starten'} (${browserInfo.name} ${browserInfo.version})`}
        >
          {isRecording ? (
            <Square className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          {isRecording ? 'Stopp' : 'Aufnahme'}
        </Button>
        
        {/* Browser compatibility indicator */}
        <div className="hidden sm:flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            {browserInfo.supportsWebkitSpeech ? '✅' : '⚠️'} {browserInfo.name}
          </div>
          {!browserInfo.supportsWebkitSpeech && (
            <Button
              onClick={() => setShowTroubleshooting(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Hilfe
            </Button>
          )}
        </div>

        {/* Audio Level Visualization */}
        {(isRecording || isListening) && (
          <div className="flex items-center space-x-1">
            <Volume2 className="w-4 h-4 text-green-500" />
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-4 rounded-full transition-all duration-100 ${
                    audioLevel > (i + 1) * 0.2 ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            {isListening && (
              <span className="text-xs text-green-600 animate-pulse">Höre zu...</span>
            )}
          </div>
        )}

        {/* Status Indicator */}
        {(isRecording || isListening) && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">
              {isRecording && isListening ? 'Aufnahme & Erkennung' : 
               isRecording ? 'Aufnahme läuft' : 'Spracherkennung'}
            </span>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {showTranscript && (transcript || interimTranscript) && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Live Transkript</h4>
            {!autoSend && transcript && (
              <Button onClick={sendTranscript} size="sm" variant="outline">
                <Play className="w-3 h-3 mr-1" />
                Senden
              </Button>
            )}
          </div>
          <div className="text-sm">
            <span className="text-gray-900">{transcript}</span>
            {interimTranscript && (
              <span className="text-gray-500 italic">{interimTranscript}</span>
            )}
          </div>
          {autoSend && (
            <div className="text-xs text-gray-500 mt-1">
              Text wird automatisch gesendet wenn die Sprache pausiert
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <MicOff className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium mb-1">Spracherkennungsfehler</p>
              <p className="text-sm text-red-600">{error}</p>
              
              {/* Additional help based on browser */}
              {browserInfo.name === 'firefox' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Firefox-Nutzer:</strong> Verwenden Sie Chrome oder Edge für Sprachfunktionen.
                  </p>
                </div>
              )}
              
              {browserInfo.name === 'safari' && browserInfo.isMobile && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Safari Mobile:</strong> Stellen Sie sicher, dass Sie HTTPS verwenden und Mikrofonzugriff erlaubt ist.
                  </p>
                </div>
              )}
              
              {error.includes('nicht erlaubt') && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Mikrofonzugriff:</strong> Klicken Sie auf das Mikrofon-Symbol in der Adressleiste und erlauben Sie den Zugriff.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recorded Audio Playback */}
      {recordedBlob && (
        <div className="p-3 bg-blue-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Aufgenommene Audio</span>
            <audio 
              controls 
              src={URL.createObjectURL(recordedBlob)}
              className="h-8"
            />
          </div>
        </div>
      )}
      
      {/* Troubleshooting Modal */}
      {showTroubleshooting && (
        <VoiceTroubleshooting
          isOpen={showTroubleshooting}
          onClose={() => setShowTroubleshooting(false)}
        />
      )}
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}