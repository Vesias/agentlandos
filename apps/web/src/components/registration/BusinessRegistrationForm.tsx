'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle, Building2, Users, Euro, FileText, MapPin } from 'lucide-react'

// Validation Schema
const businessRegistrationSchema = z.object({
  // Grunddaten
  companyName: z.string().min(2, 'Firmenname muss mindestens 2 Zeichen haben'),
  legalForm: z.enum(['GmbH', 'UG', 'AG', 'GbR', 'OHG', 'KG', 'eK', 'Freiberufler']),
  industry: z.string().min(3, 'Branche ist erforderlich'),
  description: z.string().min(10, 'Beschreibung muss mindestens 10 Zeichen haben'),
  
  // Adresse
  street: z.string().min(3, 'Straße ist erforderlich'),
  houseNumber: z.string().min(1, 'Hausnummer ist erforderlich'),
  postalCode: z.string().regex(/^66\d{3}$/, 'Nur Saarland PLZ (66xxx) erlaubt'),
  city: z.string().min(2, 'Stadt ist erforderlich'),
  
  // Kontakt
  phone: z.string().min(10, 'Telefonnummer ist erforderlich'),
  email: z.string().email('Gültige E-Mail-Adresse erforderlich'),
  website: z.string().url('Gültige Website-URL erforderlich').optional().or(z.literal('')),
  
  // Gründer
  founderFirstName: z.string().min(2, 'Vorname ist erforderlich'),
  founderLastName: z.string().min(2, 'Nachname ist erforderlich'),
  founderEmail: z.string().email('Gültige E-Mail-Adresse erforderlich'),
  founderPhone: z.string().min(10, 'Telefonnummer ist erforderlich'),
  founderAge: z.number().min(18, 'Mindestalter für Geschäftsführer: 18 Jahre'),
  founderDateOfBirth: z.string().min(1, 'Geburtsdatum ist erforderlich'),
  saarId: z.string().optional(),
  
  // Business Details
  expectedEmployees: z.number().min(0, 'Anzahl Mitarbeiter muss >= 0 sein'),
  expectedRevenue: z.number().min(0, 'Erwarteter Umsatz muss >= 0 sein'),
  businessPlan: z.string().optional(),
  fundingNeeded: z.boolean(),
  fundingAmount: z.number().min(0).optional(),
  
  // Legal
  termsAccepted: z.boolean().refine(val => val === true, 'AGB müssen akzeptiert werden'),
  privacyAccepted: z.boolean().refine(val => val === true, 'Datenschutz muss akzeptiert werden')
})

type BusinessRegistrationData = z.infer<typeof businessRegistrationSchema>

interface BusinessRegistrationFormProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface RegistrationResult {
  businessId: string
  authority: any
  eligibleFunding: any[]
  nextSteps: any[]
  estimatedProcessingTime: string
  totalCosts: string
}

export default function BusinessRegistrationForm({ onSuccess, onError }: BusinessRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null)
  const [plzValidation, setPlzValidation] = useState<{ valid: boolean; authority?: any }>({ valid: false })

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<BusinessRegistrationData>({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      expectedEmployees: 0,
      expectedRevenue: 0,
      fundingNeeded: false,
      founderAge: 0,
      founderDateOfBirth: '',
      termsAccepted: false,
      privacyAccepted: false
    }
  })

  const watchedFields = watch()
  const totalSteps = 5

  // Age calculation function
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // PLZ Validation
  useEffect(() => {
    const validatePLZ = async () => {
      if (watchedFields.postalCode && watchedFields.postalCode.length === 5) {
        try {
          const response = await fetch(`/api/registration/business?plz=${watchedFields.postalCode}`)
          const data = await response.json()
          setPlzValidation({ valid: data.success, authority: data.data?.authority })
        } catch (error) {
          setPlzValidation({ valid: false })
        }
      }
    }
    
    validatePLZ()
  }, [watchedFields.postalCode])

  const onSubmit = async (data: BusinessRegistrationData) => {
    setIsSubmitting(true)
    
    try {
      const registrationData = {
        companyName: data.companyName,
        legalForm: data.legalForm,
        industry: data.industry,
        description: data.description,
        address: {
          street: data.street,
          houseNumber: data.houseNumber,
          postalCode: data.postalCode,
          city: data.city,
          country: 'Deutschland'
        },
        contact: {
          phone: data.phone,
          email: data.email,
          website: data.website
        },
        founder: {
          firstName: data.founderFirstName,
          lastName: data.founderLastName,
          email: data.founderEmail,
          phone: data.founderPhone,
          age: data.founderAge,
          dateOfBirth: data.founderDateOfBirth,
          saarId: data.saarId
        },
        expectedEmployees: data.expectedEmployees,
        expectedRevenue: data.expectedRevenue,
        businessPlan: data.businessPlan,
        fundingNeeded: data.fundingNeeded,
        fundingAmount: data.fundingAmount
      }

      const response = await fetch('/api/registration/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()

      if (result.success) {
        setRegistrationResult(result.data)
        setCurrentStep(6) // Success step
        onSuccess?.(result.data)
      } else {
        onError?.(result.error)
      }
    } catch (error) {
      onError?.('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepValidation = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(watchedFields.companyName && watchedFields.legalForm && watchedFields.industry && watchedFields.description)
      case 2:
        return !!(watchedFields.street && watchedFields.houseNumber && watchedFields.postalCode && watchedFields.city && plzValidation.valid)
      case 3:
        return !!(watchedFields.phone && watchedFields.email)
      case 4:
        const founderAge = calculateAge(watchedFields.founderDateOfBirth)
        return !!(watchedFields.founderFirstName && 
                 watchedFields.founderLastName && 
                 watchedFields.founderEmail && 
                 watchedFields.founderPhone &&
                 watchedFields.founderDateOfBirth &&
                 founderAge >= 18)
      case 5:
        return watchedFields.termsAccepted && watchedFields.privacyAccepted
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h2 className="text-2xl font-bold text-gray-900">Unternehmensdaten</h2>
              <p className="text-gray-600">Grundlegende Informationen zu Ihrem Unternehmen</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Firmenname *</label>
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Meine Firma GmbH"
                    />
                  )}
                />
                {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rechtsform *</label>
                <Controller
                  name="legalForm"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Rechtsform wählen</option>
                      <option value="GmbH">GmbH</option>
                      <option value="UG">UG (haftungsbeschränkt)</option>
                      <option value="AG">AG</option>
                      <option value="GbR">GbR</option>
                      <option value="OHG">OHG</option>
                      <option value="KG">KG</option>
                      <option value="eK">e.K.</option>
                      <option value="Freiberufler">Freiberufler</option>
                    </select>
                  )}
                />
                {errors.legalForm && <p className="text-red-500 text-sm">{errors.legalForm.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Branche *</label>
              <Controller
                name="industry"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Softwareentwicklung, Einzelhandel, Beratung"
                  />
                )}
              />
              {errors.industry && <p className="text-red-500 text-sm">{errors.industry.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Beschreibung *</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Beschreiben Sie Ihr Geschäftsmodell und Ihre Dienstleistungen..."
                  />
                )}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h2 className="text-2xl font-bold text-gray-900">Geschäftsadresse</h2>
              <p className="text-gray-600">Standort Ihres Unternehmens im Saarland</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Straße *</label>
                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Musterstraße"
                    />
                  )}
                />
                {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nr. *</label>
                <Controller
                  name="houseNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                    />
                  )}
                />
                {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PLZ *</label>
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <input
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          plzValidation.valid ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="66111"
                        maxLength={5}
                      />
                      {watchedFields.postalCode && watchedFields.postalCode.length === 5 && (
                        <div className="absolute right-3 top-2">
                          {plzValidation.valid ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
                {plzValidation.valid && plzValidation.authority && (
                  <p className="text-green-600 text-sm">✓ Zuständig: {plzValidation.authority.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stadt *</label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Saarbrücken"
                    />
                  )}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h2 className="text-2xl font-bold text-gray-900">Kontaktdaten</h2>
              <p className="text-gray-600">Wie können wir Sie erreichen?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefon *</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+49 681 123456"
                    />
                  )}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">E-Mail *</label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@meine-firma.de"
                    />
                  )}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Website (optional)</label>
              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.meine-firma.de"
                  />
                )}
              />
              {errors.website && <p className="text-red-500 text-sm">{errors.website.message}</p>}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h2 className="text-2xl font-bold text-gray-900">Gründer / Geschäftsführer</h2>
              <p className="text-gray-600">Informationen zur verantwortlichen Person</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Vorname *</label>
                <Controller
                  name="founderFirstName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                    />
                  )}
                />
                {errors.founderFirstName && <p className="text-red-500 text-sm">{errors.founderFirstName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nachname *</label>
                <Controller
                  name="founderLastName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mustermann"
                    />
                  )}
                />
                {errors.founderLastName && <p className="text-red-500 text-sm">{errors.founderLastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">E-Mail *</label>
                <Controller
                  name="founderEmail"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="max.mustermann@email.de"
                    />
                  )}
                />
                {errors.founderEmail && <p className="text-red-500 text-sm">{errors.founderEmail.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefon *</label>
                <Controller
                  name="founderPhone"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+49 681 123456"
                    />
                  )}
                />
                {errors.founderPhone && <p className="text-red-500 text-sm">{errors.founderPhone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Geburtsdatum *</label>
                <Controller
                  name="founderDateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        const newAge = calculateAge(e.target.value)
                        setValue('founderAge', newAge)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
                {errors.founderDateOfBirth && <p className="text-red-500 text-sm">{errors.founderDateOfBirth.message}</p>}
                {watchedFields.founderDateOfBirth && (
                  <p className="text-xs text-gray-500">
                    Alter: {calculateAge(watchedFields.founderDateOfBirth)} Jahre
                    {calculateAge(watchedFields.founderDateOfBirth) < 18 && (
                      <span className="text-red-500 ml-2">Mindestalter: 18 Jahre</span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Alter</label>
                <Controller
                  name="founderAge"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      placeholder="Wird automatisch berechnet"
                    />
                  )}
                />
                <p className="text-xs text-gray-500">Basierend auf Geburtsdatum</p>
                {errors.founderAge && <p className="text-red-500 text-sm">{errors.founderAge.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">SAAR-ID (optional)</label>
              <Controller
                name="saarId"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SAAR-25-ABC123-45"
                  />
                )}
              />
              <p className="text-sm text-gray-500">Mit SAAR-ID werden Behördengänge automatisch verknüpft</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Erwartete Mitarbeiter</label>
                <Controller
                  name="expectedEmployees"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="0"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Erwarteter Jahresumsatz (€)</label>
                <Controller
                  name="expectedRevenue"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="0"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50000"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Controller
                  name="fundingNeeded"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  )}
                />
                <label className="text-sm font-medium text-gray-700">Ich benötige Fördermittel</label>
              </div>

              {watchedFields.fundingNeeded && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Benötigter Förderbetrag (€)</label>
                  <Controller
                    name="fundingAmount"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25000"
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h2 className="text-2xl font-bold text-gray-900">Bestätigung</h2>
              <p className="text-gray-600">Bitte bestätigen Sie die Nutzungsbedingungen</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                  )}
                />
                <label className="text-sm text-gray-700">
                  Ich akzeptiere die{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Allgemeinen Geschäftsbedingungen
                  </a>{' '}
                  von AGENTLAND.SAARLAND
                </label>
              </div>
              {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>}

              <div className="flex items-start space-x-3">
                <Controller
                  name="privacyAccepted"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                  )}
                />
                <label className="text-sm text-gray-700">
                  Ich habe die{' '}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    Datenschutzerklärung
                  </a>{' '}
                  gelesen und akzeptiere die Verarbeitung meiner Daten
                </label>
              </div>
              {errors.privacyAccepted && <p className="text-red-500 text-sm">{errors.privacyAccepted.message}</p>}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">📋 Zusammenfassung</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Firma:</strong> {watchedFields.companyName} ({watchedFields.legalForm})</p>
                <p><strong>Branche:</strong> {watchedFields.industry}</p>
                <p><strong>Standort:</strong> {watchedFields.city}, {watchedFields.postalCode}</p>
                <p><strong>Gründer:</strong> {watchedFields.founderFirstName} {watchedFields.founderLastName} ({watchedFields.founderAge} Jahre)</p>
                <p><strong>Mitarbeiter:</strong> {watchedFields.expectedEmployees}</p>
                <p><strong>Umsatz:</strong> {watchedFields.expectedRevenue?.toLocaleString()}€</p>
                {watchedFields.fundingNeeded && (
                  <p><strong>Förderbedarf:</strong> {watchedFields.fundingAmount?.toLocaleString()}€</p>
                )}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900">Registrierung erfolgreich!</h2>
            <p className="text-gray-600">Ihre Unternehmensregistrierung wurde erfolgreich eingereicht.</p>
            
            {registrationResult && (
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-4">📋 Ihre Registrierungsdaten</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <p><strong>Business-ID:</strong> {registrationResult.businessId}</p>
                    <p><strong>Bearbeitungszeit:</strong> {registrationResult.estimatedProcessingTime}</p>
                    <p><strong>Kosten:</strong> {registrationResult.totalCosts}</p>
                    {registrationResult.authority && (
                      <p><strong>Zuständige Behörde:</strong> {registrationResult.authority.name}</p>
                    )}
                  </div>
                </div>

                {registrationResult.eligibleFunding.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-4">💰 Verfügbare Förderprogramme</h3>
                    <div className="space-y-3">
                      {registrationResult.eligibleFunding.map((program: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-blue-900">{program.name}</h4>
                          <p className="text-sm text-blue-700">{program.description}</p>
                          <p className="text-sm text-blue-600">
                            Förderung: {program.minAmount.toLocaleString()}€ - {program.maxAmount.toLocaleString()}€
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">🚀 Nächste Schritte</h3>
                  <div className="space-y-3">
                    {registrationResult.nextSteps.map((step: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {step.step}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          <p className="text-sm text-gray-600">{step.description}</p>
                          {step.deadline && (
                            <p className="text-xs text-gray-500">
                              Frist: {new Date(step.deadline).toLocaleDateString('de-DE')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Fortschritt</span>
          <span className="text-sm font-medium text-gray-700">{currentStep} von {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStepContent()}

        {currentStep < 6 && (
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Zurück
            </Button>

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!getStepValidation(currentStep)}
              >
                Weiter
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!getStepValidation(currentStep) || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registrierung einreichen
              </Button>
            )}
          </div>
        )}
      </form>
    </Card>
  )
}