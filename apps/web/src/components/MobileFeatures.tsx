'use client'

import React, { useState, useEffect } from 'react'
import { Phone, MapPin, Share2, Download, Clock, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileFeaturesProps {
  showLocationButton?: boolean
  showCallButton?: boolean
  showShareButton?: boolean
  showInstallButton?: boolean
  className?: string
}

export default function MobileFeatures({
  showLocationButton = true,
  showCallButton = true,
  showShareButton = true,
  showInstallButton = true,
  className = ''
}: MobileFeaturesProps) {
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Get user location
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert('Standortbestimmung wird von Ihrem Browser nicht unterstützt.')
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })
      
      setLocation(position)
      
      // Open location in maps
      const { latitude, longitude } = position.coords
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
      window.open(mapsUrl, '_blank')
      
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Standort konnte nicht ermittelt werden. Bitte überprüfen Sie Ihre Standortberechtigungen.')
    }
  }

  // Make phone call
  const handleCall = (phoneNumber: string) => {
    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`
    } else {
      // Copy number to clipboard for desktop
      navigator.clipboard.writeText(phoneNumber)
      alert(`Telefonnummer ${phoneNumber} wurde in die Zwischenablage kopiert.`)
    }
  }

  // Share current page
  const handleShare = async () => {
    const shareData = {
      title: 'AGENTLAND.SAARLAND',
      text: 'KI für das Saarland - Entdecken Sie intelligente Services für Tourismus, Wirtschaft und Verwaltung',
      url: window.location.href
    }

    try {
      if (navigator.share && isMobile) {
        await navigator.share(shareData)
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Link wurde in die Zwischenablage kopiert!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link wurde in die Zwischenablage kopiert!')
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError)
      }
    }
  }

  // Install PWA
  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  if (!isMobile) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 ${className}`}>
      {/* Connection Status */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
          <Wifi className="w-4 h-4" />
          Offline Modus
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {/* Location Button */}
        {showLocationButton && (
          <Button
            onClick={handleGetLocation}
            size="icon"
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg touch-target"
            aria-label="Standort ermitteln"
          >
            <MapPin className="w-5 h-5" />
          </Button>
        )}

        {/* Emergency Call Button */}
        {showCallButton && (
          <div className="flex flex-col gap-1">
            <Button
              onClick={() => handleCall('0681-5013333')}
              size="icon" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg touch-target"
              aria-label="Saarland Service-Hotline anrufen"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <span className="text-xs text-gray-600 text-center">Service</span>
          </div>
        )}

        {/* Share Button */}
        {showShareButton && (
          <Button
            onClick={handleShare}
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg touch-target"
            aria-label="Seite teilen"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        )}

        {/* Install PWA Button */}
        {showInstallButton && showInstallPrompt && (
          <Button
            onClick={handleInstall}
            size="icon"
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg touch-target animate-pulse"
            aria-label="App installieren"
          >
            <Download className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Quick Actions for Saarland Services */}
      <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Schnelle Hilfe</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleCall('115')}
            className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm touch-target-sm touch-smooth transition-colors"
          >
            📞 Behördenruf 115
          </button>
          <button
            onClick={() => handleCall('0681-5013333')}
            className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm touch-target-sm touch-smooth transition-colors"
          >
            🏛️ Saarland Service
          </button>
          <button
            onClick={() => window.open('https://notfall-saarland.de', '_blank')}
            className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm touch-target-sm touch-smooth transition-colors"
          >
            🚨 Notfall-Infos
          </button>
        </div>
      </div>
    </div>
  )
}

// Quick Contact Component for specific pages
export function QuickContactSaarland() {
  const contacts = [
    {
      name: 'Bürgerservice Saarbrücken',
      phone: '0681-905-0',
      hours: 'Mo-Fr 7:30-16:00',
      type: 'verwaltung'
    },
    {
      name: 'Tourismus Zentrale',
      phone: '0681-927200',
      hours: 'Mo-Fr 9:00-18:00',
      type: 'tourismus'
    },
    {
      name: 'Wirtschaftsförderung',
      phone: '0681-5013400',
      hours: 'Mo-Fr 8:00-16:00',
      type: 'wirtschaft'
    },
    {
      name: 'Universität des Saarlandes',
      phone: '0681-302-0',
      hours: 'Mo-Fr 8:00-16:00',
      type: 'bildung'
    }
  ]

  const handleCall = (phoneNumber: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`
    } else {
      navigator.clipboard.writeText(phoneNumber)
      alert(`Telefonnummer ${phoneNumber} wurde kopiert.`)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {contacts.map((contact, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">{contact.name}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {contact.hours}
            </div>
            <Button
              onClick={() => handleCall(contact.phone)}
              size="sm"
              className="w-full bg-saarland-blue hover:bg-saarland-blue/90 text-white touch-target"
            >
              <Phone className="w-4 h-4 mr-2" />
              {contact.phone}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}