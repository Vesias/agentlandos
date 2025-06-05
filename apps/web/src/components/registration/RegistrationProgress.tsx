'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ProgressSteps, ProgressStep } from "@/components/ui/form-components"

export interface RegistrationStep {
  id: string
  title: string
  description?: string
  completed: boolean
  current: boolean
  estimatedTime?: string
  requirements?: string[]
}

export interface NextAction {
  step: number
  title: string
  description: string
  url?: string
  deadline?: string
  required: boolean
  completed?: boolean
}

export interface RegistrationProgressProps {
  type: 'business' | 'saar-id'
  currentStep: number
  totalSteps: number
  steps: RegistrationStep[]
  nextActions?: NextAction[]
  businessId?: string
  saarId?: string
  className?: string
}

export const RegistrationProgress = ({
  type,
  currentStep,
  totalSteps,
  steps,
  nextActions = [],
  businessId,
  saarId,
  className
}: RegistrationProgressProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100
  
  const getStatusColor = (status: 'pending' | 'in_progress' | 'completed' | 'error') => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
    }
  }
  
  const getTypeIcon = () => {
    if (type === 'business') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-6h-4m0 0v2" />
      </svg>
    )
  }
  
  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
            {getTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {type === 'business' ? 'Unternehmensregistrierung' : 'SAAR-ID Registrierung'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {type === 'business' && businessId && `Business-ID: ${businessId}`}
              {type === 'saar-id' && saarId && `SAAR-ID: ${saarId}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Fortschritt
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>Schritt {currentStep} von {totalSteps}</span>
            <span>
              {currentStep === totalSteps ? 'Abgeschlossen' : `${totalSteps - currentStep} verbleibend`}
            </span>
          </div>
        </div>
      </div>
      
      {/* Steps */}
      <div className="p-6">
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
          Registrierungsschritte
        </h3>
        
        <ProgressSteps 
          steps={steps.map(step => ({
            id: step.id,
            title: step.title,
            description: step.description,
            completed: step.completed,
            current: step.current
          }))}
        />
        
        {/* Step Details */}
        <div className="mt-6 space-y-4">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={cn(
                "rounded-lg border p-4 transition-all duration-200",
                step.current 
                  ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" 
                  : step.completed
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                  step.completed 
                    ? "bg-green-600 text-white" 
                    : step.current
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                )}>
                  {step.completed ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{steps.findIndex(s => s.id === step.id) + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  )}
                  {step.estimatedTime && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Geschätzte Zeit: {step.estimatedTime}
                    </p>
                  )}
                  {step.requirements && step.requirements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Erforderliche Dokumente:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                        {step.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Next Actions */}
      {nextActions.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
            Nächste Schritte
          </h3>
          
          <div className="space-y-3">
            {nextActions.map((action) => (
              <div 
                key={action.step}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border",
                  action.completed 
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                    : action.required
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  action.completed 
                    ? "bg-green-600 text-white"
                    : action.required
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
                )}>
                  {action.completed ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{action.step}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {action.title}
                        {action.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {action.description}
                      </p>
                      {action.deadline && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Frist: {new Date(action.deadline).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                    {action.url && !action.completed && (
                      <a
                        href={action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 ml-3 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Öffnen
                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Support Contact */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Benötigen Sie Hilfe?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unser Support-Team steht Ihnen bei Fragen zur Verfügung.
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <a 
                href={`mailto:${type === 'business' ? 'business' : 'saar-id'}@agentland.saarland`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                E-Mail Support
              </a>
              <a 
                href={`/chat?service=${type === 'business' ? 'wirtschaft' : 'verwaltung'}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Live Chat
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}