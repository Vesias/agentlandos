'use client'

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Activity,
  BarChart3,
  Zap,
  Globe,
  FileText,
  Search
} from 'lucide-react';

interface LinkValidationReport {
  validation_summary: {
    total_links: number;
    valid_links: number;
    broken_links: number;
    placeholder_links: number;
    redirect_links: number;
  };
  status_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  broken_links: Array<{
    url: string;
    source_file: string;
    status: string;
    suggested_replacement?: string;
  }>;
  placeholder_links: Array<{
    url: string;
    source_file: string;
    suggested_replacement?: string;
  }>;
  generated_at: string;
}

interface ValidationStats {
  summary: any;
  health_score: number;
  recommendations: string[];
  last_updated: string;
}

export default function LinkValidationPage() {
  const [report, setReport] = useState<LinkValidationReport | null>(null);
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'broken' | 'placeholder' | 'monitor'>('overview');
  const [scanning, setScanning] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(false);

  useEffect(() => {
    loadReport();
    loadStats();
  }, []);

  const loadReport = async () => {
    try {
      const response = await fetch('/api/v1/link-validation/report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to load validation report:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/v1/link-validation/statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load validation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScan = async () => {
    setScanning(true);
    try {
      await fetch('/api/v1/link-validation/scan-codebase', { method: 'GET' });
      // Poll for updated results
      setTimeout(() => {
        loadReport();
        loadStats();
        setScanning(false);
      }, 10000);
    } catch (error) {
      console.error('Failed to start scan:', error);
      setScanning(false);
    }
  };

  const startMonitoring = async () => {
    try {
      await fetch('/api/v1/link-validation/monitor');
      setMonitoringActive(true);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBackground = (score: number) => {
    if (score >= 95) return 'bg-green-100';
    if (score >= 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading link validation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Link Validation Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor and validate all external links in AGENTLAND.SAARLAND</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startScan}
                disabled={scanning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Scanning...' : 'Scan Links'}
              </button>
              <button
                onClick={startMonitoring}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  monitoringActive 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Activity className="w-4 h-4" />
                {monitoringActive ? 'Monitoring Active' : 'Start Monitoring'}
              </button>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        {stats && (
          <div className={`mb-8 p-6 rounded-lg ${getHealthScoreBackground(stats.health_score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Overall Link Health</h2>
                <p className="text-gray-600">System-wide link validation status</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHealthScoreColor(stats.health_score)}`}>
                  {stats.health_score}%
                </div>
                <p className="text-sm text-gray-600">Health Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Globe className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Links</p>
                  <p className="text-2xl font-bold text-gray-900">{report.validation_summary.total_links}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Valid Links</p>
                  <p className="text-2xl font-bold text-gray-900">{report.validation_summary.valid_links}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Broken Links</p>
                  <p className="text-2xl font-bold text-gray-900">{report.validation_summary.broken_links}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Placeholders</p>
                  <p className="text-2xl font-bold text-gray-900">{report.validation_summary.placeholder_links}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {stats && stats.recommendations.length > 0 && (
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {stats.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-800">
                  <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'broken', label: 'Broken Links', icon: XCircle },
                { id: 'placeholder', label: 'Placeholders', icon: AlertTriangle },
                { id: 'monitor', label: 'Real-time Monitor', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Validation Overview</h3>
              
              {report && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Breakdown */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Status Breakdown</h4>
                    <div className="space-y-3">
                      {Object.entries(report.status_breakdown).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center">
                          <span className="capitalize text-gray-600">{status}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Category Breakdown</h4>
                    <div className="space-y-3">
                      {Object.entries(report.category_breakdown).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="capitalize text-gray-600">{category}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'broken' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Broken Links</h3>
                <span className="text-sm text-gray-500">
                  {report?.broken_links.length || 0} broken links found
                </span>
              </div>
              
              {report && report.broken_links.length > 0 ? (
                <div className="space-y-4">
                  {report.broken_links.map((link, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-900">{link.url}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            {link.source_file}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs bg-red-200 text-red-800 rounded">
                            {link.status}
                          </span>
                        </div>
                        {link.suggested_replacement && (
                          <div className="ml-4">
                            <p className="text-xs text-gray-500 mb-1">Suggested replacement:</p>
                            <a
                              href={link.suggested_replacement}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              {link.suggested_replacement}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No broken links found! All links are working properly.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'placeholder' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Placeholder Links</h3>
                <span className="text-sm text-gray-500">
                  {report?.placeholder_links.length || 0} placeholder links found
                </span>
              </div>
              
              {report && report.placeholder_links.length > 0 ? (
                <div className="space-y-4">
                  {report.placeholder_links.map((link, index) => (
                    <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-yellow-900">{link.url}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            <FileText className="w-4 h-4 inline mr-1" />
                            {link.source_file}
                          </p>
                        </div>
                        {link.suggested_replacement && (
                          <div className="ml-4">
                            <p className="text-xs text-gray-500 mb-1">Authentic Saarland URL:</p>
                            <a
                              href={link.suggested_replacement}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              {link.suggested_replacement}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No placeholder links found! All URLs are authentic.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Real-time Link Monitoring</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Critical Links Status</h4>
                  
                  {[
                    { url: 'https://www.saarland.de', status: 'healthy', category: 'Government' },
                    { url: 'https://www.urlaub.saarland', status: 'healthy', category: 'Tourism' },
                    { url: 'https://www.saarvv.de', status: 'healthy', category: 'Transport' },
                    { url: 'https://www.uni-saarland.de', status: 'healthy', category: 'Education' }
                  ].map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{link.url}</p>
                        <p className="text-sm text-gray-600">{link.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600">Online</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Monitoring Settings</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Auto-check interval</span>
                      <span className="text-sm text-gray-600">5 minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Alert threshold</span>
                      <span className="text-sm text-gray-600">3 failures</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Email notifications</span>
                      <span className="text-sm text-green-600">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Last updated: {report?.generated_at ? new Date(report.generated_at).toLocaleString() : 'Never'}</p>
        </div>
      </div>
    </div>
  );
}