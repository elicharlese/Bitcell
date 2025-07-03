# API Documentation

The BitCell API provides RESTful endpoints for managing users, cells, transactions, and Solana blockchain interactions.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-app.vercel.app/api`

## Authentication

All protected endpoints require authentication via Supabase. Include the user's JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication (`/api/auth`)

#### POST /api/auth - User Registration/Login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### GET /api/auth - Get Current User

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Cell Management (`/api/cells`)

#### GET /api/cells - List User's Cells

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of cells to return (default: 10)
- `offset` (optional): Number of cells to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "cells": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU",
      "name": "My Cell",
      "cell_type": "standard",
      "settings": {
        "growth_rate": 1.5,
        "evolution_stage": 2
      },
      "statistics": {
        "total_energy": 100,
        "growth_level": 75
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### POST /api/cells - Create New Cell

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "My New Cell",
  "cell_type": "standard",
  "settings": {
    "growth_rate": 1.0,
    "evolution_stage": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "cell": {
    "id": "uuid",
    "user_id": "uuid",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU",
    "name": "My New Cell",
    "cell_type": "standard",
    "settings": {
      "growth_rate": 1.0,
      "evolution_stage": 1
    },
    "statistics": {
      "total_energy": 0,
      "growth_level": 0
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/cells - Update Cell

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "cell_id": "uuid",
  "settings": {
    "growth_rate": 2.0,
    "evolution_stage": 3
  },
  "statistics": {
    "total_energy": 150,
    "growth_level": 90
  }
}
```

**Response:**
```json
{
  "success": true,
  "cell": {
    "id": "uuid",
    "settings": {
      "growth_rate": 2.0,
      "evolution_stage": 3
    },
    "statistics": {
      "total_energy": 150,
      "growth_level": 90
    },
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/cells - Delete Cell

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "cell_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cell deleted successfully"
}
```

### Transaction Management (`/api/transactions`)

#### GET /api/transactions - Get Transaction History

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)
- `offset` (optional): Number of transactions to skip (default: 0)
- `type` (optional): Filter by transaction type

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "transaction_hash": "5KJp7f2B9vzqBrqK8E...",
      "type": "deposit",
      "amount": 1000000,
      "status": "confirmed",
      "metadata": {
        "cell_id": "uuid",
        "description": "Deposit to cell"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### POST /api/transactions - Log New Transaction

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "transaction_hash": "5KJp7f2B9vzqBrqK8E...",
  "type": "withdraw",
  "amount": 500000,
  "metadata": {
    "cell_id": "uuid",
    "description": "Withdraw from cell"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "transaction_hash": "5KJp7f2B9vzqBrqK8E...",
    "type": "withdraw",
    "amount": 500000,
    "status": "pending",
    "metadata": {
      "cell_id": "uuid",
      "description": "Withdraw from cell"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Solana Integration (`/api/solana`)

#### POST /api/solana - Execute Solana Program Instruction

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "instruction": "initialize_cell",
  "params": {
    "cell_account": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU",
    "initial_energy": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "transaction_hash": "5KJp7f2B9vzqBrqK8E...",
  "result": {
    "cell_account": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU",
    "energy": 100,
    "growth_level": 0,
    "last_update": 1640995200
  }
}
```

**Supported Instructions:**
- `initialize_cell`: Create a new cell on-chain
- `deposit_funds`: Deposit SOL to a cell
- `withdraw_profits`: Withdraw accumulated profits
- `check_maturity`: Check if cell is ready for harvest

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error
- `BLOCKCHAIN_ERROR`: Solana transaction failed

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication**: 10 requests per minute
- **Read operations**: 100 requests per minute
- **Write operations**: 50 requests per minute
- **Solana operations**: 20 requests per minute

## Testing

Use the included test suite to verify API functionality:

```bash
# Run API tests
pnpm test:api

# Test specific endpoint
pnpm test:api -- --grep "auth"
```

## Examples

See the [examples directory](./examples/) for complete API usage examples in different programming languages.
