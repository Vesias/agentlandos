-- Collaboration Tables for Real-time Canvas Planning
-- Compatible with Supabase PostgreSQL

-- Collaboration Sessions
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    elements JSONB DEFAULT '[]'::jsonb,
    users JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration Events (for real-time sync)
CREATE TABLE IF NOT EXISTS collaboration_events (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    user_id TEXT NOT NULL,
    event_data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration Participants
CREATE TABLE IF NOT EXISTS collaboration_participants (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_color TEXT NOT NULL DEFAULT '#3b82f6',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(session_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collaboration_events_session_id ON collaboration_events(session_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_events_timestamp ON collaboration_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_session_id ON collaboration_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_active ON collaboration_participants(session_id, is_active);

-- Real-time subscriptions for Supabase
-- Enable row level security
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;

-- Policies for collaboration access (public for demo - customize for production)
CREATE POLICY "Public can view collaboration sessions" ON collaboration_sessions FOR SELECT USING (true);
CREATE POLICY "Public can create collaboration sessions" ON collaboration_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update collaboration sessions" ON collaboration_sessions FOR UPDATE USING (true);

CREATE POLICY "Public can view collaboration events" ON collaboration_events FOR SELECT USING (true);
CREATE POLICY "Public can create collaboration events" ON collaboration_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view collaboration participants" ON collaboration_participants FOR SELECT USING (true);
CREATE POLICY "Public can create collaboration participants" ON collaboration_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update collaboration participants" ON collaboration_participants FOR UPDATE USING (true);

-- Function to cleanup old events (keep last 1000 per session)
CREATE OR REPLACE FUNCTION cleanup_old_collaboration_events()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM collaboration_events
    WHERE id NOT IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY timestamp DESC) as rn
            FROM collaboration_events
        ) ranked
        WHERE rn <= 1000
    );
END;
$$;

-- Function to mark inactive participants
CREATE OR REPLACE FUNCTION mark_inactive_participants()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE collaboration_participants
    SET is_active = false
    WHERE last_seen < NOW() - INTERVAL '5 minutes'
    AND is_active = true;
END;
$$;

-- Auto-cleanup trigger (optional)
-- You can run these functions periodically with a cron job or pg_cron extension