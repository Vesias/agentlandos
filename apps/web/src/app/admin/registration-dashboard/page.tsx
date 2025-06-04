'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Download,
  RefreshCw,
  Search,
  Filter,
  Euro,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Shield,
  Zap
} from 'lucide-react'

interface RegistrationStats {
  totalBusinessRegistrations: number
  totalSaarIds: number
  pendingVerifications: number
  activeToday: number
  completedThisWeek: number
  averageProcessingTime: string
  successRate: number
  revenueThisMonth: number
  mrrProgress: number
  targetMRR: number
  totalUsers: number
  userGrowthRate: number
  premiumSubscriptions: number
  apiRevenue: number
  governmentContracts: number
  churnRate: number
  lifetimeValue: number
}

interface BusinessRegistration {
  businessId: string
  companyName: string
  legalForm: string
  founder: string
  email: string
  phone: string
  city: string
  postalCode: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'processing' | 'completed'
  submissionDate: string
  authority: string
  fundingRequested: boolean
  fundingAmount?: number
  processingStage: string
  assignedOfficer?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedCompletion?: string
  revenueGenerated: number
  tags: string[]
}

interface SaarIdRegistration {
  saarId: string
  firstName: string
  lastName: string
  email: string
  city: string
  postalCode: string
  status: 'pending' | 'verified' | 'active' | 'suspended' | 'expired'
  registrationDate: string
  verificationMethod: string
  authorizedServices: number
  lastActivity: string
  subscriptionTier: 'basic' | 'premium' | 'enterprise'
  monthlyFee: number
  securityLevel: number
  documentsUploaded: number
  apiUsage: number
}

interface RevenueMetrics {
  dailyRevenue: number[]
  monthlyRevenue: number[]
  subscriptionBreakdown: {
    basic: number
    premium: number
    enterprise: number
  }
  churnAnalysis: {
    rate: number
    reasons: string[]
  }
  projectedMRR: number
  conversionRate: number
}

interface SystemHealth {
  uptime: number
  responseTime: number
  errorRate: number
  activeConnections: number
  serverLoad: number
  databasePerformance: number
}

export default function RegistrationDashboard() {
  const [stats, setStats] = useState<RegistrationStats>({
    totalBusinessRegistrations: 0,
    totalSaarIds: 0,
    pendingVerifications: 0,
    activeToday: 0,
    completedThisWeek: 0,
    averageProcessingTime: '0 Tage',
    successRate: 0,
    revenueThisMonth: 0,
    mrrProgress: 0,
    targetMRR: 25000,
    totalUsers: 0,
    userGrowthRate: 0,
    premiumSubscriptions: 0,
    apiRevenue: 0,
    governmentContracts: 0,
    churnRate: 0,
    lifetimeValue: 0
  })
  
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    dailyRevenue: [],
    monthlyRevenue: [],
    subscriptionBreakdown: { basic: 0, premium: 0, enterprise: 0 },
    churnAnalysis: { rate: 0, reasons: [] },
    projectedMRR: 0,
    conversionRate: 0
  })
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.1,
    activeConnections: 0,
    serverLoad: 0,
    databasePerformance: 0
  })
  
  const [businessRegistrations, setBusinessRegistrations] = useState<BusinessRegistration[]>([])
  const [saarIdRegistrations, setSaarIdRegistrations] = useState<SaarIdRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'saar-id' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRealTimeActive, setIsRealTimeActive] = useState(true)
  const [notifications, setNotifications] = useState<Array<{id: string, type: 'info' | 'success' | 'warning' | 'error', message: string, timestamp: Date}>>([]);

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Real-time data updates every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRealTimeActive) {
      interval = setInterval(() => {
        loadDashboardData(true) // Silent update
        setLastUpdate(new Date())
      }, 30000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRealTimeActive])

  const addNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }
    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only 5 notifications
  }, [])

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true)
    
    try {
      // Generate mock data for demonstration
      // In production, these would be real API calls to the backend
      
      // Enhanced production-ready stats with €25k+ MRR tracking
      const currentMRR = Math.floor(Math.random() * 8000) + 12000 // 12k-20k current MRR
      const targetProgress = (currentMRR / 25000) * 100
      
      const mockStats: RegistrationStats = {
        totalBusinessRegistrations: Math.floor(Math.random() * 300) + 450,
        totalSaarIds: Math.floor(Math.random() * 800) + 1200,
        pendingVerifications: Math.floor(Math.random() * 35) + 15,
        activeToday: Math.floor(Math.random() * 25) + 8,
        completedThisWeek: Math.floor(Math.random() * 80) + 45,
        averageProcessingTime: '5-8 Tage',
        successRate: 96.8 + Math.random() * 2,
        revenueThisMonth: Math.floor(Math.random() * 8000) + 15000,
        mrrProgress: targetProgress,
        targetMRR: 25000,
        totalUsers: Math.floor(Math.random() * 5000) + 8500,
        userGrowthRate: 12.5 + Math.random() * 5,
        premiumSubscriptions: Math.floor(Math.random() * 150) + 280,
        apiRevenue: Math.floor(Math.random() * 3000) + 5000,
        governmentContracts: Math.floor(Math.random() * 2) + 3,
        churnRate: 2.1 + Math.random() * 1.5,
        lifetimeValue: Math.floor(Math.random() * 200) + 450
      }
      
      const mockRevenueMetrics: RevenueMetrics = {
        dailyRevenue: Array.from({length: 30}, () => Math.floor(Math.random() * 800) + 400),
        monthlyRevenue: Array.from({length: 12}, () => Math.floor(Math.random() * 5000) + 10000),
        subscriptionBreakdown: {
          basic: Math.floor(Math.random() * 100) + 150,
          premium: Math.floor(Math.random() * 80) + 120,
          enterprise: Math.floor(Math.random() * 20) + 25
        },
        churnAnalysis: {
          rate: 2.1 + Math.random() * 1.5,
          reasons: ['Price concerns', 'Feature limitations', 'Competition', 'Service issues']
        },
        projectedMRR: currentMRR + Math.floor(Math.random() * 3000) + 1000,
        conversionRate: 8.5 + Math.random() * 3
      }
      
      const mockSystemHealth: SystemHealth = {
        uptime: 99.7 + Math.random() * 0.3,
        responseTime: 180 + Math.random() * 120,
        errorRate: Math.random() * 0.5,
        activeConnections: Math.floor(Math.random() * 500) + 200,
        serverLoad: Math.random() * 60 + 20,
        databasePerformance: 85 + Math.random() * 10
      }
      
      const mockBusinessRegistrations: BusinessRegistration[] = [
        {
          businessId: 'BUS-2025-ABC123',
          companyName: 'Saarland Tech Solutions GmbH',
          legalForm: 'GmbH',
          founder: 'Anna Müller',
          email: 'anna.mueller@saartech.de',
          phone: '+49 681 123456',
          city: 'Saarbrücken',
          postalCode: '66111',
          status: 'under_review',
          submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          authority: 'Stadt Saarbrücken - Bürgeramt',
          fundingRequested: true,
          fundingAmount: 25000,
          processingStage: 'Dokumentenprüfung',
          assignedOfficer: 'Maria Weber',
          priority: 'high',
          estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          revenueGenerated: 299,
          tags: ['Tech', 'KI', 'Premium']
        },
        {
          businessId: 'BUS-2025-DEF456',
          companyName: 'Grenzland Consulting UG',
          legalForm: 'UG',
          founder: 'Pierre Dubois',
          email: 'p.dubois@grenzland.fr',
          phone: '+49 681 987654',
          city: 'Völklingen',
          postalCode: '66302',
          status: 'pending',
          submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          authority: 'Stadt Völklingen - Rathaus',
          fundingRequested: false,
          processingStage: 'Eingangsprüfung',
          assignedOfficer: 'Thomas Klein',
          priority: 'medium',
          estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          revenueGenerated: 99,
          tags: ['Beratung', 'Cross-Border']
        },
        {
          businessId: 'BUS-2025-GHI789',
          companyName: 'Saar Digital Marketing e.K.',
          legalForm: 'eK',
          founder: 'Michael Weber',
          email: 'weber@saardigital.de',
          phone: '+49 681 555888',
          city: 'Homburg',
          postalCode: '66424',
          status: 'approved',
          submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          authority: 'Stadt Homburg - Rathaus',
          fundingRequested: true,
          fundingAmount: 15000,
          processingStage: 'Abgeschlossen',
          assignedOfficer: 'Sandra Meyer',
          priority: 'medium',
          estimatedCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          revenueGenerated: 199,
          tags: ['Marketing', 'Digital']
        }
      ]
      
      const mockSaarIdRegistrations: SaarIdRegistration[] = [
        {
          saarId: 'SAAR-25-ALPHA1-45',
          firstName: 'Sarah',
          lastName: 'Schmidt',
          email: 'sarah.schmidt@email.de',
          city: 'Saarbrücken',
          postalCode: '66113',
          status: 'active',
          registrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          verificationMethod: 'video-id',
          authorizedServices: 6,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          subscriptionTier: 'premium',
          monthlyFee: 19.99,
          securityLevel: 3,
          documentsUploaded: 8,
          apiUsage: 1250
        },
        {
          saarId: 'SAAR-25-BETA22-89',
          firstName: 'Jean-Luc',
          lastName: 'Martin',
          email: 'jl.martin@example.fr',
          city: 'Saarlouis',
          postalCode: '66740',
          status: 'pending',
          registrationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          verificationMethod: 'post-id',
          authorizedServices: 4,
          lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          subscriptionTier: 'basic',
          monthlyFee: 9.99,
          securityLevel: 2,
          documentsUploaded: 3,
          apiUsage: 450
        }
      ]
      
      setStats(mockStats)
      setBusinessRegistrations(mockBusinessRegistrations)
      setSaarIdRegistrations(mockSaarIdRegistrations)
      setRevenueMetrics(mockRevenueMetrics)
      setSystemHealth(mockSystemHealth)
      
      // Add notification for significant changes during real-time updates
      if (silent && Math.random() > 0.7) {
        const notifications = [
          { type: 'success' as const, message: 'Neue Unternehmensregistrierung eingegangen' },
          { type: 'info' as const, message: 'SAAR-ID Verifizierung abgeschlossen' },
          { type: 'warning' as const, message: 'Hohe API-Nutzung erkannt' },
          { type: 'success' as const, message: 'Monatsumsatz-Ziel erreicht' }
        ]
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
        addNotification(randomNotification.type, randomNotification.message)
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'verified':
        return 'bg-emerald-100 text-emerald-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      case 'premium':
        return 'bg-blue-100 text-blue-800'
      case 'basic':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredBusinessRegistrations = businessRegistrations.filter(reg => {
    const matchesSearch = reg.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.businessId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredSaarIdRegistrations = saarIdRegistrations.filter(reg => {
    const matchesSearch = reg.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.saarId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Dashboard wird geladen...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AGENTLAND.SAARLAND</h1>
              <p className="text-lg text-gray-600">Admin Dashboard - Registrierungsverwaltung</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={() => loadDashboardData()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Aktualisieren
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Übersicht', icon: TrendingUp },
                { id: 'business', label: 'Unternehmen', icon: Building2 },
                { id: 'saar-id', label: 'SAAR-ID', icon: CreditCard },
                { id: 'analytics', label: 'Analytics', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Unternehmen registriert</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBusinessRegistrations}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">SAAR-IDs ausgegeben</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSaarIds}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Wartend auf Prüfung</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Umsatz diesen Monat</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenueThisMonth)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Real-time Activity & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  Live Aktivität
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-900">Neue Registrierungen heute</div>
                      <div className="text-sm text-green-600">+{stats.activeToday} seit Mitternacht</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.activeToday}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-900">Aktive Verbindungen</div>
                      <div className="text-sm text-blue-600">WebSocket & API</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{systemHealth.activeConnections}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium text-purple-900">API Calls/Min</div>
                      <div className="text-sm text-purple-600">Durchschnitt letzte Stunde</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 150) + 50}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  System Health
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Server Uptime</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${systemHealth.uptime}%` }}></div>
                      </div>
                      <span className="font-medium text-green-600">{systemHealth.uptime.toFixed(2)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Response Time</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.max(100 - (systemHealth.responseTime / 10), 20)}%` }}></div>
                      </div>
                      <span className="font-medium">{systemHealth.responseTime.toFixed(0)}ms</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Error Rate</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${systemHealth.errorRate * 20}%` }}></div>
                      </div>
                      <span className="font-medium text-green-600">{systemHealth.errorRate.toFixed(2)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Database Performance</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${systemHealth.databasePerformance}%` }}></div>
                      </div>
                      <span className="font-medium">{systemHealth.databasePerformance.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Business Registrations Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Suche nach Unternehmen, Gründer oder ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Alle Status</option>
                    <option value="pending">Wartend</option>
                    <option value="under_review">In Prüfung</option>
                    <option value="approved">Genehmigt</option>
                    <option value="rejected">Abgelehnt</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Business Registrations Table */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Unternehmensregistrierungen ({filteredBusinessRegistrations.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unternehmen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gründer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standort</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Priorität</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bearbeitung</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Förderung & Revenue</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBusinessRegistrations.map((registration) => (
                      <tr key={registration.businessId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{registration.companyName}</div>
                            <div className="text-sm text-gray-500">{registration.legalForm} • {registration.businessId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{registration.founder}</div>
                            <div className="text-sm text-gray-500">{registration.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{registration.city}</div>
                          <div className="text-sm text-gray-500">{registration.postalCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(registration.status)}`}>
                              {registration.status}
                            </span>
                            <div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(registration.priority)}`}>
                                {registration.priority}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{registration.processingStage}</div>
                            <div className="text-xs text-gray-500">Bearbeiter: {registration.assignedOfficer}</div>
                            <div className="text-xs text-gray-500">Eingereicht: {formatDate(registration.submissionDate)}</div>
                            {registration.estimatedCompletion && (
                              <div className="text-xs text-blue-600">Erwartet: {formatDate(registration.estimatedCompletion)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {registration.fundingRequested ? (
                              <div className="text-sm">
                                <div className="text-green-600 font-medium">✓ Förderung</div>
                                <div className="text-gray-500">{formatCurrency(registration.fundingAmount || 0)}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">Keine Förderung</div>
                            )}
                            <div className="text-xs">
                              <div className="text-gray-500">Revenue: {formatCurrency(registration.revenueGenerated)}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {registration.tags.map((tag, index) => (
                                  <span key={index} className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <Button size="sm" variant="outline" title="Details anzeigen">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" title="E-Mail senden">
                              <Mail className="w-4 h-4" />
                            </Button>
                            {registration.status === 'pending' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" title="Schnell genehmigen">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* SAAR-ID Tab */}
        {activeTab === 'saar-id' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Suche nach Name oder SAAR-ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="pending">Wartend</option>
                  <option value="verified">Verifiziert</option>
                  <option value="active">Aktiv</option>
                  <option value="suspended">Gesperrt</option>
                </select>
              </div>
            </Card>

            {/* SAAR-ID Table */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  SAAR-ID Registrierungen ({filteredSaarIdRegistrations.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SAAR-ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standort</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Abo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktivität & API</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue & Security</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSaarIdRegistrations.map((registration) => (
                      <tr key={registration.saarId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{registration.saarId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {registration.firstName} {registration.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{registration.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{registration.city}</div>
                          <div className="text-sm text-gray-500">{registration.postalCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(registration.status)}`}>
                              {registration.status}
                            </span>
                            <div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSubscriptionColor(registration.subscriptionTier)}`}>
                                {registration.subscriptionTier}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{registration.verificationMethod}</div>
                            <div className="text-xs text-gray-500">Registriert: {formatDate(registration.registrationDate)}</div>
                            <div className="text-xs text-gray-500">Letzte Aktivität: {formatDate(registration.lastActivity)}</div>
                            <div className="text-xs text-blue-600">API Calls: {registration.apiUsage.toLocaleString('de-DE')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-green-600">{formatCurrency(registration.monthlyFee)}/Monat</div>
                            <div className="text-xs text-gray-500">{registration.authorizedServices} Services</div>
                            <div className="text-xs text-gray-500">{registration.documentsUploaded} Dokumente</div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Shield className="w-3 h-3 mr-1" />
                              Security Level {registration.securityLevel}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <Button size="sm" variant="outline" title="Profil anzeigen">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" title="E-Mail senden">
                              <Mail className="w-4 h-4" />
                            </Button>
                            {registration.status === 'pending' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" title="Verifizieren">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Revenue Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Euro className="w-5 h-5 mr-2 text-green-600" />
                  MRR Entwicklung
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Aktueller MRR</span>
                    <span className="font-bold text-2xl text-green-600">{formatCurrency(stats.revenueThisMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ziel (€25k)</span>
                    <span className="font-medium">{stats.mrrProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(stats.mrrProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Noch {formatCurrency(stats.targetMRR - stats.revenueThisMonth)} bis zum Ziel
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                  Subscription Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-gray-600">Basic (€9.99)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{revenueMetrics.subscriptionBreakdown.basic}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(revenueMetrics.subscriptionBreakdown.basic * 9.99)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Premium (€19.99)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{revenueMetrics.subscriptionBreakdown.premium}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(revenueMetrics.subscriptionBreakdown.premium * 19.99)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                      <span className="text-gray-600">Enterprise (€99.99)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{revenueMetrics.subscriptionBreakdown.enterprise}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(revenueMetrics.subscriptionBreakdown.enterprise * 99.99)}</div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Growth Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Growth Rate</span>
                    <span className="font-medium text-green-600">+{stats.userGrowthRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-medium text-blue-600">{revenueMetrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Churn Rate</span>
                    <span className="font-medium text-red-600">{stats.churnRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LTV</span>
                    <span className="font-medium">{formatCurrency(stats.lifetimeValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected MRR</span>
                    <span className="font-medium text-purple-600">{formatCurrency(revenueMetrics.projectedMRR)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Geographic & Performance Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Top Saarland Städte
                </h3>
                <div className="space-y-3">
                  {[
                    { city: 'Saarbrücken', users: Math.floor(Math.random() * 200) + 150, revenue: Math.floor(Math.random() * 5000) + 3000 },
                    { city: 'Völklingen', users: Math.floor(Math.random() * 100) + 80, revenue: Math.floor(Math.random() * 2000) + 1500 },
                    { city: 'Homburg', users: Math.floor(Math.random() * 80) + 60, revenue: Math.floor(Math.random() * 1500) + 1000 },
                    { city: 'Saarlouis', users: Math.floor(Math.random() * 70) + 50, revenue: Math.floor(Math.random() * 1200) + 800 },
                    { city: 'Neunkirchen', users: Math.floor(Math.random() * 60) + 40, revenue: Math.floor(Math.random() * 1000) + 600 }
                  ].map((location, index) => (
                    <div key={location.city} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{location.city}</div>
                        <div className="text-sm text-gray-500">{location.users} Nutzer</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{formatCurrency(location.revenue)}</div>
                        <div className="text-xs text-gray-500">Monthly Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  System Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Server Uptime</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${systemHealth.uptime}%` }}></div>
                      </div>
                      <span className="font-medium text-green-600">{systemHealth.uptime.toFixed(2)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Response Time</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.max(100 - (systemHealth.responseTime / 10), 20)}%` }}></div>
                      </div>
                      <span className="font-medium">{systemHealth.responseTime.toFixed(0)}ms</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Error Rate</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${systemHealth.errorRate * 20}%` }}></div>
                      </div>
                      <span className="font-medium text-green-600">{systemHealth.errorRate.toFixed(2)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Database Performance</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${systemHealth.databasePerformance}%` }}></div>
                      </div>
                      <span className="font-medium">{systemHealth.databasePerformance.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-blue-600">{systemHealth.activeConnections}</div>
                        <div className="text-xs text-gray-500">Active Connections</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">{Math.floor(Math.random() * 150) + 50}</div>
                        <div className="text-xs text-gray-500">API Calls/Min</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">{systemHealth.serverLoad.toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">Server Load</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Real-time Chart Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Revenue Timeline (letzte 30 Tage)
              </h3>
              <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Chart.js / Recharts Integration</p>
                  <p className="text-sm text-gray-400 mt-1">Real-time revenue visualization wird geladen...</p>
                  <div className="mt-4 flex justify-center space-x-4 text-sm">
                    <div className="text-green-600">📈 +{stats.userGrowthRate.toFixed(1)}% Growth</div>
                    <div className="text-blue-600">💰 {formatCurrency(stats.revenueThisMonth)} MRR</div>
                    <div className="text-purple-600">🎯 {stats.mrrProgress.toFixed(1)}% zu €25k</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}