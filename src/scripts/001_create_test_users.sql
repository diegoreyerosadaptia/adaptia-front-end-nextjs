-- Create test users for authentication
-- Note: These users need to be created in Supabase Auth first, then linked here

-- Insert admin user
INSERT INTO users (id, email, password, name, surname, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@adaptia.com',
  'hashed_password_placeholder', -- This will be managed by Supabase Auth
  'Admin',
  'Adaptia',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert client user
INSERT INTO users (id, email, password, name, surname, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'cliente@adaptia.com',
  'hashed_password_placeholder', -- This will be managed by Supabase Auth
  'Cliente',
  'Demo',
  'client',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create a sample organization for the client user
INSERT INTO organizations (id, name, industry, country, employees_number, company_size, website, owner_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Empresa Demo S.A.',
  'Tecnología',
  'Chile',
  150,
  'Mediana',
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
  'pending',
  NOW() - INTERVAL '5 days',
  NOW()
FROM organizations o
WHERE o.name = 'Empresa Demo S.A.'
ON CONFLICT DO NOTHING;
