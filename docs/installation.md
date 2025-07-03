# Installation Guide

This guide will help you set up the BitCell development environment.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - preferred package manager
- **Rust** (latest stable) - for Solana program development
- **Solana CLI** (latest) - for blockchain interaction
- **Git** - for version control

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd bitcell
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Rust and Solana CLI (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# - Add your Supabase URL and keys
# - Configure Solana network settings
# - Set up any other required environment variables
```

### 4. Database Setup

```bash
# If using Supabase locally
npx supabase start

# Or configure your cloud Supabase instance
# Import the schema from database/schema.sql
```

### 5. Solana Program Setup

```bash
# Set Solana to devnet
solana config set --url devnet

# Generate a new keypair for development
solana-keygen new --outfile ./keypair.json

# Build the Solana program
cd bitcell-program
cargo build-bpf
```

### 6. Start Development

```bash
# Start the Next.js development server
pnpm dev

# The application will be available at http://localhost:3000
```

## Verification

To verify your installation:

1. **Frontend**: Visit http://localhost:3000 - you should see the BitCell landing page
2. **API**: Test API endpoints at http://localhost:3000/api/health
3. **Database**: Check Supabase dashboard for proper table creation
4. **Solana Program**: Deploy to devnet and test basic operations

## Troubleshooting

### Common Issues

1. **pnpm not found**: Install pnpm globally with `npm install -g pnpm`
2. **Rust/Cargo errors**: Ensure Rust is properly installed and updated
3. **Solana CLI issues**: Make sure PATH includes Solana binaries
4. **Environment variables**: Double-check all required variables are set in .env.local

### Getting Help

- Check the [API Documentation](./api/README.md) for backend issues
- Review [Solana Program Documentation](./solana/README.md) for blockchain issues
- Consult [Database Documentation](./database/README.md) for data issues

## Next Steps

After successful installation:

1. Review the [API Documentation](./api/README.md)
2. Understand the [Database Schema](./database/README.md)
3. Study the [Solana Program Documentation](./solana/README.md)
4. Start developing following our coding standards
