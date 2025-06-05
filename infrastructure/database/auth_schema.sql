-- Authentication Schema for agentland.saarland
-- Compatible with Supabase Auth + Custom User Management

-- Enhanced Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    user_type TEXT DEFAULT 'citizen' CHECK (user_type IN ('citizen', 'business', 'admin', 'premium')),
    preferences JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- User Sessions for Analytics
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    location_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- User Activity Log
CREATE TABLE IF NOT EXISTS public.user_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON public.user_activities(timestamp);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_activities
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" ON public.user_activities
    FOR INSERT WITH CHECK (true);

-- Function to automatically create user profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.created_at,
        NEW.updated_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile timestamp
CREATE OR REPLACE FUNCTION public.handle_user_profile_updated()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on profile changes
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.user_profiles;
CREATE TRIGGER on_user_profile_updated
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_profile_updated();

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_data JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO public.user_activities (user_id, activity_type, activity_data, ip_address)
    VALUES (p_user_id, p_activity_type, p_activity_data, p_ip_address);
    
    -- Update last_seen in user_profiles
    UPDATE public.user_profiles 
    SET last_seen = NOW() 
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS void AS $$
BEGIN
    -- Mark sessions as inactive after 24 hours of inactivity
    UPDATE public.user_sessions
    SET is_active = false
    WHERE last_activity < NOW() - INTERVAL '24 hours'
    AND is_active = true;
    
    -- Delete sessions older than 30 days
    DELETE FROM public.user_sessions
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old activities (keep last 90 days)
    DELETE FROM public.user_activities
    WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE(
    total_users BIGINT,
    active_users_today BIGINT,
    new_users_today BIGINT,
    active_sessions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true),
        (SELECT COUNT(DISTINCT user_id) FROM public.user_activities 
         WHERE timestamp >= CURRENT_DATE),
        (SELECT COUNT(*) FROM public.user_profiles 
         WHERE created_at >= CURRENT_DATE),
        (SELECT COUNT(*) FROM public.user_sessions 
         WHERE is_active = true AND last_activity >= NOW() - INTERVAL '30 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.user_activities TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;

-- Create some sample data for testing (remove in production)
-- INSERT INTO public.user_profiles (id, email, name, user_type) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'test@agentland.saarland', 'Test User', 'citizen'),
-- ('00000000-0000-0000-0000-000000000002', 'admin@agentland.saarland', 'Admin User', 'admin');