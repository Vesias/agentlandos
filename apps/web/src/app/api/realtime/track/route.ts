import { NextRequest, NextResponse } from 'next/server';

interface ActivityData {
  activity_type: string;
  page?: string;
  metadata?: any;
}

// Simple in-memory tracking (in production, this would go to a database)
let activityLog: Array<ActivityData & { timestamp: string; ip?: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const activity: ActivityData = await request.json();
    
    // Add tracking entry
    activityLog.push({
      ...activity,
      timestamp: new Date().toISOString(),
      ip: request.ip || 'unknown'
    });
    
    // Keep only last 1000 entries to prevent memory issues
    if (activityLog.length > 1000) {
      activityLog = activityLog.slice(-1000);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track activity'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const recentActivity = activityLog
      .slice(-limit)
      .reverse(); // Most recent first
    
    return NextResponse.json({
      success: true,
      data: {
        recent_activity: recentActivity,
        total_entries: activityLog.length
      }
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activity data'
    }, { status: 500 });
  }
}