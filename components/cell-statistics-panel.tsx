"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Clock, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

interface CellStatisticsPanelProps {
  cellData: any
  onWithdrawProfit: (amount: string) => Promise<void>
  onAddInvestment: (amount: string) => Promise<void>
  isWithdrawing: boolean
  isAddingInvestment: boolean
}

export default function CellStatisticsPanel({
  cellData,
  onWithdrawProfit,
  onAddInvestment,
  isWithdrawing,
  isAddingInvestment,
}: CellStatisticsPanelProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [investmentAmount, setInvestmentAmount] = useState("")
  const { theme } = useTheme()

  // Mock data for fund allocation
  const fundAllocation = [
    { name: "Stable Pairs", percentage: 40, color: "bg-peach-dark dark:bg-peach" },
    { name: "Growth Tokens", percentage: 30, color: "bg-peach/80 dark:bg-peach/80" },
    { name: "Yield Farming", percentage: 20, color: "bg-peach/60 dark:bg-peach/60" },
    { name: "Reserve", percentage: 10, color: "bg-peach/40 dark:bg-peach/40" },
  ]

  // Mock data for recent trades
  const recentTrades = [
    {
      id: 1,
      type: "buy",
      pair: "SOL/USDC",
      amount: 2.5,
      price: 103.45,
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      profit: null,
    },
    {
      id: 2,
      type: "sell",
      pair: "ETH/USDC",
      amount: 0.12,
      price: 3245.78,
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      profit: 24.56,
    },
    {
      id: 3,
      type: "buy",
      pair: "JUP/USDC",
      amount: 50,
      price: 1.23,
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      profit: null,
    },
    {
      id: 4,
      type: "sell",
      pair: "SOL/USDC",
      amount: 1.8,
      price: 102.34,
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      profit: -5.23,
    },
    {
      id: 5,
      type: "sell",
      pair: "JTO/USDC",
      amount: 75,
      price: 2.45,
      timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
      profit: 12.75,
    },
  ]

  // Cell health metrics
  const healthMetrics = [
    { name: "Membrane Integrity", value: 92, color: "bg-peach-dark dark:bg-peach" },
    { name: "Mitochondrial Activity", value: 87, color: "bg-peach/80 dark:bg-peach/80" },
    { name: "Metabolic Rate", value: 78, color: "bg-peach/60 dark:bg-peach/60" },
    { name: "Adaptation Score", value: 95, color: "bg-peach/40 dark:bg-peach/40" },
  ]

  const handleWithdraw = () => {
    if (withdrawAmount && Number.parseFloat(withdrawAmount) > 0) {
      onWithdrawProfit(withdrawAmount)
      setWithdrawAmount("")
    }
  }

  const handleAddInvestment = () => {
    if (investmentAmount && Number.parseFloat(investmentAmount) > 0) {
      onAddInvestment(investmentAmount)
      setInvestmentAmount("")
    }
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trades">Trades</TabsTrigger>
        <TabsTrigger value="manage">Manage</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Cell Health</CardTitle>
            <CardDescription>Overall system performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthMetrics.map((metric) => (
              <div key={metric.name} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">{metric.name}</span>
                  <span className="text-sm font-medium">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className={`h-2 ${metric.color}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Fund Allocation</CardTitle>
            <CardDescription>How your investment is distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {fundAllocation.map((fund) => (
                <div key={fund.name} className="relative flex h-full flex-1 flex-col justify-end rounded-md p-1">
                  <div
                    className={`${fund.color} rounded-sm animate-in fade-in-50 transition-all duration-500`}
                    style={{ height: `${fund.percentage}%` }}
                  />
                  <span className="mt-1 text-center text-xs font-medium">{fund.name}</span>
                  <span className="text-center text-xs">{fund.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Current status of your investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Locked Funds</p>
                <p className="text-xl font-bold">${cellData?.lockedFunds?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Available Profits</p>
                <p className="text-xl font-bold text-green-500">${cellData?.availableProfits?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">
                  ${((cellData?.lockedFunds || 0) + (cellData?.availableProfits || 0)).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="text-xl font-bold text-green-500">
                  +{(((cellData?.availableProfits || 0) / (cellData?.lockedFunds || 1)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trades" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Latest trading activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center py-2 border-b last:border-0">
                <div className="mr-2">
                  {trade.type === "buy" ? (
                    <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {trade.type === "buy" ? "Bought" : "Sold"} {trade.pair}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {trade.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {trade.amount} @ ${trade.price}
                    </span>
                    {trade.profit !== null && (
                      <span className={`font-medium ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              View All Trades
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Trading Performance</CardTitle>
            <CardDescription>Statistics on bot activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-xl font-bold">{cellData?.activePositions || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-xl font-bold">{cellData?.totalTrades || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-xl font-bold">{cellData?.successRate || 0}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Profit/Trade</p>
                <p className="text-xl font-bold text-green-500">$12.45</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Performance Trend (24h)</h4>
              <div className="flex items-center space-x-2 h-20 border-b border-border relative">
                {/* Simple mock chart */}
                <div className="absolute inset-0 flex items-end">
                  {[...Array(24)].map((_, i) => {
                    const height = 30 + Math.sin(i * 0.5) * 20 + Math.random() * 20
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-peach/20 dark:bg-peach/30 rounded-t-sm mx-px"
                        style={{ height: `${height}%` }}
                      ></div>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>Now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Withdraw Profits</CardTitle>
            <CardDescription>Access your available earnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Available to withdraw:</span>
              <span className="font-bold text-green-500">${cellData?.availableProfits?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount to withdraw</Label>
              <div className="flex space-x-2">
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0"
                  max={cellData?.availableProfits || 0}
                  step="0.01"
                />
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    isWithdrawing ||
                    !withdrawAmount ||
                    Number.parseFloat(withdrawAmount) <= 0 ||
                    Number.parseFloat(withdrawAmount) > (cellData?.availableProfits || 0)
                  }
                  className="bg-peach-dark hover:bg-peach-dark/90 dark:bg-peach dark:hover:bg-peach/90"
                >
                  {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Note: Withdrawals are processed on the Solana blockchain and may take a few moments to complete.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Add Investment</CardTitle>
            <CardDescription>Increase your locked funds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Currently locked:</span>
              <span className="font-bold">${cellData?.lockedFunds?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentAmount">Amount to add</Label>
              <div className="flex space-x-2">
                <Input
                  id="investmentAmount"
                  type="number"
                  placeholder="0.00"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <Button
                  onClick={handleAddInvestment}
                  disabled={isAddingInvestment || !investmentAmount || Number.parseFloat(investmentAmount) <= 0}
                  className="bg-peach-dark hover:bg-peach-dark/90 dark:bg-peach dark:hover:bg-peach/90"
                >
                  {isAddingInvestment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-md text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <p className="text-xs">Additional investments will be locked until the maturity period ends.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Maturity Status</CardTitle>
            <CardDescription>Time until funds can be fully withdrawn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {cellData?.maturityTimestamp
                    ? new Date(Number(cellData.maturityTimestamp)).toLocaleDateString()
                    : "Not set"}
                </p>
                <p className="text-sm text-muted-foreground">Maturity Date</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>
                  {cellData?.maturityTimestamp
                    ? Math.ceil(
                        ((Date.now() - (Date.now() - 30 * 24 * 60 * 60 * 1000)) /
                          (Number(cellData.maturityTimestamp) - (Date.now() - 30 * 24 * 60 * 60 * 1000))) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  cellData?.maturityTimestamp
                    ? ((Date.now() - (Date.now() - 30 * 24 * 60 * 60 * 1000)) /
                        (Number(cellData.maturityTimestamp) - (Date.now() - 30 * 24 * 60 * 60 * 1000))) *
                      100
                    : 0
                }
                className="h-2 bg-muted [&>div]:bg-peach-dark dark:[&>div]:bg-peach"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              After maturity, you can withdraw both your initial investment and any accumulated profits.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
