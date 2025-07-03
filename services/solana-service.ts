import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
  AccountInfo
} from "@solana/web3.js";
import { Buffer } from "buffer";
import type { WalletContextState } from "@solana/wallet-adapter-react";

// Configuration - these would come from environment variables in production
const BITCELL_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_BITCELL_PROGRAM_ID || 
  "11111111111111111111111111111111" // Placeholder
);

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
  "https://api.devnet.solana.com";

// Define the instruction types for our Solana program
export enum BitcellInstruction {
  INITIALIZE_CELL = 0,
  DEPOSIT_FUNDS = 1,
  WITHDRAW_PROFITS = 2,
  CHECK_MATURITY = 3,
  UPDATE_SETTINGS = 4,
}

// Define the account data structure that matches our Rust program
export interface BitcellAccountData {
  owner: PublicKey;
  lockedFunds: number;
  availableProfits: number;
  maturityTimestamp: number;
  health: number;
  activePositions: number;
  totalTrades: number;
  successRate: number;
  isInitialized: boolean;
  riskTolerance: number;
  maxDrawdown: number;
  tradingFrequency: number;
}

// Error types for better error handling
export class SolanaServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SolanaServiceError';
  }
}

// Solana Service - Production-ready integration with BitCell program
export class SolanaService {
  private connection: Connection;
  
  constructor(rpcUrl?: string) {
    this.connection = new Connection(rpcUrl || SOLANA_RPC_URL, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
  }

  /**
   * Create a connection to Solana RPC
   */
  static createConnection(rpcUrl?: string): Connection {
    return new Connection(rpcUrl || SOLANA_RPC_URL, 'confirmed');
  }

  /**
   * Generate a new keypair for a cell account
   */
  static generateCellKeypair(): Keypair {
    return Keypair.generate();
  }

  /**
   * Get the rent-exempt minimum balance for a cell account
   */
  async getRentExemptMinimum(): Promise<number> {
    try {
      const rentExemptMinimum = await this.connection.getMinimumBalanceForRentExemption(
        58 // BitcellAccount::SIZE from Rust program
      );
      return rentExemptMinimum;
    } catch (error) {
      throw new SolanaServiceError('Failed to get rent exempt minimum', 'RENT_ERROR');
    }
  }

  /**
   * Check if a cell account exists and is initialized
   */
  async getCellAccount(cellAddress: PublicKey): Promise<BitcellAccountData | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(cellAddress);
      
      if (!accountInfo) {
        return null;
      }

      if (accountInfo.owner.toString() !== BITCELL_PROGRAM_ID.toString()) {
        throw new SolanaServiceError('Account is not owned by BitCell program', 'INVALID_OWNER');
      }

      // Parse the account data (simplified - would need proper deserialization)
      const data = accountInfo.data;
      if (data.length < 58) {
        throw new SolanaServiceError('Invalid account data size', 'INVALID_DATA');
      }

      // This is a simplified parsing - in production, use borsh deserialization
      const cellData: BitcellAccountData = {
        owner: new PublicKey(data.slice(0, 32)),
        lockedFunds: data.readFloatLE(32),
        availableProfits: data.readFloatLE(36),
        maturityTimestamp: Number(data.readBigUInt64LE(40)),
        health: data.readUInt8(48),
        activePositions: data.readUInt8(49),
        totalTrades: data.readUInt16LE(50),
        successRate: data.readUInt8(52),
        isInitialized: data.readUInt8(53) === 1,
        riskTolerance: data.readUInt8(54),
        maxDrawdown: data.readUInt8(55),
        tradingFrequency: data.readUInt16LE(56),
      };

      return cellData;
    } catch (error) {
      if (error instanceof SolanaServiceError) {
        throw error;
      }
      throw new SolanaServiceError(`Failed to get cell account: ${error}`, 'ACCOUNT_ERROR');
    }
  }

  /**
   * Initialize a new BitCell
   */
  async initializeCell(
    wallet: WalletContextState,
    cellKeypair: Keypair,
    params: {
      initialDeposit: number; // in lamports
      maturityPeriod: number; // in seconds
      riskTolerance: number; // 1-100
      maxDrawdown: number; // 1-100
      tradingFrequency: number; // trades per day
    }
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new SolanaServiceError('Wallet not connected', 'WALLET_ERROR');
    }

    try {
      const rentExemptMinimum = await this.getRentExemptMinimum();
      const totalCost = rentExemptMinimum + params.initialDeposit;

      // Create account instruction
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: cellKeypair.publicKey,
        lamports: rentExemptMinimum,
        space: 58, // BitcellAccount::SIZE
        programId: BITCELL_PROGRAM_ID,
      });

      // Initialize cell instruction
      const initializeCellInstruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: cellKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: BITCELL_PROGRAM_ID,
        data: serializeInitializeCellData(
          params.initialDeposit,
          params.maturityPeriod,
          params.riskTolerance,
          params.maxDrawdown,
          params.tradingFrequency
        ),
      });

      const transaction = new Transaction()
        .add(createAccountInstruction)
        .add(initializeCellInstruction);

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign with both wallet and cell account
      transaction.sign(cellKeypair);
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send and confirm transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      });

      return signature;
    } catch (error) {
      throw new SolanaServiceError(`Failed to initialize cell: ${error}`, 'INIT_ERROR');
    }
  }

  /**
   * Deposit additional funds into an existing cell
   */
  async depositFunds(
    wallet: WalletContextState,
    cellAddress: PublicKey,
    amount: number // in lamports
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new SolanaServiceError('Wallet not connected', 'WALLET_ERROR');
    }

    try {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: cellAddress, isSigner: false, isWritable: true },
        ],
        programId: BITCELL_PROGRAM_ID,
        data: serializeDepositFundsData(amount),
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      });

      return signature;
    } catch (error) {
      throw new SolanaServiceError(`Failed to deposit funds: ${error}`, 'DEPOSIT_ERROR');
    }
  }

  /**
   * Withdraw profits from a mature cell
   */
  async withdrawProfits(
    wallet: WalletContextState,
    cellAddress: PublicKey,
    amount: number // in lamports
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new SolanaServiceError('Wallet not connected', 'WALLET_ERROR');
    }

    try {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: cellAddress, isSigner: false, isWritable: true },
        ],
        programId: BITCELL_PROGRAM_ID,
        data: serializeWithdrawProfitsData(amount),
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      });

      return signature;
    } catch (error) {
      throw new SolanaServiceError(`Failed to withdraw profits: ${error}`, 'WITHDRAW_ERROR');
    }
  }

  /**
   * Check cell maturity status
   */
  async checkMaturity(
    wallet: WalletContextState,
    cellAddress: PublicKey
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new SolanaServiceError('Wallet not connected', 'WALLET_ERROR');
    }

    try {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: cellAddress, isSigner: false, isWritable: false },
        ],
        programId: BITCELL_PROGRAM_ID,
        data: Buffer.from([BitcellInstruction.CHECK_MATURITY]),
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      });

      return signature;
    } catch (error) {
      throw new SolanaServiceError(`Failed to check maturity: ${error}`, 'MATURITY_ERROR');
    }
  }

  /**
   * Update cell settings
   */
  async updateSettings(
    wallet: WalletContextState,
    cellAddress: PublicKey,
    settings: {
      riskTolerance: number;
      maxDrawdown: number;
      tradingFrequency: number;
    }
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new SolanaServiceError('Wallet not connected', 'WALLET_ERROR');
    }

    try {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: cellAddress, isSigner: false, isWritable: true },
        ],
        programId: BITCELL_PROGRAM_ID,
        data: serializeUpdateSettingsData(
          settings.riskTolerance,
          settings.maxDrawdown,
          settings.tradingFrequency
        ),
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight,
      });

      return signature;
    } catch (error) {
      throw new SolanaServiceError(`Failed to update settings: ${error}`, 'SETTINGS_ERROR');
    }
  }
}

// Helper functions for instruction data serialization
function serializeInitializeCellData(
  initialDeposit: number,
  maturityPeriod: number,
  riskTolerance: number,
  maxDrawdown: number,
  tradingFrequency: number
): Buffer {
  const dataLayout = Buffer.alloc(13) // 1 + 4 + 4 + 1 + 1 + 2
  dataLayout.writeUInt8(BitcellInstruction.INITIALIZE_CELL, 0)
  dataLayout.writeUInt32LE(initialDeposit, 1)
  dataLayout.writeUInt32LE(maturityPeriod, 5)
  dataLayout.writeUInt8(riskTolerance, 9)
  dataLayout.writeUInt8(maxDrawdown, 10)
  dataLayout.writeUInt16LE(tradingFrequency, 11)
  return dataLayout
}

function serializeDepositFundsData(amount: number): Buffer {
  const dataLayout = Buffer.alloc(5) // 1 + 4
  dataLayout.writeUInt8(BitcellInstruction.DEPOSIT_FUNDS, 0)
  dataLayout.writeUInt32LE(amount, 1)
  return dataLayout
}

function serializeWithdrawProfitsData(amount: number): Buffer {
  const dataLayout = Buffer.alloc(5) // 1 + 4
  dataLayout.writeUInt8(BitcellInstruction.WITHDRAW_PROFITS, 0)
  dataLayout.writeUInt32LE(amount, 1)
  return dataLayout
}

function serializeUpdateSettingsData(
  riskTolerance: number,
  maxDrawdown: number,
  tradingFrequency: number
): Buffer {
  const dataLayout = Buffer.alloc(5) // 1 + 1 + 1 + 2
  dataLayout.writeUInt8(BitcellInstruction.UPDATE_SETTINGS, 0)
  dataLayout.writeUInt8(riskTolerance, 1)
  dataLayout.writeUInt8(maxDrawdown, 2)
  dataLayout.writeUInt16LE(tradingFrequency, 3)
  return dataLayout
}

// Function to initialize a new Bitcell
export async function initializeCell(
  connection: Connection,
  programId: PublicKey,
  wallet: WalletContextState,
  initialDeposit: number,
  maturityPeriod: number, // in days
  riskTolerance: number = 50,
  maxDrawdown: number = 15,
  tradingFrequency: number = 60
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  // Create a new account for the cell
  const [cellAccount] = deriveCellAccount(programId, wallet.publicKey)

  // Create the instruction data
  const dataLayout = serializeInitializeCellData(
    initialDeposit,
    maturityPeriod,
    riskTolerance,
    maxDrawdown,
    tradingFrequency
  )

  // Create the instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: cellAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data: dataLayout,
  })

  // Create the transaction
  const transaction = new Transaction().add(instruction)
  transaction.feePayer = wallet.publicKey
  
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  // Sign and send the transaction
  const signedTransaction = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

// Function to deposit funds
export async function depositFunds(
  connection: Connection,
  programId: PublicKey,
  wallet: WalletContextState,
  amount: number,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  const [cellAccount] = deriveCellAccount(programId, wallet.publicKey)
  const dataLayout = serializeDepositFundsData(amount)

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: cellAccount, isSigner: false, isWritable: true },
    ],
    programId,
    data: dataLayout,
  })

  const transaction = new Transaction().add(instruction)
  transaction.feePayer = wallet.publicKey
  
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  const signedTransaction = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

// Function to withdraw available profits
export async function withdrawProfits(
  connection: Connection,
  programId: PublicKey,
  wallet: WalletContextState,
  amount: number,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  const [cellAccount] = deriveCellAccount(programId, wallet.publicKey)
  const dataLayout = serializeWithdrawProfitsData(amount)

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: cellAccount, isSigner: false, isWritable: true },
    ],
    programId,
    data: dataLayout,
  })

  const transaction = new Transaction().add(instruction)
  transaction.feePayer = wallet.publicKey
  
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  const signedTransaction = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

// Function to update cell settings
export async function updateSettings(
  connection: Connection,
  programId: PublicKey,
  wallet: WalletContextState,
  riskTolerance: number,
  maxDrawdown: number,
  tradingFrequency: number,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  const [cellAccount] = deriveCellAccount(programId, wallet.publicKey)
  const dataLayout = serializeUpdateSettingsData(riskTolerance, maxDrawdown, tradingFrequency)

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      { pubkey: cellAccount, isSigner: false, isWritable: true },
    ],
    programId,
    data: dataLayout,
  })

  const transaction = new Transaction().add(instruction)
  transaction.feePayer = wallet.publicKey
  
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  const signedTransaction = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

// Function to fetch the Bitcell account data
export async function fetchBitcellData(
  connection: Connection,
  programId: PublicKey,
  owner: PublicKey,
): Promise<BitcellAccountData | null> {
  try {
    // Get the cell account
    const [cellAccount] = deriveCellAccount(programId, owner)

    const accountInfo = await connection.getAccountInfo(cellAccount)

    if (!accountInfo) {
      return null
    }

    // Parse the account data according to our Rust program's data structure
    const data = accountInfo.data

    return {
      owner: new PublicKey(data.slice(0, 32)),
      lockedFunds: data.readFloatLE(32),
      availableProfits: data.readFloatLE(36),
      maturityTimestamp: Number(data.readBigUInt64LE(40)),
      health: data.readUInt8(48),
      activePositions: data.readUInt8(49),
      totalTrades: data.readUInt16LE(50),
      successRate: data.readUInt8(52),
      isInitialized: Boolean(data.readUInt8(53)),
      riskTolerance: data.readUInt8(54),
      maxDrawdown: data.readUInt8(55),
      tradingFrequency: data.readUInt16LE(56),
    }
  } catch (error) {
    console.error("Error fetching Bitcell data:", error)
    return null
  }
}

// Function to derive the cell account address for a user
export function deriveCellAccount(programId: PublicKey, owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("bitcell"), owner.toBuffer()], programId)
}
