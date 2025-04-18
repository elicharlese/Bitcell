"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface DemoContextType {
  isDemoMode: boolean
  enableDemoMode: () => void
  disableDemoMode: () => void
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
})

export const useDemoMode = () => useContext(DemoContext)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if demo mode is enabled in localStorage on mount
  useEffect(() => {
    const storedDemoMode = localStorage.getItem("bitcell-demo-mode")
    if (storedDemoMode === "true") {
      setIsDemoMode(true)

      // If we're on the root page and demo mode is enabled, redirect to app
      if (pathname === "/") {
        router.push("/app")
      }
    }
  }, [router, pathname])

  const enableDemoMode = () => {
    setIsDemoMode(true)
    localStorage.setItem("bitcell-demo-mode", "true")
    router.push("/app")
  }

  const disableDemoMode = () => {
    setIsDemoMode(false)
    localStorage.removeItem("bitcell-demo-mode")
    router.push("/")
  }

  return <DemoContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode }}>{children}</DemoContext.Provider>
}

