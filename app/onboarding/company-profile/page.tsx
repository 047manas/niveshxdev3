"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Toaster, toast } from "sonner"

const formSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required." }),
  description: z.string().optional(),
  sector: z.string().min(1, { message: "Please select a sector." }),
  foundingYear: z.coerce.number()
    .int()
    .min(1800, { message: "Founding year must be after 1800." })
    .max(new Date().getFullYear(), { message: "Founding year cannot be in the future." }),
})

const sectors = [
  "Technology",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "SaaS",
  "Fintech",
  "Deep Tech",
  "AI/ML",
  "Blockchain",
  "Consumer Goods",
  "Other",
]

export default function CompanyProfilePage() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      description: "",
      sector: "",
      foundingYear: new Date().getFullYear(),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = Cookies.get("token")
    if (!token) {
      toast.error("Authentication token not found. Please log in again.")
      router.push("/login")
      return
    }

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Company profile created successfully!")
        router.push("/dashboard")
      } else {
        toast.error(data.error || "An unexpected error occurred.")
      }
    } catch (error) {
      toast.error("Failed to create profile. Please try again later.")
      console.error("Profile creation failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center p-4">
      <Toaster richColors />
      <Card className="w-full max-w-lg bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Tell Us About Your Company
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            This information will help us connect you with the right investors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Innovate Inc."
                        {...field}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what your company does."
                        {...field}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select a sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600 text-white">
                          {sectors.map((sector) => (
                            <SelectItem key={sector} value={sector} className="hover:bg-gray-700">
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foundingYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founding Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 2020"
                          {...field}
                          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white">
                Save & Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
