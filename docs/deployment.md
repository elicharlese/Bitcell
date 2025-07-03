# Deployment Guide

This guide covers deploying the BitCell application to production using Vercel for the frontend/API and Supabase for the database.

## Prerequisites

Before deploying, ensure you have:

- [Vercel CLI](https://vercel.com/cli) installed
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Git](https://git-scm.com/) with your repository connected to GitHub
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) for program deployment

## Environment Setup

### 1. Production Environment Variables

Create production environment variables in Vercel:

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
vercel env add NEXT_PUBLIC_BITCELL_PROGRAM_ID production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

Or set them in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for the "Production" environment

### 2. Supabase Production Setup

```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Push database schema to production
supabase db push

# Enable Row Level Security
supabase db reset --production
```

## Solana Program Deployment

### 1. Mainnet Deployment

```bash
# Set Solana to mainnet-beta
solana config set --url mainnet-beta

# Generate deployment keypair (save this securely!)
solana-keygen new --outfile ./deploy-keypair.json

# Fund the deployment account
# You'll need sufficient SOL for deployment and rent exemption
solana airdrop 2 ./deploy-keypair.json  # Use faucet for testnet only

# Build the program
cd bitcell-program
cargo build-bpf

# Deploy to mainnet
solana program deploy target/deploy/bitcell_program.so \
  --keypair ../deploy-keypair.json \
  --upgrade-authority ../deploy-keypair.json

# Note the program ID and update your environment variables
```

### 2. Update Program ID

After deployment, update the program ID in your environment:

```bash
# Update Vercel environment variables
vercel env add NEXT_PUBLIC_BITCELL_PROGRAM_ID <NEW_PROGRAM_ID> production
```

## Database Deployment

### 1. Production Database Setup

```bash
# Create production database schema
supabase db reset --production

# Verify tables were created
supabase db list

# Check RLS policies are active
supabase db inspect
```

### 2. Database Migrations

For future schema changes:

```bash
# Generate migration file
supabase migration new add_new_feature

# Edit the migration file in supabase/migrations/
# Apply migration to production
supabase db push
```

## Frontend/API Deployment

### 1. Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or set up automatic deployments from GitHub
vercel --repo <your-github-repo>
```

### 2. Build Configuration

Ensure your `vercel.json` is properly configured:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "mainnet-beta",
    "NODE_ENV": "production"
  }
}
```

## Custom Domain Setup

### 1. Add Custom Domain

```bash
# Add domain to Vercel project
vercel domains add yourdomain.com

# Add www subdomain
vercel domains add www.yourdomain.com
```

### 2. SSL Certificate

Vercel automatically provisions SSL certificates. Verify:

1. Check domain status in Vercel dashboard
2. Ensure DNS records are properly configured
3. Test HTTPS access

## Monitoring and Analytics

### 1. Vercel Analytics

Enable Vercel Analytics in your project:

```bash
# Add to your app
pnpm add @vercel/analytics

# Update your layout.tsx
import { Analytics } from '@vercel/analytics/react';
```

### 2. Error Monitoring

Set up error monitoring with Sentry:

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Configure Sentry (sentry.client.config.js)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Database Monitoring

Monitor Supabase metrics:

1. Database performance
2. API usage
3. Authentication metrics
4. Real-time subscriptions

## Performance Optimization

### 1. Next.js Optimization

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
```

### 2. API Route Optimization

```typescript
// Enable edge runtime for better performance
export const runtime = 'edge';

// Add appropriate caching headers
export async function GET() {
  const response = new Response(data);
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return response;
}
```

### 3. Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_cell_metadata_user_active 
ON cell_metadata (user_id, is_active) 
WHERE is_active = true;

-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

## Security Configuration

### 1. CORS Setup

```typescript
// app/api/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
```

### 2. Security Headers

```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Backup and Disaster Recovery

### 1. Database Backups

```bash
# Automated Supabase backups are enabled by default
# For additional backups:
supabase db dump --data-only > backup-$(date +%Y%m%d).sql

# Store backups in secure location (AWS S3, etc.)
```

### 2. Code Backups

```bash
# Ensure code is backed up to GitHub
git push origin main

# Tag releases
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### 3. Environment Backups

```bash
# Export Vercel environment variables
vercel env ls > production-env-backup.txt

# Backup Supabase configuration
supabase projects list > supabase-config-backup.txt
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Solana program deployed and tested
- [ ] SSL certificates configured
- [ ] Custom domain configured (if applicable)

### Post-Deployment

- [ ] Verify application loads correctly
- [ ] Test user authentication
- [ ] Test cell creation and management
- [ ] Test Solana transactions
- [ ] Verify API endpoints respond correctly
- [ ] Check error monitoring is working
- [ ] Monitor performance metrics

### Rollback Plan

If deployment fails:

1. **Vercel Rollback**: Use Vercel dashboard to rollback to previous deployment
2. **Database Rollback**: Restore from Supabase backup if schema changes caused issues
3. **Solana Program**: Deploy previous version if new program has issues

```bash
# Vercel rollback
vercel rollback <DEPLOYMENT_URL>

# Supabase rollback
supabase db reset --ref <PREVIOUS_MIGRATION>
```

## Maintenance

### Regular Tasks

1. **Monitor Performance**: Check Vercel and Supabase metrics weekly
2. **Update Dependencies**: Monthly security updates
3. **Database Maintenance**: Monitor query performance and optimize as needed
4. **SSL Renewal**: Automatic with Vercel, but verify quarterly

### Scaling Considerations

1. **Vercel**: Automatically scales based on traffic
2. **Supabase**: Monitor database connections and upgrade plan if needed
3. **Solana**: Consider program upgrades for new features

## Support and Troubleshooting

### Common Issues

1. **Build Failures**: Check build logs in Vercel dashboard
2. **Database Connection**: Verify environment variables and connection strings
3. **Solana Transactions**: Check network status and RPC endpoints
4. **SSL Issues**: Verify DNS configuration and certificate status

### Getting Help

- Vercel: [Documentation](https://vercel.com/docs) and [Support](https://vercel.com/support)
- Supabase: [Documentation](https://supabase.com/docs) and [Discord](https://discord.supabase.com/)
- Solana: [Documentation](https://docs.solana.com/) and [Discord](https://discord.gg/solana)

## Cost Optimization

### Vercel

- Use appropriate function regions
- Optimize bundle sizes
- Implement proper caching strategies

### Supabase

- Monitor database usage
- Optimize queries and indexes
- Use appropriate authentication methods

### Solana

- Minimize program account sizes
- Optimize transaction fees
- Use appropriate RPC endpoints

This completes the deployment guide. Follow this checklist for a successful production deployment of your BitCell application.
