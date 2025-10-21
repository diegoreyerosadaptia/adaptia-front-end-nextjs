-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('client', 'admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    country TEXT,
    company_size TEXT CHECK (company_size IN ('micro', 'small', 'medium', 'large', 'multinational')),
    employees_number INT,
    website TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Removed user_organizations table - relationship is one-to-many via owner_id

-- Analysis table
CREATE TABLE analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending_payment', 'to_do', 'in_progress', 'completed', 'published', 'error')) NOT NULL DEFAULT 'pending_payment',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table (oriented to MercadoPago)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected')) NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT NOW(),
    provider TEXT DEFAULT 'mercadopago',
    transaction_id TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analysis_Steps table
CREATE TABLE analysis_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    step_name TEXT NOT NULL,
    input_json JSONB,
    output_json JSONB,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'error', 'corrected')) NOT NULL DEFAULT 'pending',
    executed_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analysis_Results table
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID UNIQUE REFERENCES analysis(id) ON DELETE CASCADE,
    context TEXT,
    materiality_matrix JSONB,
    sasb_metrics JSONB,
    gri_metrics JSONB,
    national_regulations JSONB,
    executive_summary TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
