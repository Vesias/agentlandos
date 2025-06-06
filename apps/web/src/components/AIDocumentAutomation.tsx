'use client'

import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface DocumentTemplate {
  id: string
  name: string
  category: 'verwaltung' | 'business' | 'personal' | 'cross-border'
  description: string
  fields: FormField[]
  estimatedTime: string
  complexity: 'easy' | 'medium' | 'complex'
  fee?: number
}

interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox'
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: string
}

interface DocumentSession {
  templateId: string
  formData: Record<string, any>
  status: 'draft' | 'processing' | 'completed' | 'error'
  generatedDocument?: string
  submissionId?: string
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: 'gewerbeanmeldung',
    name: 'Gewerbeanmeldung',
    category: 'business',
    description: 'Automatische Erstellung Ihrer Gewerbeanmeldung für das Saarland',
    estimatedTime: '5-10 Min',
    complexity: 'medium',
    fee: 25,
    fields: [
      { id: 'company_name', label: 'Firmenname', type: 'text', required: true, placeholder: 'Ihre Firmenbezeichnung' },
      { id: 'business_type', label: 'Rechtsform', type: 'select', required: true, options: ['GmbH', 'UG', 'OHG', 'KG', 'Einzelunternehmen'] },
      { id: 'owner_name', label: 'Inhaber/Geschäftsführer', type: 'text', required: true },
      { id: 'address', label: 'Geschäftsadresse', type: 'textarea', required: true },
      { id: 'business_purpose', label: 'Gegenstand des Unternehmens', type: 'textarea', required: true },
      { id: 'start_date', label: 'Geplanter Beginn', type: 'date', required: true },
      { id: 'employee_count', label: 'Geplante Mitarbeiterzahl', type: 'select', required: true, options: ['0', '1-5', '6-20', '21-50', '50+'] }
    ]
  },
  {
    id: 'wohnsitz_anmeldung',
    name: 'Wohnsitz-Anmeldung',
    category: 'verwaltung',
    description: 'Anmeldung des Wohnsitzes in einer saarländischen Gemeinde',
    estimatedTime: '3-5 Min',
    complexity: 'easy',
    fields: [
      { id: 'full_name', label: 'Vollständiger Name', type: 'text', required: true },
      { id: 'birth_date', label: 'Geburtsdatum', type: 'date', required: true },
      { id: 'birth_place', label: 'Geburtsort', type: 'text', required: true },
      { id: 'old_address', label: 'Alte Adresse', type: 'textarea', required: true },
      { id: 'new_address', label: 'Neue Adresse', type: 'textarea', required: true },
      { id: 'move_date', label: 'Einzugsdatum', type: 'date', required: true },
      { id: 'family_members', label: 'Weitere umziehende Personen', type: 'textarea', required: false }
    ]
  },
  {
    id: 'grenzpendler_antrag',
    name: 'Grenzpendler-Antrag DE/FR',
    category: 'cross-border',
    description: 'Beantragung der Grenzpendler-Bescheinigung für Deutschland/Frankreich',
    estimatedTime: '10-15 Min',
    complexity: 'complex',
    fee: 35,
    fields: [
      { id: 'full_name', label: 'Vollständiger Name', type: 'text', required: true },
      { id: 'residence_country', label: 'Wohnsitzland', type: 'select', required: true, options: ['Deutschland', 'Frankreich', 'Luxemburg'] },
      { id: 'work_country', label: 'Arbeitsland', type: 'select', required: true, options: ['Deutschland', 'Frankreich', 'Luxemburg'] },
      { id: 'employer_name', label: 'Arbeitgeber', type: 'text', required: true },
      { id: 'employer_address', label: 'Adresse des Arbeitgebers', type: 'textarea', required: true },
      { id: 'tax_number_de', label: 'Deutsche Steuernummer', type: 'text', required: false },
      { id: 'tax_number_fr', label: 'Französische Steuernummer', type: 'text', required: false },
      { id: 'employment_start', label: 'Beschäftigungsbeginn', type: 'date', required: true }
    ]
  },
  {
    id: 'building_permit',
    name: 'Bauantrag vereinfacht',
    category: 'verwaltung',
    description: 'Vereinfachter Bauantrag für kleinere Bauprojekte',
    estimatedTime: '15-20 Min',
    complexity: 'complex',
    fee: 50,
    fields: [
      { id: 'applicant_name', label: 'Antragsteller', type: 'text', required: true },
      { id: 'property_address', label: 'Grundstücksadresse', type: 'textarea', required: true },
      { id: 'project_type', label: 'Art des Bauvorhabens', type: 'select', required: true, options: ['Neubau', 'Anbau', 'Umbau', 'Sanierung'] },
      { id: 'project_description', label: 'Beschreibung des Vorhabens', type: 'textarea', required: true },
      { id: 'floor_area', label: 'Grundfläche (m²)', type: 'text', required: true },
      { id: 'building_plans', label: 'Baupläne', type: 'file', required: true },
      { id: 'site_plan', label: 'Lageplan', type: 'file', required: true }
    ]
  }
]

export default function AIDocumentAutomation() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [currentSession, setCurrentSession] = useState<DocumentSession | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredTemplates = documentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const startDocumentSession = (template: DocumentTemplate) => {
    setSelectedTemplate(template)
    setCurrentSession({
      templateId: template.id,
      formData: {},
      status: 'draft'
    })
  }

  const updateFormData = (fieldId: string, value: any) => {
    if (!currentSession) return
    
    setCurrentSession(prev => ({
      ...prev!,
      formData: {
        ...prev!.formData,
        [fieldId]: value
      }
    }))
  }

  const handleFileUpload = async (fieldId: string, file: File) => {
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { data, error } = await supabase.storage
        .from('document-uploads')
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('document-uploads')
        .getPublicUrl(filePath)

      updateFormData(fieldId, publicUrl)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Fehler beim Hochladen der Datei')
    }
  }

  const generateDocument = async () => {
    if (!currentSession || !selectedTemplate) return

    setIsProcessing(true)
    setCurrentSession(prev => ({ ...prev!, status: 'processing' }))

    try {
      // Call AI document generation API
      const response = await fetch('/api/ai/document-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          formData: currentSession.formData,
          language: 'de'
        })
      })

      const result = await response.json()

      if (result.success) {
        setCurrentSession(prev => ({
          ...prev!,
          status: 'completed',
          generatedDocument: result.documentContent,
          submissionId: result.submissionId
        }))

        // Log document generation for analytics
        await supabase.from('document_generations').insert({
          template_id: selectedTemplate.id,
          user_session: result.submissionId,
          status: 'completed',
          generation_time: new Date().toISOString()
        })
      } else {
        throw new Error(result.error || 'Document generation failed')
      }
    } catch (error) {
      console.error('Document generation error:', error)
      setCurrentSession(prev => ({ ...prev!, status: 'error' }))
      alert('Fehler bei der Dokumentenerstellung. Bitte versuchen Sie es erneut.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadDocument = () => {
    if (!currentSession?.generatedDocument) return

    const blob = new Blob([currentSession.generatedDocument], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTemplate?.name}_${currentSession.submissionId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetSession = () => {
    setSelectedTemplate(null)
    setCurrentSession(null)
    setIsProcessing(false)
  }

  const renderFormField = (field: FormField) => {
    const value = currentSession?.formData[field.id] || ''

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        )

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Bitte wählen...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        )

      case 'file':
        return (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(field.id, file)
              }}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {value && (
              <p className="text-sm text-green-600 mt-2">✓ Datei hochgeladen</p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              checked={value}
              onChange={(e) => updateFormData(field.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
            />
            <label htmlFor={field.id} className="ml-2 text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        )

      default:
        return null
    }
  }

  if (selectedTemplate && currentSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={resetSession}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Zurück zur Übersicht
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h1>
          <p className="text-gray-600">{selectedTemplate.description}</p>
          <div className="flex items-center mt-4 space-x-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              ⏱️ {selectedTemplate.estimatedTime}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              selectedTemplate.complexity === 'easy' ? 'bg-green-100 text-green-800' :
              selectedTemplate.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedTemplate.complexity === 'easy' ? '🟢 Einfach' :
               selectedTemplate.complexity === 'medium' ? '🟡 Mittel' : '🔴 Komplex'}
            </span>
            {selectedTemplate.fee && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                💰 {selectedTemplate.fee}€
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        {currentSession.status === 'draft' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={(e) => { e.preventDefault(); generateDocument(); }}>
              <div className="space-y-6">
                {selectedTemplate.fields.map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFormField(field)}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetSession}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? 'Erstelle Dokument...' : 'Dokument erstellen'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Processing State */}
        {currentSession.status === 'processing' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">KI erstellt Ihr Dokument</h3>
            <p className="text-gray-600">Dies kann einige Sekunden dauern...</p>
          </div>
        )}

        {/* Completed State */}
        {currentSession.status === 'completed' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dokument erfolgreich erstellt!</h3>
            <p className="text-gray-600 mb-6">
              Ihr {selectedTemplate.name} wurde generiert und ist bereit zum Download.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={downloadDocument}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📄 PDF herunterladen
              </button>
              <button
                onClick={resetSession}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Neues Dokument
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {currentSession.status === 'error' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fehler beim Erstellen</h3>
            <p className="text-gray-600 mb-6">
              Es gab ein Problem bei der Dokumentenerstellung. Bitte versuchen Sie es erneut.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentSession(prev => ({ ...prev!, status: 'draft' }))}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Erneut versuchen
              </button>
              <button
                onClick={resetSession}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Zurück
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🤖 KI-gestützte Dokumentenerstellung
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Automatische Erstellung von Behörden- und Geschäftsdokumenten mit künstlicher Intelligenz
        </p>
        
        {/* Search and Filter */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Suchen Sie nach Dokumenttypen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
          </div>
          
          <div className="flex justify-center space-x-2">
            {[
              { key: 'all', label: 'Alle' },
              { key: 'verwaltung', label: 'Verwaltung' },
              { key: 'business', label: 'Business' },
              { key: 'personal', label: 'Privat' },
              { key: 'cross-border', label: 'Grenzüberschreitend' }
            ].map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => startDocumentSession(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                template.category === 'verwaltung' ? 'bg-blue-100 text-blue-800' :
                template.category === 'business' ? 'bg-green-100 text-green-800' :
                template.category === 'personal' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {template.category}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">{template.description}</p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">⏱️ {template.estimatedTime}</span>
                <span className={`${
                  template.complexity === 'easy' ? 'text-green-600' :
                  template.complexity === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {template.complexity === 'easy' ? '🟢' :
                   template.complexity === 'medium' ? '🟡' : '🔴'}
                </span>
              </div>
              {template.fee && (
                <span className="font-semibold text-blue-600">{template.fee}€</span>
              )}
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Starten →
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Keine Dokumente gefunden</h3>
          <p className="text-gray-600">Versuchen Sie einen anderen Suchbegriff oder Filter.</p>
        </div>
      )}

      {/* Features Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Warum KI-gestützte Dokumentenerstellung?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Schnell & Effizient</h3>
            <p className="text-gray-600 text-sm">
              Automatische Dokumentenerstellung in wenigen Minuten statt Stunden
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Rechtssicher</h3>
            <p className="text-gray-600 text-sm">
              Alle Dokumente entsprechen aktuellen rechtlichen Anforderungen
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Präzise</h3>
            <p className="text-gray-600 text-sm">
              KI-optimierte Formulare reduzieren Fehler auf ein Minimum
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}