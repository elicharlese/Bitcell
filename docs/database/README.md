# Database Documentation

The BitCell application uses Supabase (PostgreSQL) for data persistence, user management, and real-time features.

## Database Schema

### Tables

#### user_profiles

Stores user account information and preferences.

```sql
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id`: UUID from Supabase auth.users table
- `wallet_address`: Solana wallet public key (unique)
- `email`: User's email address
- `display_name`: Optional display name
- `preferences`: JSON object for user settings
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

#### cell_metadata

Stores information about user's BitCells.

```sql
CREATE TABLE cell_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    name TEXT NOT NULL,
    cell_type TEXT DEFAULT 'standard',
    solana_account TEXT UNIQUE,
    settings JSONB DEFAULT '{}',
    statistics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique cell identifier
- `user_id`: Reference to user_profiles
- `wallet_address`: Owner's wallet address
- `name`: User-defined cell name
- `cell_type`: Cell type (standard, premium, etc.)
- `solana_account`: On-chain account address
- `settings`: Cell configuration (JSON)
- `statistics`: Cell performance data (JSON)
- `is_active`: Whether cell is active
- `created_at`: Cell creation timestamp
- `updated_at`: Last update timestamp

#### transaction_logs

Records all blockchain transactions and application events.

```sql
CREATE TABLE transaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    cell_id UUID REFERENCES cell_metadata(id) ON DELETE SET NULL,
    transaction_hash TEXT,
    type TEXT NOT NULL,
    amount BIGINT,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique transaction log identifier
- `user_id`: Reference to user_profiles
- `cell_id`: Reference to cell_metadata (nullable)
- `transaction_hash`: Solana transaction signature
- `type`: Transaction type (deposit, withdraw, etc.)
- `amount`: Transaction amount in lamports
- `status`: Transaction status (pending, confirmed, failed)
- `metadata`: Additional transaction data (JSON)
- `created_at`: Transaction timestamp
- `updated_at`: Status update timestamp

### Indexes

Performance indexes for common queries:

```sql
-- User lookups
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Cell queries
CREATE INDEX idx_cell_metadata_user ON cell_metadata(user_id);
CREATE INDEX idx_cell_metadata_wallet ON cell_metadata(wallet_address);
CREATE INDEX idx_cell_metadata_active ON cell_metadata(is_active) WHERE is_active = true;
CREATE INDEX idx_cell_metadata_solana ON cell_metadata(solana_account);

-- Transaction queries
CREATE INDEX idx_transaction_logs_user ON transaction_logs(user_id);
CREATE INDEX idx_transaction_logs_cell ON transaction_logs(cell_id);
CREATE INDEX idx_transaction_logs_hash ON transaction_logs(transaction_hash);
CREATE INDEX idx_transaction_logs_type ON transaction_logs(type);
CREATE INDEX idx_transaction_logs_status ON transaction_logs(status);
CREATE INDEX idx_transaction_logs_created ON transaction_logs(created_at DESC);
```

## Row Level Security (RLS)

### Security Policies

#### user_profiles policies

```sql
-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

#### cell_metadata policies

```sql
-- Users can only access their own cells
CREATE POLICY "Users can view own cells" ON cell_metadata
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own cells" ON cell_metadata
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cells" ON cell_metadata
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cells" ON cell_metadata
    FOR DELETE USING (user_id = auth.uid());
```

#### transaction_logs policies

```sql
-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON transaction_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions" ON transaction_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Only system can update transaction status
CREATE POLICY "System can update transactions" ON transaction_logs
    FOR UPDATE USING (auth.role() = 'service_role');
```

## Database Functions

### Helper Functions

#### get_user_by_wallet

```sql
CREATE OR REPLACE FUNCTION get_user_by_wallet(wallet_addr TEXT)
RETURNS TABLE (
    id UUID,
    wallet_address TEXT,
    email TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.wallet_address,
        up.email,
        up.display_name,
        up.created_at
    FROM user_profiles up
    WHERE up.wallet_address = wallet_addr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### update_cell_statistics

```sql
CREATE OR REPLACE FUNCTION update_cell_statistics(
    cell_uuid UUID,
    new_stats JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE cell_metadata 
    SET 
        statistics = new_stats,
        updated_at = NOW()
    WHERE id = cell_uuid AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### log_transaction

```sql
CREATE OR REPLACE FUNCTION log_transaction(
    p_user_id UUID,
    p_cell_id UUID,
    p_tx_hash TEXT,
    p_type TEXT,
    p_amount BIGINT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    tx_id UUID;
BEGIN
    INSERT INTO transaction_logs (
        user_id, cell_id, transaction_hash, 
        type, amount, metadata
    ) VALUES (
        p_user_id, p_cell_id, p_tx_hash, 
        p_type, p_amount, p_metadata
    ) RETURNING id INTO tx_id;
    
    RETURN tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Triggers

#### updated_at triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cell_metadata_updated_at
    BEFORE UPDATE ON cell_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_logs_updated_at
    BEFORE UPDATE ON transaction_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Views

### Active Cells View

```sql
CREATE VIEW active_cells AS
SELECT 
    cm.id,
    cm.user_id,
    cm.name,
    cm.cell_type,
    cm.solana_account,
    cm.settings,
    cm.statistics,
    cm.created_at,
    cm.updated_at,
    up.wallet_address,
    up.display_name
FROM cell_metadata cm
JOIN user_profiles up ON cm.user_id = up.id
WHERE cm.is_active = true;
```

### Transaction Summary View

```sql
CREATE VIEW transaction_summary AS
SELECT 
    tl.user_id,
    up.wallet_address,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN tl.type = 'deposit' THEN 1 END) as deposits,
    COUNT(CASE WHEN tl.type = 'withdraw' THEN 1 END) as withdrawals,
    SUM(CASE WHEN tl.type = 'deposit' THEN tl.amount ELSE 0 END) as total_deposited,
    SUM(CASE WHEN tl.type = 'withdraw' THEN tl.amount ELSE 0 END) as total_withdrawn,
    MAX(tl.created_at) as last_transaction
FROM transaction_logs tl
JOIN user_profiles up ON tl.user_id = up.id
GROUP BY tl.user_id, up.wallet_address;
```

## Data Migration

### Migration Scripts

Migration scripts are stored in `/database/migrations/` and executed in order:

```sql
-- 001_initial_schema.sql
-- Creates initial tables and indexes

-- 002_add_rls_policies.sql  
-- Adds Row Level Security policies

-- 003_create_functions.sql
-- Creates helper functions and triggers

-- 004_create_views.sql
-- Creates database views
```

### Running Migrations

```bash
# Using Supabase CLI
supabase db reset

# Or manually apply to remote database
psql -h <HOST> -U <USER> -d <DATABASE> -f database/schema.sql
```

## Backup and Recovery

### Automated Backups

Supabase provides automatic daily backups. For additional safety:

```sql
-- Create manual backup
pg_dump -h <HOST> -U <USER> -d <DATABASE> > backup_$(date +%Y%m%d).sql

-- Restore from backup
psql -h <HOST> -U <USER> -d <DATABASE> < backup_20241201.sql
```

### Point-in-Time Recovery

Supabase Pro plans include point-in-time recovery:

```bash
# Using Supabase CLI
supabase db restore --ref <PROJECT_REF> --recovery-time <ISO_TIMESTAMP>
```

## Performance Optimization

### Query Optimization

Common query patterns and their optimizations:

```sql
-- Efficient user cell lookup
SELECT * FROM cell_metadata 
WHERE user_id = $1 AND is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Efficient transaction history
SELECT * FROM transaction_logs 
WHERE user_id = $1 
ORDER BY created_at DESC
LIMIT 50;

-- Aggregate statistics
SELECT 
    user_id,
    COUNT(*) as cell_count,
    AVG((statistics->>'total_energy')::numeric) as avg_energy
FROM cell_metadata 
WHERE is_active = true
GROUP BY user_id;
```

### Connection Pooling

Configure connection pooling for production:

```javascript
// supabase client configuration
const supabase = createClient(url, key, {
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

## Monitoring

### Key Metrics

Monitor these database metrics:

- Connection count and pool utilization
- Query execution times
- Index usage statistics
- Table sizes and growth rates
- RLS policy performance

### Alerting

Set up alerts for:

```sql
-- Slow queries (>1 second)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements 
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- High connection usage
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active';

-- Large table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Best Practices

### Access Control

1. **Use RLS**: All tables have Row Level Security enabled
2. **Principle of Least Privilege**: Users can only access their own data
3. **Service Role Protection**: System operations use service role key
4. **Connection Security**: Always use SSL connections

### Data Protection

1. **Encryption**: Data encrypted at rest and in transit
2. **Sensitive Data**: Store wallet addresses, not private keys
3. **Audit Trail**: All transactions logged with timestamps
4. **Data Retention**: Implement data retention policies

### Compliance

1. **GDPR**: Users can delete their accounts and all associated data
2. **Data Portability**: Users can export their data
3. **Privacy**: No personally identifiable information stored unnecessarily

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Check user authentication and policy conditions
2. **Connection Limits**: Monitor connection pool usage
3. **Slow Queries**: Use EXPLAIN ANALYZE to identify bottlenecks
4. **Migration Failures**: Check dependency order and syntax

### Debug Queries

```sql
-- Check RLS policy effectiveness
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- Monitor active connections
SELECT pid, usename, application_name, state, query_start, query
FROM pg_stat_activity 
WHERE state = 'active';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```
