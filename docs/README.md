# BitCell Documentation

Welcome to the BitCell documentation! This project is a Solana-based decentralized application for virtual cell evolution and trading.

## Quick Start

1. [Installation Guide](./installation.md)
2. [API Documentation](./api/README.md)
3. [Solana Program Documentation](./solana/README.md)
4. [Database Schema](./database/README.md)
5. [Deployment Guide](./deployment.md)

## Architecture Overview

BitCell is built with:
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Solana Program (Rust)
- **Deployment**: Vercel

## Project Structure

```
/project/workspace/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── ...                # Frontend pages and components
├── bitcell-program/       # Solana program (Rust)
├── components/           # React components
├── database/             # Database schema and migrations
├── docs/                 # Documentation
├── lib/                  # Utility libraries
└── services/             # External service integrations
```

## Development Workflow

1. Follow the [Installation Guide](./installation.md) to set up your development environment
2. Read the [API Documentation](./api/README.md) to understand the backend services
3. Review the [Solana Program Documentation](./solana/README.md) for blockchain integration
4. Check the [Database Schema](./database/README.md) for data structure
5. Use the [Deployment Guide](./deployment.md) for production deployment

## Contributing

Please read our contributing guidelines and ensure all tests pass before submitting pull requests.
