import { NextRequest, NextResponse } from 'next/server'
import { realTracker, generateSessionId, getUserIP } from '@/lib/realAnalytics'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RealAnalyticsData {
  activeUsers: number
  totalUsers: number
  pageViews: number
  sessions: number
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    // CLEANUP alte sessions vor jeder Abfrage
    await realTracker.cleanupOldSessions()
    
    // ECHTE aktuelle Statistics abrufen
    const stats = realTracker.getCurrentStats()
    
    const analyticsData = {
      activeUsers: stats.activeUsers,
      totalUsers: stats.totalUsersToday,
      pageViews: stats.totalPageViewsToday,
      sessions: stats.totalSessionsToday,
      timestamp: new Date().toISOString(),
      source: 'agentland-real-tracker',
      note: 'REAL DATA - Starting from 0, tracking actual users'
    }
    
    return NextResponse.json(analyticsData)
    
  } catch (error) {
    console.error('Real Analytics API Error:', error)
    
    return NextResponse.json({
      activeUsers: 0,
      totalUsers: 0,
      pageViews: 0,
      sessions: 0,
      timestamp: new Date().toISOString(),
      source: 'error-fallback',
      error: 'Real analytics temporarily unavailable'
    }, { status: 200 })
  }
}

// POST für ECHTE User Session Tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, userId, sessionId, action } = body
    
    const userIP = getUserIP(request)
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined
    
    if (action === 'start_session') {
      // NEUE SESSION STARTEN
      const newSessionId = sessionId || generateSessionId()
      
      await realTracker.startSession(newSessionId, {
        ip: userIP,
        userAgent,
        referrer,
        userId
      })
      
      console.log('🚀 NEW SESSION STARTED:', {
        sessionId: newSessionId,
        userId: userId || 'anonymous',
        ip: userIP?.substring(0, 8) + '***', // Privacy
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ 
        success: true,
        sessionId: newSessionId,
        message: 'Session started - REAL tracking active'
      })
      
    } else if (action === 'page_view') {
      // PAGE VIEW TRACKEN
      if (sessionId) {
        await realTracker.updateActivity(sessionId, true)
        
        console.log('📄 PAGE VIEW TRACKED:', {
          sessionId,
          timestamp: new Date().toISOString()
        })
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Page view tracked'
      })
      
    } else if (action === 'activity') {
      // USER ACTIVITY UPDATE
      if (sessionId) {
        await realTracker.updateActivity(sessionId, false)
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Activity updated'
      })
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Unknown action'
    })
    
  } catch (error) {
    console.error('Real tracking error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Tracking failed' 
    }, { status: 200 })
  }
}