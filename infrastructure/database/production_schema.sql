-- AGENTLAND.SAARLAND Production Database Schema
-- Multi-Model AI System with Vector Embeddings Support
-- Updated: January 2025

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===========================================================================
-- CORE TABLES: Chat & AI System
-- ===========================================================================

-- Chat conversations with embeddings
CREATE TABLE IF NOT EXISTS chat_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(1536),
  user_id UUID REFERENCES auth.users(id),
  topic VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat interactions logging
CREATE TABLE IF NOT EXISTS chat_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  model_used VARCHAR(50),
  response_time_ms INTEGER,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI usage tracking for cost monitoring
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  model VARCHAR(50) NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  endpoint VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback system
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  content TEXT NOT NULL,
  feedback JSONB NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- SAARLAND DATA TABLES
-- ===========================================================================

-- Saarland services with real-time status
CREATE TABLE IF NOT EXISTS saarland_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website TEXT,
  opening_hours JSONB DEFAULT '{}',
  coordinates POINT,
  is_active BOOLEAN DEFAULT true,
  digital_services JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time service status tracking
CREATE TABLE IF NOT EXISTS service_real_time_status (
  service_id UUID PRIMARY KEY REFERENCES saarland_services(id),
  is_online BOOLEAN DEFAULT true,
  current_queue INTEGER DEFAULT 0,
  average_wait_minutes INTEGER,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  next_available_slot TIMESTAMPTZ,
  capacity_percentage INTEGER DEFAULT 0,
  status_message TEXT
);

-- Saarland events and activities
CREATE TABLE IF NOT EXISTS saarland_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location VARCHAR(255),
  address TEXT,
  price DECIMAL(10, 2),
  organizer VARCHAR(255),
  contact_info JSONB DEFAULT '{}',
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- BUSINESS & FUNDING TABLES
-- ===========================================================================

-- Business funding programs
CREATE TABLE IF NOT EXISTS funding_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  max_amount DECIMAL(12, 2),
  min_amount DECIMAL(12, 2),
  deadline TIMESTAMPTZ,
  eligibility_criteria JSONB DEFAULT '{}',
  application_process TEXT,
  contact_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority_sectors TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium subscriptions
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  plan VARCHAR(50) DEFAULT 'premium',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  monthly_amount DECIMAL(8, 2) DEFAULT 10.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business registrations
CREATE TABLE IF NOT EXISTS business_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  registration_number VARCHAR(100),
  address JSONB NOT NULL,
  contact_info JSONB DEFAULT '{}',
  services_offered TEXT[],
  founded_date DATE,
  employee_count INTEGER,
  annual_revenue DECIMAL(15, 2),
  is_verified BOOLEAN DEFAULT false,
  verification_documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- SPORTS & FOOTBALL TABLES
-- ===========================================================================

-- Football leagues
CREATE TABLE IF NOT EXISTS saarland_football_leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  level INTEGER NOT NULL,
  season VARCHAR(10) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football clubs
CREATE TABLE IF NOT EXISTS football_clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(10),
  city VARCHAR(100),
  founded_year INTEGER,
  stadium VARCHAR(255),
  website TEXT,
  contact_info JSONB DEFAULT '{}',
  league_id UUID REFERENCES saarland_football_leagues(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football seasons
CREATE TABLE IF NOT EXISTS football_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season VARCHAR(10) NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football matches
CREATE TABLE IF NOT EXISTS football_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_club_id UUID REFERENCES football_clubs(id),
  away_club_id UUID REFERENCES football_clubs(id),
  league_id UUID REFERENCES saarland_football_leagues(id),
  season_id UUID REFERENCES football_seasons(id),
  match_date TIMESTAMPTZ,
  home_score INTEGER,
  away_score INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled',
  venue VARCHAR(255),
  referee VARCHAR(255),
  attendance INTEGER,
  match_report TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- NEWS & CONTENT TABLES
-- ===========================================================================

-- News article caching
CREATE TABLE IF NOT EXISTS news_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id VARCHAR(255) UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source VARCHAR(100),
  category VARCHAR(50),
  pub_date TIMESTAMPTZ,
  url TEXT,
  image_url TEXT,
  tags TEXT[],
  sentiment DECIMAL(3, 2), -- -1 to 1
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- SAARBRETT community posts
CREATE TABLE IF NOT EXISTS saar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  event_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  organizer_name VARCHAR(255),
  contact_info JSONB DEFAULT '{}',
  attendees INTEGER DEFAULT 0,
  max_attendees INTEGER,
  price DECIMAL(8, 2) DEFAULT 0,
  tags TEXT[],
  is_trending BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- CROSS-BORDER SERVICES
-- ===========================================================================

-- Cross-border service requests
CREATE TABLE IF NOT EXISTS cross_border_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  service_type VARCHAR(100),
  countries TEXT[], -- ['DE', 'FR', 'LU']
  status VARCHAR(50) DEFAULT 'planning',
  coordination_plan JSONB DEFAULT '{}',
  estimated_duration_days INTEGER,
  total_cost DECIMAL(10, 2),
  documents_required TEXT[],
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- MONITORING & ANALYTICS TABLES
-- ===========================================================================

-- API error logging
CREATE TABLE IF NOT EXISTS api_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  error_type VARCHAR(100),
  error_message TEXT,
  error_stack TEXT,
  user_id UUID REFERENCES auth.users(id),
  request_data JSONB,
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Production errors tracking
CREATE TABLE IF NOT EXISTS production_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path VARCHAR(255),
  method VARCHAR(10),
  error_message TEXT,
  error_stack TEXT,
  context VARCHAR(100),
  user_agent TEXT,
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- System health monitoring
CREATE TABLE IF NOT EXISTS health_check (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100),
  status VARCHAR(20), -- 'healthy', 'degraded', 'unhealthy'
  response_time_ms INTEGER,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- INDEXES FOR PERFORMANCE
-- ===========================================================================

-- Chat embeddings indexes
CREATE INDEX IF NOT EXISTS idx_chat_embeddings_vector 
ON chat_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_chat_embeddings_user_date 
ON chat_embeddings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_embeddings_topic 
ON chat_embeddings(topic) WHERE topic IS NOT NULL;

-- Chat interactions indexes
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_time 
ON chat_interactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_interactions_model 
ON chat_interactions(model_used);

-- AI usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time 
ON ai_usage_tracking(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_model_cost 
ON ai_usage_tracking(model, total_cost);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_category_active 
ON saarland_services(category) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_location 
ON saarland_services USING GIST(coordinates);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_date_category 
ON saarland_events(start_date, category) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_events_featured 
ON saarland_events(is_featured, start_date) WHERE is_featured = true;

-- News cache indexes
CREATE INDEX IF NOT EXISTS idx_news_cache_pub_date 
ON news_cache(pub_date DESC);

CREATE INDEX IF NOT EXISTS idx_news_cache_category 
ON news_cache(category, pub_date DESC);

CREATE INDEX IF NOT EXISTS idx_news_cache_title_trgm 
ON news_cache USING gin(title gin_trgm_ops);

-- Football indexes
CREATE INDEX IF NOT EXISTS idx_matches_date_league 
ON football_matches(match_date, league_id);

CREATE INDEX IF NOT EXISTS idx_matches_clubs 
ON football_matches(home_club_id, away_club_id);

-- Error logging indexes
CREATE INDEX IF NOT EXISTS idx_api_errors_timestamp 
ON api_errors(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_api_errors_endpoint 
ON api_errors(endpoint, timestamp DESC);

-- ===========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================================================

-- Enable RLS on sensitive tables
ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_border_requests ENABLE ROW LEVEL SECURITY;

-- Chat interactions policies
CREATE POLICY "Users can view own chat interactions" ON chat_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat interactions" ON chat_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat embeddings policies
CREATE POLICY "Users can view own embeddings" ON chat_embeddings
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own embeddings" ON chat_embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Premium subscriptions policies
CREATE POLICY "Users can view own subscription" ON premium_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Business registrations policies
CREATE POLICY "Users can view own business registration" ON business_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business registration" ON business_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for public data
CREATE POLICY "Public services access" ON saarland_services
  FOR SELECT USING (true);

CREATE POLICY "Public events access" ON saarland_events
  FOR SELECT USING (true);

CREATE POLICY "Public news access" ON news_cache
  FOR SELECT USING (true);

CREATE POLICY "Public football data access" ON football_matches
  FOR SELECT USING (true);

CREATE POLICY "Public football clubs access" ON football_clubs
  FOR SELECT USING (true);

-- ===========================================================================
-- FUNCTIONS FOR VECTOR SIMILARITY SEARCH
-- ===========================================================================

-- Function to find similar chat messages using embeddings
CREATE OR REPLACE FUNCTION find_similar_chats(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  topic text,
  similarity float,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.content,
    ce.topic,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    ce.created_at
  FROM chat_embeddings ce
  WHERE ce.embedding IS NOT NULL
    AND 1 - (ce.embedding <=> query_embedding) > similarity_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to store chat with automatic embedding generation
CREATE OR REPLACE FUNCTION store_chat_with_embedding(
  p_content text,
  p_user_id uuid DEFAULT NULL,
  p_topic text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO chat_embeddings (content, user_id, topic, created_at)
  VALUES (p_content, p_user_id, p_topic, NOW())
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- ===========================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ===========================================================================

-- Service statistics view
CREATE MATERIALIZED VIEW IF NOT EXISTS service_stats AS
SELECT 
  s.category,
  COUNT(*) as total_services,
  COUNT(CASE WHEN rt.is_online THEN 1 END) as online_services,
  AVG(rt.average_wait_minutes) as avg_wait_time,
  AVG(rt.capacity_percentage) as avg_capacity,
  MAX(rt.last_update) as last_update
FROM saarland_services s
LEFT JOIN service_real_time_status rt ON s.id = rt.service_id
WHERE s.is_active = true
GROUP BY s.category;

CREATE UNIQUE INDEX ON service_stats(category);

-- Daily usage statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_usage_stats AS
SELECT 
  DATE(timestamp) as date,
  model,
  COUNT(*) as request_count,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(total_cost) as total_cost,
  AVG(total_cost) as avg_cost_per_request
FROM ai_usage_tracking
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp), model
ORDER BY date DESC, model;

CREATE INDEX ON daily_usage_stats(date DESC, model);

-- ===========================================================================
-- FUNCTIONS TO REFRESH MATERIALIZED VIEWS
-- ===========================================================================

CREATE OR REPLACE FUNCTION refresh_service_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY service_stats;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_usage_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_usage_stats;
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ===========================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_saarland_services_updated_at
  BEFORE UPDATE ON saarland_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_subscriptions_updated_at
  BEFORE UPDATE ON premium_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_border_requests_updated_at
  BEFORE UPDATE ON cross_border_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================================================
-- SAMPLE DATA FOR TESTING
-- ===========================================================================

-- Insert sample football season
INSERT INTO football_seasons (season, start_date, end_date, is_current) 
VALUES ('2024/25', '2024-08-01', '2025-05-31', true)
ON CONFLICT (season) DO NOTHING;

-- Insert sample league
INSERT INTO saarland_football_leagues (name, level, season, is_active)
VALUES ('Verbandsliga Saarland', 5, '2024/25', true)
ON CONFLICT DO NOTHING;

-- Insert sample service categories
INSERT INTO saarland_services (name, category, description, is_active)
VALUES 
  ('Bürgeramt Saarbrücken', 'verwaltung', 'Allgemeine Bürgerservices', true),
  ('Tourist Information Saarschleife', 'tourismus', 'Touristische Informationen', true),
  ('IHK Saarland', 'wirtschaft', 'Industrie- und Handelskammer', true)
ON CONFLICT DO NOTHING;

-- ===========================================================================
-- FINAL GRANTS AND PERMISSIONS
-- ===========================================================================

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON chat_interactions, chat_embeddings, user_feedback TO authenticated;
GRANT INSERT, UPDATE ON premium_subscriptions, business_registrations TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION find_similar_chats TO authenticated;
GRANT EXECUTE ON FUNCTION store_chat_with_embedding TO authenticated;

-- ===========================================================================
-- COMPLETION MESSAGE
-- ===========================================================================

-- Log successful schema creation
INSERT INTO health_check (service_name, status, details)
VALUES (
  'database_schema', 
  'healthy', 
  '{"version": "3.0", "tables_created": 20, "indexes_created": 15, "functions_created": 4}'
);

-- Display success message
DO $$ 
BEGIN 
  RAISE NOTICE 'AGENTLAND.SAARLAND Production Schema v3.0 deployed successfully!';
  RAISE NOTICE 'Features: Multi-Model AI, Vector Embeddings, Real-time Services, Cost Tracking';
  RAISE NOTICE 'Tables: %, Indexes: %, Functions: %', 20, 15, 4;
END $$;