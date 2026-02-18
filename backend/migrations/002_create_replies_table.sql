-- ============================================================
-- Replies Table — Agent responses to client leads
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Create replies table
CREATE TABLE IF NOT EXISTS replies (
    id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id             UUID NOT NULL,
    agent_email         TEXT NOT NULL,
    agent_name          TEXT NOT NULL DEFAULT '',
    original_message    TEXT NOT NULL,
    translated_message  TEXT NOT NULL DEFAULT '',
    target_language     TEXT NOT NULL DEFAULT 'english',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_replies_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Index for fast lookup by lead
CREATE INDEX IF NOT EXISTS idx_replies_lead_id ON replies(lead_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON replies(created_at);

-- Enable Row Level Security
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations via service key (backend)
CREATE POLICY "Allow all for service role"
    ON replies
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- Verify: Run this to check the table was created
-- SELECT * FROM replies LIMIT 1;
-- ============================================================
