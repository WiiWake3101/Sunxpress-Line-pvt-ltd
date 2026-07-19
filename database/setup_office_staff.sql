-- ================================================================
-- Sun Xpress Line - Office Staff & Auto-Assignment Setup
-- ================================================================
-- This script sets up the office staff system with automatic
-- query assignment and staff management features.
--
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Create office_staff table
CREATE TABLE IF NOT EXISTS office_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add assigned_to column to quote_requests table
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES office_staff(id) ON DELETE SET NULL;

-- 3. Add assigned_to column to contact_messages table
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES office_staff(id) ON DELETE SET NULL;

-- 4. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_quote_requests_assigned_to ON quote_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assigned_to ON contact_messages(assigned_to);

-- 5. Create function to get next available staff member (round-robin)
CREATE OR REPLACE FUNCTION get_next_staff_member()
RETURNS UUID AS $$
DECLARE
    staff_id UUID;
BEGIN
    -- Get active staff member with least assignments
    SELECT os.id INTO staff_id
    FROM office_staff os
    WHERE os.is_active = true
    ORDER BY (
        SELECT COUNT(*) 
        FROM (
            SELECT assigned_to FROM quote_requests WHERE assigned_to = os.id
            UNION ALL
            SELECT assigned_to FROM contact_messages WHERE assigned_to = os.id
        ) assignments
    ) ASC, os.created_at ASC
    LIMIT 1;
    
    RETURN staff_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger function to auto-assign quotes
CREATE OR REPLACE FUNCTION auto_assign_quote()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign if not already assigned
    IF NEW.assigned_to IS NULL THEN
        NEW.assigned_to := get_next_staff_member();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger function to auto-assign contacts
CREATE OR REPLACE FUNCTION auto_assign_contact()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign if not already assigned
    IF NEW.assigned_to IS NULL THEN
        NEW.assigned_to := get_next_staff_member();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create triggers for auto-assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_quote ON quote_requests;
CREATE TRIGGER trigger_auto_assign_quote
    BEFORE INSERT ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_quote();

DROP TRIGGER IF EXISTS trigger_auto_assign_contact ON contact_messages;
CREATE TRIGGER trigger_auto_assign_contact
    BEFORE INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_contact();

-- 9. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Add updated_at triggers
DROP TRIGGER IF EXISTS update_office_staff_updated_at ON office_staff;
CREATE TRIGGER update_office_staff_updated_at
    BEFORE UPDATE ON office_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Enable Row Level Security (RLS)
ALTER TABLE office_staff ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for office_staff
-- Allow admins to manage staff
CREATE POLICY "Allow admin full access to office_staff"
    ON office_staff
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 13. Grant necessary permissions
GRANT ALL ON office_staff TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these to verify the setup:

-- Check if office_staff table exists
-- SELECT * FROM office_staff;

-- Check if columns were added
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('quote_requests', 'contact_messages') 
-- AND column_name = 'assigned_to';

-- Check if triggers exist
-- SELECT trigger_name, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name LIKE '%auto_assign%';

-- ================================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================================
-- Uncomment to add sample staff members

-- INSERT INTO office_staff (name, email, is_active) VALUES
-- ('John Smith', 'john@sunxpressline.com', true),
-- ('Sarah Johnson', 'sarah@sunxpressline.com', true),
-- ('Michael Chen', 'michael@sunxpressline.com', true);

-- ================================================================
-- ADD YOUR PERSONAL ACCOUNT
-- ================================================================
-- Uncomment and modify these lines to add your personal staff account
-- Replace 'your.email@sunxp.in' with your actual email

-- Step 1: Add to office_staff table
INSERT INTO office_staff (name, email, is_active) VALUES
('Admin Staff', 'vivek@sunxp.in', true);

-- Step 2: Create auth user (Run this separately in Supabase Dashboard → Authentication)
-- Go to Authentication → Users → Add User (click the button)
-- Email: vivek@sunxp.in
-- Password: 1234
-- Auto Confirm User: YES (toggle this on)

-- OR use SQL if you have admin.createUser permission:
-- Note: This requires service_role key, typically done through Dashboard UI
-- SELECT auth.create_user(
--   jsonb_build_object(
--     'email', 'vivek@sunxp.in',
--     'password', '1234',
--     'email_confirm', true
--   )
-- );

-- ================================================================
-- VIEW DATABASE CONTENT
-- ================================================================
-- Run these queries to see all data:

-- 1. View all staff members
SELECT 
  id,
  name,
  email,
  is_active,
  created_at
FROM office_staff
ORDER BY created_at DESC;

-- 2. View all quotes with assignments
SELECT 
  qr.id,
  qr.name,
  qr.email,
  qr.status,
  qr.created_at,
  qr.assigned_to,
  os.name as assigned_staff_name
FROM quote_requests qr
LEFT JOIN office_staff os ON qr.assigned_to = os.id
ORDER BY qr.created_at DESC
LIMIT 20;

-- 3. View all contact messages with assignments
SELECT 
  id,
  name,
  email,
  is_active,
  created_at
FROM office_staff
ORDER BY created_at DESC;

-- 4. View assignment distribution (workload per staff)
SELECT 
  os.name,
  os.email,
  os.is_active,
  COUNT(DISTINCT qr.id) as quote_count,
  COUNT(DISTINCT cm.id) as message_count,
  (COUNT(DISTINCT qr.id) + COUNT(DISTINCT cm.id)) as total_assignments
FROM office_staff os
LEFT JOIN quote_requests qr ON qr.assigned_to = os.id
LEFT JOIN contact_messages cm ON cm.assigned_to = os.id
GROUP BY os.id, os.name, os.email, os.is_active
ORDER BY total_assignments DESC;

-- 5. View all auth users (to verify account creation)
-- Note: This requires special permissions
-- SELECT id, email, created_at FROM auth.users;

-- ================================================================
-- ROLLBACK SCRIPT (if needed)
-- ================================================================
-- Uncomment and run if you need to remove the office staff system

-- DROP TRIGGER IF EXISTS trigger_auto_assign_quote ON quote_requests;
-- DROP TRIGGER IF EXISTS trigger_auto_assign_contact ON contact_messages;
-- DROP TRIGGER IF EXISTS update_office_staff_updated_at ON office_staff;
-- DROP FUNCTION IF EXISTS auto_assign_quote();
-- DROP FUNCTION IF EXISTS auto_assign_contact();
-- DROP FUNCTION IF EXISTS get_next_staff_member();
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- ALTER TABLE quote_requests DROP COLUMN IF EXISTS assigned_to;
-- ALTER TABLE contact_messages DROP COLUMN IF EXISTS assigned_to;
-- DROP TABLE IF EXISTS office_staff;

-- ================================================================
-- NOTES:
-- ================================================================
-- * Auto-assignment distributes queries evenly using round-robin
-- * Only active staff members receive assignments
-- * Staff with fewer total assignments get priority
-- * Assignments are made automatically when new queries arrive
-- * Staff can be activated/deactivated from admin dashboard
-- ================================================================
