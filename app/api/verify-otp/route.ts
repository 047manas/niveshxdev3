import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = verifyOtpSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { email, otp } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (!user.otp || !user.otpExpires) {
      return NextResponse.json({ message: "OTP not requested or already used" }, { status: 400 })
    }

    if (new Date() > new Date(user.otpExpires)) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 })
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp)

    if (!isOtpValid) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 })
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        otp: null,
        otpExpires: null,
      },
    })

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("OTP verification error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "An error occurred during OTP verification" }, { status: 500 })
  }
}
