import { z } from "zod";

export const companyProfileSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    companyWebsite: z.string().url("Please enter a valid URL"),
    companyLinkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal('')),
    oneLiner: z.string().max(150, "Pitch must be 150 characters or less"),
    about: z.string().max(1000, "About section must be 1000 characters or less"),
});

export const companyDetailsSchema = z.object({
    industry: z.array(z.string()).nonempty("Please select at least one industry."),
    otherIndustry: z.string().optional(),
    primarySector: z.string().min(1, "Primary sector is required"),
    businessModel: z.string().min(1, "Business model is required"),
    stage: z.string().min(1, "Company stage is required"),
    teamSize: z.coerce.number().min(1, "Team size must be at least 1"),
    locations: z.string().min(1, "Please list at least one location."),
}).refine(data => !(data.industry.includes("Other") && !data.otherIndustry), {
    message: "Please specify your industry",
    path: ["otherIndustry"],
});

export const fundingHistorySchema = z.object({
    hasRaised: z.enum(["yes", "no"], { required_error: "Please select an option." }),
    totalRaised: z.coerce.number().optional(),
    currency: z.string().optional(),
    rounds: z.coerce.number().optional(),
    latestRound: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.hasRaised === 'yes') {
        if (!data.totalRaised || data.totalRaised <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Total funding raised is required.", path: ["totalRaised"] });
        if (!data.currency) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a currency.", path: ["currency"] });
        if (!data.rounds || data.rounds <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Number of rounds is required.", path: ["rounds"] });
        if (!data.latestRound) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select the latest round.", path: ["latestRound"] });
    }
});
