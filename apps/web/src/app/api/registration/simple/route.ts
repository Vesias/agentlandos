import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    // Validation
    if (!email || !name) {
      return NextResponse.json({
        success: false,
        error: 'Name und E-Mail sind erforderlich'
      }, { status: 400 })
    }

    // Check if email already exists in Supabase
    const existingUser = await DatabaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Diese E-Mail-Adresse ist bereits registriert'
      }, { status: 400 })
    }

    // Create user in Supabase
    const newUser = await DatabaseService.createUser(email, name)
    
    if (!newUser) {
      return NextResponse.json({
        success: false,
        error: 'Fehler bei der Registrierung in der Datenbank'
      }, { status: 500 })
    }

    console.log('✅ New user registered in Supabase:', {
      userId: newUser.id,
      name: newUser.name,
      email: email.substring(0, 3) + '***@' + email.split('@')[1],
      timestamp: newUser.created_at
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        message: 'Erfolgreich in der Datenbank registriert'
      }
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Fehler bei der Registrierung'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (email) {
      const user = await DatabaseService.getUserByEmail(email)
      if (user) {
        return NextResponse.json({
          success: true,
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            registeredAt: user.created_at
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Benutzer nicht gefunden'
        }, { status: 404 })
      }
    }
    
    // Return real stats from Supabase
    const totalUsers = await DatabaseService.getTotalUsers()
    const registrationsToday = await DatabaseService.getUsersRegisteredToday()
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        registrationsToday,
        source: 'supabase-database',
        note: 'Real user count from database'
      }
    })
    
  } catch (error) {
    console.error('GET registration error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Abrufen der Daten'
    }, { status: 500 })
  }
}