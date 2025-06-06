'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileCheck, 
  User, 
  Shield,
  Calendar,
  Phone,
  Users,
  Building2
} from 'lucide-react'

export type RegistrationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'active'

interface RegistrationProgressProps {
  status: RegistrationStatus
  type: 'saar_id' | 'business'
  submittedAt?: string
  lastUpdated?: string
  statusMessage?: string
  nextSteps?: string[]
  registrationId?: string
  estimatedProcessingTime?: string
  userAge?: number
  applicantInfo?: {
    name?: string
    email?: string
    company?: string
  }
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: 'Antrag eingereicht',
    description: 'Ihr Antrag wurde erfolgreich eingereicht und wartet auf Bearbeitung.'
  },
  in_review: {
    icon: FileCheck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'In Bearbeitung',
    description: 'Ihr Antrag wird derzeit von unseren Experten geprüft.'
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Genehmigt',
    description: 'Ihr Antrag wurde genehmigt und ist bereit zur Aktivierung.'
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Abgelehnt',
    description: 'Ihr Antrag wurde abgelehnt. Weitere Informationen finden Sie unten.'
  },
  active: {
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    title: 'Aktiv',
    description: 'Ihre Registrierung ist vollständig und aktiv.'
  }
}

const RegistrationProgress: React.FC<RegistrationProgressProps> = ({
  status,
  type,
  submittedAt,
  lastUpdated,
  statusMessage,
  nextSteps = [],
  registrationId,
  estimatedProcessingTime,
  userAge,
  applicantInfo
}) => {
  const config = statusConfig[status]
  const Icon = config.icon

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressPercentage = () => {
    switch (status) {
      case 'pending': return 25
      case 'in_review': return 50
      case 'approved': return 75
      case 'active': return 100
      case 'rejected': return 0
      default: return 0
    }
  }

  const getStepStatus = (stepIndex: number) => {
    const currentStep = getProgressPercentage() / 25
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === Math.floor(currentStep)) return 'current'
    return 'upcoming'
  }

  const steps = type === 'saar_id' 
    ? ['Antrag eingereicht', 'Altersverifikation', 'Dokumente prüfen', 'SAAR-ID aktiv']
    : ['Antrag eingereicht', 'Altersverifikation', 'Behördenprüfung', 'Business-ID aktiv']

  const getAgeVerificationStatus = () => {
    if (!userAge) return 'unknown'
    if (type === 'saar_id') {
      return userAge >= 14 ? 'verified' : 'failed'
    } else {
      return userAge >= 18 ? 'verified' : 'failed'
    }
  }

  const ageStatus = getAgeVerificationStatus()
  const minAge = type === 'saar_id' ? 14 : 18

  return (
    <Card className="p-6 space-y-6">
      {/* Header with Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {type === 'saar_id' ? 'SAAR-ID' : 'Business-ID'} Registrierung
            </h3>
            <p className={`text-sm font-medium ${config.color}`}>
              {config.title}
            </p>
          </div>
        </div>
        
        {registrationId && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Registrierungs-ID</p>
            <p className="text-sm font-mono text-gray-700">{registrationId}</p>
          </div>
        )}
      </div>

      {/* Applicant Information */}
      {applicantInfo && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {type === 'business' ? (
              <Building2 className="w-4 h-4 text-gray-400" />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
            <h4 className="text-sm font-medium text-gray-900">Antragsteller</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {applicantInfo.name && (
              <p><span className="text-gray-500">Name:</span> {applicantInfo.name}</p>
            )}
            {applicantInfo.email && (
              <p><span className="text-gray-500">E-Mail:</span> {applicantInfo.email}</p>
            )}
            {applicantInfo.company && (
              <p><span className="text-gray-500">Unternehmen:</span> {applicantInfo.company}</p>
            )}
            {userAge && (
              <p>
                <span className="text-gray-500">Alter:</span> {userAge} Jahre
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  ageStatus === 'verified' 
                    ? 'bg-green-100 text-green-700' 
                    : ageStatus === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {ageStatus === 'verified' && '✓ Berechtigt'}
                  {ageStatus === 'failed' && `✗ Min. ${minAge} Jahre erforderlich`}
                  {ageStatus === 'unknown' && 'Prüfung ausstehend'}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Age Verification Alert */}
      {userAge && ageStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Altersverifikation fehlgeschlagen</h4>
              <p className="text-sm text-red-700 mt-1">
                Für eine {type === 'saar_id' ? 'SAAR-ID' : 'Business-ID'} Registrierung ist ein Mindestalter von {minAge} Jahren erforderlich. 
                Ihr angegebenes Alter beträgt {userAge} Jahre.
              </p>
              <p className="text-sm text-red-600 mt-2 font-medium">
                Ihr Antrag kann erst nach Erreichen des Mindestalters bearbeitet werden.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Description */}
      <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <p className="text-sm text-gray-700">{config.description}</p>
        {statusMessage && (
          <p className="text-sm text-gray-600 mt-2 italic">{statusMessage}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Fortschritt</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              status === 'rejected' || ageStatus === 'failed' ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index)
          // Special handling for age verification step
          const isAgeStep = step.includes('Altersverifikation')
          const stepFailed = isAgeStep && ageStatus === 'failed'
          
          return (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300 ${
                  stepFailed
                    ? 'bg-red-500 text-white'
                    : stepStatus === 'completed'
                    ? 'bg-green-500 text-white'
                    : stepStatus === 'current'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepFailed ? (
                  <XCircle className="w-4 h-4" />
                ) : stepStatus === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs text-center max-w-16 ${
                  stepFailed
                    ? 'text-red-600 font-medium'
                    : stepStatus === 'completed' || stepStatus === 'current'
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Timeline Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        {submittedAt && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Eingereicht am</p>
              <p className="text-sm text-gray-700">{formatDate(submittedAt)}</p>
            </div>
          </div>
        )}
        
        {lastUpdated && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Zuletzt aktualisiert</p>
              <p className="text-sm text-gray-700">{formatDate(lastUpdated)}</p>
            </div>
          </div>
        )}
        
        {estimatedProcessingTime && status !== 'active' && status !== 'rejected' && ageStatus !== 'failed' && (
          <div className="flex items-center space-x-2 md:col-span-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs text-gray-500">Geschätzte Bearbeitungszeit</p>
              <p className="text-sm text-orange-600 font-medium">{estimatedProcessingTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* GDPR & Privacy Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Datenschutz & Altersverifikation</h4>
            <p className="text-xs text-blue-700 mt-1">
              Ihre Altersangaben werden gemäß DSGVO verarbeitet und ausschließlich für die 
              {type === 'saar_id' ? ' SAAR-ID' : ' Business-ID'} Verifizierung verwendet. 
              Die Daten werden nach abgeschlossener Registrierung oder nach gesetzlichen Aufbewahrungsfristen gelöscht.
            </p>
            {userAge && (
              <p className="text-xs text-blue-600 mt-2">
                <strong>Altersverifikation:</strong> {userAge} Jahre (Erforderlich: min. {minAge} Jahre)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {nextSteps.length > 0 && ageStatus !== 'failed' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Nächste Schritte</span>
          </h4>
          <ul className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact Information for Support */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-900">Fragen? Wir helfen gerne!</h4>
        </div>
        <p className="text-xs text-gray-600">
          Bei Fragen zur Registrierung kontaktieren Sie uns über das Chat-System oder per E-Mail: 
          <a href="mailto:support@agentland.saarland" className="text-blue-600 hover:underline ml-1">
            support@agentland.saarland
          </a>
        </p>
        {ageStatus === 'failed' && (
          <p className="text-xs text-red-600 mt-2">
            <strong>Hinweis:</strong> Bei Fragen zur Altersverifikation wenden Sie sich bitte an unser Support-Team.
          </p>
        )}
      </div>
    </Card>
  )
}

export default RegistrationProgress