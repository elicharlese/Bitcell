"use client"

import { useState, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { useConnection } from "@solana/wallet-adapter-react"
import { useBitcellWallet, useWallet } from "@/context/wallet-context"
import { useDemoMode } from "@/context/demo-context"
import { fetchBitcellData, withdrawProfits } from "@/services/solana-service"
import { useTheme } from "next-themes"

import BitcellInterface from "@/components/bitcell-interface"
import Cell from "@/components/cell/cell"
import CellControls from "@/components/cell/cell-controls"
import GridBackdrop from "@/components/grid-backdrop"
import { ThemeToggle } from "@/components/theme-toggle"
import CellStatisticsPanel from "@/components/cell-statistics-panel"
import CellSettingsPanel from "@/components/cell-settings-panel"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Wallet, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Loading component for the 3D scene
function SceneLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-peach" />
        <p className="text-muted-foreground">Loading Bitcell...</p>
      </div>
    </div>
  )
}

export default function AppPage() {
  const [activeOrganelle, setActiveOrganelle] = useState<string | null>(null)
  const [cellData, setCellData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isAddingInvestment, setIsAddingInvestment] = useState(false)
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)
  const [statsPanelOpen, setStatsPanelOpen] = useState(true)
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  const { connection } = useConnection()
  const walletContext = useWallet()
  const { publicKey, connected } = walletContext
  const { programId, balance } = useBitcellWallet()
  const { isDemoMode } = useDemoMode()

  // Ensure theme is only applied after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for demo mode
  const mockBotData = {
    lockedFunds: 1000,
    availableProfits: 245.78,
    health: 92,
    activePositions: 3,
    totalTrades: 127,
    successRate: 78,
    maturityTimestamp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    riskTolerance: 50,
    maxDrawdown: 15,
    tradingFrequency: 60,
    portfolioPreferences: {
      stablecoins: 30,
      bluechip: 40,
      defi: 20,
      experimental: 10,
      autoRebalance: false,
      rebalanceThreshold: 10,
    },
    connectedCells: [
      { id: "cell1", name: "Growth Cell", status: "active", synced: true },
      { id: "cell2", name: "Stable Cell", status: "active", synced: true },
    ],
  }

  // Fetch cell data
  useEffect(() => {
    const getData = async () => {
      if (isDemoMode) {
        setCellData({
          isInitialized: true,
          ...mockBotData,
        })
        setIsLoading(false)
        return
      }

      if (connected && publicKey) {
        try {
          const data = await fetchBitcellData(connection, programId, publicKey)
          setCellData(data)
        } catch (error) {
          console.error("Error fetching cell data:", error)
        }
      }
      setIsLoading(false)
    }

    getData()
  }, [connection, programId, publicKey, connected, isDemoMode])

  // Handle withdraw profits
  const handleWithdrawProfits = async (amount: string) => {
    if (isDemoMode) {
      setIsWithdrawing(true)
      // Simulate withdrawal in demo mode
      setTimeout(() => {
        setCellData((prev: any) => ({
          ...prev,
          availableProfits: prev.availableProfits - Number(amount),
        }))
        setIsWithdrawing(false)
      }, 1500)
      return
    }

    if (!connected || !publicKey) return

    try {
      setIsWithdrawing(true)
      await withdrawProfits(connection, programId, walletContext, Number(amount))

      // Refresh data
      const data = await fetchBitcellData(connection, programId, publicKey)
      setCellData(data)
    } catch (error) {
      console.error("Error withdrawing profits:", error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  // Handle add investment
  const handleAddInvestment = async (amount: string) => {
    if (isDemoMode) {
      setIsAddingInvestment(true)
      // Simulate adding investment in demo mode
      setTimeout(() => {
        setCellData((prev: any) => ({
          ...prev,
          lockedFunds: prev.lockedFunds + Number(amount),
        }))
        setIsAddingInvestment(false)
      }, 1500)
      return
    }

    // Real implementation would go here
    setIsAddingInvestment(false)
  }

  // Handle update settings
  const handleUpdateSettings = async (settings: any) => {
    if (isDemoMode) {
      setIsUpdatingSettings(true)
      // Simulate updating settings in demo mode
      setTimeout(() => {
        setCellData((prev: any) => ({
          ...prev,
          ...settings,
        }))
        setIsUpdatingSettings(false)
      }, 1500)
      return
    }

    // Real implementation would go here
    setIsUpdatingSettings(false)
  }

  // Calculate total value
  const totalValue = (cellData?.lockedFunds || 0) + (cellData?.availableProfits || 0)
  const initialInvestment = cellData?.lockedFunds || 0
  const totalProfit = cellData?.availableProfits || 0
  const maturityDate = cellData?.maturityTimestamp
    ? new Date(Number(cellData.maturityTimestamp)).toLocaleDateString()
    : "Not set"

  // Calculate main content padding based on panel states
  const getMainContentClass = () => {
    if (settingsPanelOpen && statsPanelOpen) {
      return "pl-96 pr-96" // Both panels open
    } else if (settingsPanelOpen) {
      return "pl-96" // Only left panel open
    } else if (statsPanelOpen) {
      return "pr-96" // Only right panel open
    }
    return "" // No panels open
  }

  // Get background gradient based on theme
  const getBackgroundGradient = () => {
    const currentTheme = resolvedTheme || theme

    if (currentTheme === "dark") {
      return "bg-gradient-to-b from-background via-background/90 to-black/80"
    } else {
      return "bg-gradient-to-b from-background via-peach-50/30 to-peach-50/20"
    }
  }

  if (!mounted) {
    // Return a placeholder with the same structure to avoid layout shift
    return (
      <div className="relative h-screen w-full overflow-hidden bg-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse w-12 h-12 rounded-full bg-peach/20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative h-screen w-full overflow-hidden ${getBackgroundGradient()}`}>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-6 overflow-x-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Initial Investment</span>
            <span className="font-medium">${initialInvestment.toFixed(2)}</span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Profit</span>
            <span className="font-medium text-green-500">${totalProfit.toFixed(2)}</span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Value</span>
            <span className="font-medium">${totalValue.toFixed(2)}</span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Maturity Date</span>
            <span className="font-medium">{maturityDate}</span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Mitochondrial Activity</span>
            <span className="font-medium">Normal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDemoMode && <div className="px-2 py-1 text-xs bg-amber-500/20 text-amber-500 rounded-md">Demo Mode</div>}
          <ThemeToggle />
          {!isDemoMode && connected && (
            <Button variant="outline" size="sm" className="gap-2">
              <Wallet className="h-4 w-4" />
              {balance.toFixed(2)} SOL
            </Button>
          )}
        </div>
      </div>

      {/* Left Settings Panel */}
      <div
        className={`absolute top-16 left-0 bottom-0 z-10 bg-background/80 backdrop-blur-sm border-r border-border transition-all duration-300 ${
          settingsPanelOpen ? "w-96" : "w-0 border-r-0"
        }`}
      >
        {settingsPanelOpen && (
          <div className="h-full p-4 overflow-auto">
            <CellSettingsPanel
              cellData={cellData || mockBotData}
              onUpdateSettings={handleUpdateSettings}
              isUpdating={isUpdatingSettings}
            />
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          className={`absolute top-1/2 ${
            settingsPanelOpen ? "-right-7" : "left-0 -right-7"
          } transform -translate-y-1/2 rounded-r-md rounded-l-none h-14 px-1.5`}
          onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
        >
          {settingsPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className={`relative h-full ${getMainContentClass()}`}>
        {/* 3D Scene */}
        <Suspense fallback={<SceneLoader />}>
          <Canvas shadows>
            {/* Use PerspectiveCamera for more control */}
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} /> {/* Moved closer and wider FOV */}
            {/* Enhanced lighting for better visibility */}
            <ambientLight intensity={2.0} /> {/* Increased from 1.5 to 2.0 */}
            <pointLight position={[10, 10, 10]} intensity={3.0} castShadow /> {/* Increased from 2.5 to 3.0 */}
            <pointLight position={[-10, -10, 10]} intensity={2.0} /> {/* Increased from 1.5 to 2.0 */}
            <pointLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" /> {/* Increased from 2.0 to 2.5 */}
            {/* Add spotlights specifically targeting each organelle with higher intensity */}
            <spotLight
              position={[0, 2, 5]}
              intensity={3.0}
              angle={0.4}
              penumbra={0.2}
              target-position={[0, 2, 0]}
              color="#FF9F7E"
            />{" "}
            {/* Nucleus */}
            <spotLight
              position={[3, 0, 5]}
              intensity={3.0}
              angle={0.4}
              penumbra={0.2}
              target-position={[3, 0, 0]}
              color="#63B3ED"
            />{" "}
            {/* Vacuole */}
            <spotLight
              position={[-1.5, -1.5, 5]}
              intensity={3.0}
              angle={0.4}
              penumbra={0.2}
              target-position={[-1.5, -1.5, 0]}
              color="#E53E3E"
            />{" "}
            {/* Mitochondria */}
            <GridBackdrop />
            <Cell
              setActiveOrganelle={setActiveOrganelle}
              activeOrganelle={activeOrganelle}
              botData={cellData || mockBotData}
            />
            {/* Adjusted OrbitControls for better initial view */}
            <OrbitControls
              enablePan={false}
              minDistance={6} // Reduced from 8 to 6
              maxDistance={16} // Reduced from 20 to 16
              enableRotate={!activeOrganelle}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
              target={[0, 0, 0]}
            />
            <Environment preset="studio" background={false} />
          </Canvas>
        </Suspense>

        {/* Cell Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <CellControls setActiveOrganelle={setActiveOrganelle} activeOrganelle={activeOrganelle} />
        </div>

        {/* Organelle Info */}
        <BitcellInterface
          activeOrganelle={activeOrganelle}
          cellData={cellData}
          mockBotData={mockBotData}
          handleWithdrawProfits={handleWithdrawProfits}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          isWithdrawing={isWithdrawing}
          setActiveOrganelle={setActiveOrganelle}
        />
      </div>

      {/* Right Stats Panel */}
      <div
        className={`absolute top-16 right-0 bottom-0 z-10 bg-background/80 backdrop-blur-sm border-l border-border transition-all duration-300 ${
          statsPanelOpen ? "w-96" : "w-0 border-l-0"
        }`}
      >
        {statsPanelOpen && (
          <div className="h-full p-4 overflow-auto">
            <CellStatisticsPanel
              cellData={cellData || mockBotData}
              onWithdrawProfit={handleWithdrawProfits}
              onAddInvestment={handleAddInvestment}
              isWithdrawing={isWithdrawing}
              isAddingInvestment={isAddingInvestment}
            />
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          className={`absolute top-1/2 ${
            statsPanelOpen ? "-left-7" : "right-0 -left-7"
          } transform -translate-y-1/2 rounded-l-md rounded-r-none h-14 px-1.5`}
          onClick={() => setStatsPanelOpen(!statsPanelOpen)}
        >
          {statsPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

