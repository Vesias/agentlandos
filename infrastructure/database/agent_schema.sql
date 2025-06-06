-- Agent Conversations Schema
-- For AGENTLAND.SAARLAND Claude agent chat functionality

-- Agent conversations table
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id ON agent_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_updated_at ON agent_conversations(updated_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_agent_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_conversations_updated_at
  BEFORE UPDATE ON agent_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_conversations_updated_at();

-- RLS Policies
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can access own conversations" ON agent_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Agent usage analytics table
CREATE TABLE IF NOT EXISTS agent_usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_agent_usage_user_id ON agent_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_date ON agent_usage_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_agent_usage_session_id ON agent_usage_analytics(session_id);

-- RLS for analytics
ALTER TABLE agent_usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own usage analytics" ON agent_usage_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Agent feedback table
CREATE TABLE IF NOT EXISTS agent_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  message_index INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  improvement_suggestion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_agent_feedback_user_id ON agent_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_session_id ON agent_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_rating ON agent_feedback(rating);

-- RLS for feedback
ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own feedback" ON agent_feedback
  FOR ALL USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE agent_conversations IS 'Stores Claude agent conversation history with JSONB messages';
COMMENT ON TABLE agent_usage_analytics IS 'Tracks agent usage for billing and analytics';
COMMENT ON TABLE agent_feedback IS 'User feedback on agent responses for improvement';

COMMENT ON COLUMN agent_conversations.messages IS 'JSONB array of message objects with role and content';
COMMENT ON COLUMN agent_conversations.metadata IS 'Additional session metadata like model used, settings, etc.';
COMMENT ON COLUMN agent_usage_analytics.cost_cents IS 'Cost in cents for API usage tracking';
COMMENT ON COLUMN agent_feedback.message_index IS 'Index of the message being rated in the conversation';