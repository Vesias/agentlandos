-- Security and Authentication Schema for AGENTLAND.SAARLAND
-- This file contains all security-related database structures

-- Security events logging table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    client_ip INET,
    user_id UUID REFERENCES auth.users(id),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity) WHERE severity IN ('high', 'critical');
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(resolved, timestamp) WHERE resolved = false;

-- Enhanced user profiles with security features
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    municipality VARCHAR(100),
    registration_ip INET,
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    last_ip INET,
    device_fingerprint TEXT,
    gdpr_consent BOOLEAN DEFAULT false,
    gdpr_consent_date TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned', 'pending')),
    security_questions JSONB DEFAULT '[]',
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login TIMESTAMPTZ,
    account_locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Password history for preventing reuse
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempt_type VARCHAR(50) DEFAULT 'password',
    metadata JSONB DEFAULT '{}',
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API rate limiting tracking
CREATE TABLE IF NOT EXISTS rate_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    violation_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    blocked_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR compliance and data processing logs
CREATE TABLE IF NOT EXISTS gdpr_data_processing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    processing_type VARCHAR(50) NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    data_categories TEXT[] NOT NULL,
    purpose TEXT NOT NULL,
    retention_period INTERVAL,
    consent_given BOOLEAN DEFAULT false,
    consent_withdrawn_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by UUID REFERENCES auth.users(id)
);

-- Data export requests (GDPR Article 20)
CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) DEFAULT 'export' CHECK (request_type IN ('export', 'deletion')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    requested_data TEXT[] DEFAULT '{}',
    export_file_path TEXT,
    download_expires_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- Security audit trail
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    api_endpoint VARCHAR(255),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suspicious activity detection
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    activity_type VARCHAR(50) NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    indicators TEXT[] DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    investigated BOOLEAN DEFAULT false,
    investigation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security configuration settings
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default security settings
INSERT INTO security_settings (setting_key, setting_value, description) VALUES 
('max_login_attempts', '5', 'Maximum failed login attempts before account lockout'),
('lockout_duration_minutes', '15', 'Account lockout duration in minutes'),
('session_timeout_hours', '24', 'Session timeout in hours'),
('password_min_length', '12', 'Minimum password length'),
('password_require_special', 'true', 'Require special characters in password'),
('two_factor_enforcement', 'false', 'Enforce 2FA for all users'),
('suspicious_activity_threshold', '75', 'Risk score threshold for flagging suspicious activity')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS (Row Level Security) Policies

-- Enable RLS on all security tables
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_data_processing ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own GDPR data" ON gdpr_data_processing
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own export requests" ON data_export_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests" ON data_export_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own audit trail" ON audit_trail
    FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (requires admin role)
CREATE POLICY "Admins can view all security events" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (user_metadata->>'role' = 'admin' OR user_metadata->>'role' = 'security_admin')
        )
    );

CREATE POLICY "Admins can view all suspicious activities" ON suspicious_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (user_metadata->>'role' = 'admin' OR user_metadata->>'role' = 'security_admin')
        )
    );

-- Functions for security operations

-- Function to check if user account is locked
CREATE OR REPLACE FUNCTION is_account_locked(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    profile_record user_profiles%ROWTYPE;
BEGIN
    SELECT * INTO profile_record 
    FROM user_profiles 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    RETURN (profile_record.account_locked_until IS NOT NULL 
            AND profile_record.account_locked_until > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record failed login attempt
CREATE OR REPLACE FUNCTION record_failed_login(
    p_email TEXT,
    p_ip_address INET,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    max_attempts INTEGER;
    lockout_duration INTEGER;
    current_attempts INTEGER;
BEGIN
    -- Get security settings
    SELECT (setting_value->>'max_login_attempts')::INTEGER INTO max_attempts
    FROM security_settings WHERE setting_key = 'max_login_attempts';
    
    SELECT (setting_value->>'lockout_duration_minutes')::INTEGER INTO lockout_duration
    FROM security_settings WHERE setting_key = 'lockout_duration_minutes';
    
    -- Record the failed attempt
    INSERT INTO failed_login_attempts (email, ip_address, user_agent)
    VALUES (p_email, p_ip_address, p_user_agent);
    
    -- Update user profile
    UPDATE user_profiles 
    SET 
        failed_login_attempts = failed_login_attempts + 1,
        last_failed_login = NOW()
    WHERE email = p_email;
    
    -- Check if account should be locked
    SELECT failed_login_attempts INTO current_attempts
    FROM user_profiles WHERE email = p_email;
    
    IF current_attempts >= max_attempts THEN
        UPDATE user_profiles 
        SET account_locked_until = NOW() + (lockout_duration || ' minutes')::INTERVAL
        WHERE email = p_email;
        
        -- Log security event
        INSERT INTO security_events (event_type, metadata, severity)
        VALUES (
            'account_locked',
            jsonb_build_object(
                'email', p_email,
                'ip_address', p_ip_address,
                'failed_attempts', current_attempts
            ),
            'high'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        failed_login_attempts = 0,
        last_failed_login = NULL,
        account_locked_until = NULL,
        last_login = NOW(),
        login_count = login_count + 1
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old security data
CREATE OR REPLACE FUNCTION cleanup_old_security_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old security events (keep 1 year)
    DELETE FROM security_events 
    WHERE timestamp < NOW() - INTERVAL '1 year'
    AND severity NOT IN ('high', 'critical');
    
    -- Delete old failed login attempts (keep 30 days)
    DELETE FROM failed_login_attempts 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old audit trail entries (keep 2 years)
    DELETE FROM audit_trail 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Delete expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 days';
    
    -- Delete old password history (keep last 12 passwords)
    DELETE FROM password_history 
    WHERE id NOT IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM password_history
        ) ranked
        WHERE rn <= 12
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_action ON audit_trail(user_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user ON suspicious_activities(user_id, created_at);

-- Create trigger to update user_profiles.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-security-data', '0 2 * * 0', 'SELECT cleanup_old_security_data();');