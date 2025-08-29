-- KiotViet Dashboard Database Schema
-- This script creates the necessary tables for the KiotViet Dashboard application

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User credentials table for storing KiotViet API credentials
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- User preferences table for storing theme, language, etc.
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'vi')),
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Cache table for storing KiotViet API responses (optional)
CREATE TABLE IF NOT EXISTS api_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    cache_key VARCHAR(500) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    

);

-- Activity logs for tracking user actions
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_cache_user_endpoint ON api_cache (user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_user_credentials
    BEFORE UPDATE ON user_credentials
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_user_preferences
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for user_credentials
CREATE POLICY "Users can view their own credentials" ON user_credentials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials" ON user_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials" ON user_credentials
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials" ON user_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for api_cache
CREATE POLICY "Users can view their own cache" ON api_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cache" ON api_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cache" ON api_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cache" ON api_cache
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for activity_logs
CREATE POLICY "Users can view their own logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired cache (if pg_cron is available)
-- SELECT cron.schedule('cleanup-cache', '0 0 * * *', 'SELECT cleanup_expired_cache();');

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, theme, language)
SELECT id, 'system', 'en' 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;
