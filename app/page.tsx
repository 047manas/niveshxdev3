"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Building2,
  Wallet,
  Shield,
  BarChart3,
  Target,
  Zap,
  FileCheck,
  Eye,
  Handshake,
  Linkedin,
  Twitter,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0D1B2A]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">
            <span className="text-white">Nivesh</span>
            <span className="text-[#3BB273]">x</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#startups" className="text-gray-300 hover:text-white transition-colors">
              For Startups
            </Link>
            <Link href="#investors" className="text-gray-300 hover:text-white transition-colors">
              For Investors
            </Link>
            <Link href="#shareholders" className="text-gray-300 hover:text-white transition-colors">
              For Shareholders
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#1a2332] to-[#0D1B2A]" />

        {/* Mock Dashboard Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 gap-4 h-full p-8">
            <div className="col-span-8 bg-gradient-to-r from-[#3BB273]/30 to-transparent rounded-lg p-4">
              <div className="h-4 bg-[#3BB273]/50 rounded mb-2 w-1/3"></div>
              <div className="h-8 bg-[#3BB273]/30 rounded mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[#3BB273]/20 rounded"></div>
                ))}
              </div>
            </div>
            <div className="col-span-4 space-y-4">
              <div className="bg-[#3BB273]/20 rounded-lg p-4 h-32"></div>
              <div className="bg-[#3BB273]/20 rounded-lg p-4 h-24"></div>
              <div className="bg-[#3BB273]/20 rounded-lg p-4 h-20"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto relative z-10 text-center">
          <Badge className="mb-6 bg-[#3BB273]/20 text-[#3BB273] border-[#3BB273]/30">
            Building Liquidity Infrastructure for Private Equity
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Empowering Secondary liquidity in <span className="text-[#3BB273]">Private Equity</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Making Private Startup Equity Visible, Sellable and Liquid
          </p>

          <div className="mb-6">
            <Badge className="bg-[#3BB273]/10 text-[#3BB273] border-[#3BB273]/30 mb-2">
              🔒 Limited early access for verified users
            </Badge>
          </div>
        </div>
      </section>

      {/* For Startups Section */}
      <section id="startups" className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 p-8">
            <CardHeader className="text-center mb-8">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-[#3BB273]" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                Create Liquidity for Your Shares, Employees & Shareholders On Your Terms
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Approve buyers based on your preference</h3>
                      <p className="text-gray-300">Maintain control over who can invest in your company</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Conduct structured partial exits for early backers or personal liquidity
                      </h3>
                      <p className="text-gray-300">Enable strategic liquidity events for stakeholders</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Demonstrate tangible value creation to your team and early investors
                      </h3>
                      <p className="text-gray-300">Show measurable growth and attract future funding</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        List verified secondary offers for discreet, controlled transactions
                      </h3>
                      <p className="text-gray-300">Manage liquidity events with privacy and control</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" className="bg-[#3BB273] hover:bg-[#3BB273]/90 text-white">
                  Create Liquidity
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* For Investors Section */}
      <section id="investors" className="py-20 px-4 bg-[#0a1520]">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 p-8">
            <CardHeader className="text-center mb-8">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-[#3BB273]" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get access to secondary deals of industry-leading startups
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Target className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Discover New Exit Paths & Secondary Opportunities
                      </h3>
                      <p className="text-gray-300">Find unique investment opportunities in private markets</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Shield className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Access curated live secondary opportunities in promising growth-stage startups
                      </h3>
                      <p className="text-gray-300">Vetted opportunities from high-growth companies</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Zap className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Gain liquidity for your early-stage equity investments, pre-IPO
                      </h3>
                      <p className="text-gray-300">Exit before traditional IPO timelines</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <BarChart3 className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Diversify your portfolio by acquiring stakes in high-potential companies
                      </h3>
                      <p className="text-gray-300">Spread risk across multiple promising ventures</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Zap className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Reduce exit timelines from years to just clicks
                      </h3>
                      <p className="text-gray-300">Faster liquidity through our platform</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" className="bg-[#3BB273] hover:bg-[#3BB273]/90 text-white">
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* For Shareholders Section */}
      <section id="shareholders" className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 p-8">
            <CardHeader className="text-center mb-8">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-[#3BB273]" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                Sell your equity to relevant individuals and institutional investors
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Users className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Dedicated investor portal to filter the relevant investors
                      </h3>
                      <p className="text-gray-300">Connect with qualified buyers for your equity</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Review multiple offers before selling</h3>
                      <p className="text-gray-300">Compare and choose the best terms</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Zap className="h-6 w-6 text-[#3BB273] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        1-click participation in structured secondary sales to monetize your equity
                      </h3>
                      <p className="text-gray-300">Streamlined process for quick transactions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" className="bg-[#3BB273] hover:bg-[#3BB273]/90 text-white">
                  Start Selling
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Niveshx Section */}
      <section className="py-20 px-4 bg-[#0a1520]">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Why <span className="text-[#3BB273]">Niveshx</span>?
          </h2>

          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl text-gray-300 mb-6">
              <strong>The problem:</strong> Startup equity is powerful—but frustratingly illiquid and opaque. Its true
              value remains locked away.
            </p>

            <div className="grid md:grid-cols-2 gap-8 text-left mb-8">
              <Card className="bg-[#1a2332] border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">For Founders</h3>
                  <p className="text-gray-300">
                    Can't easily realize value from their shares without complex, ad-hoc processes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">For Early Investors</h3>
                  <p className="text-gray-300">
                    Struggle to find clean, compliant secondary exit routes for their holdings
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">For Shareholders</h3>
                  <p className="text-gray-300">Have no clear path to understand or unlock their equity's value</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">For New Investors</h3>
                  <p className="text-gray-300">
                    Find it difficult to access curated growth-stage secondary deals without insider networks
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-8">
              <p className="text-2xl text-[#3BB273] font-bold">We're changing that. Forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
            What You Can Do with <span className="text-[#3BB273]">Niveshx</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-[#1a2332] rounded-lg border border-gray-700">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-6 text-white font-semibold">Stakeholder</th>
                  <th className="text-left p-6 text-white font-semibold">What You Get</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-[#3BB273] font-medium">Founders</td>
                  <td className="p-6 text-gray-300">
                    Realize Partial Exits: Access liquidity for your shares, on your terms
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-[#3BB273] font-medium">Investors</td>
                  <td className="p-6 text-gray-300">
                    Seamless Exits & Trading: Sell or acquire early-stage equity via a compliant platform
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-[#3BB273] font-medium">Startups</td>
                  <td className="p-6 text-gray-300">
                    Host Structured Liquidity Events: Organize clean secondary rounds for all stakeholders
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-[#3BB273] font-medium">Employees</td>
                  <td className="p-6 text-gray-300">
                    Track, Value & Liquidate ESOPs: Understand your equity and participate in liquidity events
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-[#0a1520]">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
            How It <span className="text-[#3BB273]">Works</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="h-8 w-8 text-[#3BB273]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. Secure Onboarding & Verification</h3>
                <p className="text-gray-300">
                  Startups securely submit financials and cap tables. Investors and equity holders complete seamless
                  KYC.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-[#3BB273]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. Equity Visibility & Discovery</h3>
                <p className="text-gray-300">
                  Verified startup profiles go live. Equity instruments are made visible, verified, and priced for
                  potential transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-8 w-8 text-[#3BB273]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Curate or Join a Deal</h3>
                <p className="text-gray-300">
                  Choose to list your equity for sale or participate in a structured liquidity event. Select buyers, set
                  ROFR rules, and approve sales with full control.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Invest Now Section */}
      <section id="invest-now" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-[#3BB273]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Invest in India's Top Startups — Backed by <span className="text-[#3BB273]">Verified Data</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Access exclusive secondary opportunities. Empower your portfolio.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Verified startup financials and cap tables</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Exclusive access to secondary deals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Portfolio diversification opportunities</span>
                </div>
              </div>
              <Button size="lg" className="bg-[#3BB273] hover:bg-[#3BB273]/90 text-white">
                Start Investing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] rounded-lg p-8 border border-gray-700">
              <div className="space-y-6">
                {/* Investment Dashboard Illustration */}
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 bg-[#3BB273]/30 rounded w-1/3"></div>
                  <div className="h-4 bg-[#3BB273]/50 rounded w-1/4"></div>
                </div>

                {/* Portfolio Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#3BB273]/10 rounded-lg p-4 border border-[#3BB273]/20">
                    <div className="h-3 bg-[#3BB273]/40 rounded mb-2 w-2/3"></div>
                    <div className="h-6 bg-[#3BB273]/60 rounded mb-2"></div>
                    <div className="h-2 bg-[#3BB273]/30 rounded w-1/2"></div>
                  </div>
                  <div className="bg-[#3BB273]/10 rounded-lg p-4 border border-[#3BB273]/20">
                    <div className="h-3 bg-[#3BB273]/40 rounded mb-2 w-2/3"></div>
                    <div className="h-6 bg-[#3BB273]/60 rounded mb-2"></div>
                    <div className="h-2 bg-[#3BB273]/30 rounded w-1/2"></div>
                  </div>
                </div>

                {/* Investment Flow */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#3BB273]/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#3BB273] rounded-full"></div>
                    </div>
                    <div className="h-3 bg-[#3BB273]/20 rounded flex-1"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#3BB273]/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#3BB273] rounded-full"></div>
                    </div>
                    <div className="h-3 bg-[#3BB273]/20 rounded flex-1"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#3BB273]/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#3BB273] rounded-full"></div>
                    </div>
                    <div className="h-3 bg-[#3BB273]/20 rounded flex-1"></div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="h-12 bg-[#3BB273] rounded flex items-center justify-center">
                  <span className="text-white font-semibold">Invest in Verified Startups</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liquidate With Ease Section */}
      <section className="py-20 px-4 bg-[#0a1520]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Liquidate With <span className="text-[#3BB273]">Ease</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Find curated investors, negotiate terms, receive funds and stay compliant with our platform.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Compliant, verified, and always accessible</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Transparent pricing and terms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Secure transaction processing</span>
                </div>
              </div>
            </div>
            <div
              className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] rounded-lg p-8 border border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300 cursor-pointer group"
              onClick={() => document.getElementById("invest-now")?.scrollIntoView({ behavior: "smooth" })}
            >
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#3BB273]/30 transition-colors">
                  <DollarSign className="h-10 w-10 text-[#3BB273]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Invest?</h3>
                  <p className="text-gray-300 mb-4">Discover verified startup opportunities</p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-[#3BB273] group-hover:text-white transition-colors">
                  <span className="font-semibold">Explore Investment Options</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hassle-Free Investment Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] rounded-lg p-8 border border-gray-700">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-[#3BB273]/30 rounded w-1/2"></div>
                  <div className="h-4 bg-[#3BB273]/50 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-[#3BB273]/20 rounded"></div>
                    <div className="h-6 bg-[#3BB273]/30 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-[#3BB273]/20 rounded"></div>
                    <div className="h-6 bg-[#3BB273]/30 rounded"></div>
                  </div>
                </div>
                <div className="h-12 bg-[#3BB273] rounded flex items-center justify-center">
                  <span className="text-white font-semibold">Invest Now</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Hassle-Free Investment <span className="text-[#3BB273]">Process</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Find curated deals based on your preference, access all deal details and complete the transaction
                through a single dashboard.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Curated investment opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Comprehensive due diligence</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#3BB273]" />
                  <span className="text-gray-300">Single-click investment process</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#0a1520] border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-white">Nivesh</span>
                <span className="text-[#3BB273]">x</span>
              </div>
              <p className="text-gray-400 text-sm">Empowering Private Startup Equity through Liquidity</p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="#startups" className="hover:text-white transition-colors">
                    For Founders
                  </Link>
                </li>
                <li>
                  <Link href="#investors" className="hover:text-white transition-colors">
                    For Investors
                  </Link>
                </li>
                <li>
                  <Link href="#shareholders" className="hover:text-white transition-colors">
                    For Employees
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@niveshx.app</li>
                <li className="flex space-x-4 pt-2">
                  <Link href="#" className="hover:text-white transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="hover:text-white transition-colors">
                    <Twitter className="h-5 w-5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 text-sm text-gray-400 mb-4 md:mb-0">
              <Link href="/terms" target="_blank" className="hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" target="_blank" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
            <span className="text-sm text-gray-400">© 2025 Startup Gurukul Innovation Pvt Ltd</span>
          </div>
        </div>
      </footer>

      {/* Legal Disclaimer Section - Bottom of Page */}
      <section className="py-8 px-4 bg-[#0a1520] border-t border-gray-700">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-6">Legal Disclaimer</h3>
            <div className="text-sm text-gray-400 leading-relaxed space-y-4">
              <p>
                All trademarks and logos found on this Site or mentioned herein belong to their respective owners and
                are solely being used for informational purposes.
              </p>

              <p>
                Information provided herein has been gathered from public sources. Startup Gurukul Innovation Pvt. Ltd.
                disclaims any and all responsibility in connection with veracity of this data. Information presented on
                this website is for educational purposes only and should not be treated as legal, financial, or any
                other form of advice. Startup Gurukul Innovation Pvt. Ltd. is not liable for financial or any other form
                of loss incurred by the user or any affiliated party on the basis of information provided herein.
              </p>

              <p>
                Startup Gurukul Innovation Pvt. Ltd. is neither a stock exchange nor does it intend to get recognized as
                a stock exchange under the Securities Contracts Regulation Act, 1956. Startup Gurukul Innovation Pvt.
                Ltd. is not authorised by the capital markets regulator to solicit investments. The securities traded on
                these platforms are not traded on any regulated exchange. Startup Gurukul Innovation Pvt. Ltd. also
                provides that it does not facilitate any online or offline buying, selling, or trading of securities.
              </p>

              <p>
                Investing in private companies may be considered highly speculative and involves a high degree of risk,
                including the risk of substantial loss of investment. Investors must be able to afford the loss of their
                entire investment.
              </p>

              <p>This Site will be updated on a regular basis.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
