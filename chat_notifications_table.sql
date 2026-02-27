-- ============================================================
-- Chat Notifications Table
-- Single-row-per-user conversation notification status
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_notifications (
    id SERIAL PRIMARY KEY,
    chat_username VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(10) NOT NULL DEFAULT 'no', -- 'new' or 'no'
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS for frontend access (adjust if you use RLS policies)
ALTER TABLE chat_notifications DISABLE ROW LEVEL SECURITY;

-- Index/constraint
CREATE UNIQUE INDEX IF NOT EXISTS uk_chat_notifications_username ON chat_notifications (chat_username);

-- Auto-update trigger for updated_at (uses update_updated_at_column defined elsewhere in schema)
DROP TRIGGER IF EXISTS set_chat_notifications_updated_at ON chat_notifications;
CREATE TRIGGER set_chat_notifications_updated_at
    BEFORE UPDATE ON chat_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
