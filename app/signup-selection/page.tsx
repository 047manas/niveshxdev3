"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Users, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignupSelectionPage() {
  const router = useRouter()

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })

    // Additional fallback
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 50)
  }, [])

  const handleRoleSelection = (role: string) => {
    router.push(`/register/${role}`)
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="font-body text-3xl font-bold mb-4">
            <span className="text-white">Nivesh</span>
            <span className="text-[#3BB273]">x</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-300">Select how you'd like to participate in the startup ecosystem</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Card */}
          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3BB273]/30 transition-colors">
                <Building2 className="h-8 w-8 text-[#3BB273]" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Company</CardTitle>
              <p className="text-gray-300">Raise funds and create liquidity for your startup</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Raise primary funding rounds
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Enable employee ESOP liquidity
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Manage cap table and investors
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Zero commission on transactions
                </li>
              </ul>
              <Button
                className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold mt-6"
                onClick={() => handleRoleSelection("company")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Investor Card */}
          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3BB273]/30 transition-colors">
                <TrendingUp className="h-8 w-8 text-[#3BB273]" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Investor</CardTitle>
              <p className="text-gray-300">Invest in curated startup opportunities</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Access primary and secondary deals
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Verified startup financials
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Portfolio diversification
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Commission-free investing
                </li>
              </ul>
              <Button
                className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold mt-6"
                onClick={() => handleRoleSelection("investor")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Shareholder Card */}
          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3BB273]/30 transition-colors">
                <Users className="h-8 w-8 text-[#3BB273]" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Shareholder</CardTitle>
              <p className="text-gray-300">Monetize your ESOPs and equity holdings</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Sell ESOPs and equity stakes
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Connect with qualified buyers
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  Track equity value in real-time
                </li>
                <li className="flex items-start">
                  <span className="text-[#3BB273] mr-2">•</span>
                  100% of proceeds go to you
                </li>
              </ul>
              <Button
                className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold mt-6"
                onClick={() => handleRoleSelection("shareholder")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Button
              variant="link"
              className="text-[#3BB273] hover:text-[#3BB273]/80 p-0 h-auto font-normal"
              onClick={() => router.push("/login")}
            >
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
