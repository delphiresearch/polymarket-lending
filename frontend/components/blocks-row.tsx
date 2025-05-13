"use client"

import { CardContent } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { MarketDescription } from "./market-description"
import { useWeb3 } from "./web3-provider"

// データを更新: 左側は日数が大きい順に並べる（点線に近づくほど日数が少なくなる）
// 価格をすべて90%以上に調整、利益率を10%以下に調整
const activeMarkets = [
  {
    id: 1,
    name: "Tech Earnings Q2",
    daysRemaining: 12,
    yieldRange: "+7.5%",
    yieldLoss: "-3.2%",
    avgPrice: 0.94,
    priceChange24h: "+0.05%",
    volume: 1.23,
    marketCap: 2.45,
    settlementDate: "20250612", // 決済日時
    markets: [
      { id: 101, name: "AAPL Beats Q2 EPS", proportion: 0.25, price: 0.95, category: "Tech", remainingHours: 288 },
      { id: 102, name: "MSFT Revenue > $50B", proportion: 0.2, price: 0.93, category: "Tech", remainingHours: 264 },
      { id: 103, name: "GOOGL Ad Revenue Growth", proportion: 0.3, price: 0.92, category: "Tech", remainingHours: 240 },
      { id: 104, name: "AMZN AWS Growth > 20%", proportion: 0.15, price: 0.97, category: "Tech", remainingHours: 216 },
      { id: 105, name: "META DAU Increase", proportion: 0.1, price: 0.91, category: "Tech", remainingHours: 192 },
    ],
  },
  {
    id: 2,
    name: "Crypto Q3",
    daysRemaining: 9,
    yieldRange: "+6.8%",
    yieldLoss: "-4.7%",
    avgPrice: 0.93,
    priceChange24h: "-0.03%",
    volume: 0.98,
    marketCap: 1.87,
    settlementDate: "20250509", // 決済日時
    markets: [
      { id: 201, name: "BTC > $70K by Sep", proportion: 0.35, price: 0.94, category: "Crypto", remainingHours: 216 },
      { id: 202, name: "ETH > $4K by Sep", proportion: 0.25, price: 0.92, category: "Crypto", remainingHours: 192 },
      { id: 203, name: "SOL > $150 by Sep", proportion: 0.2, price: 0.9, category: "Crypto", remainingHours: 168 },
      { id: 204, name: "New BTC ATH in Q3", proportion: 0.2, price: 0.96, category: "Crypto", remainingHours: 144 },
    ],
  },
  {
    id: 3,
    name: "Fed Policy 2025",
    daysRemaining: 6,
    yieldRange: "+5.2%",
    yieldLoss: "-6.1%",
    avgPrice: 0.91,
    priceChange24h: "+0.02%",
    volume: 1.45,
    marketCap: 3.1,
    settlementDate: "20250506", // 決済日時
    markets: [
      { id: 301, name: "Fed Cuts Rates in Q1", proportion: 0.4, price: 0.92, category: "Finance", remainingHours: 144 },
      {
        id: 302,
        name: "Inflation < 2.5% by Q2",
        proportion: 0.3,
        price: 0.9,
        category: "Finance",
        remainingHours: 120,
      },
      { id: 303, name: "Unemployment < 4%", proportion: 0.3, price: 0.91, category: "Finance", remainingHours: 96 },
    ],
  },
  {
    id: 4,
    name: "AI Developments",
    daysRemaining: 3,
    yieldRange: "+9.8%",
    yieldLoss: "-2.3%",
    avgPrice: 0.96,
    priceChange24h: "+0.08%",
    volume: 0.76,
    marketCap: 1.54,
    settlementDate: "20250503", // 決済日時
    markets: [
      {
        id: 401,
        name: "GPT-5 Release in 2025",
        position: "Candidate Y",
        proportion: 0.3,
        price: 0.97,
        category: "AI",
        remainingHours: 0.03,
      },
      {
        id: 402,
        name: "Google Gemini Pro+",
        position: "No",
        proportion: 0.25,
        price: 0.95,
        category: "AI",
        remainingHours: 2,
      },
      {
        id: 403,
        name: "AI Regulation in US",
        position: "Team B",
        proportion: 0.25,
        price: 0.94,
        category: "AI",
        remainingHours: 3,
      },
      {
        id: 404,
        name: "Open Source LLM > 100B",
        position: "Candidate Y",
        proportion: 0.2,
        price: 0.98,
        category: "AI",
        remainingHours: 4,
      },
    ],
  },
]

// 期限切れの市場 - 利益率を10%以下に調整
const expiredMarkets = [
  {
    id: 101,
    name: "Q1 Earnings",
    daysRemaining: 0,
    yieldRange: "+6.8%",
    yieldLoss: "-3%",
    avgPrice: 0.95,
    priceChange24h: "+0.00%",
    volume: 0.05,
    marketCap: 0.12,
    settlementDate: "20250430", // 決済日時
    markets: [
      {
        id: 1101,
        name: "Tech Sector Earnings Beat",
        proportion: 0.4,
        price: 0.96,
        category: "Finance",
        remainingHours: 0,
      },
      {
        id: 1102,
        name: "Banking Sector Performance",
        proportion: 0.3,
        price: 0.94,
        category: "Finance",
        remainingHours: 0,
      },
      { id: 1103, name: "Retail Sales Growth", proportion: 0.3, price: 0.95, category: "Finance", remainingHours: 0 },
    ],
    expired: true,
  },
  {
    id: 102,
    name: "Sports Championships",
    daysRemaining: 0,
    yieldRange: "+8.2%",
    yieldLoss: "-2%",
    avgPrice: 0.97,
    priceChange24h: "+0.00%",
    volume: 0.03,
    marketCap: 0.08,
    settlementDate: "20250428", // 決済日時
    markets: [
      { id: 1201, name: "NBA Finals Winner", proportion: 0.5, price: 0.98, category: "Sports", remainingHours: 0 },
      { id: 1202, name: "UEFA Champions League", proportion: 0.5, price: 0.96, category: "Sports", remainingHours: 0 },
    ],
    expired: true,
  },
  {
    id: 103,
    name: "Political Events",
    daysRemaining: 0,
    yieldRange: "+5.7%",
    yieldLoss: "-9%",
    avgPrice: 0.92,
    priceChange24h: "+0.00%",
    volume: 0.02,
    marketCap: 0.05,
    settlementDate: "20250425", // 決済日時
    markets: [
      { id: 1301, name: "Election Outcome", proportion: 0.6, price: 0.93, category: "Politics", remainingHours: 0 },
      {
        id: 1302,
        name: "Policy Implementation",
        proportion: 0.4,
        price: 0.91,
        category: "Politics",
        remainingHours: 0,
      },
    ],
    expired: true,
  },
  {
    id: 104,
    name: "Tech Innovation",
    daysRemaining: 0,
    yieldRange: "+9.2%",
    yieldLoss: "-4%",
    avgPrice: 0.94,
    priceChange24h: "+0.00%",
    volume: 0.04,
    marketCap: 0.09,
    settlementDate: "20250422", // 決済日時
    markets: [
      { id: 1401, name: "New Smartphone Release", proportion: 0.6, price: 0.95, category: "Tech", remainingHours: 0 },
      { id: 1402, name: "Cloud Computing Growth", proportion: 0.4, price: 0.93, category: "Tech", remainingHours: 0 },
    ],
    expired: true,
  },
  {
    id: 105,
    name: "Energy Markets",
    daysRemaining: 0,
    yieldRange: "+7.3%",
    yieldLoss: "-6%",
    avgPrice: 0.93,
    priceChange24h: "+0.00%",
    volume: 0.03,
    marketCap: 0.07,
    settlementDate: "20250420", // 決済日時
    markets: [
      { id: 1501, name: "Oil Price Forecast", proportion: 0.5, price: 0.92, category: "Energy", remainingHours: 0 },
      {
        id: 1502,
        name: "Renewable Energy Growth",
        proportion: 0.5,
        price: 0.94,
        category: "Energy",
        remainingHours: 0,
      },
    ],
    expired: true,
  },
  {
    id: 106,
    name: "Healthcare Trends",
    daysRemaining: 0,
    yieldRange: "+8.5%",
    yieldLoss: "-5%",
    avgPrice: 0.95,
    priceChange24h: "+0.00%",
    volume: 0.02,
    marketCap: 0.06,
    settlementDate: "20250418", // 決済日時
    markets: [
      {
        id: 1601,
        name: "Pharmaceutical Breakthroughs",
        proportion: 0.6,
        price: 0.96,
        category: "Health",
        remainingHours: 0,
      },
      {
        id: 1602,
        name: "Healthcare Policy Changes",
        proportion: 0.4,
        price: 0.94,
        category: "Health",
        remainingHours: 0,
      },
    ],
    expired: true,
  },
]

// Category colors for the market segments
const categoryColors: Record<string, string> = {
  Tech: "bg-blue-600",
  Crypto: "bg-purple-600",
  Finance: "bg-green-600",
  AI: "bg-indigo-600",
  Climate: "bg-teal-600",
  Entertainment: "bg-pink-600",
  Health: "bg-red-600",
  Space: "bg-cyan-600",
  Transport: "bg-amber-600",
  Geopolitics: "bg-orange-600",
  Energy: "bg-yellow-600",
  Sports: "bg-rose-600",
  Politics: "bg-violet-600",
}

export function BlocksRow() {
  const [selectedIndex, setSelectedIndex] = useState<any | null>(null)
  const { walletAddress } = useWeb3()

  const handleIndexClick = (index: any) => {
    // 同じインデックスをクリックした場合は詳細ビューを閉じる
    if (selectedIndex?.id === index.id) {
      setSelectedIndex(null)
    } else {
      setSelectedIndex(index)
    }
  }

  return (
    <div className="space-y-4">
      <div className="scrollable-container pb-2 pt-10">
        <div className="flex space-x-4 pb-2 relative">
          {/* Active Markets */}
          {activeMarkets.map((index) => (
            <IndexBlock
              key={index.id}
              index={index}
              isSelected={selectedIndex?.id === index.id}
              onClick={() => handleIndexClick(index)}
            />
          ))}

          {/* 点線をボックス間に配置 */}
          <div className="border-r border-dashed border-white/10 h-[130px] self-center mx-2"></div>

          {/* Expired Markets */}
          {expiredMarkets.map((index) => (
            <IndexBlock
              key={index.id}
              index={index}
              isSelected={selectedIndex?.id === index.id}
              onClick={() => handleIndexClick(index)}
              isExpired
            />
          ))}
        </div>
      </div>

      {/* Index Details Section - MarketDescriptionに置き換え */}
      {selectedIndex && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            <MarketDescription index={selectedIndex} categoryColors={categoryColors} />
          </div>
          <div className="lg:col-span-1">
            <BuyWidget index={selectedIndex} />
          </div>
        </div>
      )}
    </div>
  )
}

function IndexBlock({
  index,
  isSelected,
  onClick,
  isExpired = false,
}: {
  index: any
  isSelected: boolean
  onClick: () => void
  isExpired?: boolean
}) {
  const gradientClass = isExpired ? "luxury-gradient-block" : "luxury-gradient-mempool"

  // Determine if price change is positive or negative
  const isPriceChangePositive = index.priceChange24h.startsWith("+")

  return (
    <Card
      className={`block-card flex flex-col items-center justify-between p-3 rounded-md ${gradientClass} transition-all hover:scale-105 cursor-pointer ${isSelected ? "luxury-highlight" : ""} luxury-shadow group relative`}
      onClick={onClick}
    >
      {/* Settlement date tooltip on hover - 位置とz-indexを調整 */}
      <div className="absolute top-0 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-10 text-center z-20">
        <div className="bg-gray-800 text-gray-200 text-xs py-1 px-2 rounded inline-block shadow-lg">
          {index.settlementDate}
        </div>
      </div>

      <div className="w-full flex justify-start items-start">
        <div className="text-left">
          {isExpired ? (
            <div className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full inline-block">
              Expired
            </div>
          ) : (
            <div className="text-gray-300 text-xs">{index.daysRemaining} days</div>
          )}
        </div>
      </div>

      <div className="w-full text-center my-2">
        {isExpired ? (
          // 期限切れの場合は確定利益のみを表示
          <div className="font-medium text-gray-200">
            <span className="text-2xl font-bold text-green-400">{index.yieldRange}</span>
          </div>
        ) : (
          // アクティブな市場の場合は従来通り利益と損失の範囲を表示
          <div className="font-medium text-gray-200">
            <span className="text-xs text-gray-400">{index.yieldLoss}</span>
            <span className="text-xs text-gray-400"> ~ </span>
            <span className="text-xl font-bold">{index.yieldRange}</span>
          </div>
        )}
      </div>

      <div className="w-full flex justify-between items-end">
        <div className="text-left">
          <div className="text-xs text-gray-400">Avg</div>
          <div className="font-mono text-sm font-medium text-gray-200">${index.avgPrice.toFixed(2)}</div>
        </div>
        {!isExpired && (
          <div className="text-right">
            <div className={`text-xs ${isPriceChangePositive ? "text-green-400" : "text-red-400"}`}>
              {index.priceChange24h}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Buy Widgetコンポーネント - 選択されたインデックスのデータを受け取るように修正
function BuyWidget({ index }: { index: any }) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isWalletConnected) {
      connectWallet()
      return
    }

    // 実際のトランザクション処理はここに実装
    alert(`${activeTab === "supply" ? "Supply" : "Withdraw"} ${amount} submitted for ${index.name}`)
  }

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow overflow-hidden">
      <CardHeader className="pb-2 border-b border-gray-800">
        <CardTitle className="text-md font-medium text-gray-100">Trade</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="supply" className="w-full" onValueChange={setActiveTab}>
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-2 mb-6 rounded-full h-10 p-1 bg-gray-800/50 w-full">
              <TabsTrigger
                value="supply"
                className="rounded-full text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
              >
                Supply
              </TabsTrigger>
              <TabsTrigger
                value="withdraw"
                className="rounded-full text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
              >
                Withdraw
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="supply" className="px-4 pb-4 mt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="amount" className="text-xs text-gray-400">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Max
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="pr-16 h-12 bg-gray-800/30 border-gray-700 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">USDC</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-800/20 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Expected Yield</span>
                  <span className="text-green-400 font-medium">{index.yieldRange}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Settlement Date</span>
                  <span className="text-gray-300">{index.settlementDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current Price</span>
                  <span className="text-gray-300">${index.avgPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
              >
                {isWalletConnected ? "Supply" : "Connect Wallet"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="withdraw" className="px-4 pb-4 mt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="withdraw-amount" className="text-xs text-gray-400">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Max
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="withdraw-amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="pr-16 h-12 bg-gray-800/30 border-gray-700 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">USDC</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-800/20 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current Position</span>
                  <span className="text-gray-300">500 USDC</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current PnL</span>
                  <span className="text-green-400 font-medium">+3.2%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Market Price</span>
                  <span className="text-gray-300">${index.avgPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
              >
                {isWalletConnected ? "Withdraw" : "Connect Wallet"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// 必要なコンポーネントのインポート
import { CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
