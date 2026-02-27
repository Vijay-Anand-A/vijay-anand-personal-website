-- ============================================================
-- Chat Users Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_users (
    id SERIAL PRIMARY KEY,
    chat_username VARCHAR(100) NOT NULL UNIQUE,
    chat_password VARCHAR(255) NOT NULL,
    approval VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS for frontend access
ALTER TABLE chat_users DISABLE ROW LEVEL SECURITY;

-- Auto-update trigger
DROP TRIGGER IF EXISTS set_chat_users_updated_at ON chat_users;
CREATE TRIGGER set_chat_users_updated_at
    BEFORE UPDATE ON chat_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
