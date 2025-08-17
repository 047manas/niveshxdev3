"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { ScrollRestoration } from "@/components/scroll-restoration"
import { useToast } from "@/hooks/use-toast"

const formSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    designation: z.string().min(1, "Designation is required"),
    companyName: z.string().min(1, "Company name is required"),
    companyEmail: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    numberOfEmployees: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

export default function CompanyRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreeToTerms: false,
      firstName: "",
      lastName: "",
      designation: "",
      companyName: "",
      companyEmail: "",
      phoneNumber: "",
      websiteUrl: "",
      numberOfEmployees: "",
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
          role: "COMPANY",
          ...data,
        }),
      })

      const res = await response.json()
      if (!response.ok) {
        throw new Error(res.message || "Something went wrong")
      }

      router.push(`/verify-otp?email=${res.email}`)
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
    }
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
      <div className="flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Unlock Liquidity for Your <span className="text-[#3BB273]">Cap Table</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Enable secondary transactions and provide exit opportunities for your investors and employees
            </p>
          </div>

          {/* Form Card */}
          <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <h2 className="text-2xl font-semibold text-white text-center">Register Your Startup</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-200 font-medium">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-200 font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-gray-200 font-medium">
                    Designation <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="designation"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-[#0D1B2A]/50 border-gray-600 text-white focus:border-[#3BB273] focus:ring-[#3BB273]">
                          <SelectValue placeholder="Select your designation" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-600">
                          <SelectItem value="founder" className="text-white hover:bg-[#3BB273]/20">
                            Founder
                          </SelectItem>
                          <SelectItem value="ceo" className="text-white hover:bg-[#3BB273]/20">
                            CEO
                          </SelectItem>
                          <SelectItem value="cfo" className="text-white hover:bg-[#3BB273]/20">
                            CFO
                          </SelectItem>
                          <SelectItem value="hr-head" className="text-white hover:bg-[#3BB273]/20">
                            HR Head
                          </SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-[#3BB273]/20">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>}
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-200 font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
                </div>

                {/* Company Email */}
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-gray-200 font-medium">
                    Company Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    {...register("companyEmail")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="company@example.com"
                  />
                  {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200 font-medium">
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
                  <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">
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
                  <Label htmlFor="phoneNumber" className="text-gray-200 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-[#0D1B2A]/50 border border-gray-600 border-r-0 rounded-l-md">
                      <span className="text-white text-sm">+91</span>
                    </div>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register("phoneNumber")}
                      className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273] rounded-l-none"
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-gray-200 font-medium">
                    Website URL
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    {...register("websiteUrl")}
                    className="bg-[#0D1B2A]/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] focus:ring-[#3BB273]"
                    placeholder="https://yourcompany.com"
                  />
                  {errors.websiteUrl && <p className="text-red-500 text-sm mt-1">{errors.websiteUrl.message}</p>}
                </div>

                {/* Number of Employees */}
                <div className="space-y-2">
                  <Label htmlFor="numberOfEmployees" className="text-gray-200 font-medium">
                    Number of Employees
                  </Label>
                  <Controller
                    name="numberOfEmployees"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-[#0D1B2A]/50 border-gray-600 text-white focus:border-[#3BB273] focus:ring-[#3BB273]">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-600">
                          <SelectItem value="1-10" className="text-white hover:bg-[#3BB273]/20">
                            1-10
                          </SelectItem>
                          <SelectItem value="11-50" className="text-white hover:bg-[#3BB273]/20">
                            11-50
                          </SelectItem>
                          <SelectItem value="51-200" className="text-white hover:bg-[#3BB273]/20">
                            51-200
                          </SelectItem>
                          <SelectItem value="201+" className="text-white hover:bg-[#3BB273]/20">
                            201+
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.numberOfEmployees && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfEmployees.message}</p>
                  )}
                </div>

                {/* Terms and Privacy Agreement */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 bg-[#0D1B2A]/30 rounded-lg border border-gray-700/50">
                    <Controller
                      name="agreeToTerms"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="agreeToTerms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1 border-gray-600 data-[state=checked]:bg-[#3BB273] data-[state=checked]:border-[#3BB273]"
                        />
                      )}
                    />
                    <Label htmlFor="agreeToTerms" className="text-gray-200 text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-[#3BB273] hover:text-[#3BB273]/80 underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-[#3BB273] hover:text-[#3BB273]/80 underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </Link>
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                  </div>
                  {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms.message}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold py-3 text-lg transition-all duration-200"
                >
                  {isSubmitting ? "Registering..." : "Register Your Startup"}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <Link href="/login" className="text-gray-400 hover:text-[#3BB273] text-sm transition-colors">
                    Already have an account? Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm mb-4">Trusted by 100+ startups across India</p>
            <div className="flex justify-center items-center space-x-6 text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[#3BB273]" />
                <span className="text-sm">Secure & Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[#3BB273]" />
                <span className="text-sm">Zero Commission</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[#3BB273]" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
