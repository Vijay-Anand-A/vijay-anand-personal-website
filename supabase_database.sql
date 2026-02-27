-- ============================================================
-- Portfolio Website Database Schema
-- For Supabase (PostgreSQL)
-- Converted from Firebase Firestore
-- ============================================================

-- ============================================================
-- Table: admins
-- Firebase Collection: admins (Document: mainAdmin)
-- Stores admin login credentials for dashboard access
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    doc_key VARCHAR(50) NOT NULL DEFAULT 'mainAdmin',
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_doc_key UNIQUE (doc_key)
);

-- Default admin user
INSERT INTO admins (doc_key, username, password) VALUES
('mainAdmin', 'admin', '9489318959@123!')
ON CONFLICT (doc_key) DO NOTHING;

-- ============================================================
-- Table: contact_submissions
-- Firebase Collection: contact_submissions
-- Stores enquiries submitted via the contact form
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_contact_is_read ON contact_submissions (is_read);

-- ============================================================
-- Auto-update `updated_at` trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to admins table
DROP TRIGGER IF EXISTS set_admins_updated_at ON admins;
CREATE TRIGGER set_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to contact_submissions table
DROP TRIGGER IF EXISTS set_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER set_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
