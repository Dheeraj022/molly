-- ============================================
-- MULTI-USER SAAS DATA ISOLATION
-- SQL Migration Script for Supabase
-- ============================================
-- Run this script in Supabase SQL Editor
-- ============================================

-- STEP 1: Add user_id columns to all tables
-- ============================================

-- Add user_id to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to buyers table
ALTER TABLE buyers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to quotations table
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- STEP 2: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON buyers(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);

-- ============================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies for COMPANIES
-- ============================================

-- DROP existing policies if any
DROP POLICY IF EXISTS "Users can view own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON companies;

-- SELECT: Users can only see their own companies
CREATE POLICY "Users can view own companies"
ON companies FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert companies with their own user_id
CREATE POLICY "Users can insert own companies"
ON companies FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own companies
CREATE POLICY "Users can update own companies"
ON companies FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own companies
CREATE POLICY "Users can delete own companies"
ON companies FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: Create RLS Policies for BUYERS
-- ============================================

-- DROP existing policies if any
DROP POLICY IF EXISTS "Users can view own buyers" ON buyers;
DROP POLICY IF EXISTS "Users can insert own buyers" ON buyers;
DROP POLICY IF EXISTS "Users can update own buyers" ON buyers;
DROP POLICY IF EXISTS "Users can delete own buyers" ON buyers;

-- SELECT: Users can only see their own buyers
CREATE POLICY "Users can view own buyers"
ON buyers FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert buyers with their own user_id
CREATE POLICY "Users can insert own buyers"
ON buyers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own buyers
CREATE POLICY "Users can update own buyers"
ON buyers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own buyers
CREATE POLICY "Users can delete own buyers"
ON buyers FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Create RLS Policies for QUOTATIONS
-- ============================================

-- DROP existing policies if any
DROP POLICY IF EXISTS "Users can view own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can insert own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete own quotations" ON quotations;

-- SELECT: Users can only see their own quotations
CREATE POLICY "Users can view own quotations"
ON quotations FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert quotations with their own user_id
CREATE POLICY "Users can insert own quotations"
ON quotations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own quotations
CREATE POLICY "Users can update own quotations"
ON quotations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own quotations
CREATE POLICY "Users can delete own quotations"
ON quotations FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- STEP 7: (OPTIONAL) Make user_id NOT NULL
-- ============================================
-- Uncomment these lines AFTER migrating existing data
-- or if starting fresh

-- ALTER TABLE companies ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE buyers ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE quotations ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'buyers', 'quotations');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('companies', 'buyers', 'quotations');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Update frontend code to pass user_id
-- 2. Test with multiple user accounts
-- 3. Verify data isolation
-- ============================================
