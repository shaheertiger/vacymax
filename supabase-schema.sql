-- VacyMax Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plan Generations Table
CREATE TABLE IF NOT EXISTS plan_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  pto_used INTEGER NOT NULL,
  total_days_off INTEGER NOT NULL,
  monetary_value DECIMAL(10, 2) NOT NULL,
  region TEXT NOT NULL,
  strategy TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_plan_generations_created_at ON plan_generations(created_at DESC),
  INDEX idx_plan_generations_user_id ON plan_generations(user_id),
  INDEX idx_plan_generations_region ON plan_generations(region)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  stripe_payment_id TEXT UNIQUE NOT NULL,
  stripe_customer_email TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  plan_stats JSONB,
  user_metadata JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'refunded', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_payments_created_at ON payments(created_at DESC),
  INDEX idx_payments_user_id ON payments(user_id),
  INDEX idx_payments_stripe_id ON payments(stripe_payment_id),
  INDEX idx_payments_status ON payments(status),
  INDEX idx_payments_email ON payments(stripe_customer_email)
);

-- Sessions Table (for analytics)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_sessions_created_at ON sessions(created_at DESC),
  INDEX idx_sessions_user_id ON sessions(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE plan_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all operations for now - adjust based on your auth strategy)
CREATE POLICY "Allow all operations on plan_generations" ON plan_generations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on sessions" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Create a view for analytics dashboard
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_plans,
  AVG(pto_used) as avg_pto_used,
  AVG(total_days_off) as avg_days_off,
  AVG(monetary_value) as avg_value,
  region,
  strategy
FROM plan_generations
GROUP BY DATE_TRUNC('day', created_at), region, strategy
ORDER BY date DESC;

-- Create a view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_payments,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_payment,
  currency
FROM payments
GROUP BY DATE_TRUNC('day', created_at), currency
ORDER BY date DESC;

-- Comments for documentation
COMMENT ON TABLE plan_generations IS 'Tracks all vacation plan generations by users';
COMMENT ON TABLE payments IS 'Tracks all successful Stripe payments';
COMMENT ON TABLE sessions IS 'Tracks user sessions for analytics';
COMMENT ON VIEW analytics_summary IS 'Aggregated analytics for plan generations';
COMMENT ON VIEW payment_analytics IS 'Aggregated payment and revenue analytics';
