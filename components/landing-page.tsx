"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Lock, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react"
import { useDemoMode } from "@/context/demo-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  const searchParams = useSearchParams()
  const { enableDemoMode } = useDemoMode()

  // Check if demo parameter is present in URL
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      enableDemoMode()
    }
  }, [searchParams, enableDemoMode])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-background dark:from-background dark:via-background/95 dark:to-background/90">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16 border-b border-border/30">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Algorithmic Trading <span className="text-peach-dark dark:text-peach">Reimagined</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Bitcell is a fully automated algorithmic trading bot on Solana that grows your assets like a living
                cell. Lock in your initial funds and watch your profits multiply.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/app" className="inline-block">
                  <Button className="px-6 py-3 rounded-lg bg-peach-dark hover:bg-peach-dark/90 dark:bg-peach dark:hover:bg-peach/90 text-white">
                    Launch App
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="text-peach-dark border-peach-dark hover:bg-peach-dark/10 dark:text-peach dark:border-peach dark:hover:bg-peach/10"
                  onClick={enableDemoMode}
                >
                  Try Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-peach/10 to-pink/10 rounded-lg backdrop-blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bitcell-Logo-zfxpLOOuIBZ6r1teID7BWqefkU409V.png"
                  alt="Bitcell Logo"
                  width={240}
                  height={240}
                  className="w-48 h-48 md:w-60 md:h-60"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 border-b border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Cellular Trading Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our unique cell-based interface represents different aspects of your trading bot, making complex
              algorithms intuitive and visual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <div className="w-12 h-12 rounded-full bg-peach/10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-peach/20"></div>
                </div>
              }
              title="Nucleus"
              description="The command center of your trading bot, housing the core algorithms and trading logic that power your investments."
            />

            <FeatureCard
              icon={
                <div className="w-12 h-12 rounded-full bg-pink/10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-pink/20"></div>
                </div>
              }
              title="Vacuole"
              description="Secure storage for your assets and funds, visually representing your locked capital and available profits."
            />

            <FeatureCard
              icon={
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/20"></div>
                </div>
              }
              title="Mitochondria"
              description="The powerhouse of your trading bot, generating energy for automated processes and active trading positions."
            />

            <FeatureCard
              icon={
                <div className="w-12 h-12 rounded-full bg-peach-dark/10 flex items-center justify-center border-2 border-dashed border-peach-dark/20"></div>
              }
              title="Lipid Membrane"
              description="The security layer protecting your investments from external threats using Solana's blockchain security."
            />

            <FeatureCard
              icon={<Lock className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
              title="Locked Initial Funds"
              description="Your initial investment is locked for a maturity period, ensuring the algorithm has time to work effectively."
            />

            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-green-600/80 dark:text-green-400/80" />}
              title="Accessible Profits"
              description="While your initial investment is locked, generated profits are accessible and can be withdrawn at any time."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 border-b border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How Bitcell Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple 3-step process to start growing your assets with our algorithmic trading bot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Connect Wallet"
              description="Connect your Solana wallet to get started. We support Phantom, Solflare, and other popular wallets."
              icon={<Wallet className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
            />

            <StepCard
              number="02"
              title="Initialize Cell"
              description="Set your initial deposit and maturity period. Your funds will be locked for this period while the algorithm works."
              icon={<Zap className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
            />

            <StepCard
              number="03"
              title="Monitor & Collect"
              description="Watch your cell grow and collect profits. The 3D interface shows you exactly how your investment is performing."
              icon={<BarChart3 className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 border-b border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Bitcell</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our algorithmic trading bot offers unique advantages over traditional trading methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BenefitCard
              icon={<Shield className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
              title="Blockchain Security"
              description="Built on Solana's secure blockchain, your funds are protected by cutting-edge cryptography and decentralized security."
            />

            <BenefitCard
              icon={<Lock className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
              title="Locked Strategy"
              description="Once initialized, the trading strategy cannot be changed, preventing emotional decisions during market volatility."
            />

            <BenefitCard
              icon={<TrendingUp className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
              title="Profit Optimization"
              description="Our algorithms continuously analyze market conditions to maximize profits while managing risk."
            />

            <BenefitCard
              icon={<Zap className="h-8 w-8 text-peach-dark/80 dark:text-peach/80" />}
              title="Real-time Visualization"
              description="The 3D cell interface provides an intuitive way to monitor your trading bot's performance and health."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-peach/20 to-pink/20 dark:from-peach/10 dark:to-pink/10 border-peach/20 dark:border-peach/10 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Trading?</h2>
              <p className="text-muted-foreground mb-8">
                Connect your wallet now and experience the future of algorithmic trading with Bitcell.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/app" className="inline-block">
                  <Button className="px-6 py-3 rounded-lg bg-peach-dark hover:bg-peach-dark/90 dark:bg-peach dark:hover:bg-peach/90 text-white">
                    Launch App
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="text-peach-dark border-peach-dark hover:bg-peach-dark/10 dark:text-peach dark:border-peach dark:hover:bg-peach/10"
                  onClick={enableDemoMode}
                >
                  Try Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 lg:px-16 border-t border-border/30 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-foreground">Bitcell</h3>
              <p className="text-muted-foreground">Algorithmic Trading on Solana</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                FAQ
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Bitcell. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-background/50 dark:bg-background/20 border-border/30 hover:border-border/60 transition-colors">
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StepCard({
  number,
  title,
  description,
  icon,
}: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-background/50 dark:bg-background/20 border-border/30 hover:border-border/60 transition-colors relative overflow-hidden">
      <div className="absolute -right-4 -top-4 text-8xl font-bold text-peach/5 dark:text-peach-dark/5">{number}</div>
      <CardContent className="p-6 relative z-10">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-background/50 dark:bg-background/20 border-border/30 hover:border-border/60 transition-colors">
      <CardContent className="p-6 flex gap-4">
        <div className="shrink-0">{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Wallet({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}

