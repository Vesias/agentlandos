'use client'

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Award,
  BarChart3,
  Settings,
  Play,
  Pause,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ValidationSummary {
  totalLinks: number;
  validLinks: number;
  brokenLinks: number;
  placeholderLinks: number;
  saarlandRelevant: number;
  overallHealthScore: number;
}

interface CardHealthData {
  category: string;
  totalCards: number;
  healthScore: number;
  issues: string[];
  improvements: string[];
  priority: 'high' | 'medium' | 'low';
}

interface MonitoringAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  category: string;
  timestamp: string;
  resolved: boolean;
}

export default function CardAuditorPage() {
  const [validationData, setValidationData] = useState<ValidationSummary | null>(null);
  const [cardHealthData, setCardHealthData] = useState<CardHealthData[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'health' | 'monitoring' | 'automation'>('overview');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadValidationData(),
        loadCardHealthData(),
        loadMonitoringAlerts()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadValidationData = async () => {
    try {
      const response = await fetch('/api/v1/link-validation');
      const data = await response.json();
      if (data.success) {
        setValidationData(data.summary);
      }
    } catch (error) {
      console.error('Failed to load validation data:', error);
    }
  };

  const loadCardHealthData = async () => {
    try {
      const response = await fetch('/api/v1/card-health');
      const data = await response.json();
      if (data.success) {
        const healthData = Object.entries(data.healthScores).map(([category, score]) => ({
          category,
          totalCards: data.currentCardStatus[category]?.totalCards || 0,
          healthScore: score as number,
          issues: data.suggestedImprovements[category] || [],
          improvements: data.suggestedImprovements[category] || [],
          priority: ((score as number) < 50 ? 'high' : (score as number) < 75 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
        }));
        setCardHealthData(healthData);
      }
    } catch (error) {
      console.error('Failed to load card health data:', error);
    }
  };

  const loadMonitoringAlerts = async () => {
    try {
      const response = await fetch('/api/v1/content-monitor');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to load monitoring alerts:', error);
    }
  };

  const startFullScan = async () => {
    setScanning(true);
    try {
      // Start comprehensive scan
      const response = await fetch('/api/v1/link-validation', { method: 'GET' });
      if (response.ok) {
        // Reload data after scan
        setTimeout(() => {
          loadAllData();
          setScanning(false);
        }, 10000);
      }
    } catch (error) {
      console.error('Failed to start scan:', error);
      setScanning(false);
    }
  };

  const toggleMonitoring = async () => {
    try {
      const action = monitoring ? 'stop' : 'start';
      const response = await fetch('/api/v1/content-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: `${action}-monitoring` })
      });
      
      if (response.ok) {
        setMonitoring(!monitoring);
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/v1/content-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-alert', alertId })
      });
      
      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 75) return 'bg-yellow-100 border-yellow-200';
    if (score >= 50) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Card Auditor Dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Card Auditor Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive card validation and monitoring for AGENTLAND.SAARLAND
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={startFullScan}
                disabled={scanning}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Scanning...' : 'Full Scan'}
              </Button>
              <Button
                onClick={toggleMonitoring}
                variant={monitoring ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                {monitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {monitoring ? 'Stop Monitor' : 'Start Monitor'}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Health Score */}
        {validationData && (
          <Card className={`mb-8 ${getHealthScoreBackground(validationData.overallHealthScore)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Overall System Health</h2>
                  <p className="text-gray-600">Comprehensive validation across all card systems</p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getHealthScoreColor(validationData.overallHealthScore)}`}>
                    {validationData.overallHealthScore}%
                  </div>
                  <p className="text-sm text-gray-600">Health Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {validationData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Globe className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Links</p>
                    <p className="text-2xl font-bold text-gray-900">{validationData.totalLinks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valid Links</p>
                    <p className="text-2xl font-bold text-gray-900">{validationData.validLinks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issues Found</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {validationData.brokenLinks + validationData.placeholderLinks}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saarland Links</p>
                    <p className="text-2xl font-bold text-gray-900">{validationData.saarlandRelevant}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'validation', label: 'Link Validation', icon: Globe },
                { id: 'health', label: 'Card Health', icon: Activity },
                { id: 'monitoring', label: 'Real-time Monitor', icon: Target },
                { id: 'automation', label: 'Automation', icon: Zap }
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
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Card Health by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cardHealthData.map((category) => (
                      <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{category.category}</p>
                          <p className="text-sm text-gray-500">{category.totalCards} cards</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getHealthScoreColor(category.healthScore)}`}>
                            {category.healthScore}%
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            category.priority === 'high' ? 'bg-red-100 text-red-700' :
                            category.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {category.priority} priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className={`p-3 border rounded-lg ${alert.resolved ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <span className="text-xs text-gray-500">{alert.category}</span>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!alert.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              {cardHealthData.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{category.category} Cards</span>
                      <span className={`text-2xl font-bold ${getHealthScoreColor(category.healthScore)}`}>
                        {category.healthScore}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Issues Found</h4>
                        <ul className="space-y-2">
                          {category.issues.slice(0, 5).map((issue, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Improvements Needed</h4>
                        <ul className="space-y-2">
                          {category.improvements.slice(0, 5).map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Real-time Monitoring
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${monitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">
                      {monitoring ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Critical Systems Status</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Education Cards', status: 'healthy', lastCheck: '2 min ago' },
                        { name: 'Tourism Links', status: 'healthy', lastCheck: '1 min ago' },
                        { name: 'Business Data', status: 'warning', lastCheck: '5 min ago' },
                        { name: 'Culture Events', status: 'healthy', lastCheck: '3 min ago' },
                        { name: 'Admin Services', status: 'healthy', lastCheck: '1 min ago' }
                      ].map((system) => (
                        <div key={system.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{system.name}</p>
                            <p className="text-sm text-gray-500">Last check: {system.lastCheck}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              system.status === 'healthy' ? 'bg-green-500' :
                              system.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                            <span className="text-sm capitalize">{system.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Monitoring Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Check interval</span>
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
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'automation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automated Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Link validation scan', frequency: 'Every 6 hours', status: 'active' },
                      { name: 'Content freshness check', frequency: 'Daily', status: 'active' },
                      { name: 'Saarland data sync', frequency: 'Weekly', status: 'active' },
                      { name: 'Health score calculation', frequency: 'Every hour', status: 'active' },
                      { name: 'Alert notification', frequency: 'Real-time', status: 'active' }
                    ].map((task) => (
                      <div key={task.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-gray-500">{task.frequency}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">High Priority</h4>
                      <p className="text-sm text-blue-800">
                        Replace 12 placeholder business funding links with authentic Saarland programs
                      </p>
                      <Button size="sm" className="mt-3">
                        Auto-fix Now
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Medium Priority</h4>
                      <p className="text-sm text-yellow-800">
                        Update tourism attraction opening hours and contact information
                      </p>
                      <Button size="sm" variant="outline" className="mt-3">
                        Schedule Update
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Enhancement</h4>
                      <p className="text-sm text-green-800">
                        Add real-time event data feeds for cultural venues
                      </p>
                      <Button size="sm" variant="outline" className="mt-3">
                        Configure Feed
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}