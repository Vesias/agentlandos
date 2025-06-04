'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  LogOut, 
  Settings, 
  Shield, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface UserProfileProps {
  compact?: boolean
  showActions?: boolean
}

export default function UserProfile({ compact = false, showActions = true }: UserProfileProps) {
  const { user, signOut, loading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      // Redirect to home or login page
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
        <span className="text-sm">Lade...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => window.location.href = '/auth?mode=login'}
          variant="outline"
          size="sm"
        >
          Anmelden
        </Button>
        <Button 
          onClick={() => window.location.href = '/auth?mode=register'}
          size="sm"
          style={{ backgroundColor: '#003399' }}
        >
          Registrieren
        </Button>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.user_metadata?.name || user.email?.split('@')[0] || 'Benutzer'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>

        {/* Quick Actions */}
        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              disabled={isSigningOut}
              className="text-xs"
            >
              {isSigningOut ? (
                <div className="w-3 h-3 animate-spin border border-gray-400 border-t-transparent rounded-full" />
              ) : (
                <LogOut className="w-3 h-3" />
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
          <User className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">
            {user.user_metadata?.name || 'Willkommen'}
          </h2>
          <p className="text-gray-600 text-sm">
            agentland.saarland Benutzer
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              {user.email_confirmed_at ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Bestätigt</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-600">Nicht bestätigt</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Mitglied seit</p>
            <p className="text-xs text-gray-600">
              {(user as any).created_at ? new Date((user as any).created_at).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unbekannt'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // TODO: Implement profile settings
              alert('Profileinstellungen kommen bald!')
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Profileinstellungen
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // TODO: Implement privacy settings
              alert('Datenschutzeinstellungen kommen bald!')
            }}
          >
            <Shield className="w-4 h-4 mr-2" />
            Datenschutz & Sicherheit
          </Button>

          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-red-400 border-t-transparent rounded-full" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Abmelden
          </Button>
        </div>
      )}

      {/* Email Verification Notice */}
      {!user.email_confirmed_at && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-yellow-800 font-medium">
                E-Mail-Bestätigung ausstehend
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Bitte überprüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail-Adresse.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}