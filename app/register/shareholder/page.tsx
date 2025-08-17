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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Users, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollRestoration } from "@/components/scroll-restoration"
import { useToast } from "@/hooks/use-toast"

const formSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    companyName: z.string().min(1, "Company name is required"),
    companyEmail: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    sharesHeld: z.string().min(1, "Number of shares is required"),
    shareClass: z.string().optional(),
    shareValue: z.string().min(1, "Approximate share value is required"),
    country: z.string().min(1, "Country is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

export default function ShareholderRegisterPage() {
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
      companyName: "",
      companyEmail: "",
      phoneNumber: "+91",
      sharesHeld: "",
      shareClass: "",
      shareValue: "",
      country: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
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
          role: "SHAREHOLDER",
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
              <CheckCircle className="h-8 w-8 text-[#3BB273]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
            <p className="text-gray-300 mb-6">
              Thank you for your interest in exploring liquidity options. Our team will review your details and contact
              you within 24-48 hours.
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
              Explore Liquidity Options for Your <span className="text-[#3BB273]">Private Shares</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Connect with potential buyers and unlock the value of your equity in high-growth companies.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-[#3BB273]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Secure & Confidential</h3>
              <p className="text-gray-400 text-sm">Your information is protected with bank-level security</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-[#3BB273]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Verified Buyers</h3>
              <p className="text-gray-400 text-sm">Connect only with pre-qualified, serious investors</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-[#3BB273]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-[#3BB273]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Zero Commission</h3>
              <p className="text-gray-400 text-sm">Keep 100% of your proceeds with no hidden fees</p>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">Shareholder Registration</CardTitle>
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

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
                </div>

                {/* Company Email */}
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-white font-medium">
                    Company Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    {...register("companyEmail")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="your.email@company.com"
                  />
                  {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail.message}</p>}
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

                {/* Number of Shares Held */}
                <div className="space-y-2">
                  <Label htmlFor="sharesHeld" className="text-white font-medium">
                    Number of Shares Held <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sharesHeld"
                    type="number"
                    {...register("sharesHeld")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Enter number of shares"
                  />
                  {errors.sharesHeld && <p className="text-red-500 text-sm mt-1">{errors.sharesHeld.message}</p>}
                </div>

                {/* Share Class */}
                <div className="space-y-2">
                  <Label htmlFor="shareClass" className="text-white font-medium">
                    Share Class
                  </Label>
                  <Input
                    id="shareClass"
                    {...register("shareClass")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="e.g., Common, Preferred A, ESOP"
                  />
                </div>

                {/* Approximate Share Value */}
                <div className="space-y-2">
                  <Label htmlFor="shareValue" className="text-white font-medium">
                    Approximate Share Value <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shareValue"
                    {...register("shareValue")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="e.g., ₹10,00,000 or $50,000"
                  />
                  {errors.shareValue && <p className="text-red-500 text-sm mt-1">{errors.shareValue.message}</p>}
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
                      <span className="text-red-500">*</span> I confirm that I am an authorized shareholder and agree to
                      the{" "}
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
                  {isSubmitting ? "Submitting..." : "Submit Shareholder Details"}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <Link href="/login" className="text-gray-400 hover:text-[#3BB273] text-sm transition-colors">
                    Already have an account? Log in
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
