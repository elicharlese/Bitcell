/**
 * Integration tests for BitCell Solana Program
 * These tests verify the complete flow from frontend to blockchain
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { 
  Connection, 
  Keypair, 
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { SolanaService, BitcellInstruction } from '../services/solana-service';

// Test configuration
const TEST_RPC_URL = process.env.TEST_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_BITCELL_PROGRAM_ID || '11111111111111111111111111111111');

describe('BitCell Solana Program Integration', () => {
  let connection: Connection;
  let payer: Keypair;
  let service: SolanaService;

  beforeAll(async () => {
    connection = new Connection(TEST_RPC_URL, 'confirmed');
    service = new SolanaService(TEST_RPC_URL);
    
    // Generate a test keypair (in real tests, you'd fund this from a faucet)
    payer = Keypair.generate();
    
    // Request airdrop for testing (devnet only)
    try {
      const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);
      console.log('Test account funded with 2 SOL');
    } catch (error) {
      console.warn('Airdrop failed, tests may fail due to insufficient funds:', error);
    }
  });

  describe('Cell Initialization', () => {
    test('should create a new cell account', async () => {
      const cellKeypair = Keypair.generate();
      const mockWallet = {
        publicKey: payer.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(payer);
          return tx;
        },
      };

      const signature = await service.initializeCell(mockWallet as any, cellKeypair, {
        initialDeposit: 0.1 * LAMPORTS_PER_SOL,
        maturityPeriod: 30 * 24 * 60 * 60, // 30 days
        riskTolerance: 50,
        maxDrawdown: 20,
        tradingFrequency: 10,
      });

      expect(signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/); // Valid Solana signature format
      
      // Verify the account was created
      const cellData = await service.getCellAccount(cellKeypair.publicKey);
      expect(cellData).not.toBeNull();
      expect(cellData?.isInitialized).toBe(true);
      expect(cellData?.owner).toEqual(payer.publicKey);
    }, 30000);

    test('should fail with insufficient funds', async () => {
      const poorPayer = Keypair.generate(); // No funds
      const cellKeypair = Keypair.generate();
      const mockWallet = {
        publicKey: poorPayer.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(poorPayer);
          return tx;
        },
      };

      await expect(
        service.initializeCell(mockWallet as any, cellKeypair, {
          initialDeposit: 0.1 * LAMPORTS_PER_SOL,
          maturityPeriod: 30 * 24 * 60 * 60,
          riskTolerance: 50,
          maxDrawdown: 20,
          tradingFrequency: 10,
        })
      ).rejects.toThrow();
    }, 10000);
  });

  describe('Cell Operations', () => {
    let cellKeypair: Keypair;
    let mockWallet: any;

    beforeAll(async () => {
      cellKeypair = Keypair.generate();
      mockWallet = {
        publicKey: payer.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(payer);
          return tx;
        },
      };

      // Create a cell for testing operations
      await service.initializeCell(mockWallet, cellKeypair, {
        initialDeposit: 0.1 * LAMPORTS_PER_SOL,
        maturityPeriod: 30 * 24 * 60 * 60,
        riskTolerance: 50,
        maxDrawdown: 20,
        tradingFrequency: 10,
      });
    });

    test('should deposit additional funds', async () => {
      const depositAmount = 0.05 * LAMPORTS_PER_SOL;
      
      const signature = await service.depositFunds(
        mockWallet,
        cellKeypair.publicKey,
        depositAmount
      );

      expect(signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/);
      
      // Verify the deposit was recorded
      const cellData = await service.getCellAccount(cellKeypair.publicKey);
      expect(cellData?.lockedFunds).toBeGreaterThan(0.1 * LAMPORTS_PER_SOL);
    }, 30000);

    test('should update cell settings', async () => {
      const newSettings = {
        riskTolerance: 75,
        maxDrawdown: 15,
        tradingFrequency: 20,
      };

      const signature = await service.updateSettings(
        mockWallet,
        cellKeypair.publicKey,
        newSettings
      );

      expect(signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/);
      
      // Verify the settings were updated
      const cellData = await service.getCellAccount(cellKeypair.publicKey);
      expect(cellData?.riskTolerance).toBe(75);
      expect(cellData?.maxDrawdown).toBe(15);
      expect(cellData?.tradingFrequency).toBe(20);
    }, 30000);

    test('should check maturity status', async () => {
      const signature = await service.checkMaturity(
        mockWallet,
        cellKeypair.publicKey
      );

      expect(signature).toMatch(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/);
    }, 30000);
  });

  describe('Error Handling', () => {
    test('should handle invalid cell address', async () => {
      const invalidAddress = Keypair.generate().publicKey;
      
      const cellData = await service.getCellAccount(invalidAddress);
      expect(cellData).toBeNull();
    });

    test('should reject unauthorized operations', async () => {
      const cellKeypair = Keypair.generate();
      const unauthorizedPayer = Keypair.generate();
      const mockWallet = {
        publicKey: payer.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(payer);
          return tx;
        },
      };

      // Create a cell
      await service.initializeCell(mockWallet, cellKeypair, {
        initialDeposit: 0.1 * LAMPORTS_PER_SOL,
        maturityPeriod: 30 * 24 * 60 * 60,
        riskTolerance: 50,
        maxDrawdown: 20,
        tradingFrequency: 10,
      });

      // Try to operate with unauthorized wallet
      const unauthorizedWallet = {
        publicKey: unauthorizedPayer.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(unauthorizedPayer);
          return tx;
        },
      };

      await expect(
        service.depositFunds(
          unauthorizedWallet as any,
          cellKeypair.publicKey,
          0.01 * LAMPORTS_PER_SOL
        )
      ).rejects.toThrow();
    }, 30000);
  });

  afterAll(async () => {
    // Cleanup test accounts if needed
    console.log('Integration tests completed');
  });
});

export {};
