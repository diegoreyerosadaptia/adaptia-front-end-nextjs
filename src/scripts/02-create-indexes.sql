-- Indexes for better query performance

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Organizations indexes
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_industry ON organizations(industry);
CREATE INDEX idx_organizations_country ON organizations(country);

-- User_Organizations indexes
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_organization_id ON user_organizations(organization_id);

-- Analysis indexes
CREATE INDEX idx_analysis_organization_id ON analysis(organization_id);
CREATE INDEX idx_analysis_status ON analysis(status);
CREATE INDEX idx_analysis_created_at ON analysis(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_analysis_id ON payments(analysis_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Analysis_Steps indexes
CREATE INDEX idx_analysis_steps_analysis_id ON analysis_steps(analysis_id);
CREATE INDEX idx_analysis_steps_status ON analysis_steps(status);
CREATE INDEX idx_analysis_steps_step_number ON analysis_steps(analysis_id, step_number);

-- Analysis_Results indexes
CREATE INDEX idx_analysis_results_analysis_id ON analysis_results(analysis_id);
CREATE INDEX idx_analysis_results_published_at ON analysis_results(published_at);
