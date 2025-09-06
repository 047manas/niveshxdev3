import { z } from "zod";

export const userAccountSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    designation: z.string().min(1, "Please select your designation"),
    linkedinProfile: z.string().url("Please enter a valid LinkedIn URL").or(z.literal('')),
    email: z.string().email("Please enter a valid email"),
    phone: z.object({
        countryCode: z.string().min(1, "Country code is required"),
        number: z.string().min(1, "Phone number is required")
    }),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export const otpSchema = z.object({
    otp: z.string().min(6, "Please enter your 6-digit OTP")
});

export * from "@/lib/schemas/company";
