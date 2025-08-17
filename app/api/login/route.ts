import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.hashedPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({ message: "Email not verified. Please complete the OTP verification process." }, { status: 403 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role } }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}