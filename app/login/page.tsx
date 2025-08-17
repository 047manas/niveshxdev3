"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })

    // Additional fallback
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 50)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/marketplace');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="bg-[#1a2332] border-gray-700">
          <CardHeader className="text-center">
            <div className="font-body text-2xl font-bold mb-2">
              <span className="text-white">Nivesh</span>
              <span className="text-[#3BB273]">x</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <p className="text-gray-300">Sign in to your account</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="bg-[#0D1B2A] border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273]"
                  required
                />
              </div>


              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="bg-[#0D1B2A] border-gray-600 text-white placeholder-gray-400 focus:border-[#3BB273] pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link href="#" className="text-[#3BB273] hover:text-[#3BB273]/80 text-sm">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold">
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="text-center">
              <p className="text-gray-300">
                Don't have an account?{" "}
                <Link href="/signup-selection" className="text-[#3BB273] hover:text-[#3BB273]/80">
                 Register here
               </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
