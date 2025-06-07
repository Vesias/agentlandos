"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  Globe,
  Database,
  Bot,
  Target,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import EnhancedWebSearch from "@/components/EnhancedWebSearch";
import InstantHelpSearch from "@/components/InstantHelpSearch";

export default function SearchPage() {
  const [searchMode, setSearchMode] = useState<"web" | "instant">("web");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check for URL parameters
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || params.get("query");
    const mode = params.get("mode");

    if (query) {
      setSearchQuery(decodeURIComponent(query));
    }

    if (mode === "instant") {
      setSearchMode("instant");
    }
  }, []);

  const searchModes = [
    {
      id: "web" as const,
      name: "Web-Suche",
      description: "KI-enhanced web search mit Saarland-Optimierung",
      icon: Globe,
      features: [
        "Real-time Web-Ergebnisse",
        "KI-Zusammenfassung",
        "Saarland-Fokus",
        "Cross-Border DE/FR/LU",
      ],
      color: "blue",
    },
    {
      id: "instant" as const,
      name: "Instant-Hilfe",
      description: "Sofort-Hilfe aus der Saarland Wissensbasis",
      icon: Database,
      features: [
        "Lokale Expertise",
        "Strukturierte Lösungen",
        "Schnelle Antworten",
        "Behörden-Services",
      ],
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                AGENTLAND Search
              </h1>
              <p className="text-gray-600">
                KI-powered Suchplattform für das Saarland
              </p>
            </div>
          </motion.div>

          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
              <div className="flex gap-2">
                {searchModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSearchMode(mode.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                      searchMode === mode.id
                        ? mode.color === "blue"
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-purple-500 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <mode.icon className="w-5 h-5" />
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Mode Description */}
          <motion.div
            key={searchMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {searchModes.map(
              (mode) =>
                searchMode === mode.id && (
                  <div
                    key={mode.id}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          mode.color === "blue"
                            ? "bg-blue-100"
                            : "bg-purple-100"
                        }`}
                      >
                        <mode.icon
                          className={`w-6 h-6 ${
                            mode.color === "blue"
                              ? "text-blue-600"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {mode.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{mode.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {mode.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Target
                                className={`w-4 h-4 ${
                                  mode.color === "blue"
                                    ? "text-blue-500"
                                    : "text-purple-500"
                                }`}
                              />
                              <span className="text-sm text-gray-700">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
            )}
          </motion.div>
        </div>

        {/* Search Interface */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={searchMode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {searchMode === "web" ? (
              <EnhancedWebSearch
                initialQuery={searchQuery}
                category="general"
                location="saarland"
                compact={false}
                showFilters={true}
                onResultClick={(result) => {
                  console.log("Result clicked:", result);
                }}
              />
            ) : (
              <InstantHelpSearch
                initialQuery={searchQuery}
                category="all"
                compact={false}
                onSolutionSelect={(solution) => {
                  console.log("Solution selected:", solution);
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Quick Start Examples */}
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Beispiel-Suchanfragen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Business Examples */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Business</h3>
              </div>
              <div className="space-y-2">
                {[
                  "Gewerbe anmelden Saarland",
                  "Startup Förderung SIKB",
                  "IHK Saarland Beratung",
                  "Grenzgänger Steuer",
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(example)}
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    &quot;{example}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Tourism Examples */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Tourismus</h3>
              </div>
              <div className="space-y-2">
                {[
                  "Saarschleife besuchen",
                  "Völklinger Hütte UNESCO",
                  "Wandern Saarland",
                  "Hotels Saarbrücken",
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(example)}
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    &quot;{example}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Education Examples */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Bildung</h3>
              </div>
              <div className="space-y-2">
                {[
                  "Universität Saarland studieren",
                  "Weiterbildung Förderung",
                  "HTW Saar Studiengänge",
                  "BAföG Saarland",
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(example)}
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    &quot;{example}&quot;
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="max-w-6xl mx-auto mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Warum AGENTLAND Search?</h2>
            <p className="text-blue-100 text-lg">
              Die erste KI-gestützte Suchplattform speziell für das Saarland
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">KI-Enhanced</h3>
              <p className="text-blue-100">
                Intelligente Zusammenfassungen und kontextuelle Antworten durch
                modernste KI-Technologie
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Saarland-Fokus</h3>
              <p className="text-blue-100">
                Speziell optimiert für regionale Inhalte, Behörden-Services und
                Cross-Border-Themen
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sofort verfügbar</h3>
              <p className="text-blue-100">
                Keine Registrierung erforderlich - starten Sie sofort mit Ihrer
                Suche
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => window.open("/chat", "_blank")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              <Bot className="w-5 h-5" />
              Noch Fragen? KI-Chat starten
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
