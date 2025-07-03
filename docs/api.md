# Bitcell API Documentation

## Overview
The Bitcell API provides endpoints for managing decentralized trading cells on the Solana blockchain. This API serves as a bridge between the frontend application and the Solana program.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-app.vercel.app/api`

## Authentication
Most endpoints require a connected Solana wallet. Transactions are signed client-side and submitted through the API.

## Endpoints

### Cell Management

#### GET `/cells/{address}`
Fetch cell data for a specific wallet address.

**Parameters:**
- `address` (string, required): Solana wallet public key

**Response:**
```json
{
  "success": true,
  "data": {
    "owner": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    "lockedFunds": 1000.0,
    "availableProfits": 150.5,
    "maturityTimestamp": 1672531200000,
    "health": 85,
    "activePositions": 3,
    "totalTrades": 47,
    "successRate": 78,
    "isInitialized": true,
    "riskTolerance": 65,
    "maxDrawdown": 15,
    "tradingFrequency": 120
  }
}
```

#### POST `/cells/{address}`
Initialize a new trading cell.

**Parameters:**
- `address` (string, required): Solana wallet public key

**Body:**
```json
{
  "initialDeposit": 1000,
  "maturityPeriod": 30,
  "riskTolerance": 50,
  "maxDrawdown": 15,
  "tradingFrequency": 60
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "transaction_signature_here"
  },
  "message": "Cell initialized successfully"
}
```

#### POST `/cells/{address}/deposit`
Deposit additional funds into an existing cell.

**Body:**
```json
{
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "transaction_signature_here"
  },
  "message": "Successfully deposited 500 tokens"
}
```

#### POST `/cells/{address}/withdraw`
Withdraw available profits from a cell.

**Body:**
```json
{
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "transaction_signature_here"
  },
  "message": "Successfully withdrew 100 tokens"
}
```

#### PUT `/cells/{address}/settings`
Update cell trading settings.

**Body:**
```json
{
  "riskTolerance": 75,
  "maxDrawdown": 20,
  "tradingFrequency": 90
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "transaction_signature_here"
  },
  "message": "Settings updated successfully"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common error codes:
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Wallet not connected
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

## Rate Limiting
- Development: No rate limiting
- Production: 100 requests per minute per IP

## SDK Usage

```typescript
import { BitcellAPI } from '@/lib/api'

// Initialize cell
const result = await BitcellAPI.initializeCell(walletAddress, {
  initialDeposit: 1000,
  maturityPeriod: 30,
  riskTolerance: 50,
  maxDrawdown: 15,
  tradingFrequency: 60
})

// Fetch cell data
const cellData = await BitcellAPI.getCellData(walletAddress)

// Deposit funds
await BitcellAPI.depositFunds(walletAddress, 500)

// Withdraw profits
await BitcellAPI.withdrawProfits(walletAddress, 100)

// Update settings
await BitcellAPI.updateSettings(walletAddress, {
  riskTolerance: 75,
  maxDrawdown: 20,
  tradingFrequency: 90
})
```
