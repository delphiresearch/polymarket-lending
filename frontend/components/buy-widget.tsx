"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWeb3 } from "./web3-provider"
import { useBackend } from "@/hooks/useBackend"

export function BuyWidget() {
  const [amount, setAmount] = useState("")
  const { isWalletConnected, connectWallet } = useWeb3()
  const [activeTab, setActiveTab] = useState("supply")

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 数値のみ許可
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value)
    }
  }

  const handleMaxClick = () => {
    // デモ用に最大値を設定
    setAmount("1000")
  }

  const { executeOrder, loading, error } = useBackend()
  const [txStatus, setTxStatus] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isWalletConnected) {
      connectWallet()
      return
    }

    try {
      setTxStatus("Processing transaction...")
      
      const selectedMarketId = "your-selected-market-id"
      
      const orderParams = {
        marketIdOrSlug: selectedMarketId,
        positionIdOrName: "YES", // Assuming "YES" position for supply
        buyOrSell: activeTab === "supply" ? "BUY" : "SELL",
        usdcFlowAbs: parseFloat(amount),
        provider: "polymarket"
      }
      
      const result = await executeOrder(orderParams)
      
      setTxStatus("Transaction successful!")
      console.log("Transaction result:", result)
      
      setTimeout(() => setTxStatus(null), 3000)
    } catch (err: any) {
      setTxStatus(`Transaction failed: ${err.message}`)
      console.error("Transaction error:", err)
      
      setTimeout(() => setTxStatus(null), 5000)
    }
  }

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium text-gray-100">Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="supply" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="supply">Supply</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="supply">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="amount" className="text-xs text-gray-400">
                    Amount
                  </label>
                  <button type="button" onClick={handleMaxClick} className="text-xs text-blue-400 hover:text-blue-300">
                    Max
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">USDC</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Expected Yield</span>
                  <span className="text-green-400">+7.5%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Settlement Date</span>
                  <span className="text-gray-300">2025-06-12</span>
                </div>
              </div>

              {txStatus && (
                <div className={`text-sm mb-2 ${txStatus.includes("failed") ? "text-red-400" : "text-green-400"}`}>
                  {txStatus}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {!isWalletConnected 
                  ? "Connect Wallet" 
                  : loading 
                    ? "Processing..." 
                    : "Supply"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="withdraw">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="withdraw-amount" className="text-xs text-gray-400">
                    Amount
                  </label>
                  <button type="button" onClick={handleMaxClick} className="text-xs text-blue-400 hover:text-blue-300">
                    Max
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="withdraw-amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">USDC</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current Position</span>
                  <span className="text-gray-300">500 USDC</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current PnL</span>
                  <span className="text-green-400">+3.2%</span>
                </div>
              </div>

              {txStatus && (
                <div className={`text-sm mb-2 ${txStatus.includes("failed") ? "text-red-400" : "text-green-400"}`}>
                  {txStatus}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {!isWalletConnected 
                  ? "Connect Wallet" 
                  : loading 
                    ? "Processing..." 
                    : "Withdraw"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
