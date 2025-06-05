import { NextRequest, NextResponse } from 'next/server'
import { realTracker, generateSessionId, getUserIP } from '@/lib/realAnalytics'
import { DatabaseService } from '@/lib/supabase'

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
    // Get real data from Supabase database
    const totalUsers = await DatabaseService.getTotalUsers()
    const usersToday = await DatabaseService.getUsersRegisteredToday()
    const activeSessions = await DatabaseService.getActiveSessions()
    
    // Also get local tracker stats if available
    let localStats = { activeUsers: 0, totalPageViewsToday: 0, totalSessionsToday: 0 }
    try {
      await realTracker.cleanupOldSessions()
      localStats = realTracker.getCurrentStats()
    } catch (trackerError) {
      console.warn('Local tracker unavailable:', trackerError)
    }
    
    const analyticsData = {
      activeUsers: Math.max(activeSessions, localStats.activeUsers, 1), // At least 1 (current user)
      totalUsers: totalUsers,
      pageViews: localStats.totalPageViewsToday,
      sessions: Math.max(activeSessions, localStats.totalSessionsToday),
      registeredUsers: totalUsers,
      newUsersToday: usersToday,
      timestamp: new Date().toISOString(),
      source: 'supabase-database + real-tracker',
      note: 'REAL DATA from Supabase database'
    }
    
    return NextResponse.json(analyticsData)
    
  } catch (error) {
    console.error('Real Analytics API Error:', error)
    
    return NextResponse.json({
      activeUsers: 1, // At least current user
      totalUsers: 0,
      pageViews: 0,
      sessions: 1,
      registeredUsers: 0,
      newUsersToday: 0,
      timestamp: new Date().toISOString(),
      source: 'error-fallback',
      error: 'Analytics temporarily unavailable - showing minimal real data'
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