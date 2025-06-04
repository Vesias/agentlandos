import { NextRequest, NextResponse } from 'next/server';

interface UserStats {
  active_users: number;
  daily_visitors: number;
  weekly_visitors: number;
  monthly_visitors: number;
  total_users: number;
  timestamp: string;
}

// Simulated real-time user data
let userCounter = {
  active_users: Math.floor(Math.random() * 50) + 10,
  daily_visitors: Math.floor(Math.random() * 500) + 100,
  weekly_visitors: Math.floor(Math.random() * 2000) + 500,
  monthly_visitors: Math.floor(Math.random() * 8000) + 2000,
  total_users: Math.floor(Math.random() * 50000) + 10000,
  last_update: Date.now()
};

// Update user stats periodically
setInterval(() => {
  userCounter.active_users = Math.max(1, userCounter.active_users + Math.floor(Math.random() * 6) - 3);
  userCounter.daily_visitors += Math.floor(Math.random() * 10);
  userCounter.last_update = Date.now();
}, 30000); // Update every 30 seconds

export async function GET(request: NextRequest) {
  try {
    const stats: UserStats = {
      active_users: userCounter.active_users,
      daily_visitors: userCounter.daily_visitors,
      weekly_visitors: userCounter.weekly_visitors,
      monthly_visitors: userCounter.monthly_visitors,
      total_users: userCounter.total_users,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user statistics'
    }, { status: 500 });
  }
}