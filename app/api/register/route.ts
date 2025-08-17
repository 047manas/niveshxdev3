import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

const companySchema = z.object({
  role: z.literal("COMPANY"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  designation: z.string().min(1),
  companyName: z.string().min(1),
  companyEmail: z.string().email(),
  phoneNumber: z.string().min(10),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  numberOfEmployees: z.string().optional(),
  password: z.string().min(8),
})

const investorSchema = z.object({
  role: z.literal("INVESTOR"),
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  investorType: z.string().min(1),
  companyName: z.string().optional(),
  country: z.string().min(1),
  investmentBudget: z.string().min(1),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  password: z.string().min(8),
})

const shareholderSchema = z.object({
  role: z.literal("SHAREHOLDER"),
  fullName: z.string().min(1),
  companyName: z.string().min(1),
  companyEmail: z.string().email(),
  phoneNumber: z.string().min(10),
  sharesHeld: z.string().min(1),
  shareClass: z.string().optional(),
  shareValue: z.string().min(1),
  country: z.string().min(1),
  password: z.string().min(8),
})

const registerSchema = z.discriminatedUnion("role", [companySchema, investorSchema, shareholderSchema])

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { password, ...data } = result.data
    const email = data.role === "COMPANY" || data.role === "SHAREHOLDER" ? data.companyEmail : data.email

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ message: "User with this email already exists and is verified" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    console.log(`OTP for ${email}: ${otp}`) // Log OTP for testing

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { email },
        data: {
          hashedPassword,
          role: data.role,
          name: data.role === "INVESTOR" || data.role === "SHAREHOLDER" ? data.fullName : `${data.firstName} ${data.lastName}`,
          otp: hashedOtp,
          otpExpires,
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          email,
          hashedPassword,
          role: data.role,
          name: data.role === "INVESTOR" || data.role === "SHAREHOLDER" ? data.fullName : `${data.firstName} ${data.lastName}`,
          otp: hashedOtp,
          otpExpires,
        },
      })
    }

    // Since a user can only have one profile, we use upsert to create a new profile or update an existing one.
    // This handles cases where a user re-registers with a different role.
    await prisma.$transaction(async (tx) => {
      // First, delete all possible profiles to handle role changes.
      // The upsert logic below only works if the user keeps the same role.
      // If a user was a "COMPANY" and re-registers as "INVESTOR", the old company profile would remain.
      await tx.company.deleteMany({ where: { userId: user.id } });
      await tx.investor.deleteMany({ where: { userId: user.id } });
      await tx.shareholder.deleteMany({ where: { userId: user.id } });

      switch (data.role) {
        case "COMPANY":
          await tx.company.upsert({
            where: { userId: user.id },
            update: {
              name: data.companyName,
              description: `Designation: ${data.designation}, Employees: ${data.numberOfEmployees || "N/A"}`,
            },
            create: {
              name: data.companyName,
              description: `Designation: ${data.designation}, Employees: ${data.numberOfEmployees || "N/A"}`,
              userId: user.id,
            },
          });
          break;
        case "INVESTOR":
          await tx.investor.upsert({
            where: { userId: user.id },
            update: {
              name: data.fullName,
              interests: `Type: ${data.investorType}, Budget: ${data.investmentBudget}`,
            },
            create: {
              name: data.fullName,
              interests: `Type: ${data.investorType}, Budget: ${data.investmentBudget}`,
              userId: user.id,
            },
          });
          break;
        case "SHAREHOLDER":
          await tx.shareholder.upsert({
            where: { userId: user.id },
            update: {
              name: data.fullName,
              shares: parseInt(data.sharesHeld, 10) || 0,
            },
            create: {
              name: data.fullName,
              shares: parseInt(data.sharesHeld, 10) || 0,
              userId: user.id,
            },
          });
          break;
      }
    });


    return NextResponse.json({ message: "OTP sent to your email. Please verify to complete registration.", email }, { status: 200 })
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 })
  }
}
