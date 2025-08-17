"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Building2, TrendingUp, Users } from "lucide-react"
import { useScrollNavigation } from "@/components/scroll-restoration"

export function FinalCTASection() {
  const { navigateWithScrollToTop } = useScrollNavigation()

  const handleNavigate = (path: string) => {
    navigateWithScrollToTop(path)
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#0D1B2A] via-[#1a2332] to-[#0D1B2A]">
      <div className="container mx-auto text-center">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Get <span className="text-[#3BB273]">Started</span>?
        </h2>
        <p className="font-body text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Join thousands of founders, investors, and shareholders who are already using NiveshX to unlock liquidity in
          private equity.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#3BB273]/30 transition-colors">
                <Building2 className="h-8 w-8 text-[#3BB273]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Companies</h3>
              <p className="text-gray-300 mb-6">
                Enable liquidity events for your cap table and provide exit opportunities for stakeholders.
              </p>
              <Button
                onClick={() => handleNavigate("/register/company")}
                className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold group-hover:scale-105 transition-transform"
              >
                Create Liquidity
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#3BB273]/30 transition-colors">
                <TrendingUp className="h-8 w-8 text-[#3BB273]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Investors</h3>
              <p className="text-gray-300 mb-6">
                Access curated secondary deals and diversify your portfolio with pre-IPO opportunities.
              </p>
              <Button
                onClick={() => handleNavigate("/register/investor")}
                className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold group-hover:scale-105 transition-transform"
              >
                Start Investing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#3BB273]/30 transition-colors">
                <Users className="h-8 w-8 text-[#3BB273]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Shareholders</h3>
              <p className="text-gray-300 mb-6">
                Monetize your ESOPs and equity holdings with verified buyers and zero commission fees.
              </p>
              <Button
                onClick={() => handleNavigate("/register/shareholder")}
                className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold group-hover:scale-105 transition-transform"
              >
                Start Selling
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-[#3BB273]/10 border border-[#3BB273]/30 rounded-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">Zero Commission. Maximum Value.</h3>
          <p className="text-gray-300 text-lg">
            Join the revolution in private equity liquidity. No hidden fees, no commission charges—just pure value for
            all stakeholders.
          </p>
        </div>
      </div>
    </section>
  )
}
