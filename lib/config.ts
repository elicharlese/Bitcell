// Supabase configuration utility
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
}

// Solana configuration
export const solanaConfig = {
  network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  programId: process.env.NEXT_PUBLIC_BITCELL_PROGRAM_ID || 'BitC1177777777777777777777777777777777777777',
}

// App configuration
export const appConfig = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validate required environment variables
export function validateEnvironment() {
  const requiredVars = {
    'NEXT_PUBLIC_SOLANA_NETWORK': solanaConfig.network,
    'NEXT_PUBLIC_SOLANA_RPC_URL': solanaConfig.rpcUrl,
    'NEXT_PUBLIC_BITCELL_PROGRAM_ID': solanaConfig.programId,
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
