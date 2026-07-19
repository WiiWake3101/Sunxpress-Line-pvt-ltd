-- ================================================================
-- QUICK SETUP: Add Your Personal Staff Account
-- ================================================================
-- Email: vivek@sunxp.in
-- Password: 1234
-- ================================================================

-- STEP 1: Add staff record to database
-- Copy and run this in Supabase SQL Editor:

INSERT INTO office_staff (name, email, is_active) VALUES
('Vivek', 'vivek@sunxp.in', true);

-- ================================================================
-- STEP 2: Create authentication user
-- ================================================================
-- Option A: Use Supabase Dashboard (RECOMMENDED - EASIEST)
-- 1. Go to Authentication tab in Supabase Dashboard
-- 2. Click "Add User" button
-- 3. Fill in:
--    - Email: vivek@sunxp.in
--    - Password: 1234
--    - Toggle "Auto Confirm User" to ON
-- 4. Click "Create User"

-- Option B: Use admin API (requires service_role key)
-- Only if you have admin access, run this:
-- SELECT auth.admin_create_user(
--   jsonb_build_object(
--     'email', 'vivek@sunxp.in',
--     'password', '1234',
--     'email_confirm', true
--   )
-- );

-- ================================================================
-- STEP 3: Verify account was created
-- ================================================================
-- Run these queries to check:

-- Check if staff record exists
SELECT * FROM office_staff WHERE email = 'vivek@sunxp.in';

-- Check assignment count (should be 0 initially)
SELECT 
  os.name,
  os.email,
  os.is_active,
  COUNT(DISTINCT qr.id) as quotes,
  COUNT(DISTINCT cm.id) as messages
FROM office_staff os
LEFT JOIN quote_requests qr ON qr.assigned_to = os.id
LEFT JOIN contact_messages cm ON cm.assigned_to = os.id
WHERE os.email = 'vivek@sunxp.in'
GROUP BY os.id, os.name, os.email, os.is_active;

-- ================================================================
-- STEP 4: Test login
-- ================================================================
-- 1. Go to: http://localhost:3000/staff/login
-- 2. Email: vivek@sunxp.in
-- 3. Password: 1234
-- 4. Click Login

-- If successful, you'll see your staff dashboard!
-- ================================================================

-- ================================================================
-- VIEW ALL DATABASE CONTENT
-- ================================================================

-- 1. All staff members
SELECT 
  id,
  name,
  email,
  is_active,
  created_at
FROM office_staff
ORDER BY created_at DESC;

-- 2. All quotes with assignments
SELECT 
  qr.id,
  qr.name as customer_name,
  qr.email as customer_email,
  qr.status,
  qr.port_of_loading,
  qr.port_of_discharge,
  qr.created_at,
  os.name as assigned_to_staff
FROM quote_requests qr
LEFT JOIN office_staff os ON qr.assigned_to = os.id
ORDER BY qr.created_at DESC;

-- 3. All contact messages with assignments
SELECT 
  cm.id,
  cm.name as customer_name,
  cm.email as customer_email,
  cm.subject,
  cm.status,
  cm.created_at,
  os.name as assigned_to_staff
FROM contact_messages cm
LEFT JOIN office_staff os ON cm.assigned_to = os.id
ORDER BY cm.created_at DESC;

-- 4. Assignment distribution (who has how many)
SELECT 
  os.name as staff_name,
  os.email,
  os.is_active as active,
  COUNT(DISTINCT qr.id) as quotes_assigned,
  COUNT(DISTINCT cm.id) as messages_assigned,
  (COUNT(DISTINCT qr.id) + COUNT(DISTINCT cm.id)) as total_assigned
FROM office_staff os
LEFT JOIN quote_requests qr ON qr.assigned_to = os.id
LEFT JOIN contact_messages cm ON cm.assigned_to = os.id
GROUP BY os.id, os.name, os.email, os.is_active
ORDER BY total_assigned DESC;

-- 5. Unassigned items (items with no staff assigned)
SELECT 
  'Quote' as type,
  id,
  name,
  email,
  created_at
FROM quote_requests
WHERE assigned_to IS NULL
UNION ALL
SELECT 
  'Contact' as type,
  id,
  name,
  email,
  created_at
FROM contact_messages
WHERE assigned_to IS NULL
ORDER BY created_at DESC;

-- ================================================================
-- USEFUL ADMIN QUERIES
-- ================================================================

-- Reassign a specific quote to yourself
-- UPDATE quote_requests 
-- SET assigned_to = (SELECT id FROM office_staff WHERE email = 'vivek@sunxp.in')
-- WHERE id = 'PASTE-QUOTE-ID-HERE';

-- Reassign a specific contact message to yourself
-- UPDATE contact_messages 
-- SET assigned_to = (SELECT id FROM office_staff WHERE email = 'vivek@sunxp.in')
-- WHERE id = 'PASTE-MESSAGE-ID-HERE';

-- Make yourself active/inactive
-- UPDATE office_staff SET is_active = true WHERE email = 'vivek@sunxp.in';
-- UPDATE office_staff SET is_active = false WHERE email = 'vivek@sunxp.in';

-- ================================================================
-- TROUBLESHOOTING
-- ================================================================

-- Can't login?
-- 1. Check if staff record exists:
SELECT * FROM office_staff WHERE email = 'vivek@sunxp.in';

-- 2. Check if account is active:
SELECT is_active FROM office_staff WHERE email = 'vivek@sunxp.in';

-- 3. Reset password in Supabase Dashboard:
--    Authentication → Users → Find your email → Reset Password

-- Not getting assignments?
-- 1. Make sure you're active:
UPDATE office_staff SET is_active = true WHERE email = 'vivek@sunxp.in';

-- 2. Check if triggers are working:
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auto_assign%';

-- ================================================================
