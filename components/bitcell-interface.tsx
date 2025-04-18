"use client"

import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

function OrganelleInfo({
  organelle,
  botData,
  cellData,
  onWithdraw,
  withdrawAmount,
  setWithdrawAmount,
  isWithdrawing,
}: {
  organelle: string
  botData: any
  cellData: any
  onWithdraw: (amount: string) => void
  withdrawAmount: string
  setWithdrawAmount: (value: string) => void
  isWithdrawing: boolean
}) {
  // Define organelle-specific colors
  const getOrganelleColor = () => {
    switch (organelle) {
      case "Nucleus":
        return "text-peach-dark dark:text-peach"
      case "Vacuole":
        return "text-blue-500 dark:text-blue-400"
      case "Mitochondria":
        return "text-red-500 dark:text-red-400"
      case "Lipid Membrane":
        return "text-yellow-500 dark:text-yellow-400"
      default:
        return "text-foreground"
    }
  }

  // Define organelle-specific background colors
  const getOrganelleBgColor = () => {
    switch (organelle) {
      case "Nucleus":
        return "bg-peach/10 dark:bg-peach/5"
      case "Vacuole":
        return "bg-blue-500/10 dark:bg-blue-400/5"
      case "Mitochondria":
        return "bg-red-500/10 dark:bg-red-400/5"
      case "Lipid Membrane":
        return "bg-yellow-500/10 dark:bg-yellow-400/5"
      default:
        return "bg-muted/50"
    }
  }

  switch (organelle) {
    case "Nucleus":
      return (
        <div className="space-y-3">
          <p>The command center of your Bitcell, housing the core algorithms and trading logic.</p>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-sm text-muted-foreground">Algorithm Version</p>
              <p className="font-medium">v2.4.1</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">2 days ago</p>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Trading Strategy</span>
              <span className={`text-xs px-2 py-0.5 ${getOrganelleBgColor()} ${getOrganelleColor()} rounded-full`}>
                Adaptive
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              The nucleus adapts to market conditions using a combination of momentum, mean reversion, and volatility
              breakout strategies.
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <span className="text-sm font-medium">Performance Metrics</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Win Rate</span>
                <span className="font-medium text-green-500">{cellData?.successRate || 78}%</span>
              </div>
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Avg. Hold Time</span>
                <span className="font-medium">4.2 hours</span>
              </div>
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Risk Score</span>
                <span className="font-medium text-amber-500">Medium</span>
              </div>
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Efficiency</span>
                <span className={`font-medium ${getOrganelleColor()}`}>92%</span>
              </div>
            </div>
          </div>
        </div>
      )
    case "Vacuole":
      return (
        <div className="space-y-3">
          <p>Secure storage for your assets and funds on the Solana blockchain.</p>

          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Locked Funds</p>
              <p className="font-medium">${botData.lockedFunds.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Available Profits</p>
              <p className="font-medium text-green-500">${botData.availableProfits.toFixed(2)}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Asset Allocation</span>
                <span className="text-xs text-muted-foreground">Current Distribution</span>
              </div>

              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-peach-dark dark:bg-peach h-full" style={{ width: "45%" }}></div>
                  </div>
                  <span className="text-xs whitespace-nowrap">SOL 45%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: "30%" }}></div>
                  </div>
                  <span className="text-xs whitespace-nowrap">USDC 30%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: "15%" }}></div>
                  </div>
                  <span className="text-xs whitespace-nowrap">JUP 15%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: "10%" }}></div>
                  </div>
                  <span className="text-xs whitespace-nowrap">Other 10%</span>
                </div>
              </div>
            </div>

            {cellData?.isInitialized && botData.availableProfits > 0 && (
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <span className="text-sm font-medium">Quick Withdraw</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to withdraw"
                    min="0"
                    max={botData.availableProfits}
                    step="0.01"
                  />
                  <Button
                    size="sm"
                    onClick={() => onWithdraw(withdrawAmount)}
                    disabled={
                      isWithdrawing ||
                      Number.parseFloat(withdrawAmount) <= 0 ||
                      Number.parseFloat(withdrawAmount) > botData.availableProfits
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    case "Mitochondria":
      return (
        <div className="space-y-3">
          <p>The powerhouse of your Bitcell, generating energy for trading operations on Solana.</p>

          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Active Positions</p>
              <p className="font-medium">{botData.activePositions}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Energy Output</p>
              <p className="font-medium">High</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-sm font-medium">Active Trading Pairs</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-1.5 p-2 bg-muted/50 rounded-md">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">SOL/USDC</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-muted/50 rounded-md">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">JUP/USDC</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-muted/50 rounded-md">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-xs">ETH/USDC</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-muted/50 rounded-md">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">JTO/USDC</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-sm font-medium">Metabolic Efficiency</span>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">ATP Production</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: "85%" }}></div>
                  </div>
                  <span className="text-xs">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Electron Transport</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: "92%" }}></div>
                  </div>
                  <span className="text-xs">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Oxygen Consumption</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: "78%" }}></div>
                  </div>
                  <span className="text-xs">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    case "Lipid Membrane":
      return (
        <div className="space-y-3">
          <p>The security layer protecting your Bitcell from external threats using Solana's blockchain security.</p>

          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Security Status</p>
              <p className="font-medium text-green-500">Protected</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Last Scan</p>
              <p className="font-medium">10 minutes ago</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-sm font-medium">Protection Layers</span>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Blockchain Verification</span>
                </div>
                <span className="text-xs font-medium text-green-500">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Multi-sig Authorization</span>
                </div>
                <span className="text-xs font-medium text-green-500">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Anomaly Detection</span>
                </div>
                <span className="text-xs font-medium text-green-500">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Transaction Monitoring</span>
                </div>
                <span className="text-xs font-medium text-green-500">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-sm font-medium">Health Metrics</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Integrity</span>
                <span className="font-medium text-green-500">98%</span>
              </div>
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Resilience</span>
                <span className="font-medium text-green-500">High</span>
              </div>
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Threats Blocked</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground">Last Breach</span>
                <span className="font-medium">Never</span>
              </div>
            </div>
          </div>
        </div>
      )
    default:
      return <p>Select an organelle to view details.</p>
  }
}

interface BitcellInterfaceProps {
  activeOrganelle: string | null
  cellData: any
  mockBotData: any
  handleWithdrawProfits: (amount: string) => void
  withdrawAmount: string
  setWithdrawAmount: (value: string) => void
  isWithdrawing: boolean
  setActiveOrganelle: (organelle: string | null) => void
}

export default function BitcellInterface({
  activeOrganelle,
  cellData,
  mockBotData,
  handleWithdrawProfits,
  withdrawAmount,
  setWithdrawAmount,
  isWithdrawing,
  setActiveOrganelle,
}: BitcellInterfaceProps) {
  // Get organelle-specific colors for the card header
  const getOrganelleHeaderClass = () => {
    if (!activeOrganelle) return ""

    switch (activeOrganelle) {
      case "Nucleus":
        return "bg-peach/10 dark:bg-peach/5 border-b border-peach/20"
      case "Vacuole":
        return "bg-blue-500/10 dark:bg-blue-400/5 border-b border-blue-500/20"
      case "Mitochondria":
        return "bg-red-500/10 dark:bg-red-400/5 border-b border-red-500/20"
      case "Lipid Membrane":
        return "bg-yellow-500/10 dark:bg-yellow-400/5 border-b border-yellow-500/20"
      default:
        return ""
    }
  }

  return (
    <>
      {activeOrganelle && (
        <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:bottom-8 md:transform md:-translate-x-1/2 z-10">
          <Card className="w-full md:w-[400px] bg-background/90 backdrop-blur-sm max-h-[500px] overflow-y-auto">
            <CardHeader className={`p-4 flex flex-row items-center justify-between ${getOrganelleHeaderClass()}`}>
              <CardTitle className="text-lg">{activeOrganelle}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setActiveOrganelle(null)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <OrganelleInfo
                organelle={activeOrganelle}
                botData={mockBotData}
                cellData={cellData}
                onWithdraw={(amount) => handleWithdrawProfits(amount)}
                withdrawAmount={withdrawAmount}
                setWithdrawAmount={setWithdrawAmount}
                isWithdrawing={isWithdrawing}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

