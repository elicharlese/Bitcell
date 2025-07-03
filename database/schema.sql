-- Supabase Database Schema for Bitcell Application
-- This file contains the database schema, RLS policies, and initial setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cells table (stores off-chain cell metadata)
CREATE TABLE cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
    locked_funds BIGINT DEFAULT 0,
    available_profits BIGINT DEFAULT 0,
    maturity_timestamp BIGINT DEFAULT 0,
    health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
    active_positions INTEGER DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    success_rate INTEGER DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
    risk_tolerance INTEGER DEFAULT 50 CHECK (risk_tolerance >= 0 AND risk_tolerance <= 100),
    max_drawdown INTEGER DEFAULT 15 CHECK (max_drawdown >= 0 AND max_drawdown <= 100),
    trading_frequency INTEGER DEFAULT 60, -- in minutes
    is_initialized BOOLEAN DEFAULT TRUE,
    solana_account_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction logs table
CREATE TABLE transaction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
    cell_id UUID REFERENCES cells(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('initialize', 'deposit', 'withdraw', 'trade', 'settings_update')),
    amount BIGINT,
    transaction_hash TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cell settings history (track changes over time)
CREATE TABLE cell_settings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cell_id UUID NOT NULL REFERENCES cells(id) ON DELETE CASCADE,
    user_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
    old_settings JSONB,
    new_settings JSONB,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading activity simulation (for demo purposes)
CREATE TABLE trading_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cell_id UUID NOT NULL REFERENCES cells(id) ON DELETE CASCADE,
    user_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
    trade_type TEXT CHECK (trade_type IN ('buy', 'sell', 'profit', 'loss')),
    amount BIGINT,
    profit_loss BIGINT,
    asset_symbol TEXT,
    simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_cells_owner_wallet ON cells(owner_wallet);
CREATE INDEX idx_cells_solana_account ON cells(solana_account_address);
CREATE INDEX idx_transaction_logs_user_wallet ON transaction_logs(user_wallet);
CREATE INDEX idx_transaction_logs_cell_id ON transaction_logs(cell_id);
CREATE INDEX idx_transaction_logs_type ON transaction_logs(transaction_type);
CREATE INDEX idx_transaction_logs_status ON transaction_logs(status);
CREATE INDEX idx_transaction_logs_created_at ON transaction_logs(created_at);
CREATE INDEX idx_trading_activities_cell_id ON trading_activities(cell_id);
CREATE INDEX idx_trading_activities_user_wallet ON trading_activities(user_wallet);
CREATE INDEX idx_trading_activities_created_at ON trading_activities(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cells_updated_at 
    BEFORE UPDATE ON cells 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_activities ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Cells policies
CREATE POLICY "Users can view own cells" ON cells
    FOR SELECT USING (owner_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own cells" ON cells
    FOR INSERT WITH CHECK (owner_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own cells" ON cells
    FOR UPDATE USING (owner_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can delete own cells" ON cells
    FOR DELETE USING (owner_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Transaction logs policies
CREATE POLICY "Users can view own transactions" ON transaction_logs
    FOR SELECT USING (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own transactions" ON transaction_logs
    FOR INSERT WITH CHECK (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Cell settings history policies
CREATE POLICY "Users can view own settings history" ON cell_settings_history
    FOR SELECT USING (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own settings history" ON cell_settings_history
    FOR INSERT WITH CHECK (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Trading activities policies
CREATE POLICY "Users can view own trading activities" ON trading_activities
    FOR SELECT USING (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own trading activities" ON trading_activities
    FOR INSERT WITH CHECK (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Functions for common operations

-- Function to get cell statistics
CREATE OR REPLACE FUNCTION get_cell_statistics(p_cell_id UUID)
RETURNS TABLE (
    total_trades_count INTEGER,
    total_profit_loss BIGINT,
    avg_profit_loss NUMERIC,
    success_rate_calculated NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_trades_count,
        COALESCE(SUM(profit_loss), 0) as total_profit_loss,
        COALESCE(AVG(profit_loss), 0) as avg_profit_loss,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE profit_loss > 0)::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0
        END as success_rate_calculated
    FROM trading_activities 
    WHERE cell_id = p_cell_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update cell health based on trading performance
CREATE OR REPLACE FUNCTION update_cell_health(p_cell_id UUID)
RETURNS VOID AS $$
DECLARE
    recent_trades_performance NUMERIC;
    current_health INTEGER;
    new_health INTEGER;
BEGIN
    -- Get current health
    SELECT health INTO current_health FROM cells WHERE id = p_cell_id;
    
    -- Calculate performance from last 10 trades
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE profit_loss > 0)::NUMERIC / COUNT(*)::NUMERIC)
            ELSE 0.5 -- neutral if no trades
        END
    INTO recent_trades_performance
    FROM (
        SELECT profit_loss 
        FROM trading_activities 
        WHERE cell_id = p_cell_id 
        ORDER BY created_at DESC 
        LIMIT 10
    ) recent;
    
    -- Adjust health based on performance
    IF recent_trades_performance > 0.7 THEN
        new_health := LEAST(100, current_health + 5);
    ELSIF recent_trades_performance < 0.3 THEN
        new_health := GREATEST(0, current_health - 10);
    ELSE
        new_health := current_health; -- No change for neutral performance
    END IF;
    
    -- Update the cell health
    UPDATE cells SET health = new_health WHERE id = p_cell_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update cell health after trading activity
CREATE OR REPLACE FUNCTION trigger_update_cell_health()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_cell_health(NEW.cell_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cell_health_after_trade
    AFTER INSERT ON trading_activities
    FOR EACH ROW EXECUTE FUNCTION trigger_update_cell_health();

-- Sample data (optional, for development)
-- Uncomment the following lines to insert sample data

/*
-- Insert sample user
INSERT INTO user_profiles (wallet_address, email, username) VALUES 
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'demo@bitcell.io', 'demo_user');

-- Insert sample cell
INSERT INTO cells (owner_wallet, locked_funds, risk_tolerance, max_drawdown, trading_frequency) VALUES 
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 1000000000, 75, 20, 30);

-- Insert sample transaction
INSERT INTO transaction_logs (user_wallet, transaction_type, amount, status) VALUES 
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'initialize', 1000000000, 'confirmed');
*/
