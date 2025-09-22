"use client"

import { ThemeProvider } from "@/components/providers/theme-provider"
import type React from "react"

import { Suspense } from "react"

interface LayoutClientProps {
  children: React.ReactNode
  fontClasses: string
}

export function LayoutClient({ children, fontClasses }: LayoutClientProps) {
  return (
// antialiased w-full min-h-screen dark:text-white text-slate-800 dark:bg-[#020b19] bg-white
    <body className={`font-sans antialiased w-full min-h-screen dark:text-white text-slate-800 dark:bg-[#020b19] bg-white ${fontClasses}`}>
      <Suspense fallback={null}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </Suspense>
    </body>
  )
}
