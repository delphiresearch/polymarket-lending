"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Create a context for Web3 state
type Web3ContextType = {
  isWalletConnected: boolean
  connectWallet: () => Promise<void>
  walletAddress: string | null
}

const Web3Context = createContext<Web3ContextType>({
  isWalletConnected: false,
  connectWallet: async () => {},
  walletAddress: null,
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Safely check for ethereum
  const getEthereum = () => {
    if (typeof window !== "undefined") {
      // Return the ethereum object without modifying it
      return typeof window.ethereum !== "undefined" ? window.ethereum : null
    }
    return null
  }

  // Connect wallet function
  const connectWallet = async () => {
    const ethereum = getEthereum()
    if (!ethereum) {
      console.log("Please install MetaMask or another Web3 wallet")
      return
    }

    try {
      // Request account access with error handling
      const accounts = await ethereum.request({ method: "eth_requestAccounts" }).catch((error: any) => {
        console.error("User denied account access", error)
        return []
      })

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsWalletConnected(true)
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error)
    }
  }

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = getEthereum()
      if (!ethereum) return

      try {
        // Use a try-catch block to safely request accounts
        const accounts = await ethereum.request({ method: "eth_accounts" }).catch(() => [])
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }

    checkConnection()
  }, [])

  return (
    <Web3Context.Provider
      value={{
        isWalletConnected,
        connectWallet,
        walletAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

// Hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context)
