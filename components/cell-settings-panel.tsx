"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Link2, Plus, RefreshCw, Save, Trash2 } from "lucide-react"

interface CellSettingsPanelProps {
  cellData: any
  onUpdateSettings: (settings: any) => Promise<void>
  isUpdating: boolean
}

export default function CellSettingsPanel({ cellData, onUpdateSettings, isUpdating }: CellSettingsPanelProps) {
  const [riskTolerance, setRiskTolerance] = useState(cellData?.riskTolerance || 50)
  const [maxDrawdown, setMaxDrawdown] = useState(cellData?.maxDrawdown || 15)
  const [tradingFrequency, setTradingFrequency] = useState(cellData?.tradingFrequency || 60)
  const [apiKey, setApiKey] = useState("")

  // Portfolio preferences
  const [portfolioPreferences, setPortfolioPreferences] = useState({
    stablecoins: cellData?.portfolioPreferences?.stablecoins || 30,
    bluechip: cellData?.portfolioPreferences?.bluechip || 40,
    defi: cellData?.portfolioPreferences?.defi || 20,
    experimental: cellData?.portfolioPreferences?.experimental || 10,
    autoRebalance: cellData?.portfolioPreferences?.autoRebalance || false,
    rebalanceThreshold: cellData?.portfolioPreferences?.rebalanceThreshold || 10,
  })

  // Connected cells
  const [connectedCells, setConnectedCells] = useState(
    cellData?.connectedCells || [
      { id: "cell1", name: "Growth Cell", status: "active", synced: true },
      { id: "cell2", name: "Stable Cell", status: "active", synced: true },
      { id: "cell3", name: "DeFi Cell", status: "inactive", synced: false },
    ],
  )

  const handleUpdateSettings = async () => {
    const settings = {
      riskTolerance,
      maxDrawdown,
      tradingFrequency,
      portfolioPreferences,
      connectedCells,
    }
    await onUpdateSettings(settings)
  }

  const handleConnectCell = () => {
    if (!apiKey.trim()) return

    // In a real app, you would validate the API key and get cell details
    const newCell = {
      id: `cell${connectedCells.length + 1}`,
      name: `New Cell ${connectedCells.length + 1}`,
      status: "pending",
      synced: false,
    }

    setConnectedCells([...connectedCells, newCell])
    setApiKey("")
  }

  const handleRemoveCell = (id: string) => {
    setConnectedCells(connectedCells.filter((cell) => cell.id !== id))
  }

  const handleUpdatePortfolioPreference = (key: string, value: number | boolean) => {
    setPortfolioPreferences({
      ...portfolioPreferences,
      [key]: value,
    })
  }

  return (
    <Tabs defaultValue="risk" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="risk">Risk Settings</TabsTrigger>
        <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        <TabsTrigger value="bitcellular">Bitcellular</TabsTrigger>
      </TabsList>

      <TabsContent value="risk" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Risk Tolerance</CardTitle>
            <CardDescription>Adjust your trading risk parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                <span className="text-sm font-medium">{riskTolerance}%</span>
              </div>
              <Slider
                id="risk-tolerance"
                min={10}
                max={90}
                step={5}
                value={[riskTolerance]}
                onValueChange={(value) => setRiskTolerance(value[0])}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="max-drawdown">Maximum Drawdown</Label>
                <span className="text-sm font-medium">{maxDrawdown}%</span>
              </div>
              <Slider
                id="max-drawdown"
                min={5}
                max={30}
                step={1}
                value={[maxDrawdown]}
                onValueChange={(value) => setMaxDrawdown(value[0])}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">Maximum allowed loss before the system reduces exposure</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="trading-frequency">Trading Frequency</Label>
                <span className="text-sm font-medium">{tradingFrequency} min</span>
              </div>
              <Slider
                id="trading-frequency"
                min={15}
                max={240}
                step={15}
                value={[tradingFrequency]}
                onValueChange={(value) => setTradingFrequency(value[0])}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">How often the system evaluates and executes trades</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateSettings} disabled={isUpdating} className="w-full">
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Risk Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>Current risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Risk Level</span>
                <Badge variant={riskTolerance > 70 ? "destructive" : riskTolerance > 40 ? "default" : "outline"}>
                  {riskTolerance > 70 ? "High" : riskTolerance > 40 ? "Medium" : "Low"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Volatility Exposure</span>
                <span className="text-sm font-medium">{Math.round(riskTolerance * 0.8)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Leverage Used</span>
                <span className="text-sm font-medium">{(1 + riskTolerance / 100).toFixed(1)}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="portfolio" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Customize your portfolio composition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="stablecoins">Stablecoins</Label>
                <span className="text-sm font-medium">{portfolioPreferences.stablecoins}%</span>
              </div>
              <Slider
                id="stablecoins"
                min={0}
                max={100}
                step={5}
                value={[portfolioPreferences.stablecoins]}
                onValueChange={(value) => handleUpdatePortfolioPreference("stablecoins", value[0])}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">USDC, USDT, DAI and other stable assets</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="bluechip">Blue Chip</Label>
                <span className="text-sm font-medium">{portfolioPreferences.bluechip}%</span>
              </div>
              <Slider
                id="bluechip"
                min={0}
                max={100}
                step={5}
                value={[portfolioPreferences.bluechip]}
                onValueChange={(value) => handleUpdatePortfolioPreference("bluechip", value[0])}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">SOL, ETH, BTC and other established cryptocurrencies</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="defi">DeFi</Label>
                <span className="text-sm font-medium">{portfolioPreferences.defi}%</span>
              </div>
              <Slider
                id="defi"
                min={0}
                max={100}
                step={5}
                value={[portfolioPreferences.defi]}
                onValueChange={(value) => handleUpdatePortfolioPreference("defi", value[0])}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">JUP, RAY, ORCA and other DeFi tokens</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="experimental">Experimental</Label>
                <span className="text-sm font-medium">{portfolioPreferences.experimental}%</span>
              </div>
              <Slider
                id="experimental"
                min={0}
                max={100}
                step={5}
                value={[portfolioPreferences.experimental]}
                onValueChange={(value) => handleUpdatePortfolioPreference("experimental", value[0])}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">New tokens and high-risk opportunities</p>
            </div>

            {portfolioPreferences.stablecoins +
              portfolioPreferences.bluechip +
              portfolioPreferences.defi +
              portfolioPreferences.experimental !==
              100 && (
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-md text-amber-500">
                <AlertCircle className="h-4 w-4" />
                <p className="text-xs">Total allocation must equal 100%</p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-rebalance">Auto Rebalance</Label>
                <p className="text-xs text-muted-foreground">Automatically maintain your target allocation</p>
              </div>
              <Switch
                id="auto-rebalance"
                checked={portfolioPreferences.autoRebalance}
                onCheckedChange={(checked) => handleUpdatePortfolioPreference("autoRebalance", checked)}
              />
            </div>

            {portfolioPreferences.autoRebalance && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="rebalance-threshold">Rebalance Threshold</Label>
                  <span className="text-sm font-medium">{portfolioPreferences.rebalanceThreshold}%</span>
                </div>
                <Slider
                  id="rebalance-threshold"
                  min={5}
                  max={20}
                  step={1}
                  value={[portfolioPreferences.rebalanceThreshold]}
                  onValueChange={(value) => handleUpdatePortfolioPreference("rebalanceThreshold", value[0])}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">Rebalance when allocation deviates by this percentage</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpdateSettings}
              disabled={
                isUpdating ||
                portfolioPreferences.stablecoins +
                  portfolioPreferences.bluechip +
                  portfolioPreferences.defi +
                  portfolioPreferences.experimental !==
                  100
              }
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Portfolio Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="bitcellular" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Connect Cells</CardTitle>
            <CardDescription>Link multiple Bitcells for enhanced performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Cell API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key of another Bitcell"
                />
                <Button onClick={handleConnectCell} disabled={!apiKey.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect to other Bitcells to form a network for shared intelligence
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Connected Cells</h3>
              {connectedCells.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cells connected yet</p>
              ) : (
                <div className="space-y-2">
                  {connectedCells.map((cell) => (
                    <div key={cell.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            cell.status === "active"
                              ? "bg-green-500"
                              : cell.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span className="font-medium">{cell.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cell.synced ? "outline" : "secondary"} className="text-xs">
                          {cell.synced ? "Synced" : "Not Synced"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCell(cell.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Bitcellular Network</CardTitle>
            <CardDescription>How connected cells work together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Network Status</span>
              <Badge variant={connectedCells.length > 0 ? "default" : "outline"}>
                {connectedCells.length > 0 ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Connected Cells</span>
              <span className="font-medium">{connectedCells.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Network Efficiency</span>
              <span className="font-medium">
                {connectedCells.length === 0 ? "N/A" : `${Math.min(100, 70 + connectedCells.length * 5)}%`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Data Sharing</span>
              <Switch checked={connectedCells.length > 0} disabled={connectedCells.length === 0} />
            </div>

            <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-md text-blue-500">
              <Link2 className="h-4 w-4" />
              <p className="text-xs">
                Connected cells share market insights and trading signals to improve performance
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

