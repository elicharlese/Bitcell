/**
 * API Integration Tests for BitCell Backend
 * Tests all API endpoints for proper functionality
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';

// Import API handlers
import { POST as authPost, GET as authGet } from '../app/api/auth/route';
import { POST as cellsPost, GET as cellsGet, PUT as cellsPut, DELETE as cellsDelete } from '../app/api/cells/route';
import { POST as transactionsPost, GET as transactionsGet, PUT as transactionsPut } from '../app/api/transactions/route';
import { POST as solanaPost } from '../app/api/solana/route';

// Mock request helper
function createMockRequest(method: string, url: string, body?: any): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
}

describe('API Routes Integration Tests', () => {
  describe('Auth API (/api/auth)', () => {
    test('POST should handle user authentication', async () => {
      const mockUserData = {
        wallet_address: '5yTzMwHhR8L6J4Q3Kz9X2V7Y1P8G3N6W9S4A2M7F1C5R',
        email: 'test@example.com',
        username: 'testuser'
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth', mockUserData);
      const response = await authPost(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
    });

    test('POST should validate required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing wallet_address
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth', incompleteData);
      const response = await authPost(request);

      expect(response.status).toBe(400);
    });

    test('GET should retrieve user profile', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/auth?wallet=5yTzMwHhR8L6J4Q3Kz9X2V7Y1P8G3N6W9S4A2M7F1C5R');
      const response = await authGet(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success');
    });
  });

  describe('Cells API (/api/cells)', () => {
    test('POST should create a new cell', async () => {
      const mockCellData = {
        user_id: 'test-user-id',
        wallet_address: '5yTzMwHhR8L6J4Q3Kz9X2V7Y1P8G3N6W9S4A2M7F1C5R',
        name: 'Test Cell',
        cell_type: 'standard',
        settings: {
          risk_tolerance: 50,
          max_drawdown: 20
        },
        statistics: {
          total_energy: 100,
          growth_level: 0
        }
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/cells', mockCellData);
      const response = await cellsPost(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('cell');
      expect(result).toHaveProperty('message');
    });

    test('POST should validate required fields', async () => {
      const incompleteData = {
        name: 'Test Cell'
        // Missing user_id and wallet_address
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/cells', incompleteData);
      const response = await cellsPost(request);

      expect(response.status).toBe(400);
    });

    test('GET should retrieve user cells', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/cells?user_id=test-user-id&limit=10');
      const response = await cellsGet(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('cells');
      expect(Array.isArray(result.cells)).toBe(true);
    });

    test('PUT should update cell data', async () => {
      const updateData = {
        cell_id: 'test-cell-id',
        settings: {
          risk_tolerance: 75,
          max_drawdown: 15
        }
      };

      const request = createMockRequest('PUT', 'http://localhost:3000/api/cells', updateData);
      const response = await cellsPut(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
    });

    test('DELETE should soft delete a cell', async () => {
      const deleteData = {
        cell_id: 'test-cell-id'
      };

      const request = createMockRequest('DELETE', 'http://localhost:3000/api/cells', deleteData);
      const response = await cellsDelete(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
    });
  });

  describe('Transactions API (/api/transactions)', () => {
    test('POST should log a new transaction', async () => {
      const mockTransactionData = {
        user_id: 'test-user-id',
        cell_id: 'test-cell-id',
        type: 'deposit',
        amount: 1000000,
        transaction_hash: 'test-hash-123',
        status: 'pending',
        metadata: {
          source: 'wallet'
        }
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/transactions', mockTransactionData);
      const response = await transactionsPost(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('transaction');
    });

    test('GET should retrieve transaction history', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/transactions?user_id=test-user-id&limit=10');
      const response = await transactionsGet(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('transactions');
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    test('PUT should update transaction status', async () => {
      const updateData = {
        transaction_id: 'test-transaction-id',
        status: 'completed',
        metadata: {
          confirmed_at: new Date().toISOString()
        }
      };

      const request = createMockRequest('PUT', 'http://localhost:3000/api/transactions', updateData);
      const response = await transactionsPut(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('Solana API (/api/solana)', () => {
    test('POST should handle initialize_cell instruction', async () => {
      const mockInstruction = {
        instruction: 'initialize_cell',
        params: {
          cell_account: 'test-cell-account',
          initial_energy: 100,
          owner: 'test-owner'
        }
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/solana', mockInstruction);
      const response = await solanaPost(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('transaction_hash');
      expect(result).toHaveProperty('result');
    });

    test('POST should handle deposit_funds instruction', async () => {
      const mockInstruction = {
        instruction: 'deposit_funds',
        params: {
          cell_account: 'test-cell-account',
          amount: 1000000,
          current_energy: 100
        }
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/solana', mockInstruction);
      const response = await solanaPost(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result.result).toHaveProperty('amount_deposited');
    });

    test('POST should handle withdraw_profits instruction', async () => {
      const mockInstruction = {
        instruction: 'withdraw_profits',
        params: {
          cell_account: 'test-cell-account',
          amount: 500000,
          available_profits: 1000000
        }
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/solana', mockInstruction);
      const response = await solanaPost(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result.result).toHaveProperty('amount_withdrawn');
    });

    test('POST should handle check_maturity instruction', async () => {
      const mockInstruction = {
        instruction: 'check_maturity',
        params: {
          cell_account: 'test-cell-account',
          energy: 150,
          growth_level: 75
        }
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/solana', mockInstruction);
      const response = await solanaPost(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result.result).toHaveProperty('is_mature');
    });

    test('POST should validate instruction parameter', async () => {
      const invalidInstruction = {
        // Missing instruction field
        params: {
          cell_account: 'test-cell-account'
        }
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/solana', invalidInstruction);
      const response = await solanaPost(request);

      expect(response.status).toBe(400);
    });

    test('POST should reject invalid instruction types', async () => {
      const invalidInstruction = {
        instruction: 'invalid_instruction',
        params: {}
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/solana', invalidInstruction);
      const response = await solanaPost(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/cells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json{',
      });

      const response = await cellsPost(request);
      expect(response.status).toBe(500);
    });

    test('should handle missing query parameters', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/cells');
      const response = await cellsGet(request);

      expect(response.status).toBe(400);
    });
  });
});

export {};
