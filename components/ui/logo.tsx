"use client"

import Link from "next/link"
import { useTheme } from "next-themes"

export function Logo({ className = "", size = "default" }: { className?: string; size?: "default" | "large" }) {
  const { theme } = useTheme()

  return (
    <Link href="/" className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}>
      <div className="relative">
        <div
          className={`rounded-full bg-gradient-to-r from-[#FF9F7E] to-[#FF7BAC] ${
            size === "large" ? "w-12 h-12" : "w-8 h-8"
          }`}
        />
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#FF9F7E]/50 to-[#FF7BAC]/50 blur-lg ${
            size === "large" ? "w-12 h-12" : "w-8 h-8"
          }`}
        />
      </div>
      <span
        className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F7E] to-[#FF7BAC] ${
          size === "large" ? "text-4xl" : "text-2xl"
        }`}
      >
        Bitcell
      </span>
    </Link>
  )
}

