"use client";

import React, { useState, useEffect, useRef } from "react";
import { enhancedStreamingService } from "@/lib/mastra/enhanced-ai-integration";

interface VoiceInterfaceProps {
  onResponse?: (response: string) => void;
  language?: "de-DE" | "fr-FR" | "en-US";
  enableRealTimeTranscription?: boolean;
  agentMode?: "general" | "business" | "tourism" | "admin";
}

interface VoiceSession {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
  responseText: string;
  error: string | null;
}

export default function AdvancedVoiceInterface({
  onResponse,
  language = "de-DE",
  enableRealTimeTranscription = true,
  agentMode = "general",
}: VoiceInterfaceProps) {
  const [session, setSession] = useState<VoiceSession>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: "",
    confidence: 0,
    responseText: "",
    error: null,
  });

  const [isSupported, setIsSupported] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: null as SpeechSynthesisVoice | null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    initializeVoiceInterface();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      loadAvailableVoices();
    }
  }, [language]);

  const initializeVoiceInterface = async () => {
    try {
      // Check browser support
      const hasSpeechRecognition =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      const hasSpeechSynthesis = "speechSynthesis" in window;

      if (!hasSpeechRecognition || !hasSpeechSynthesis) {
        setSession((prev) => ({
          ...prev,
          error: "Voice interface not supported in this browser",
        }));
        return;
      }

      setIsSupported(true);

      // Initialize Speech Recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = enableRealTimeTranscription;
        recognitionRef.current.lang = language;
        recognitionRef.current.maxAlternatives = 3;

        recognitionRef.current.onstart = () => {
          setSession((prev) => ({ ...prev, isListening: true, error: null }));
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";
          let maxConfidence = 0;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;

            if (result.isFinal) {
              finalTranscript += transcript;
              maxConfidence = Math.max(maxConfidence, confidence);
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setSession((prev) => ({
              ...prev,
              transcript: finalTranscript,
              confidence: maxConfidence,
              isListening: false,
              isProcessing: true,
            }));

            processVoiceInput(finalTranscript);
          } else if (enableRealTimeTranscription && interimTranscript) {
            setSession((prev) => ({
              ...prev,
              transcript: interimTranscript,
              confidence: 0,
            }));
          }
        };

        recognitionRef.current.onerror = (event) => {
          setSession((prev) => ({
            ...prev,
            isListening: false,
            error: `Speech recognition error: ${event.error}`,
          }));
        };

        recognitionRef.current.onend = () => {
          setSession((prev) => ({ ...prev, isListening: false }));
        };
      }

      // Initialize Speech Synthesis
      synthRef.current = window.speechSynthesis;

      // Initialize Audio Context for advanced audio processing
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (error) {
      console.error("Voice interface initialization error:", error);
      setSession((prev) => ({
        ...prev,
        error: "Failed to initialize voice interface",
      }));
    }
  };

  const loadAvailableVoices = () => {
    if (!synthRef.current) return;

    const voices = synthRef.current.getVoices();
    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang.startsWith(language.split("-")[0]) && voice.localService,
      ) ||
      voices.find((voice) => voice.lang.startsWith(language.split("-")[0])) ||
      voices[0];

    setVoiceSettings((prev) => ({ ...prev, voice: preferredVoice }));
  };

  const startListening = async () => {
    if (!recognitionRef.current || session.isListening) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setSession((prev) => ({
        ...prev,
        transcript: "",
        error: null,
        responseText: "",
      }));

      recognitionRef.current.start();
    } catch (error) {
      setSession((prev) => ({
        ...prev,
        error: "Microphone access denied",
      }));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && session.isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceInput = async (transcript: string) => {
    try {
      setSession((prev) => ({ ...prev, isProcessing: true }));

      // Process with enhanced AI streaming service
      const response = await enhancedStreamingService.createChatStream(
        [{ role: "user", content: transcript }],
        {
          agent: agentMode,
          temperature: 0.7,
          tools: true,
        },
      );

      let fullResponse = "";

      // Handle streaming response
      for await (const chunk of response) {
        if (chunk.type === "text") {
          fullResponse += chunk.text;
        }
      }

      setSession((prev) => ({
        ...prev,
        responseText: fullResponse,
        isProcessing: false,
      }));

      // Speak the response
      await speakResponse(fullResponse);

      // Call callback if provided
      if (onResponse) {
        onResponse(fullResponse);
      }
    } catch (error) {
      console.error("Voice processing error:", error);
      setSession((prev) => ({
        ...prev,
        isProcessing: false,
        error: "Failed to process voice input",
      }));
    }
  };

  const speakResponse = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current || !voiceSettings.voice) {
        reject("Speech synthesis not available");
        return;
      }

      // Stop any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voiceSettings.voice;
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = language;

      utterance.onstart = () => {
        setSession((prev) => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setSession((prev) => ({ ...prev, isSpeaking: false }));
        resolve();
      };

      utterance.onerror = (error) => {
        setSession((prev) => ({
          ...prev,
          isSpeaking: false,
          error: `Speech synthesis error: ${error.error}`,
        }));
        reject(error);
      };

      synthRef.current.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSession((prev) => ({ ...prev, isSpeaking: false }));
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-500 mr-2">⚠️</span>
          <div>
            <h3 className="text-red-800 font-medium">
              Voice Interface nicht verfügbar
            </h3>
            <p className="text-red-600 text-sm mt-1">
              Ihr Browser unterstützt keine Spracheingabe. Bitte verwenden Sie
              Chrome, Firefox oder Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🎤 SAAR-GPT Voice Assistant
        </h3>
        <p className="text-sm text-gray-600">
          Sprechen Sie mit dem Saarland KI-Assistenten
        </p>
      </div>

      {/* Voice Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={session.isListening ? stopListening : startListening}
          disabled={session.isProcessing || session.isSpeaking}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 ${
            session.isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : session.isProcessing
                ? "bg-yellow-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          {session.isListening ? "🔴" : session.isProcessing ? "⏳" : "🎤"}
        </button>

        {session.isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors"
          >
            🔇
          </button>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-center mb-4">
        {session.isListening && (
          <div className="text-blue-600 font-medium">🎤 Höre zu...</div>
        )}
        {session.isProcessing && (
          <div className="text-yellow-600 font-medium">
            🧠 Verarbeite Anfrage...
          </div>
        )}
        {session.isSpeaking && (
          <div className="text-green-600 font-medium">
            🔊 Spreche Antwort...
          </div>
        )}
        {!session.isListening &&
          !session.isProcessing &&
          !session.isSpeaking && (
            <div className="text-gray-500">
              Klicken Sie auf das Mikrofon um zu starten
            </div>
          )}
      </div>

      {/* Transcript Display */}
      {session.transcript && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-blue-800 font-medium text-sm mb-1">
                  Ihre Eingabe:
                </h4>
                <p className="text-blue-900">{session.transcript}</p>
              </div>
              {session.confidence > 0 && (
                <div className="text-blue-600 text-xs">
                  {Math.round(session.confidence * 100)}% sicher
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response Display */}
      {session.responseText && (
        <div className="mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-green-800 font-medium text-sm mb-1">
              SAAR-GPT Antwort:
            </h4>
            <p className="text-green-900">{session.responseText}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {session.error && (
        <div className="mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-medium text-sm mb-1">Fehler:</h4>
            <p className="text-red-900">{session.error}</p>
          </div>
        </div>
      )}

      {/* Voice Settings */}
      <div className="border-t border-gray-200 pt-4">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            ⚙️ Sprach-Einstellungen
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Sprechgeschwindigkeit
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    rate: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg"
              />
              <div className="text-xs text-gray-500">
                {voiceSettings.rate.toFixed(1)}x
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Tonhöhe
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    pitch: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg"
              />
              <div className="text-xs text-gray-500">
                {voiceSettings.pitch.toFixed(1)}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Lautstärke
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({
                    ...prev,
                    volume: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg"
              />
              <div className="text-xs text-gray-500">
                {Math.round(voiceSettings.volume * 100)}%
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Agent Mode Selector */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="text-xs text-gray-600 mb-2">KI-Modus:</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "general", label: "🤖 Allgemein", color: "blue" },
            { key: "business", label: "💼 Business", color: "green" },
            { key: "tourism", label: "🏛️ Tourismus", color: "purple" },
            { key: "admin", label: "📋 Verwaltung", color: "orange" },
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => {
                /* Update agent mode */
              }}
              className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                agentMode === mode.key
                  ? `bg-${mode.color}-100 border-${mode.color}-300 text-${mode.color}-800`
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
