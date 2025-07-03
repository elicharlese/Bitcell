# BitCell - Advanced DeFi Cell Simulation Platform

BitCell is a cutting-edge decentralized finance (DeFi) platform built on Solana that allows users to create, manage, and grow virtual "cells" that simulate biological processes through blockchain-powered financial mechanisms.

![BitCell](./public/placeholder-logo.svg)

## 🌟 Features

- **🧬 Cell Creation**: Create unique BitCells with customizable parameters
- **💰 DeFi Integration**: Stake, earn, and compound returns through Solana blockchain
- **📊 Real-time Analytics**: Track cell growth, energy levels, and performance metrics
- **🔬 Biological Simulation**: Advanced algorithms simulate cell behavior and evolution
- **💎 NFT Integration**: Each cell is a unique NFT with evolving characteristics
- **🌐 Decentralized**: Fully on-chain logic with off-chain metadata storage

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Modern component library
- **React Three Fiber** - 3D visualization
- **Wallet Adapter** - Solana wallet integration

### Backend
- **Solana Program (Rust)** - On-chain logic and state management
- **Next.js API Routes** - Server-side API endpoints
- **Supabase** - Database, authentication, and real-time features
- **TypeScript** - End-to-end type safety

### Blockchain
- **Solana** - High-performance blockchain
- **Anchor Framework** - Solana development framework
- **Web3.js** - Blockchain interaction library

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Rust and Cargo
- Solana CLI tools

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/elicharlese/Bitcell.git
   cd Bitcell
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Build and deploy Solana program**
   ```bash
   cd bitcell-program
   cargo build-bpf
   solana program deploy target/deploy/bitcell_program.so
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
BitCell/
├── app/                    # Next.js App Router pages
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── bitcell-program/       # Solana program (Rust)
│   ├── src/lib.rs         # Program logic
│   ├── Cargo.toml         # Rust dependencies
│   └── target/            # Build artifacts
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── cell/             # Cell-specific components
│   └── ...               # Other components
├── context/              # React context providers
├── docs/                 # Documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── services/             # API and blockchain services
├── tests/                # Test files
└── types/                # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables:

- **Supabase**: Database and authentication
- **Solana**: RPC endpoints and program IDs
- **Next.js**: Application configuration

### Database Setup

1. Create a Supabase project
2. Run the SQL schema from `docs/database.sql`
3. Configure Row Level Security (RLS) policies
4. Update environment variables

### Solana Program Deployment

1. Install Solana CLI tools
2. Create or import a wallet
3. Get devnet SOL from faucet
4. Build and deploy the program
5. Update program ID in environment variables

## 🧪 Testing

Run the test suite:

```bash
# Unit and integration tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Installation Guide](./docs/INSTALLATION.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Solana Program](./docs/SOLANA_PROGRAM.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

1. Build the application: `pnpm build`
2. Deploy to your preferred hosting platform
3. Ensure environment variables are set
4. Deploy Solana program to mainnet

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Website**: [https://bitcell.app](https://bitcell.app)
- **Documentation**: [https://docs.bitcell.app](https://docs.bitcell.app)
- **Discord**: [https://discord.gg/bitcell](https://discord.gg/bitcell)
- **Twitter**: [@BitCellApp](https://twitter.com/BitCellApp)

## ⚡ Quick Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests

# Solana Program
cd bitcell-program
cargo build-bpf   # Build program
cargo test        # Run program tests
```

## 🐛 Issues & Support

If you encounter any issues or need support:

1. Check the [documentation](./docs/)
2. Search existing [GitHub issues](https://github.com/elicharlese/Bitcell/issues)
3. Create a new issue with detailed information
4. Join our [Discord community](https://discord.gg/bitcell)

---

**Built with ❤️ by the BitCell Team**
