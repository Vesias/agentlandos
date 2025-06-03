-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create custom types
CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE user_role AS ENUM ('admin', 'user', 'developer', 'researcher');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    language_preference VARCHAR(10) DEFAULT 'de',
    region VARCHAR(100) DEFAULT 'Saarland',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capabilities TEXT[],
    status agent_status DEFAULT 'active',
    version VARCHAR(50) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    language VARCHAR(10) DEFAULT 'de',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base table with vector embeddings
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    source VARCHAR(255),
    region VARCHAR(100) DEFAULT 'Saarland',
    language VARCHAR(10) DEFAULT 'de',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Regional data table
CREATE TABLE IF NOT EXISTS regional_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    attributes JSONB DEFAULT '{}',
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_agents_agent_id ON agents(agent_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_regional_data_type ON regional_data(data_type);
CREATE INDEX idx_regional_data_embedding ON regional_data USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Insert default agents
INSERT INTO agents (agent_id, name, description, capabilities) VALUES
    ('navigator', 'NavigatorAgent', 'Zentraler KI-Assistent für das Saarland', ARRAY['routing', 'context_analysis', 'multilingual']),
    ('tourism', 'TourismusAgent', 'Spezialist für Tourismus im Saarland', ARRAY['attractions', 'events', 'recommendations']),
    ('administration', 'VerwaltungsAgent', 'Unterstützung bei Behördengängen', ARRAY['forms', 'processes', 'information']),
    ('business', 'WirtschaftsAgent', 'Business Intelligence für Unternehmen', ARRAY['analytics', 'market_info', 'networking']),
    ('education', 'BildungsAgent', 'Personalisiertes Lernen und Bildung', ARRAY['courses', 'resources', 'guidance']);

-- Insert sample regional data
INSERT INTO regional_data (data_type, name, description, location_lat, location_lng, attributes) VALUES
    ('landmark', 'Saarschleife', 'Das Wahrzeichen des Saarlandes', 49.5481, 6.5853, '{"type": "natural", "popularity": "high"}'),
    ('institution', 'DFKI Saarbrücken', 'Deutsches Forschungszentrum für Künstliche Intelligenz', 49.2576, 7.0422, '{"type": "research", "focus": "AI"}'),
    ('museum', 'Völklinger Hütte', 'UNESCO Weltkulturerbe', 49.2506, 6.8436, '{"type": "industrial_heritage", "unesco": true}');

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regional_data_updated_at BEFORE UPDATE ON regional_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();