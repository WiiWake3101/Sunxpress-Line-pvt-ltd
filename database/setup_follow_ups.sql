-- ================================================================
-- Sun Xpress Line - Follow-Up / Call Tracking Setup
-- ================================================================
-- This script creates a follow_ups table so both staff and admin
-- can log whether a customer was called and track follow-up history
-- for quote requests and contact messages.
--
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Create follow_ups table
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id BIGSERIAL PRIMARY KEY,
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('quote', 'contact')),
    reference_id BIGINT NOT NULL,
    call_status VARCHAR(50) NOT NULL DEFAULT 'not_called'
        CHECK (call_status IN ('not_called', 'called_answered', 'called_no_answer', 'left_voicemail', 'follow_up_scheduled', 'completed')),
    notes TEXT,
    follow_up_date DATE,
    created_by TEXT NOT NULL,       -- email of staff/admin who logged the update
    created_by_name TEXT,           -- display name of staff/admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_follow_ups_reference ON public.follow_ups (reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_created_at ON public.follow_ups (created_at);

-- 3. Enable Row Level Security
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- 4. Allow authenticated users (staff + admin) full access
DROP POLICY IF EXISTS "Allow authenticated full access to follow_ups" ON public.follow_ups;
CREATE POLICY "Allow authenticated full access to follow_ups"
    ON public.follow_ups
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Grant permissions
GRANT ALL ON public.follow_ups TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- SELECT * FROM public.follow_ups ORDER BY created_at DESC;
