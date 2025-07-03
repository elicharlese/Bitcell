// Shared types between frontend and backend
export interface BitcellAccountData {
  owner: string
  lockedFunds: number
  availableProfits: number
  maturityTimestamp: number
  health: number
  activePositions: number
  totalTrades: number
  successRate: number
  isInitialized: boolean
  riskTolerance: number
  maxDrawdown: number
  tradingFrequency: number
}

export interface CellSettings {
  riskTolerance: number
  maxDrawdown: number
  tradingFrequency: number
  apiKey?: string
}

export interface TransactionLog {
  id: string
  userId: string
  cellId: string
  type: 'deposit' | 'withdraw' | 'profit' | 'loss'
  amount: number
  timestamp: Date
  signature?: string
  status: 'pending' | 'confirmed' | 'failed'
}

export interface UserProfile {
  id: string
  walletAddress: string
  email?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    riskTolerance: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API Request types
export interface CreateCellRequest {
  initialDeposit: number
  maturityPeriod: number
  riskTolerance: number
  maxDrawdown: number
  tradingFrequency: number
}

export interface UpdateSettingsRequest {
  riskTolerance: number
  maxDrawdown: number
  tradingFrequency: number
  apiKey?: string
}

export interface WithdrawRequest {
  amount: number
}

export interface DepositRequest {
  amount: number
}
