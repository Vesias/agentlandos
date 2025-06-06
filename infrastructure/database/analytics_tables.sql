-- Analytics and Session Tracking Tables for AGENTLAND.SAARLAND
-- Real-time analytics with no fake data

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Session tracking table
CREATE TABLE IF NOT EXISTS session_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  is_mobile BOOLEAN DEFAULT FALSE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  pages_visited INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_tracking_session_id ON session_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_user_id ON session_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_last_activity ON session_tracking(last_activity);
CREATE INDEX IF NOT EXISTS idx_session_tracking_ended_at ON session_tracking(ended_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event ON user_analytics(event);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access users" ON users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access session_tracking" ON session_tracking FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access user_analytics" ON user_analytics FOR ALL TO service_role USING (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Insert some real initial data (0 to start authentic)
-- No fake data - everything starts from real users

COMMENT ON TABLE users IS 'Real users table - no fake data, starts from 0';
COMMENT ON TABLE session_tracking IS 'Real session tracking - authentic analytics only';
COMMENT ON TABLE user_analytics IS 'Real user events - no fabricated engagement';