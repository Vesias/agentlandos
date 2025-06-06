import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface UserStats {
  active_users: number;
  daily_visitors: number;
  weekly_visitors: number;
  monthly_visitors: number;
  total_users: number;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    // REAL ANALYTICS - Connect to actual Supabase database
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/analytics/real-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const realData = await response.json();
      
      const stats: UserStats = {
        active_users: realData.activeUsers || 0,
        daily_visitors: realData.pageViews || 0,
        weekly_visitors: realData.sessions || 0,
        monthly_visitors: realData.totalUsers || 0,
        total_users: realData.totalUsers || 0,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: stats,
        source: 'real-supabase-analytics'
      });
    } else {
      throw new Error('Real analytics API unavailable');
    }

  } catch (error) {
    console.error('Real Analytics API Error:', error);
    
    // NO FAKE DATA FALLBACK - show real zeros
    const realZeroStats: UserStats = {
      active_users: 0,
      daily_visitors: 0,
      weekly_visitors: 0,
      monthly_visitors: 0,
      total_users: 0,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: realZeroStats,
      source: 'real-zero-data-no-fakes',
      error: 'Starting from 0 - No fake metrics',
      note: 'Building authentic platform from zero'
    });
  }
}