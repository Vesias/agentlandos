-- =====================================================
-- REGISTRATION STATUS & AGE VERIFICATION ENHANCEMENT
-- Adds age tracking and registration status management
-- =====================================================

-- Add age and registration status columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS age_verification_date TIMESTAMP WITH TIME ZONE;

-- Add registration status columns to saar_id_profiles
ALTER TABLE saar_id_profiles 
ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS age_at_registration INTEGER,
ADD COLUMN IF NOT EXISTS age_verification_passed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS status_message TEXT,
ADD COLUMN IF NOT EXISTS next_steps JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS estimated_processing_time VARCHAR(100);

-- Add registration status columns to businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS founder_age INTEGER,
ADD COLUMN IF NOT EXISTS founder_date_of_birth DATE,
ADD COLUMN IF NOT EXISTS founder_age_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS status_message TEXT,
ADD COLUMN IF NOT EXISTS next_steps JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS estimated_processing_time VARCHAR(100);

-- Create registration status tracking table
CREATE TABLE IF NOT EXISTS registration_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL,
    registration_type VARCHAR(50) NOT NULL, -- 'saar_id' or 'business'
    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    status_message TEXT,
    changed_by UUID REFERENCES users(id),
    age_verification_result BOOLEAN,
    next_steps JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_registration_status_history_registration (registration_id, registration_type),
    INDEX idx_registration_status_history_status (status),
    INDEX idx_registration_status_history_created (created_at)
);

-- Create age verification logs table
CREATE TABLE IF NOT EXISTS age_verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_id UUID,
    registration_type VARCHAR(50), -- 'saar_id' or 'business'
    provided_age INTEGER,
    calculated_age INTEGER,
    date_of_birth DATE,
    verification_passed BOOLEAN NOT NULL,
    minimum_age_required INTEGER NOT NULL,
    verification_method VARCHAR(100) DEFAULT 'date_of_birth_calculation',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_age_verification_user_id (user_id),
    INDEX idx_age_verification_registration (registration_id, registration_type),
    INDEX idx_age_verification_passed (verification_passed),
    INDEX idx_age_verification_created (created_at)
);

-- Create function to automatically update registration status timestamps
CREATE OR REPLACE FUNCTION update_registration_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_status IS DISTINCT FROM OLD.registration_status THEN
        NEW.status_updated_at = CURRENT_TIMESTAMP;
        
        -- Log status change
        INSERT INTO registration_status_history (
            registration_id,
            registration_type,
            status,
            previous_status,
            status_message,
            age_verification_result,
            next_steps
        ) VALUES (
            NEW.id,
            TG_TABLE_NAME::VARCHAR,
            NEW.registration_status,
            OLD.registration_status,
            NEW.status_message,
            CASE 
                WHEN TG_TABLE_NAME = 'saar_id_profiles' THEN NEW.age_verification_passed
                WHEN TG_TABLE_NAME = 'businesses' THEN NEW.founder_age_verified
                ELSE NULL
            END,
            NEW.next_steps
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to track status changes
CREATE TRIGGER update_saar_id_status_timestamp 
    BEFORE UPDATE ON saar_id_profiles
    FOR EACH ROW EXECUTE FUNCTION update_registration_status_timestamp();

CREATE TRIGGER update_business_status_timestamp 
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_registration_status_timestamp();

-- Create function for age verification
CREATE OR REPLACE FUNCTION verify_age(
    p_user_id UUID,
    p_date_of_birth DATE,
    p_registration_type VARCHAR(50),
    p_registration_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    calculated_age INTEGER;
    min_age INTEGER;
    verification_passed BOOLEAN;
BEGIN
    -- Calculate age
    calculated_age := EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_date_of_birth));
    
    -- Determine minimum age based on registration type
    min_age := CASE 
        WHEN p_registration_type = 'saar_id' THEN 14
        WHEN p_registration_type = 'business' THEN 18
        ELSE 18
    END;
    
    -- Check if age meets requirement
    verification_passed := calculated_age >= min_age;
    
    -- Log verification attempt
    INSERT INTO age_verification_logs (
        user_id,
        registration_id,
        registration_type,
        calculated_age,
        date_of_birth,
        verification_passed,
        minimum_age_required
    ) VALUES (
        p_user_id,
        p_registration_id,
        p_registration_type,
        calculated_age,
        p_date_of_birth,
        verification_passed,
        min_age
    );
    
    -- Update user age information
    UPDATE users 
    SET 
        age = calculated_age,
        date_of_birth = p_date_of_birth,
        age_verified = verification_passed,
        age_verification_date = CURRENT_TIMESTAMP
    WHERE id = p_user_id;
    
    RETURN verification_passed;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_users_age_verified ON users(age_verified);

CREATE INDEX IF NOT EXISTS idx_saar_id_registration_status ON saar_id_profiles(registration_status);
CREATE INDEX IF NOT EXISTS idx_saar_id_age_verification ON saar_id_profiles(age_verification_passed);
CREATE INDEX IF NOT EXISTS idx_saar_id_status_updated ON saar_id_profiles(status_updated_at);

CREATE INDEX IF NOT EXISTS idx_businesses_registration_status ON businesses(registration_status);
CREATE INDEX IF NOT EXISTS idx_businesses_founder_age_verified ON businesses(founder_age_verified);
CREATE INDEX IF NOT EXISTS idx_businesses_status_updated ON businesses(status_updated_at);

-- Create view for registration overview with age verification
CREATE VIEW registration_overview AS
SELECT 
    'saar_id' as registration_type,
    sp.id as registration_id,
    sp.saar_id_number as identifier,
    u.full_name as applicant_name,
    u.email as applicant_email,
    u.age as applicant_age,
    u.date_of_birth as applicant_dob,
    sp.registration_status,
    sp.age_verification_passed,
    sp.status_updated_at,
    sp.status_message,
    sp.next_steps,
    sp.estimated_processing_time,
    sp.created_at as submitted_at
FROM saar_id_profiles sp
JOIN users u ON sp.user_id = u.id
WHERE sp.deleted_at IS NULL

UNION ALL

SELECT 
    'business' as registration_type,
    b.id as registration_id,
    b.business_name as identifier,
    u.full_name as applicant_name,
    u.email as applicant_email,
    b.founder_age as applicant_age,
    b.founder_date_of_birth as applicant_dob,
    b.registration_status,
    b.founder_age_verified,
    b.status_updated_at,
    b.status_message,
    b.next_steps,
    b.estimated_processing_time,
    b.created_at as submitted_at
FROM businesses b
JOIN users u ON b.owner_user_id = u.id
WHERE b.deleted_at IS NULL;

-- Insert initial registration statuses
UPDATE saar_id_profiles 
SET registration_status = CASE 
    WHEN status = 'pending' THEN 'pending'
    WHEN status = 'verified' THEN 'active'
    ELSE 'pending'
END
WHERE registration_status IS NULL;

UPDATE businesses 
SET registration_status = CASE 
    WHEN status = 'approved' THEN 'active'
    WHEN status = 'under_review' THEN 'in_review'
    WHEN status = 'rejected' THEN 'rejected'
    ELSE 'pending'
END
WHERE registration_status IS NULL;

-- Create GDPR-compliant data retention policies
-- Function to anonymize expired registrations
CREATE OR REPLACE FUNCTION anonymize_expired_registrations()
RETURNS INTEGER AS $$
DECLARE
    anonymized_count INTEGER := 0;
BEGIN
    -- Anonymize SAAR-ID registrations older than 10 years and inactive
    UPDATE saar_id_profiles 
    SET 
        saar_id_number = 'ANONYMIZED-' || LEFT(MD5(random()::text), 8),
        birth_date = NULL,
        birth_place = 'ANONYMIZED',
        registered_address = '{"anonymized": true}',
        residence_address = '{"anonymized": true}'
    WHERE 
        created_at < CURRENT_TIMESTAMP - INTERVAL '10 years'
        AND status != 'verified'
        AND saar_id_number NOT LIKE 'ANONYMIZED-%';
    
    GET DIAGNOSTICS anonymized_count = ROW_COUNT;
    
    -- Log anonymization
    INSERT INTO audit_logs (entity_type, action, new_values) 
    VALUES ('data_retention', 'anonymization', jsonb_build_object('anonymized_count', anonymized_count));
    
    RETURN anonymized_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule data retention (would be called by external cron job)
COMMENT ON FUNCTION anonymize_expired_registrations() IS 'GDPR compliance: Anonymizes expired registrations. Should be called monthly.';

-- Insert schema migration record
INSERT INTO schema_migrations (version) VALUES ('002_registration_status_age_verification');