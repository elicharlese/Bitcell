import { type Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js"
import { Buffer } from "buffer"
import type { WalletContextState } from "@solana/wallet-adapter-react"

// Define the instruction types for our Solana program
export enum BitcellInstruction {
  INITIALIZE_CELL = 0,
  DEPOSIT_FUNDS = 1,
  WITHDRAW_PROFITS = 2,
  CHECK_MATURITY = 3,
}

// Define the account data structure that matches our Rust program
export interface BitcellAccountData {
  owner: PublicKey
  lockedFunds: number
  availableProfits: number
  maturityTimestamp: number
  health: number
  activePositions: number
  totalTrades: number
  successRate: number
  isInitialized: boolean
}

// Function to initialize a new Bitcell
export async function initializeCell(
  connection: Connection,
  programId: PublicKey,
  wallet: WalletContextState,
  initialDeposit: number,
  maturityPeriod: number, // in days
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  // Create a new account for the cell
  const [cellAccount] = deriveCellAccount(programId, wallet.publicKey)

  // Create the instruction data
  const dataLayout = Buffer.alloc(9)
  dataLayout.writeUInt8(BitcellInstruction.INITIALIZE_CELL, 0)
  dataLayout.writeUInt32LE(initialDeposit, 1)
  dataLayout.writeUInt32LE(maturityPeriod, 5)

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
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

  // Sign and send the transaction
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

  // Get the cell account
  const [cellAccount] = deriveCellAccount(programId, wallet.publicKey)

  // Create the instruction data
  const dataLayout = Buffer.alloc(5)
  dataLayout.writeUInt8(BitcellInstruction.WITHDRAW_PROFITS, 0)
  dataLayout.writeUInt32LE(amount, 1)

  // Create the instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: cellAccount, isSigner: false, isWritable: true },
    ],
    programId,
    data: dataLayout,
  })

  // Create the transaction
  const transaction = new Transaction().add(instruction)
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

  // Sign and send the transaction
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
      maturityTimestamp: data.readBigUInt64LE(40),
      health: data.readUInt8(48),
      activePositions: data.readUInt8(49),
      totalTrades: data.readUInt16LE(50),
      successRate: data.readUInt8(52),
      isInitialized: Boolean(data.readUInt8(53)),
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
