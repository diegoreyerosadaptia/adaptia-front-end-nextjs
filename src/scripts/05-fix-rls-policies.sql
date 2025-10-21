-- Fix RLS policies to prevent infinite recursion
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

-- Drop the helper function as it's causing recursion
DROP FUNCTION IF EXISTS user_role();
DROP FUNCTION IF EXISTS auth.user_role();
DROP FUNCTION IF EXISTS public.user_role();

-- Create simple, non-recursive policies for users table
-- Users can read their own data
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data  
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- For admin access, use the service role key instead of RLS policies
-- This prevents recursion issues

-- Update payments policy to be simpler
DROP POLICY IF EXISTS "Users can view their payments" ON payments;

CREATE POLICY "Users can view their payments"
    ON payments FOR SELECT
    USING (user_id = auth.uid());

-- Note: Admins should use the service role key to access all data
-- This is the recommended Supabase pattern for admin operations
