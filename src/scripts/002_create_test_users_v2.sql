-- Create test users for authentication
-- IMPORTANT: First create these users in Supabase Auth Dashboard:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" and create:
--    - Email: admin@adaptia.com, Password: Admin123!
--    - Email: cliente@adaptia.com, Password: Cliente123!
-- 3. After creating in Auth, run this script to link the data

-- Get the auth user IDs (these will be created by Supabase Auth)
-- We'll use the auth.users table to get the correct UUIDs

-- Insert admin user (linking to Supabase Auth user)
INSERT INTO users (id, email, password, name, surname, role, created_at, updated_at)
SELECT 
  au.id,
  'admin@adaptia.com',
  'managed_by_supabase_auth',
  'Admin',
  'Adaptia',
  'admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@adaptia.com'
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  name = 'Admin',
  surname = 'Adaptia';

-- Insert client user (linking to Supabase Auth user)
INSERT INTO users (id, email, password, name, surname, role, created_at, updated_at)
SELECT 
  au.id,
  'cliente@adaptia.com',
  'managed_by_supabase_auth',
  'Cliente',
  'Demo',
  'client',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'cliente@adaptia.com'
ON CONFLICT (email) DO UPDATE SET
  role = 'client',
  name = 'Cliente',
  surname = 'Demo';

-- Create a sample organization for the client user
INSERT INTO organizations (id, name, industry, country, employees_number, company_size, website, owner_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Empresa Demo S.A.',
  'Tecnología',
  'Chile',
  150,
  'medium',
  'https://empresademo.cl',
  u.id,
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'cliente@adaptia.com'
ON CONFLICT DO NOTHING;

-- Create sample analyses for the demo organization
INSERT INTO analysis (id, organization_id, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  o.id,
  'completed',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '25 days'
FROM organizations o
WHERE o.name = 'Empresa Demo S.A.'
ON CONFLICT DO NOTHING;

INSERT INTO analysis (id, organization_id, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  o.id,
  'to_do',
  NOW() - INTERVAL '5 days',
  NOW()
FROM organizations o
WHERE o.name = 'Empresa Demo S.A.'
ON CONFLICT DO NOTHING;
