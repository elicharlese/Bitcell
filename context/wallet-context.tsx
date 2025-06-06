"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from "react"
import { PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js"
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

// Define the program ID for our Solana program
const PROGRAM_ID = new PublicKey("BitC1177777777777777777777777777777777777777")

// Define the network to connect to
const NETWORK = WalletAdapterNetwork.Devnet
const endpoint = clusterApiUrl(NETWORK)

// Define the wallet context type
interface BitcellWalletContextType {
  balance: number
  programId: PublicKey
}

// Create the wallet context
const BitcellWalletContext = createContext<BitcellWalletContextType>({
  balance: 0,
  programId: PROGRAM_ID,
})

// Create a hook to use the wallet context
export const useBitcellWallet = () => useContext(BitcellWalletContext)

// Create the wallet context provider
function BitcellWalletProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection()
  const { publicKey } = useSolanaWallet()
  const [balance, setBalance] = useState(0)

  // Update the balance when the public key changes
  useEffect(() => {
    if (!publicKey) {
      setBalance(0)
      return
    }

    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error("Error fetching balance:", error)
      }
    }

    fetchBalance()

    // Set up an interval to update the balance
    const intervalId = setInterval(fetchBalance, 10000)

    return () => clearInterval(intervalId)
  }, [publicKey, connection])

  return (
    <BitcellWalletContext.Provider
      value={{
        balance,
        programId: PROGRAM_ID,
      }}
    >
      {children}
    </BitcellWalletContext.Provider>
  )
}

// Create the wallet context provider wrapper
export function WalletContextProvider({ children }: { children: ReactNode }) {
  // Set up the wallet adapters
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BitcellWalletProvider>{children}</BitcellWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

// Export the useWallet hook from @solana/wallet-adapter-react for convenience
export const useWallet = useSolanaWallet
