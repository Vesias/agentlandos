import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Real-time football data tracker for Saarland
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league') || 'all';
    const live = searchParams.get('live') === 'true';

    // Get current matches and live scores
    const { data: matches, error } = await supabase
      .from('saarland_football_matches')
      .select(`
        *,
        home_team:saarland_football_teams!home_team_id(name, logo_url),
        away_team:saarland_football_teams!away_team_id(name, logo_url),
        league:saarland_football_leagues!league_id(name, division)
      `)
      .eq(league !== 'all' ? 'league_id' : 'id', league !== 'all' ? league : '*')
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true })
      .limit(50);

    if (error) throw error;

    // Get live match updates if requested
    let liveUpdates = [];
    if (live) {
      const { data: updates } = await supabase
        .from('football_live_updates')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });
      
      liveUpdates = updates || [];
    }

    // Get league standings
    const { data: standings } = await supabase
      .from('football_league_standings')
      .select(`
        *,
        team:saarland_football_teams!team_id(name, logo_url)
      `)
      .order('position', { ascending: true });

    return NextResponse.json({
      matches: matches || [],
      liveUpdates,
      standings: standings || [],
      lastUpdate: new Date().toISOString(),
      meta: {
        totalMatches: matches?.length || 0,
        liveMatches: liveUpdates.length,
        dataSource: 'saarland-football-federation'
      }
    });

  } catch (error) {
    console.error('Football API Error:', error);
    return NextResponse.json(
      { 
        error: 'Fehler beim Laden der Fußballdaten',
        matches: [],
        liveUpdates: [],
        standings: []
      },
      { status: 500 }
    );
  }
}

// Update live match data
export async function POST(request: NextRequest) {
  try {
    const { matchId, homeScore, awayScore, minute, events } = await request.json();

    // Update match score
    const { error: matchError } = await supabase
      .from('saarland_football_matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: minute > 90 ? 'finished' : 'live',
        last_update: new Date().toISOString()
      })
      .eq('id', matchId);

    if (matchError) throw matchError;

    // Add live update
    const { error: updateError } = await supabase
      .from('football_live_updates')
      .insert({
        match_id: matchId,
        minute,
        home_score: homeScore,
        away_score: awayScore,
        events: events || [],
        timestamp: new Date().toISOString()
      });

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Live-Daten aktualisiert',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Football update error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Live-Daten' },
      { status: 500 }
    );
  }
}