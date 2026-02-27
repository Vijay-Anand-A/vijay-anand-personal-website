-- ============================================================
-- Chat Messages Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    sender_username VARCHAR(100) NOT NULL,
    receiver_username VARCHAR(100) NOT NULL DEFAULT 'admin',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS for frontend access
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Index for fast loading
CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages (sender_username);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages (created_at);
