-- Missing tables for AgentLand Saarland
-- These tables are required by the application but missing from the main schema

-- API Health Checks table (used by health endpoint)
CREATE TABLE IF NOT EXISTS api_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(50) NOT NULL, -- 'healthy', 'degraded', 'unhealthy'
    services JSONB NOT NULL DEFAULT '{}',
    response_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Analytics table (for real analytics tracking)
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    page_url TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Interactions table (for conversation analytics)
CREATE TABLE IF NOT EXISTS chat_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL, -- 'message_sent', 'ai_response', 'feedback', 'rating'
    interaction_data JSONB DEFAULT '{}',
    response_time_ms INTEGER,
    ai_model VARCHAR(100),
    tokens_used INTEGER,
    cost_eur DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agents table (for AI agent management)
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'navigator', 'tourism', 'business', 'admin'
    description TEXT,
    configuration JSONB DEFAULT '{}',
    capabilities TEXT[],
    status agent_status DEFAULT 'active',
    model_provider VARCHAR(100), -- 'deepseek', 'openai', 'anthropic'
    model_name VARCHAR(100),
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Session Tracking table (for real user sessions)
CREATE TABLE IF NOT EXISTS session_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    pages_visited INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    is_mobile BOOLEAN DEFAULT FALSE,
    location_data JSONB DEFAULT '{}',
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    referrer TEXT
);

-- Real User Metrics table (for dashboard analytics)
CREATE TABLE IF NOT EXISTS real_user_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL, -- 'page_view', 'session_start', 'conversion', 'revenue'
    metric_value DECIMAL(15,4) NOT NULL,
    dimensions JSONB DEFAULT '{}', -- Additional context data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_key DATE DEFAULT CURRENT_DATE,
    hour_key INTEGER DEFAULT EXTRACT(HOUR FROM CURRENT_TIMESTAMP),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255)
);

-- Revenue Tracking table (for real business metrics)
CREATE TABLE IF NOT EXISTS revenue_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subscription_id UUID REFERENCES user_subscriptions(id),
    transaction_id UUID REFERENCES payment_transactions(id),
    revenue_type VARCHAR(100) NOT NULL, -- 'subscription', 'one_time', 'upgrade', 'addon'
    amount_eur DECIMAL(15,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    stripe_payment_intent_id VARCHAR(255),
    mrr_impact DECIMAL(15,4), -- Monthly Recurring Revenue impact
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    month_year VARCHAR(7) DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
    metadata JSONB DEFAULT '{}'
);

-- Performance Metrics table (for application monitoring)
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    error_message TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_key DATE DEFAULT CURRENT_DATE,
    hour_key INTEGER DEFAULT EXTRACT(HOUR FROM CURRENT_TIMESTAMP)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_health_checks_timestamp ON api_health_checks(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event ON user_analytics(event);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_id ON chat_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_created_at ON chat_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_session_tracking_session_id ON session_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_user_id ON session_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_started_at ON session_tracking(started_at);
CREATE INDEX IF NOT EXISTS idx_real_user_metrics_type ON real_user_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_real_user_metrics_timestamp ON real_user_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_real_user_metrics_date_key ON real_user_metrics(date_key);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_id ON revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_month_year ON revenue_tracking(month_year);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- Insert default agents
INSERT INTO agents (name, type, description, configuration, capabilities, model_provider, model_name) VALUES
('SAAR Navigator Agent', 'navigator', 'Primary navigation and general assistance agent for Saarland services', 
 '{"language": "de", "region": "saarland", "response_style": "helpful"}',
 ARRAY['navigation', 'general_information', 'service_routing', 'language_support'],
 'deepseek', 'deepseek-reasoner'),
('Tourism Expert Agent', 'tourism', 'Specialized agent for tourism information and recommendations in Saarland',
 '{"specialization": "tourism", "data_sources": ["real_events", "attractions", "accommodations"]}',
 ARRAY['tourism_info', 'event_recommendations', 'attraction_details', 'accommodation_booking'],
 'deepseek', 'deepseek-reasoner'),
('Business Support Agent', 'business', 'Expert agent for business registration, funding, and administrative support',
 '{"specialization": "business", "services": ["registration", "funding", "compliance"]}',
 ARRAY['business_registration', 'funding_assistance', 'regulatory_compliance', 'tax_guidance'],
 'deepseek', 'deepseek-reasoner'),
('Admin Agent', 'admin', 'Administrative agent for system management and user support',
 '{"role": "admin", "permissions": ["user_management", "system_monitoring"]}',
 ARRAY['user_management', 'system_health', 'analytics_reporting', 'content_moderation'],
 'deepseek', 'deepseek-reasoner')
ON CONFLICT DO NOTHING;

-- Create views for real-time analytics
CREATE OR REPLACE VIEW real_time_user_stats AS
SELECT 
    COUNT(DISTINCT st.session_id) as active_sessions,
    COUNT(DISTINCT st.user_id) as active_users,
    COUNT(DISTINCT CASE WHEN st.started_at >= CURRENT_DATE THEN st.user_id END) as users_today,
    COALESCE(AVG(st.duration_seconds), 0) as avg_session_duration,
    COUNT(DISTINCT CASE WHEN st.is_mobile THEN st.session_id END) as mobile_sessions
FROM session_tracking st
WHERE st.last_activity >= CURRENT_TIMESTAMP - INTERVAL '30 minutes'
   OR (st.ended_at IS NULL AND st.started_at >= CURRENT_TIMESTAMP - INTERVAL '2 hours');

CREATE OR REPLACE VIEW daily_revenue_stats AS
SELECT 
    DATE(recorded_at) as date,
    SUM(amount_eur) as daily_revenue,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT user_id) as unique_customers,
    SUM(CASE WHEN revenue_type = 'subscription' THEN amount_eur ELSE 0 END) as subscription_revenue,
    SUM(CASE WHEN revenue_type = 'one_time' THEN amount_eur ELSE 0 END) as one_time_revenue
FROM revenue_tracking
WHERE recorded_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(recorded_at)
ORDER BY date DESC;

-- Performance monitoring view
CREATE OR REPLACE VIEW api_performance_summary AS
SELECT 
    endpoint,
    COUNT(*) as request_count,
    AVG(response_time_ms) as avg_response_time,
    MAX(response_time_ms) as max_response_time,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
    (COUNT(CASE WHEN status_code >= 400 THEN 1 END) * 100.0 / COUNT(*)) as error_rate
FROM performance_metrics
WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY endpoint
ORDER BY request_count DESC;

COMMENT ON TABLE api_health_checks IS 'System health check logs for monitoring';
COMMENT ON TABLE user_analytics IS 'Real user behavior analytics - NO FAKE DATA';
COMMENT ON TABLE chat_interactions IS 'AI chat interactions and performance metrics';
COMMENT ON TABLE agents IS 'AI agent definitions and configurations';
COMMENT ON TABLE session_tracking IS 'Real user session tracking - NO FAKE DATA';
COMMENT ON TABLE real_user_metrics IS 'Aggregated real user metrics for dashboards';
COMMENT ON TABLE revenue_tracking IS 'Real revenue tracking - NO FAKE DATA';
COMMENT ON TABLE performance_metrics IS 'Application performance monitoring';