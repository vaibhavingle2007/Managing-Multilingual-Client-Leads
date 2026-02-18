-- ============================================================
-- Leads Table — Multilingual Client Lead Management
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone           TEXT NOT NULL DEFAULT '',
    original_message    TEXT NOT NULL,
    translated_message  TEXT NOT NULL DEFAULT '',
    language        TEXT NOT NULL DEFAULT 'english',
    tag             TEXT DEFAULT NULL,
    status          TEXT NOT NULL DEFAULT 'New',
    assigned_to     TEXT DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_language ON leads (language);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- Enable Row Level Security (recommended for production)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations via service key (backend)
-- In production, restrict this to authenticated users
CREATE POLICY "Allow all for service role"
    ON leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- Verify: Run this to check the table was created
-- SELECT * FROM leads LIMIT 1;
-- ============================================================
