-- =====================================================
-- AGENTLAND.SAARLAND DATABASE SCHEMA
-- Complete Registration, SAAR-ID & User Management System
-- GDPR Compliant | Performance Optimized | Revenue Ready
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- CUSTOM TYPES & ENUMS
-- =====================================================

-- User management types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'business_user', 'government_user', 'developer', 'researcher');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending_verification', 'suspended', 'deleted');
CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'maintenance');

-- SAAR-ID specific types
CREATE TYPE saar_id_status AS ENUM ('pending', 'verified', 'expired', 'revoked');
CREATE TYPE verification_level AS ENUM ('basic', 'verified', 'premium', 'government');
CREATE TYPE service_authorization_status AS ENUM ('granted', 'pending', 'denied', 'revoked');

-- Business registration types
CREATE TYPE business_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'suspended', 'closed');
CREATE TYPE business_type AS ENUM ('einzelunternehmen', 'gmbh', 'ug', 'kg', 'ohg', 'ag', 'verein', 'stiftung', 'other');
CREATE TYPE document_type AS ENUM ('handelsregister', 'gewerbeanmeldung', 'steuerliche_erfassung', 'versicherungsnachweis', 'identity_document', 'other');
CREATE TYPE document_status AS ENUM ('pending', 'uploaded', 'verified', 'rejected');

-- Payment and subscription types
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise', 'government');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');

-- =====================================================
-- CORE USER MANAGEMENT TABLES
-- =====================================================

-- Enhanced Users table (extending existing)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    
    -- Contact information
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Deutschland',
    
    -- Preferences
    language_preference VARCHAR(10) DEFAULT 'de',
    region VARCHAR(100) DEFAULT 'Saarland',
    timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
    
    -- GDPR & Privacy
    gdpr_consent BOOLEAN DEFAULT FALSE,
    gdpr_consent_date TIMESTAMP WITH TIME ZONE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    data_processing_consent BOOLEAN DEFAULT FALSE,
    privacy_settings JSONB DEFAULT '{}',
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- User sessions for security tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SAAR-ID DIGITAL IDENTITY SYSTEM
-- =====================================================

-- SAAR-ID profiles linked to users
CREATE TABLE saar_id_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    saar_id_number VARCHAR(50) UNIQUE NOT NULL, -- Format: SAAR-YYYY-XXXXXX
    
    -- Identity verification
    verification_level verification_level DEFAULT 'basic',
    status saar_id_status DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Digital identity data
    citizen_id VARCHAR(100), -- German Personalausweis number (hashed)
    birth_date DATE,
    birth_place VARCHAR(100),
    nationality VARCHAR(100) DEFAULT 'deutsch',
    
    -- Address information
    registered_address JSONB, -- Current registered address
    residence_address JSONB,  -- Actual residence if different
    
    -- Verification documents
    identity_document_hash VARCHAR(255), -- Hash of identity document
    verification_documents JSONB DEFAULT '[]',
    
    -- Digital signature capabilities
    digital_signature_key TEXT,
    signature_certificate TEXT,
    signature_valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Privacy and consent
    data_sharing_preferences JSONB DEFAULT '{}',
    service_authorizations JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service authorizations for SAAR-ID
CREATE TABLE saar_id_service_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    saar_id_profile_id UUID NOT NULL REFERENCES saar_id_profiles(id) ON DELETE CASCADE,
    service_provider VARCHAR(255) NOT NULL, -- Government agency or service
    service_name VARCHAR(255) NOT NULL,
    authorization_scope JSONB NOT NULL, -- What data/actions are authorized
    status service_authorization_status DEFAULT 'pending',
    authorized_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Linked external accounts
CREATE TABLE saar_id_linked_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    saar_id_profile_id UUID NOT NULL REFERENCES saar_id_profiles(id) ON DELETE CASCADE,
    external_provider VARCHAR(100) NOT NULL, -- e.g., 'elster', 'bundesagentur', 'krankenkasse'
    external_account_id VARCHAR(255) NOT NULL,
    account_type VARCHAR(100) NOT NULL,
    link_status VARCHAR(50) DEFAULT 'active',
    permissions JSONB DEFAULT '{}',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(saar_id_profile_id, external_provider, external_account_id)
);

-- =====================================================
-- BUSINESS REGISTRATION SYSTEM
-- =====================================================

-- Business entities
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Basic business information
    business_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    business_type business_type NOT NULL,
    status business_status DEFAULT 'draft',
    
    -- Registration details
    handelsregister_number VARCHAR(100),
    ustid_nummer VARCHAR(50), -- VAT ID
    steuernummer VARCHAR(50), -- Tax number
    gewerbe_number VARCHAR(100), -- Trade license number
    
    -- Contact information
    business_address JSONB NOT NULL,
    mailing_address JSONB,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Business details
    description TEXT,
    business_activities TEXT[],
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    founding_date DATE,
    
    -- PLZ and regional assignment
    postal_code VARCHAR(10) NOT NULL,
    municipality VARCHAR(100),
    administrative_district VARCHAR(100),
    assigned_authority VARCHAR(255), -- Which government office handles this business
    
    -- Compliance and licensing
    required_licenses TEXT[],
    obtained_licenses JSONB DEFAULT '{}',
    compliance_status JSONB DEFAULT '{}',
    
    -- Financial information
    bank_account_iban VARCHAR(50),
    bank_name VARCHAR(255),
    
    -- Metadata
    registration_notes TEXT,
    internal_notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Business registration workflows
CREATE TABLE business_registration_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Workflow tracking
    current_step VARCHAR(100) NOT NULL,
    total_steps INTEGER NOT NULL,
    completed_steps INTEGER DEFAULT 0,
    workflow_data JSONB DEFAULT '{}',
    
    -- Status tracking
    status business_status DEFAULT 'draft',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Review process
    assigned_reviewer_id UUID REFERENCES users(id),
    review_notes TEXT,
    review_deadline TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document storage references
CREATE TABLE business_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES business_registration_workflows(id),
    
    -- Document information
    document_type document_type NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500), -- Path to stored file
    file_size BIGINT,
    file_hash VARCHAR(255), -- For integrity verification
    mime_type VARCHAR(100),
    
    -- Status and verification
    status document_status DEFAULT 'pending',
    uploaded_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verification_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Business-User relationships (for multiple owners/employees)
CREATE TABLE business_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL, -- 'owner', 'admin', 'employee', 'accountant'
    permissions JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(business_id, user_id)
);

-- =====================================================
-- GOVERNMENT INTEGRATION SCHEMA
-- =====================================================

-- External API connections
CREATE TABLE external_api_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(255) NOT NULL,
    api_endpoint VARCHAR(500) NOT NULL,
    api_key_hash VARCHAR(255), -- Hashed API key for security
    connection_status VARCHAR(50) DEFAULT 'active',
    rate_limit INTEGER,
    last_used TIMESTAMP WITH TIME ZONE,
    error_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Government service mappings
CREATE TABLE government_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_code VARCHAR(100) UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    responsible_authority VARCHAR(255),
    service_url VARCHAR(500),
    online_available BOOLEAN DEFAULT FALSE,
    required_documents TEXT[],
    processing_time_days INTEGER,
    cost_eur DECIMAL(10,2),
    postal_codes TEXT[], -- Which PLZ areas this service covers
    metadata JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Authority assignments by postal codes
CREATE TABLE authority_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postal_code VARCHAR(10) NOT NULL,
    authority_name VARCHAR(255) NOT NULL,
    authority_type VARCHAR(100) NOT NULL, -- 'kommune', 'landkreis', 'land', 'bund'
    contact_info JSONB,
    services TEXT[], -- Array of service codes this authority handles
    jurisdiction_area JSONB, -- Geographic boundaries
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_authority_postal_code (postal_code)
);

-- Funding programs and eligibility
CREATE TABLE funding_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_code VARCHAR(100) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(255) NOT NULL, -- EU, Bund, Land, etc.
    eligibility_criteria JSONB NOT NULL,
    funding_amount_min DECIMAL(15,2),
    funding_amount_max DECIMAL(15,2),
    application_deadline DATE,
    program_duration_months INTEGER,
    target_groups TEXT[],
    business_types business_type[],
    postal_codes TEXT[], -- Geographic restrictions
    active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBSCRIPTION & REVENUE MANAGEMENT
-- =====================================================

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name VARCHAR(100) UNIQUE NOT NULL,
    tier subscription_tier NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL,
    limits JSONB NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    payment_method JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES user_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_reference VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AUDIT TRAIL & COMPLIANCE
-- =====================================================

-- Comprehensive audit log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(100) NOT NULL, -- 'user', 'business', 'saar_id', etc.
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'view', etc.
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_created (created_at)
);

-- GDPR data processing records
CREATE TABLE gdpr_processing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    processing_purpose VARCHAR(255) NOT NULL,
    legal_basis VARCHAR(255) NOT NULL,
    data_categories TEXT[],
    retention_period INTERVAL,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_withdrawn BOOLEAN DEFAULT FALSE,
    consent_withdrawn_date TIMESTAMP WITH TIME ZONE,
    data_deleted BOOLEAN DEFAULT FALSE,
    data_deleted_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ENHANCED EXISTING TABLES
-- =====================================================

-- Extend existing tables with additional columns if needed
-- (These would be ALTER TABLE statements in migrations)

-- Conversations table (already exists)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255),
    language VARCHAR(10) DEFAULT 'de',
    conversation_type VARCHAR(50) DEFAULT 'general', -- 'business_support', 'saar_id', 'registration'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table enhancement (already exists)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'form', 'document', 'system'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_postal_code ON users(postal_code);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- SAAR-ID indexes
CREATE INDEX idx_saar_id_profiles_user_id ON saar_id_profiles(user_id);
CREATE INDEX idx_saar_id_profiles_status ON saar_id_profiles(status);
CREATE INDEX idx_saar_id_profiles_verification_level ON saar_id_profiles(verification_level);
CREATE INDEX idx_saar_id_number ON saar_id_profiles(saar_id_number);

-- Business indexes
CREATE INDEX idx_businesses_owner_user_id ON businesses(owner_user_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_postal_code ON businesses(postal_code);
CREATE INDEX idx_businesses_business_type ON businesses(business_type);
CREATE INDEX idx_businesses_created_at ON businesses(created_at);
CREATE INDEX idx_businesses_deleted_at ON businesses(deleted_at);

-- Document indexes
CREATE INDEX idx_business_documents_business_id ON business_documents(business_id);
CREATE INDEX idx_business_documents_status ON business_documents(status);
CREATE INDEX idx_business_documents_type ON business_documents(document_type);

-- Audit and security indexes
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Full-text search indexes
CREATE INDEX idx_businesses_name_gin ON businesses USING gin(to_tsvector('german', business_name));
CREATE INDEX idx_government_services_name_gin ON government_services USING gin(to_tsvector('german', service_name || ' ' || description));

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Function to update timestamp columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saar_id_profiles_updated_at BEFORE UPDATE ON saar_id_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_registration_workflows_updated_at BEFORE UPDATE ON business_registration_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs(entity_type, entity_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs(entity_type, entity_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs(entity_type, entity_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_saar_id_profiles AFTER INSERT OR UPDATE OR DELETE ON saar_id_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_businesses AFTER INSERT OR UPDATE OR DELETE ON businesses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_name, tier, price_monthly, price_yearly, features, limits) VALUES
('Free Plan', 'free', 0.00, 0.00, 
 '{"basic_services": true, "chat_support": true, "document_templates": false}',
 '{"api_calls_per_month": 100, "document_uploads": 5, "businesses": 1}'),
('Basic Plan', 'basic', 9.99, 99.99,
 '{"basic_services": true, "chat_support": true, "document_templates": true, "priority_support": false}',
 '{"api_calls_per_month": 1000, "document_uploads": 50, "businesses": 3}'),
('Premium Plan', 'premium', 29.99, 299.99,
 '{"basic_services": true, "chat_support": true, "document_templates": true, "priority_support": true, "api_access": true}',
 '{"api_calls_per_month": 10000, "document_uploads": 500, "businesses": 10}'),
('Enterprise Plan', 'enterprise', 99.99, 999.99,
 '{"basic_services": true, "chat_support": true, "document_templates": true, "priority_support": true, "api_access": true, "custom_integrations": true}',
 '{"api_calls_per_month": 100000, "document_uploads": 10000, "businesses": 100}');

-- Insert some government services
INSERT INTO government_services (service_code, service_name, description, responsible_authority, online_available, processing_time_days, cost_eur, postal_codes) VALUES
('GEW001', 'Gewerbeanmeldung', 'Anmeldung eines Gewerbebetriebs', 'Gewerbeamt Saarbrücken', true, 7, 15.00, ARRAY['66001','66002','66003','66111','66112','66113','66115','66116','66117','66118','66119','66121','66123','66124','66125','66126','66127','66128','66129','66130','66131','66132','66133','66134','66135','66136','66137','66138','66139','66440','66441','66482','66483','66484','66485','66486','66487','66488','66489','66490','66491','66492','66493','66494','66495','66496','66497','66498','66499']),
('HR001', 'Handelsregistereintragung', 'Eintragung ins Handelsregister', 'Amtsgericht Saarbrücken', false, 14, 75.00, ARRAY['66001','66002','66003']),
('STEN001', 'Steuerliche Erfassung', 'Anmeldung beim Finanzamt', 'Finanzamt Saarbrücken', true, 21, 0.00, ARRAY['66001','66002','66003']);

-- =====================================================
-- SECURITY & PERFORMANCE SETTINGS
-- =====================================================

-- Row Level Security (RLS) examples
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saar_id_profiles ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (would be implemented based on specific security requirements)
CREATE POLICY users_self_access ON users
    FOR ALL TO authenticated_users
    USING (id = current_user_id() OR has_role('admin'));

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Business overview with owner information
CREATE VIEW business_overview AS
SELECT 
    b.id,
    b.business_name,
    b.business_type,
    b.status,
    b.postal_code,
    b.municipality,
    u.full_name as owner_name,
    u.email as owner_email,
    b.created_at,
    b.updated_at
FROM businesses b
JOIN users u ON b.owner_user_id = u.id
WHERE b.deleted_at IS NULL;

-- User activity summary
CREATE VIEW user_activity_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.status,
    u.last_login,
    COUNT(DISTINCT c.id) as conversation_count,
    COUNT(DISTINCT b.id) as business_count,
    s.plan_name as subscription_plan
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
LEFT JOIN businesses b ON u.id = b.owner_user_id AND b.deleted_at IS NULL
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN subscription_plans s ON us.plan_id = s.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.username, u.email, u.status, u.last_login, s.plan_name;

-- =====================================================
-- SCHEMA VERSION & METADATA
-- =====================================================

CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');

-- Schema metadata for tracking
COMMENT ON DATABASE current_database() IS 'AgentLand Saarland - Registration & SAAR-ID System - v1.0.0';