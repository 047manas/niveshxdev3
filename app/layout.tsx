import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext";
import { SignupProvider } from "@/context/SignupContext";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Niveshx - Empowering Private Startup Equity through Liquidity",
  description:
    "Making Private Startup Equity Visible, Sellable and Liquid. Create liquidity for your shares, access secondary deals, and sell your equity easily.",
  keywords: "startup equity, ESOP, private equity, liquidity, secondary market, fintech",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SignupProvider>
            {children}
          </SignupProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
