"use client"

import { useState, useCallback } from 'react'
import { useWeb3 } from '@/components/web3-provider'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api'

export interface Market {
  id: string
  protocol: string
  region: string
  slug: string
  title: string
  description: string
  startDate: string
  creationDate: string
  endDate: string
  image: string
  icon: string
  active: boolean
  liquidity?: number
  volume?: number
  markets: any[]
}

export interface OrderParams {
  marketIdOrSlug: string
  positionIdOrName: 'YES' | 'NO'
  buyOrSell: 'BUY' | 'SELL'
  usdcFlowAbs: number
  price?: number
  provider: string
}

export function useBackend() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { walletAddress } = useWeb3()

  const getActiveMarkets = useCallback(async (protocol = 'polymarket', page = 1, limit = 10): Promise<Market[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/markets?protocol=${protocol}&page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Error fetching markets: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getMarketBySlug = useCallback(async (slug: string): Promise<Market[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/markets/slug/${slug}`)
      
      if (!response.ok) {
        throw new Error(`Error fetching market: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const executeOrder = useCallback(async (orderParams: OrderParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/orders/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderParams),
      })
      
      if (!response.ok) {
        throw new Error(`Error executing order: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getUSDCBalance = useCallback(async (): Promise<number> => {
    if (!walletAddress) return 0
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/orders/balance/usdc?walletAddress=${walletAddress}`)
      
      if (!response.ok) {
        throw new Error(`Error fetching USDC balance: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.balance
    } catch (err: any) {
      setError(err.message)
      return 0
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  const searchMarkets = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/markets/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`Error searching markets: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getActiveMarkets,
    getMarketBySlug,
    executeOrder,
    getUSDCBalance,
    searchMarkets
  }
}
