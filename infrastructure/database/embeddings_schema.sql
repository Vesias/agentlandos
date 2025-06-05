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