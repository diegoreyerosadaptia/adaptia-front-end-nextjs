-- Enable Row Level Security (RLS) on all tables
-- This is a Supabase best practice for security

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- Removed user_organizations table
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Create helper function to check user role without triggering RLS recursion
CREATE OR REPLACE FUNCTION user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- RLS Policies for users table
-- Users can read their own data
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Fixed admin policy to use helper function instead of recursive query
-- Admins can view all users
CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (auth.user_role() = 'admin');

-- RLS Policies for organizations table
-- Updated to use owner_id directly instead of user_organizations junction table
-- Users can view organizations they own
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (owner_id = auth.uid());

-- Organization owners can update their organizations
CREATE POLICY "Owners can update their organizations"
    ON organizations FOR UPDATE
    USING (owner_id = auth.uid());

-- Organization owners can delete their organizations
CREATE POLICY "Owners can delete their organizations"
    ON organizations FOR DELETE
    USING (owner_id = auth.uid());

-- Users can create organizations
CREATE POLICY "Users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Removed user_organizations policies - table no longer exists

-- RLS Policies for analysis table
-- Simplified to use owner_id directly
-- Users can view analysis for their organizations
CREATE POLICY "Users can view their organization's analysis"
    ON analysis FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE organizations.id = analysis.organization_id
            AND organizations.owner_id = auth.uid()
        )
    );

-- Organization owners can create analysis
CREATE POLICY "Owners can create analysis"
    ON analysis FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE organizations.id = analysis.organization_id
            AND organizations.owner_id = auth.uid()
        )
    );

-- RLS Policies for payments table
-- Users can view their own payments
CREATE POLICY "Users can view their payments"
    ON payments FOR SELECT
    USING (user_id = auth.uid());

-- Fixed admin policy to use helper function instead of recursive query
-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON payments FOR SELECT
    USING (auth.user_role() = 'admin');

-- RLS Policies for analysis_steps table
-- Simplified to use owner_id directly
-- Users can view steps for their organization's analysis
CREATE POLICY "Users can view their analysis steps"
    ON analysis_steps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM analysis
            JOIN organizations ON organizations.id = analysis.organization_id
            WHERE analysis.id = analysis_steps.analysis_id
            AND organizations.owner_id = auth.uid()
        )
    );

-- RLS Policies for analysis_results table
-- Simplified to use owner_id directly
-- Users can view results for their organization's analysis
CREATE POLICY "Users can view their analysis results"
    ON analysis_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM analysis
            JOIN organizations ON organizations.id = analysis.organization_id
            WHERE analysis.id = analysis_results.analysis_id
            AND organizations.owner_id = auth.uid()
        )
    );
