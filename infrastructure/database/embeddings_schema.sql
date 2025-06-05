-- Embeddings Schema for Enhanced AI Chat
-- Migration: 20250106_embeddings_integration.sql

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Saarland Knowledge Base Embeddings
CREATE TABLE IF NOT EXISTS saarland_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Interactions for Learning
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users when available
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  feedback VARCHAR(20) CHECK (feedback IN ('positive', 'negative', 'neutral')),
  embedding vector(1536),
  category VARCHAR(100),
  agent_name VARCHAR(100),
  response_time INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions for Context
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users when available
  session_data JSONB,
  conversation_history JSONB,
  context_embedding vector(1536),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Knowledge Base with Real-Time Updates
CREATE TABLE IF NOT EXISTS dynamic_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'weather', 'events', 'news', 'services'
  content TEXT NOT NULL,
  data_source VARCHAR(100),
  embedding vector(1536),
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Similarity Search Function
CREATE OR REPLACE FUNCTION similarity_search(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  category varchar,
  source varchar,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    saarland_embeddings.id,
    saarland_embeddings.content,
    saarland_embeddings.category,
    saarland_embeddings.source,
    1 - (saarland_embeddings.embedding <=> query_embedding) as similarity
  FROM saarland_embeddings
  WHERE 1 - (saarland_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY saarland_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_saarland_embeddings_category ON saarland_embeddings(category);
CREATE INDEX IF NOT EXISTS idx_saarland_embeddings_source ON saarland_embeddings(source);
CREATE INDEX IF NOT EXISTS idx_saarland_embeddings_embedding ON saarland_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_user_interactions_category ON user_interactions(category);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_feedback ON user_interactions(feedback);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_dynamic_knowledge_type ON dynamic_knowledge(type);
CREATE INDEX IF NOT EXISTS idx_dynamic_knowledge_expires_at ON dynamic_knowledge(expires_at);

-- Row Level Security
ALTER TABLE saarland_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_knowledge ENABLE ROW LEVEL SECURITY;

-- Public read access for knowledge base
CREATE POLICY "Public knowledge access" ON saarland_embeddings
  FOR SELECT USING (true);

CREATE POLICY "Public dynamic knowledge access" ON dynamic_knowledge
  FOR SELECT USING (expires_at IS NULL OR expires_at > NOW());

-- User-specific policies
CREATE POLICY "Users own interactions" ON user_interactions
  FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users own sessions" ON chat_sessions
  FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

-- Functions for cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_knowledge()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM dynamic_knowledge 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$;

-- Auto-cleanup trigger
CREATE OR REPLACE FUNCTION schedule_cleanup()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM cleanup_expired_knowledge();
  RETURN NEW;
END;
$$;

-- Insert base Saarland knowledge
INSERT INTO saarland_embeddings (content, category, source) VALUES
('Das Saarland hat 52 Gemeinden und ist bekannt für die Saarschleife bei Mettlach', 'geography', 'saarland-facts'),
('1. FC Saarbrücken spielt in der 3. Liga, SV Elversberg in der 2. Bundesliga', 'football', 'saarfussball'),
('Die Völklinger Hütte ist UNESCO Welterbe und wichtiges Industriedenkmal', 'tourism', 'unesco-heritage'),
('Bostalsee ist der größte Freizeitsee im Saarland mit Wassersport und Baden', 'tourism', 'recreation'),
('Saarland bietet Förderprogramme für Startups und KI-Unternehmen bis 150.000€', 'business', 'funding-programs'),
('Saarbrücken hat digitale Bürgerservices mit kurzen Wartezeiten', 'administration', 'digital-services'),
('Über 1000 Vereine im Saarland: Sport, Kultur, Musik und Naturschutz', 'clubs', 'associations'),
('Nachhilfe-Anbieter im Saarland für Mathematik, Deutsch, Englisch und Französisch', 'education', 'tutoring-services')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRODUCTION TABLES FOR CHAT AND AI TRACKING
-- =====================================================

-- Chat interactions for AI tracking
CREATE TABLE IF NOT EXISTS chat_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- References auth.users when available
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    response_time_ms INTEGER,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI usage tracking for cost optimization
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model VARCHAR(100) NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,8) NOT NULL DEFAULT 0,
    user_id UUID,
    endpoint VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Production error logging
CREATE TABLE IF NOT EXISTS api_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    error_type VARCHAR(100),
    error_message TEXT,
    error_stack TEXT,
    request_data JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Premium subscriptions (Stripe integration)
CREATE TABLE IF NOT EXISTS premium_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    plan_name VARCHAR(100),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News cache for local Saarland news
CREATE TABLE IF NOT EXISTS news_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id VARCHAR(255) UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    source VARCHAR(100),
    category VARCHAR(50),
    pub_date TIMESTAMPTZ,
    url TEXT,
    image_url TEXT,
    cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football clubs in Saarland
CREATE TABLE IF NOT EXISTS football_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    founded_year INTEGER,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    stadium VARCHAR(255),
    website VARCHAR(255),
    contact JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football leagues
CREATE TABLE IF NOT EXISTS saarland_football_leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    level INTEGER,
    age_group VARCHAR(50),
    season VARCHAR(10),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football matches
CREATE TABLE IF NOT EXISTS football_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_club_id UUID REFERENCES football_clubs(id),
    away_club_id UUID REFERENCES football_clubs(id),
    league_id UUID REFERENCES saarland_football_leagues(id),
    match_date TIMESTAMPTZ,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled',
    venue VARCHAR(255),
    attendance INTEGER,
    weather JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional indexes for production tables
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_timestamp 
ON chat_interactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_model_timestamp 
ON ai_usage_tracking(model, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_api_errors_endpoint_timestamp 
ON api_errors(endpoint, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status 
ON premium_subscriptions(status, current_period_end);

CREATE INDEX IF NOT EXISTS idx_news_cache_pub_date 
ON news_cache(pub_date DESC);

CREATE INDEX IF NOT EXISTS idx_football_matches_date 
ON football_matches(match_date DESC);

-- Function to find similar chats using embeddings
CREATE OR REPLACE FUNCTION find_similar_chats(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.8,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  content text,
  topic text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ui.id,
    ui.query as content,
    ui.category as topic,
    1 - (ui.embedding <=> query_embedding) AS similarity
  FROM user_interactions ui
  WHERE ui.embedding IS NOT NULL 
    AND 1 - (ui.embedding <=> query_embedding) > similarity_threshold
  ORDER BY ui.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RLS policies for production tables
ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat interactions" ON chat_interactions
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert own chat interactions" ON chat_interactions
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can view own subscriptions" ON premium_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Public access for news and football data
CREATE POLICY "Public access to news" ON news_cache
  FOR SELECT USING (true);

CREATE POLICY "Public access to football clubs" ON football_clubs
  FOR SELECT USING (active = true);

CREATE POLICY "Public access to football matches" ON football_matches
  FOR SELECT USING (true);

-- Analytics View
CREATE OR REPLACE VIEW chat_analytics AS
SELECT 
  category,
  COUNT(*) as query_count,
  AVG(response_time) as avg_response_time,
  COUNT(CASE WHEN feedback = 'positive' THEN 1 END) as positive_feedback,
  COUNT(CASE WHEN feedback = 'negative' THEN 1 END) as negative_feedback,
  DATE_TRUNC('day', timestamp) as date
FROM user_interactions
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY category, DATE_TRUNC('day', timestamp)
ORDER BY date DESC, query_count DESC;