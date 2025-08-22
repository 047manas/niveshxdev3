"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Zap,
  FileCheck,
  Eye,
  Handshake,
  Linkedin,
  Twitter,
  DollarSign,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">
            <span className="text-white">Nivesh</span>
            <span className="text-primary">x</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation links removed as per new design */}
          </div>
          <div className="hidden md:flex items-center">
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Login / Sign Up</Button>
            </Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                {/* Navigation links removed as per new design */}
                <Link href="/auth">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Login / Sign Up</Button>
                </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="container mx-auto relative z-10">
          <h1 className="text-4xl md:text-7xl font-bold mb-4 leading-tight">
            Startup Funding Powered by <span className="text-primary">Data</span>.
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Turn your growth into a single source of truth and get funded faster, without endless pitch decks.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link href="/auth?view=signup&userType=company">
                <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">I’m a Founder</Button>
            </Link>
            <Link href="/auth?view=signup&userType=investor">
                <Button size="lg" variant="outline" className="w-full md:w-auto text-foreground border-foreground hover:bg-primary hover:text-primary-foreground">I’m an Investor</Button>
            </Link>
          </div>

          {/* Dashboard Visual Placeholder */}
          <div className="relative mt-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent" />
            <div className="container mx-auto p-4 md:p-8 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="w-1/3 h-6 bg-gray-700/50 rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 h-40 md:h-64 bg-gray-700/30 rounded-lg flex items-end p-4">
                  {/* Mock line chart */}
                  <div className="w-full h-1/2 border-b border-dashed border-gray-500 relative">
                    <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-primary/30 to-transparent"></div>
                  </div>
                </div>
                <div className="col-span-1 space-y-4">
                  <div className="h-20 bg-gray-700/30 rounded-lg p-3">
                    <div className="w-1/2 h-4 bg-gray-600/50 rounded mb-2"></div>
                    <div className="w-3/4 h-6 bg-gray-600/50 rounded"></div>
                  </div>
                  <div className="h-20 bg-gray-700/30 rounded-lg p-3">
                    <div className="w-1/2 h-4 bg-gray-600/50 rounded mb-2"></div>
                    <div className="w-3/4 h-6 bg-gray-600/50 rounded"></div>
                  </div>
                  <div className="h-12 bg-gray-700/30 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why NiveshX? Section */}
      <section id="why-niveshx" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            The Startup Ecosystem Has a Data Problem. <span className="text-primary">We're Solving It.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-12">
            Startups and investors are stuck in a cycle of inefficiency and mistrust, but the problem isn't a lack of capital—it's a lack of data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <Card className="bg-card border-border p-6">
              <CardHeader>
                <CardTitle className="text-2xl text-white">For Founders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  You're trapped in a messy process of managing spreadsheets and chasing investors. Even when you get a meeting, you don't have the clean, verified data to prove your growth. This leads to endless meetings and funding delays.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border p-6">
              <CardHeader>
                <CardTitle className="text-2xl text-white">For Investors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  You're overwhelmed by disorganized pitch decks and scattered portfolio data. It's difficult to find and vet high-quality deals, and you’re missing a central source of truth to monitor your investments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-12">
            How it Works for <span className="text-primary">You</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Founders */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">For Founders: Get Funded in 3 Simple Steps.</h3>
              <div className="space-y-8 text-left">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Step 1: Connect Your Data.</h4>
                    <p className="text-gray-300">A startup securely links their existing software (like Zoho Books, Tally, or Razorpay) to the NiveshX platform in minutes. Our system reads and consolidates all your financial metrics automatically.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Step 2: Get a Live Dashboard.</h4>
                    <p className="text-gray-300">The platform instantly generates a real-time, consolidated view of your key metrics. This becomes a single source of truth for your team and your investors, replacing messy spreadsheets and manual reports.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Step 3: Become Investor-Ready.</h4>
                    <p className="text-gray-300">Your data-rich dashboard allows you to build trust with existing investors and get discovered by new ones. This helps cut months off your fundraising timeline.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* For Investors */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">For Investors: Invest Smarter in 3 Simple Steps.</h3>
              <div className="space-y-8 text-left">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Step 1: Discover Opportunities.</h4>
                    <p className="text-gray-300">NiveshX brings you a curated feed of high-growth startups vetted by our data engine. You can filter by industry, metrics, and funding stage to find your next great deal.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Step 2: Track Your Portfolio.</h4>
                    <p className="text-gray-300">Get a unified, real-time dashboard of your entire portfolio. Stop sifting through fragmented pitch decks and monitor performance from a single source of truth.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Handshake className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Step 3: Find the Right Capital.</h4>
                    <p className="text-gray-300">Filter and connect with startups based on verified metrics to find the best equity opportunities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* For Founders */}
          <div className="text-center md:text-left">
            <p className="text-lg text-primary font-semibold">FOR FOUNDERS: YOUR FINANCIAL CO-PILOT</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">Growth, On Your Terms. Keep Your Equity. 🚀</h2>
            <p className="text-gray-300 mb-8">We help you raise capital without raising your anxiety. NiveshX turns your data into your most powerful fundraising tool.</p>
            <div className="space-y-4 text-left">
              <div className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" /><span>"Build a single source of truth for your startup."</span></div>
              <div className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" /><span>"Get investor-ready in minutes, not months."</span></div>
              <div className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" /><span>"Share a professional, data-rich dashboard with investors. Build trust without endless meetings."</span></div>
              <div className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" /><span>"Cut months off your fundraising timeline."</span></div>
            </div>
          </div>
          {/* For Investors */}
          <div className="text-center md:text-left">
            <p className="text-lg text-primary font-semibold">FOR INVESTORS: INVEST SMARTER, NOT HARDER</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">Discover Data-Driven Deals. Find Smarter Investments.</h2>
            <p className="text-gray-300 mb-8">NiveshX gives you a single, clear dashboard for portfolio management and a curated pipeline of high-growth startups.</p>
            <div className="space-y-4 text-left">
              <div className="flex items-start"><FileCheck className="h-6 w-6 text-primary mr-3 flex-shrink-0" /><span>Curated Deal Flow: We bring you a curated pipeline of high-growth startups, vetted by data. Invest smarter, not harder.</span></div>
              <div className="flex items-start"><DollarSign className="h-6 w-6 text-primary mr-3 flex-shrink-0" /><span>A Single Source of Truth: Stop sifting through disorganized pitch decks. NiveshX gives you a single, clear dashboard for portfolio management and new deals.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            The Future of Funding is Built on <span className="text-primary">Data</span>.
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Join the community that's changing how startups grow.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link href="/auth?view=signup&userType=company">
                <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">Get Started as a Founder</Button>
            </Link>
            <Link href="/auth?view=signup&userType=investor">
                <Button size="lg" variant="outline" className="w-full md:w-auto text-foreground border-foreground hover:bg-primary hover:text-primary-foreground">Get Started as an Investor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 bg-background border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <div className="text-2xl font-bold">
            <span className="text-white">Nivesh</span>
            <span className="text-primary">x</span>
          </div>
          <div className="flex space-x-4 text-sm text-gray-400">
            <Link href="/terms" target="_blank" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" target="_blank" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
