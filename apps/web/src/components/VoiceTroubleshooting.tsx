"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Mic,
  MicOff,
  Volume2,
  Settings,
  RefreshCw,
  Smartphone,
  Monitor,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  browserCompatibility,
  type BrowserInfo,
  type FeatureSupport,
} from "@/lib/browser-compatibility";

interface VoiceTroubleshootingProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function VoiceTroubleshooting({
  isOpen = true,
  onClose,
  className = "",
}: VoiceTroubleshootingProps) {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [featureSupport, setFeatureSupport] = useState<FeatureSupport | null>(
    null,
  );
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "browser",
  ]);
  const [microphoneTest, setMicrophoneTest] = useState<{
    testing: boolean;
    hasPermission: boolean | null;
    audioLevel: number;
  }>({
    testing: false,
    hasPermission: null,
    audioLevel: 0,
  });

  useEffect(() => {
    const info = browserCompatibility.getBrowserInfo();
    const support = browserCompatibility.checkAllFeatureSupport(info);
    setBrowserInfo(info);
    setFeatureSupport(support);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const testMicrophone = async () => {
    setMicrophoneTest((prev) => ({ ...prev, testing: true }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneTest((prev) => ({ ...prev, hasPermission: true }));

      // Set up audio context for level detection
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        setMicrophoneTest((prev) => ({ ...prev, audioLevel: normalizedLevel }));

        if (microphoneTest.testing) {
          requestAnimationFrame(checkAudioLevel);
        }
      };

      checkAudioLevel();

      // Stop after 5 seconds
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        setMicrophoneTest({
          testing: false,
          hasPermission: true,
          audioLevel: 0,
        });
      }, 5000);
    } catch (error) {
      console.error("Microphone test failed:", error);
      setMicrophoneTest({
        testing: false,
        hasPermission: false,
        audioLevel: 0,
      });
    }
  };

  if (!isOpen || !browserInfo || !featureSupport) {
    return null;
  }

  const speechSupport = featureSupport.speechRecognition;
  const mediaSupport = featureSupport.mediaRecording;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${className}`}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Spracherkennung Fehlerbehebung
                </h2>
                <p className="text-sm text-gray-600">
                  Diagnostik und Lösungen für Kompatibilitätsprobleme
                </p>
              </div>
            </div>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                Schließen
              </Button>
            )}
          </div>

          {/* Browser Information */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection("browser")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded">
                  {browserInfo.isMobile ? (
                    <Smartphone className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Monitor className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">
                    Browser-Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    {browserInfo.name.charAt(0).toUpperCase() +
                      browserInfo.name.slice(1)}{" "}
                    {browserInfo.version}
                    {browserInfo.isMobile && " (Mobile)"}
                  </p>
                </div>
              </div>
              {expandedSections.includes("browser") ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.includes("browser") && (
              <div className="mt-3 p-4 bg-white border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Browser-Details
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Name: {browserInfo.name}</li>
                      <li>Version: {browserInfo.version}</li>
                      <li>
                        Plattform: {browserInfo.isMobile ? "Mobile" : "Desktop"}
                      </li>
                      {browserInfo.isIOS && <li>iOS-Gerät erkannt</li>}
                      {browserInfo.isAndroid && <li>Android-Gerät erkannt</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Feature-Unterstützung
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center space-x-2">
                        {browserInfo.supportsWebkitSpeech ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>WebKit Speech Recognition</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        {browserInfo.supportsMediaDevices ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>Mikrofon-Zugriff</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        {browserInfo.supportsAudioContext ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>Audio-Verarbeitung</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Speech Recognition Status */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection("speech")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded ${
                    speechSupport.compatible ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {speechSupport.compatible ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Spracherkennung</h3>
                  <p className="text-sm text-gray-600">
                    {speechSupport.message}
                  </p>
                </div>
              </div>
              {expandedSections.includes("speech") ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.includes("speech") && (
              <div className="mt-3 p-4 bg-white border rounded-lg">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <div className="flex items-center space-x-2">
                    {browserCompatibility.getCompatibilityEmoji(
                      speechSupport.level,
                    )}
                    <span className="text-sm">
                      {speechSupport.level === "excellent" && "Hervorragend"}
                      {speechSupport.level === "good" && "Gut"}
                      {speechSupport.level === "limited" && "Eingeschränkt"}
                      {speechSupport.level === "none" && "Nicht verfügbar"}
                    </span>
                  </div>
                </div>

                {speechSupport.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Empfehlungen
                    </h4>
                    <ul className="space-y-1">
                      {speechSupport.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-600"
                        >
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Microphone Test */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection("microphone")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded">
                  <Volume2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Mikrofon-Test</h3>
                  <p className="text-sm text-gray-600">
                    Testen Sie Ihr Mikrofon
                  </p>
                </div>
              </div>
              {expandedSections.includes("microphone") ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.includes("microphone") && (
              <div className="mt-3 p-4 bg-white border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Mikrofon-Funktionalität testen
                  </h4>
                  <Button
                    onClick={testMicrophone}
                    disabled={
                      microphoneTest.testing || !mediaSupport.compatible
                    }
                    size="sm"
                    variant={microphoneTest.testing ? "destructive" : "default"}
                  >
                    {microphoneTest.testing ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Teste... (5s)
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Test starten
                      </>
                    )}
                  </Button>
                </div>

                {microphoneTest.testing && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Sprechen Sie jetzt...
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-blue-700">
                        Audio-Pegel:
                      </span>
                      <div className="flex-1 bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                          style={{
                            width: `${microphoneTest.audioLevel * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-blue-700">
                        {Math.round(microphoneTest.audioLevel * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {microphoneTest.hasPermission === true &&
                  !microphoneTest.testing && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">
                          Mikrofon funktioniert korrekt!
                        </span>
                      </div>
                    </div>
                  )}

                {microphoneTest.hasPermission === false && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        Mikrofon-Zugriff verweigert
                      </span>
                    </div>
                    <p className="text-xs text-red-700">
                      Klicken Sie auf das Mikrofon-Symbol in der Adressleiste
                      und erlauben Sie den Zugriff.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Browser Recommendations */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection("recommendations")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded">
                  <Download className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">
                    Browser-Empfehlungen
                  </h3>
                  <p className="text-sm text-gray-600">
                    Optimale Browser für Sprachfunktionen
                  </p>
                </div>
              </div>
              {expandedSections.includes("recommendations") ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.includes("recommendations") && (
              <div className="mt-3 p-4 bg-white border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Chrome */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                      <span className="font-medium">Chrome</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Empfohlen
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Beste Spracherkennungsunterstützung auf allen Plattformen
                    </p>
                    <a
                      href="https://www.google.com/chrome/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Herunterladen
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>

                  {/* Edge */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">E</span>
                      </div>
                      <span className="font-medium">Edge</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Gut
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Vollständige Unterstützung auf Windows-Geräten
                    </p>
                    <a
                      href="https://www.microsoft.com/edge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Herunterladen
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>

                  {/* Safari */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">S</span>
                      </div>
                      <span className="font-medium">Safari</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Basis
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Grundlegende Unterstützung auf Apple-Geräten
                    </p>
                    <div className="text-xs text-gray-500">
                      Vorinstalliert auf macOS/iOS
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Troubleshooting Steps */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection("troubleshooting")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded">
                  <Settings className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Fehlerbehebung</h3>
                  <p className="text-sm text-gray-600">
                    Schritt-für-Schritt Anleitung
                  </p>
                </div>
              </div>
              {expandedSections.includes("troubleshooting") ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.includes("troubleshooting") && (
              <div className="mt-3 p-4 bg-white border rounded-lg">
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-medium text-blue-900 mb-2">
                      1. Browser prüfen
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Verwenden Sie Chrome, Edge oder Safari</li>
                      <li>• Aktualisieren Sie auf die neueste Version</li>
                      <li>
                        • Firefox unterstützt derzeit keine Spracherkennung
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <h4 className="font-medium text-green-900 mb-2">
                      2. HTTPS verwenden
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Spracherkennung funktioniert nur über HTTPS</li>
                      <li>• Lokale Entwicklung: localhost ist erlaubt</li>
                      <li>
                        • Prüfen Sie die Adressleiste auf das Schloss-Symbol
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                    <h4 className="font-medium text-purple-900 mb-2">
                      3. Mikrofonberechtigungen
                    </h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Klicken Sie &quot;Erlauben&quot; wenn gefragt</li>
                      <li>• Prüfen Sie Browser-Einstellungen</li>
                      <li>• Bei Problemen: Seite neu laden</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-medium text-yellow-900 mb-2">
                      4. Hardware prüfen
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Mikrofon angeschlossen und funktionsfähig</li>
                      <li>• Lautstärke ausreichend hoch</li>
                      <li>
                        • Andere Anwendungen schließen die das Mikrofon
                        verwenden
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Seite neu laden</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
