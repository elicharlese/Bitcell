import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletContextProvider } from "@/context/wallet-context"
import { DemoProvider } from "@/context/demo-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bitcell - Algorithmic Trading Bot",
  description: "A fully automated algorithmic trading bot on Solana",
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF9F7E" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <DemoProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
          </DemoProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
