-- ============================================================
-- Supabase RLS (Row Level Security) Policies
-- Run this in Supabase SQL Editor to allow frontend access
-- ============================================================

-- Disable RLS on admins table (for simple admin login)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Disable RLS on contact_submissions table (for public contact form)
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;
