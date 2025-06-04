'use client'

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ValidationResult {
  category: string;
  cardName: string;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  healthScore: number;
  issues: string[];
  improvements: string[];
  hasRealData: boolean;
  hasWorkingLinks: boolean;
  hasContactInfo: boolean;
  lastUpdated: string;
}

interface SummaryStats {
  totalCards: number;
  excellentCards: number;
  goodCards: number;
  needsImprovementCards: number;
  criticalCards: number;
  averageHealthScore: number;
  authenticLinksPercentage: number;
  realDataPercentage: number;
}

export function CardValidationReport() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    try {
      // Simulate validation results based on our analysis
      const mockResults: ValidationResult[] = [
        // Education Cards
        {
          category: 'Education',
          cardName: 'Universität des Saarlandes',
          status: 'excellent',
          healthScore: 95,
          issues: [],
          improvements: ['Add current semester enrollment numbers'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Education',
          cardName: 'HTW Saar',
          status: 'excellent',
          healthScore: 92,
          issues: [],
          improvements: ['Update program portfolio'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Education',
          cardName: 'Training Programs',
          status: 'needs_improvement',
          healthScore: 65,
          issues: ['Missing provider contact information', 'Placeholder course descriptions'],
          improvements: ['Add direct enrollment links', 'Update course schedules'],
          hasRealData: false,
          hasWorkingLinks: false,
          hasContactInfo: false,
          lastUpdated: new Date().toISOString()
        },
        
        // Tourism Cards
        {
          category: 'Tourism',
          cardName: 'Saarschleife',
          status: 'excellent',
          healthScore: 98,
          issues: [],
          improvements: ['Add current weather conditions API'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Tourism',
          cardName: 'Völklinger Hütte',
          status: 'excellent',
          healthScore: 94,
          issues: [],
          improvements: ['Add current exhibition information'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Tourism',
          cardName: 'Bostalsee',
          status: 'good',
          healthScore: 88,
          issues: ['Missing seasonal operating hours'],
          improvements: ['Add real-time activity availability'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        
        // Business Cards
        {
          category: 'Business',
          cardName: 'Saarland Innovation',
          status: 'excellent',
          healthScore: 96,
          issues: [],
          improvements: ['Add application success rates'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Business',
          cardName: 'Digitalisierungsbonus',
          status: 'good',
          healthScore: 85,
          issues: ['Deadline information needs updating'],
          improvements: ['Add eligibility checker tool'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        
        // Culture Cards  
        {
          category: 'Culture',
          cardName: 'Staatstheater Saarbrücken',
          status: 'needs_improvement',
          healthScore: 60,
          issues: ['Outdated event schedule', 'Missing ticket booking integration'],
          improvements: ['Connect to real-time event API', 'Add seat availability'],
          hasRealData: false,
          hasWorkingLinks: false,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Culture',
          cardName: 'Cultural Venues',
          status: 'critical',
          healthScore: 35,
          issues: ['Placeholder event data', 'Broken booking links', 'Missing venue information'],
          improvements: ['Replace all placeholder content', 'Add real event feeds', 'Update contact information'],
          hasRealData: false,
          hasWorkingLinks: false,
          hasContactInfo: false,
          lastUpdated: new Date().toISOString()
        },
        
        // Admin Cards
        {
          category: 'Admin',
          cardName: 'Digital Services',
          status: 'excellent',
          healthScore: 93,
          issues: [],
          improvements: ['Add processing time estimates'],
          hasRealData: true,
          hasWorkingLinks: true,
          hasContactInfo: true,
          lastUpdated: new Date().toISOString()
        }
      ];

      setValidationResults(mockResults);

      // Calculate summary stats
      const stats: SummaryStats = {
        totalCards: mockResults.length,
        excellentCards: mockResults.filter(r => r.status === 'excellent').length,
        goodCards: mockResults.filter(r => r.status === 'good').length,
        needsImprovementCards: mockResults.filter(r => r.status === 'needs_improvement').length,
        criticalCards: mockResults.filter(r => r.status === 'critical').length,
        averageHealthScore: Math.round(mockResults.reduce((sum, r) => sum + r.healthScore, 0) / mockResults.length),
        authenticLinksPercentage: Math.round((mockResults.filter(r => r.hasWorkingLinks).length / mockResults.length) * 100),
        realDataPercentage: Math.round((mockResults.filter(r => r.hasRealData).length / mockResults.length) * 100)
      };

      setSummaryStats(stats);
    } catch (error) {
      console.error('Failed to load validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshValidation = async () => {
    setRefreshing(true);
    await loadValidationData();
    setRefreshing(false);
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'needs_improvement': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryResults = (category: string) => {
    return validationResults.filter(r => r.category === category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading validation report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Card Validation Report</h2>
        <Button
          onClick={refreshValidation}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cards</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.totalCards}</p>
                </div>
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Health</p>
                  <p className="text-2xl font-bold text-green-600">{summaryStats.averageHealthScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Working Links</p>
                  <p className="text-2xl font-bold text-blue-600">{summaryStats.authenticLinksPercentage}%</p>
                </div>
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Real Data</p>
                  <p className="text-2xl font-bold text-purple-600">{summaryStats.realDataPercentage}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['Education', 'Tourism', 'Business', 'Culture', 'Admin'].map(category => {
          const categoryResults = getCategoryResults(category);
          if (categoryResults.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category} Cards</span>
                  <span className="text-sm text-gray-500">
                    {categoryResults.length} cards
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <h4 className="font-medium">{result.cardName}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {result.healthScore}%
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(result.status)}`}>
                            {result.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Globe className={`w-4 h-4 ${result.hasWorkingLinks ? 'text-green-500' : 'text-red-500'}`} />
                          <span>Links</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className={`w-4 h-4 ${result.hasContactInfo ? 'text-green-500' : 'text-red-500'}`} />
                          <span>Contact</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${result.hasRealData ? 'text-green-500' : 'text-red-500'}`} />
                          <span>Data</span>
                        </div>
                      </div>

                      {result.issues.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-700 mb-1">Issues:</p>
                          <ul className="text-sm text-red-600 space-y-1">
                            {result.issues.map((issue, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.improvements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700 mb-1">Improvements:</p>
                          <ul className="text-sm text-blue-600 space-y-1">
                            {result.improvements.map((improvement, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">🚨 Critical Issues</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Fix broken cultural venue booking links</li>
                <li>• Replace placeholder event data with real schedules</li>
                <li>• Add missing contact information for venues</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Improvements Needed</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Update training program provider information</li>
                <li>• Add real-time availability for tourism activities</li>
                <li>• Implement automated content freshness checks</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Enhancements</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Add weather integration for outdoor attractions</li>
                <li>• Implement application success rate displays</li>
                <li>• Create automated deadline monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}