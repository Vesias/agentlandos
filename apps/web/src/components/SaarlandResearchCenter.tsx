'use client';

import React, { useState, useEffect } from 'react';
import { Search, Database, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ResearchResult {
  id: string;
  content: string;
  score: number;
  metadata: {
    category?: string;
    isRegional?: boolean;
    isOfficial?: boolean;
    publishedDate?: string;
    authority?: string;
  };
}

interface EmbeddingsHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: string;
}

const SaarlandResearchCenter: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'saarland' | 'verwaltung' | 'tourismus' | 'wirtschaft' | 'bildung'>('saarland');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<EmbeddingsHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Health Check beim Component Mount
  useEffect(() => {
    checkEmbeddingsHealth();
  }, []);

  const checkEmbeddingsHealth = async () => {
    try {
      const response = await fetch('/api/ai/embeddings?action=health');
      const data = await response.json();
      setHealth({
        status: data.status,
        details: data.details
      });
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        details: 'Unable to connect to embeddings service'
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search',
          query: query.trim(),
          searchIn: searchCategory,
          options: {
            topK: 5,
            threshold: 0.7,
            boost: {
              regional: 1.3,
              recency: 1.1,
              authority: 1.2,
            },
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch (error) {
      setError('Network error - please try again');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthIcon = () => {
    if (!health) return <Loader2 className="w-4 h-4 animate-spin" />;
    
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <XCircle className="w-4 h-4 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      saarland: '🏛️ Alles Saarland',
      verwaltung: '📋 Verwaltung',
      tourismus: '🎭 Tourismus',
      wirtschaft: '💼 Wirtschaft',
      bildung: '🎓 Bildung',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-saarland-blue mb-2">
              🔬 SAARLAND RESEARCH CENTER
            </h1>
            <p className="text-neutral-gray">
              KI-gestützte Semantic Search mit OpenAI Embeddings
            </p>
          </div>
          
          {/* Health Status */}
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
            {getHealthIcon()}
            <span className="text-sm">
              {health?.status === 'healthy' ? 'Operational' : 
               health?.status === 'degraded' ? 'Degraded' : 
               health?.status === 'unhealthy' ? 'Offline' : 'Checking...'}
            </span>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suchanfrage
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="z.B. Verwaltungsleistungen in Saarbrücken..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saarland-blue focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value as any)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saarland-blue focus:border-transparent"
              >
                <option value="saarland">🏛️ Alles</option>
                <option value="verwaltung">📋 Verwaltung</option>
                <option value="tourismus">🎭 Tourismus</option>
                <option value="wirtschaft">💼 Wirtschaft</option>
                <option value="bildung">🎓 Bildung</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim() || health?.status === 'unhealthy'}
            className="w-full bg-saarland-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-saarland-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Semantic Search läuft...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>KI-Research starten</span>
              </>
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Fehler:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              🎯 Research Ergebnisse
            </h2>
            <div className="text-sm text-gray-600">
              {results.length} Treffer für "{query}" in {getCategoryLabel(searchCategory)}
            </div>
          </div>

          <div className="grid gap-6">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-innovation-cyan"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-saarland-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          Match Score: {formatScore(result.score)}
                        </span>
                        {result.metadata.isOfficial && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Offiziell
                          </span>
                        )}
                        {result.metadata.isRegional && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Regional
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {result.metadata.authority && (
                          <>Quelle: {result.metadata.authority} • </>
                        )}
                        {formatDate(result.metadata.publishedDate)}
                      </div>
                    </div>
                  </div>
                  
                  <Database className="w-5 h-5 text-gray-400" />
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed">
                    {result.content}
                  </p>
                </div>

                {result.metadata.category && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                      {getCategoryLabel(result.metadata.category)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && query && results.length === 0 && !error && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine Ergebnisse gefunden
          </h3>
          <p className="text-gray-600">
            Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie.
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🧠 Über das Research Center
        </h3>
        <p className="text-gray-700 leading-relaxed">
          Das SAARLAND RESEARCH CENTER nutzt OpenAI's modernste Embedding-Modelle für 
          semantische Suche in regionalen Inhalten. Die KI versteht den Kontext Ihrer 
          Anfragen und findet relevante Informationen basierend auf Bedeutung, nicht nur 
          Schlüsselwörtern. Regionale und offizielle Quellen werden automatisch bevorzugt.
        </p>
      </div>
    </div>
  );
};

export default SaarlandResearchCenter;