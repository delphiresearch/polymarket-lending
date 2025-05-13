"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Info, Clock, TrendingUp, DollarSign, BarChart2, Calendar, Percent, ExternalLink } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// 選択されたインデックスのデータを受け取るように修正
export function MarketDescription({ index, categoryColors }: { index: any; categoryColors: Record<string, string> }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [pnlData, setPnlData] = useState<{ day: number; value: number }[]>([])

  // 1秒ごとにカウントダウンを更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // PnLデータを生成
  useEffect(() => {
    setPnlData(generatePnLData(30))
  }, [])

  // PnLデータを生成（モックデータ）
  const generatePnLData = (days: number) => {
    let value = 0
    const data = []
    for (let i = 0; i < days; i++) {
      // ランダムな変動を加える（-3%〜+3%）
      const change = (Math.random() * 6 - 3) / 100
      value = value + change
      data.push({ day: i, value })
    }
    return data
  }

  // 残り時間のフォーマット
  const formatRemainingTime = (hours: number) => {
    if (index.expired) return "Expired"

    if (hours === 0) return "Expired"

    if (hours < 1) {
      // 1時間未満の場合、分と秒を計算
      const totalSeconds = hours * 3600
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = Math.floor(totalSeconds % 60) - (currentTime.getSeconds() % 60)

      // 秒が負の場合の調整
      const adjustedSeconds = seconds < 0 ? 60 + seconds : seconds
      const adjustedMinutes = seconds < 0 ? minutes - 1 : minutes

      return `${adjustedMinutes}m ${adjustedSeconds}s`
    } else if (hours < 24) {
      // 24時間未満の場合は時間
      return `${Math.floor(hours)} hours`
    } else {
      // 24時間以上の場合は日数
      return `${Math.floor(hours / 24)} days`
    }
  }

  // 市場の位置情報を生成
  const getPositionValue = (market: any, idx: number) => {
    if (market.position) return market.position

    const positions = ["Yes", "No", "Team A", "Team B", "Candidate X", "Candidate Y"]
    // 市場IDとインデックスを使用して一貫した位置を生成
    const positionIndex = (market.id + idx) % positions.length
    return positions[positionIndex]
  }

  // プラットフォーム情報を生成
  const getPlatformInfo = (market: any) => {
    // 市場IDに基づいて一貫したプラットフォーム情報を生成
    const platforms = [
      {
        name: "Polymarket",
        icon: "/polymarket-logo.png",
        url: "https://polymarket.com",
      },
      {
        name: "Kalshi",
        icon: "/kalshi-logo.png",
        url: "https://kalshi.com",
      },
      {
        name: "Manifold",
        icon: "/manifold-markets-logo.png",
        url: "https://manifold.markets",
      },
      {
        name: "Metaculus",
        icon: "/metaculus-logo.png",
        url: "https://metaculus.com",
      },
      {
        name: "PredictIt",
        icon: "/predictit-logo.png",
        url: "https://predictit.org",
      },
    ]

    return platforms[market.id % platforms.length]
  }

  // 外部リンクを開く
  const openExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // 現在のPnL値を計算
  const currentPnL = pnlData.length > 0 ? pnlData[pnlData.length - 1].value : 0
  const pnlText = `${currentPnL >= 0 ? "+" : ""}${(currentPnL * 100).toFixed(2)}%`
  const pnlColor = currentPnL >= 0 ? "#4CAF50" : "#F44336"

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium text-gray-100">Market Description</CardTitle>
        <Info size={16} className="text-gray-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 市場概要情報 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <DetailItem
            icon={<DollarSign className="h-5 w-5 text-blue-400" />}
            label="Average Price"
            value={`$${index.avgPrice.toFixed(2)}`}
          />
          {!index.expired && (
            <DetailItem
              icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
              label="24h Change"
              value={
                <span className={index.priceChange24h.startsWith("+") ? "text-green-400" : "text-red-400"}>
                  {index.priceChange24h}
                </span>
              }
            />
          )}
          <DetailItem
            icon={<BarChart2 className="h-5 w-5 text-blue-400" />}
            label="Volume"
            value={`$${index.volume.toFixed(2)}M`}
          />
          <DetailItem
            icon={<Calendar className="h-5 w-5 text-blue-400" />}
            label="Status"
            value={
              index.expired ? (
                <span className="bg-green-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">Expired</span>
              ) : (
                <span>{index.daysRemaining} days remaining</span>
              )
            }
          />
          <DetailItem
            icon={<Percent className="h-5 w-5 text-blue-400" />}
            label={index.expired ? "Confirmed Yield" : "Estimated Yield Range"}
            value={
              index.expired ? (
                <span className="text-green-400 font-bold text-2xl">{index.yieldRange}</span>
              ) : (
                <span>
                  <span className="text-red-400">{index.yieldLoss}</span>
                  <span className="text-gray-400"> ~ </span>
                  <span className="text-green-400 font-bold">{index.yieldRange}</span>
                </span>
              )
            }
          />
        </div>

        {/* Supply Info with PnL Chart - Rechartsを使用 */}
        <div className="bg-gray-800/20 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-200 flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-blue-400" />
              Supply Info
            </h4>
            <div className="text-right px-3 py-1 rounded-full bg-gray-800/50">
              <span style={{ color: pnlColor }} className="font-bold text-sm">
                {pnlText}
              </span>
            </div>
          </div>
          <div className="h-[180px] w-full bg-gray-800/30 rounded-md overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A7AFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4A7AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#a0a0a0", fontSize: 10 }}
                  tickFormatter={(value) => (value === 0 ? "30 days ago" : value === 29 ? "Today" : "")}
                  axisLine={{ stroke: "#2A3040" }}
                />
                <YAxis
                  tick={{ fill: "#a0a0a0", fontSize: 10 }}
                  tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                  axisLine={{ stroke: "#2A3040" }}
                />
                <Tooltip
                  formatter={(value: any) => [`${(value * 100).toFixed(2)}%`, "PnL"]}
                  labelFormatter={(label) => `Day ${30 - label}`}
                  contentStyle={{ backgroundColor: "#1e2433", borderColor: "#2A3040" }}
                />
                <Area type="monotone" dataKey="value" stroke="#4A7AFF" fillOpacity={1} fill="url(#pnlGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pt-1 w-[220px] font-medium">Market</th>
                <th className="pb-3 pt-1 w-[100px] font-medium">Position</th>
                <th className="pb-3 pt-1 w-[120px] font-medium">Category</th>
                <th className="pb-3 pt-1 w-[120px] font-medium">Platform</th>
                <th className="pb-3 pt-1 w-[120px] text-right font-medium">Market Volume</th>
                <th className="pb-3 pt-1 w-[80px] text-right font-medium">Weight</th>
                <th className="pb-3 pt-1 w-[80px] text-right font-medium">Price</th>
                <th className="pb-3 pt-1 w-[120px] text-right font-medium">Remaining Time</th>
                <th className="pb-3 pt-1 w-[80px] text-right font-medium">Status</th>
                <th className="pb-3 pt-1 w-[50px] text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {index.markets.map((market: any, idx: number) => {
                const platform = getPlatformInfo(market)
                return (
                  <tr key={market.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-2 text-gray-200 w-[220px]">
                      <div className="truncate max-w-[200px]">{market.name}</div>
                    </td>
                    <td className="py-2 text-gray-200 w-[100px]">{getPositionValue(market, idx)}</td>
                    <td className="py-2 w-[120px]">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          categoryColors[market.category] || "bg-gray-600"
                        } text-white`}
                      >
                        {market.category}
                      </span>
                    </td>
                    <td className="py-2 w-[120px]">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={platform.icon || "/placeholder.svg"} alt={platform.name} />
                          <AvatarFallback>{platform.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-gray-300 text-xs">{platform.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right text-gray-300 w-[120px]">
                      ${(market.price * market.proportion * 10).toFixed(2)}M
                    </td>
                    <td className="py-2 text-right text-gray-300 w-[80px]">{(market.proportion * 100).toFixed(0)}%</td>
                    <td className="py-2 text-right text-gray-200 w-[80px]">${market.price.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-200 w-[120px]">
                      <div className="flex items-center justify-end">
                        <Clock className="h-3 w-3 text-blue-400 mr-1" />
                        {formatRemainingTime(market.remainingHours || 0)}
                      </div>
                    </td>
                    <td className="py-2 text-right w-[80px]">
                      <span className={index.expired ? "text-green-400" : "text-blue-400"}>
                        {index.expired ? "Settled" : "Active"}
                      </span>
                    </td>
                    <td className="py-2 text-right w-[50px]">
                      <button
                        onClick={() => openExternalLink(platform.url)}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title={`View on ${platform.name}`}
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start bg-gray-800/20 p-3 rounded-lg transition-all hover:bg-gray-800/30">
      <div className="mr-3 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className="text-sm text-gray-200">{value}</div>
      </div>
    </div>
  )
}
