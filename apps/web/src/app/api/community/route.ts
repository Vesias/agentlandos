import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Community Gamification System
const BADGE_SYSTEM = {
  // Saarland-specific badges
  saarland_badges: {
    'saar-resident': {
      name: 'Saarländer/in',
      description: 'Echte/r Saarländer/in',
      icon: '🏠',
      points: 100,
      requirements: 'Wohnsitz im Saarland bestätigt'
    },
    'fc-fan': {
      name: 'FCS Supporter',
      description: '1. FC Saarbrücken Fan',
      icon: '⚽',
      points: 50,
      requirements: '10 Fußball-News kommentiert'
    },
    'elversberg-fan': {
      name: 'SVE Ultra',
      description: 'SV Elversberg Supporter',
      icon: '🏆',
      points: 50,
      requirements: '5 Elversberg Spiele verfolgt'
    },
    'news-junkie': {
      name: 'Saarnews Insider',
      description: 'Immer auf dem Laufenden',
      icon: '📰',
      points: 75,
      requirements: '50 News gelesen'
    },
    'community-hero': {
      name: 'Community Held',
      description: 'Aktives Community-Mitglied',
      icon: '🌟',
      points: 200,
      requirements: '500 Community-Punkte erreicht'
    }
  },
  
  // Activity badges
  activity_badges: {
    'early-bird': {
      name: 'Früher Vogel',
      description: 'Vor 7 Uhr aktiv',
      icon: '🌅',
      points: 25
    },
    'night-owl': {
      name: 'Nachteule',
      description: 'Nach 22 Uhr aktiv',
      icon: '🦉',
      points: 25
    },
    'weekend-warrior': {
      name: 'Wochenend-Krieger',
      description: 'Aktiv am Wochenende',
      icon: '🏃',
      points: 30
    },
    'streak-master': {
      name: 'Serien-Meister',
      description: '7 Tage in Folge aktiv',
      icon: '🔥',
      points: 100
    }
  },
  
  // Premium badges
  premium_badges: {
    'premium-member': {
      name: 'Premium Mitglied',
      description: 'Saarland Premium aktiv',
      icon: '💎',
      points: 500,
      requirements: 'Premium Abo'
    },
    'business-member': {
      name: 'Business Partner',
      description: 'Saarland Business aktiv',
      icon: '🏢',
      points: 1000,
      requirements: 'Business Abo'
    },
    'founding-member': {
      name: 'Gründungsmitglied',
      description: 'Von Anfang an dabei',
      icon: '👑',
      points: 2000,
      requirements: 'Erste 100 User'
    }
  }
}

// Point scoring system
const POINT_ACTIONS = {
  'news_read': { points: 1, description: 'News gelesen' },
  'news_comment': { points: 5, description: 'News kommentiert' },
  'news_share': { points: 3, description: 'News geteilt' },
  'football_comment': { points: 5, description: 'Fußball-Kommentar' },
  'event_attend': { points: 10, description: 'Event teilgenommen' },
  'profile_complete': { points: 25, description: 'Profil vervollständigt' },
  'daily_login': { points: 2, description: 'Täglicher Login' },
  'weekly_login': { points: 10, description: 'Wöchentlicher Bonus' },
  'referral': { points: 50, description: 'Freund eingeladen' },
  'premium_upgrade': { points: 100, description: 'Premium Upgrade' }
}

// Leaderboard categories
const LEADERBOARDS = {
  monthly: {
    name: 'Monats-Champions',
    reset: 'monthly',
    rewards: [
      { rank: 1, reward: '2 FCS/SVE Tickets', points: 1000 },
      { rank: 2, reward: '1 Monat Premium kostenlos', points: 500 },
      { rank: 3, reward: 'Saarland Merchandise', points: 250 }
    ]
  },
  alltime: {
    name: 'Hall of Fame',
    reset: 'never',
    rewards: [
      { rank: 1, reward: 'Lebenslange Premium Mitgliedschaft', points: 10000 },
      { rank: 2, reward: 'Meet & Greet mit Ministerpräsidentin', points: 5000 },
      { rank: 3, reward: 'VIP Saarland Tour', points: 2500 }
    ]
  },
  football: {
    name: 'Fußball-Fans',
    reset: 'season',
    category: 'football',
    rewards: [
      { rank: 1, reward: 'Saison-Ticket FCS oder SVE', points: 2000 },
      { rank: 2, reward: 'VIP Stadion-Tour', points: 1000 },
      { rank: 3, reward: 'Signiertes Trikot', points: 500 }
    ]
  }
}

// Demo user data for badge system testing (replace with real database)
// Note: Real user count should come from Supabase analytics
let DEMO_USERS = [
  // Demo users for badge system functionality testing
  // Real community will be built from actual user registrations
]

function calculateLevel(points: number): number {
  // Level system: 100 points per level, with increasing requirements
  return Math.floor(Math.sqrt(points / 10)) + 1
}

function checkBadgeEligibility(user: any, action: string): string[] {
  const newBadges: string[] = []
  
  // Check for new badges based on points and actions
  if (user.points >= 500 && !user.badges.includes('community-hero')) {
    newBadges.push('community-hero')
  }
  
  if (user.streak >= 7 && !user.badges.includes('streak-master')) {
    newBadges.push('streak-master')
  }
  
  const now = new Date()
  const hour = now.getHours()
  
  if (hour < 7 && !user.badges.includes('early-bird')) {
    newBadges.push('early-bird')
  }
  
  if (hour > 22 && !user.badges.includes('night-owl')) {
    newBadges.push('night-owl')
  }
  
  return newBadges
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const user_id = searchParams.get('user_id')
    
    switch (type) {
      case 'profile':
        if (!user_id) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }
        
        const user = DEMO_USERS.find(u => u.id === user_id) || {
          id: user_id,
          name: 'Neuer User',
          location: 'Saarland',
          points: 0,
          badges: [],
          streak: 0,
          level: 1,
          premium: false
        }
        
        return NextResponse.json({
          user: {
            ...user,
            level: calculateLevel(user.points),
            next_level_points: Math.pow(user.level * 10, 2),
            progress: (user.points % 100) / 100
          },
          available_badges: BADGE_SYSTEM,
          success: true
        })
        
      case 'leaderboard':
        const category = searchParams.get('category') || 'monthly'
        const leaderboard = LEADERBOARDS[category as keyof typeof LEADERBOARDS]
        
        const sortedUsers = [...DEMO_USERS]
          .sort((a, b) => b.points - a.points)
          .slice(0, 10)
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            level: calculateLevel(user.points)
          }))
        
        return NextResponse.json({
          leaderboard: sortedUsers,
          category: leaderboard,
          rewards: leaderboard.rewards,
          success: true
        })
        
      case 'badges':
        return NextResponse.json({
          badge_system: BADGE_SYSTEM,
          point_actions: POINT_ACTIONS,
          success: true
        })
        
      default:
        return NextResponse.json({
          message: 'Saarland Community - Gemeinsam stark! 🤝',
          total_users: 0, // Real user count from Supabase needed
          total_points_distributed: 0, // Real points tracking needed
          active_badges: Object.keys(BADGE_SYSTEM).length,
          leaderboards: Object.keys(LEADERBOARDS),
          success: true
        })
    }
  } catch (error) {
    console.error('Community API error:', error)
    return NextResponse.json({
      error: 'Community service temporarily unavailable',
      success: false
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, user_id, data } = await request.json()
    
    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    // Find or create user in demo system (replace with real database)
    let user = DEMO_USERS.find(u => u.id === user_id)
    if (!user) {
      user = {
        id: user_id,
        name: data.name || 'Neuer User',
        location: data.location || 'Saarland',
        points: 0,
        badges: ['saar-resident'], // Every user gets the Saarland badge
        streak: 1,
        level: 1,
        premium: false
      }
      DEMO_USERS.push(user)
    }
    
    switch (type) {
      case 'action':
        const action = POINT_ACTIONS[data.action as keyof typeof POINT_ACTIONS]
        if (!action) {
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
        
        // Award points
        user.points += action.points
        user.level = calculateLevel(user.points)
        
        // Check for new badges
        const newBadges = checkBadgeEligibility(user, data.action)
        user.badges.push(...newBadges)
        
        // Update streak for daily login
        if (data.action === 'daily_login') {
          user.streak += 1
        }
        
        return NextResponse.json({
          message: `+${action.points} Punkte für ${action.description}! 🎉`,
          user: {
            ...user,
            progress: (user.points % 100) / 100
          },
          new_badges: newBadges.map(badge => BADGE_SYSTEM.saarland_badges[badge] || BADGE_SYSTEM.activity_badges[badge]),
          points_earned: action.points,
          success: true
        })
        
      case 'update_profile':
        user.name = data.name || user.name
        user.location = data.location || user.location
        
        // Award points for profile completion
        if (data.name && data.location && !user.badges.includes('profile-complete')) {
          user.points += 25
          user.badges.push('profile-complete')
        }
        
        return NextResponse.json({
          message: 'Profil aktualisiert! 👤',
          user,
          success: true
        })
        
      case 'premium_upgrade':
        user.premium = true
        user.points += 100
        if (!user.badges.includes('premium-member')) {
          user.badges.push('premium-member')
        }
        
        return NextResponse.json({
          message: 'Premium aktiviert! Willkommen im VIP-Club! 💎',
          user,
          success: true
        })
        
      default:
        return NextResponse.json({
          error: 'Invalid action type',
          success: false
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Community POST error:', error)
    return NextResponse.json({
      error: 'Action failed',
      success: false
    }, { status: 500 })
  }
}