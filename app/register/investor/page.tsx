"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, Shield, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollRestoration } from "@/components/scroll-restoration"
import { useToast } from "@/hooks/use-toast"

const formSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    investorType: z.string().min(1, "Investor type is required"),
    companyName: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    investmentBudget: z.string().min(1, "Investment budget is required"),
    linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

export default function InvestorRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "+91",
      investorType: "",
      companyName: "",
      country: "",
      investmentBudget: "",
      linkedinUrl: "",
      agreedToTerms: false,
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "INVESTOR",
          ...data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Something went wrong")
      }

      setIsSubmitted(true)
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-[#3BB273]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to NiveshX!</h2>
            <p className="text-gray-300 mb-6">
              Your investor application has been submitted successfully. Our team will review your credentials and
              contact you within 24-48 hours with access to exclusive investment opportunities.
            </p>
            <Button asChild className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <ScrollRestoration />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0D1B2A]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Nivesh</span>
            <span className="text-[#3BB273]">x</span>
          </Link>
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-[#3BB273]/20 transition-all duration-200 border border-gray-600 hover:border-[#3BB273]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Invest in High-Growth Startups <span className="text-[#3BB273]">Before They Go Public</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Access curated secondary deals and diversify your portfolio with pre-IPO opportunities.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-[#3BB273]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Exclusive Access</h3>
              <p className="text-gray-400 text-sm">Pre-IPO opportunities from verified high-growth companies</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-[#3BB273]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Curated Deals</h3>
              <p className="text-gray-400 text-sm">Thoroughly vetted investment opportunities</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-[#3BB273]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Zero Commission</h3>
              <p className="text-gray-400 text-sm">No fees on transactions - maximize your returns</p>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">Investor Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white font-medium">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="+91 XXXXXXXXXX"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                </div>

                {/* Investor Type */}
                <div className="space-y-2">
                  <Label htmlFor="investorType" className="text-white font-medium">
                    Investor Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="investorType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-[#0D1B2A]/50 border-gray-600 text-white focus:border-[#3BB273] focus:ring-[#3BB273]">
                          <SelectValue placeholder="Select investor type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-600">
                          <SelectItem value="angel" className="text-white hover:bg-[#3BB273]/20">
                            Angel Investor
                          </SelectItem>
                          <SelectItem value="vc" className="text-white hover:bg-[#3BB273]/20">
                            VC
                          </SelectItem>
                          <SelectItem value="family-office" className="text-white hover:bg-[#3BB273]/20">
                            Family Office
                          </SelectItem>
                          <SelectItem value="hni" className="text-white hover:bg-[#3BB273]/20">
                            HNI
                          </SelectItem>
                          <SelectItem value="institutional" className="text-white hover:bg-[#3BB273]/20">
                            Institutional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.investorType && <p className="text-red-500 text-sm mt-1">{errors.investorType.message}</p>}
                </div>

                {/* Company or Fund Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white font-medium">
                    Company or Fund Name
                  </Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Enter company or fund name"
                  />
                </div>

                {/* Country of Residence */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-white font-medium">
                    Country of Residence <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    {...register("country")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Enter your country"
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                </div>

                {/* Annual Investment Budget */}
                <div className="space-y-2">
                  <Label htmlFor="investmentBudget" className="text-white font-medium">
                    Annual Investment Budget <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="investmentBudget"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-[#0D1B2A]/50 border-gray-600 text-white focus:border-[#3BB273] focus:ring-[#3BB273]">
                          <SelectValue placeholder="Select investment budget" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-600">
                          <SelectItem value="<50k" className="text-white hover:bg-[#3BB273]/20">
                            {"<$50k"}
                          </SelectItem>
                          <SelectItem value="50k-200k" className="text-white hover:bg-[#3BB273]/20">
                            $50k–$200k
                          </SelectItem>
                          <SelectItem value="200k-1m" className="text-white hover:bg-[#3BB273]/20">
                            $200k–$1M
                          </SelectItem>
                          <SelectItem value="1m+" className="text-white hover:bg-[#3BB273]/20">
                            $1M+
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.investmentBudget && (
                    <p className="text-red-500 text-sm mt-1">{errors.investmentBudget.message}</p>
                  )}
                </div>

                {/* LinkedIn or Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-white font-medium">
                    LinkedIn or Website URL
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    {...register("linkedinUrl")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedinUrl && <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl.message}</p>}
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-3 p-4 bg-[#0D1B2A]/30 rounded-lg border border-gray-700/50">
                  <Controller
                    name="agreedToTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="agreedToTerms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border-gray-600 data-[state=checked]:bg-[#3BB273] data-[state=checked]:border-[#3BB273]"
                      />
                    )}
                  />
                  <div className="flex-1">
                    <Label htmlFor="agreedToTerms" className="text-white font-medium cursor-pointer">
                      <span className="text-red-500">*</span> I confirm I am an accredited investor and agree to the{" "}
                      <Link href="/terms" target="_blank" className="text-[#3BB273] hover:text-[#3BB273]/80 underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-[#3BB273] hover:text-[#3BB273]/80 underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </Label>
                  </div>
                </div>
                {errors.agreedToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreedToTerms.message}</p>}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold py-3 text-lg"
                >
                  {isSubmitting ? "Submitting..." : "Join as an Investor"}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <Link href="/login" className="text-gray-400 hover:text-[#3BB273] text-sm transition-colors">
                    Already joined? Log in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
