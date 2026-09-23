import { z } from "zod";

export const postcodeSchema = z
  .string()
  .trim()
  .min(3, "Enter a postcode")
  .max(12)
  .transform((value) => value.toUpperCase());

export const quoteEnquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  phone: z.string().trim().min(7, "Enter a phone number").max(40),
  email: z.string().trim().email("Enter a valid email").min(1, "Enter your email"),
  postcode: postcodeSchema,
  propertyType: z.string().trim().min(1, "Choose a property type"),
  pestProblem: z.string().trim().min(1, "Choose a pest problem"),
  urgency: z.string().trim().min(1, "Choose urgency"),
  preferredContactMethod: z.string().trim().min(1, "Choose a contact method"),
  description: z.string().trim().max(1200).optional().or(z.literal("")),
  consent: z.literal("on", {
    error: "Consent is required so LME can respond to your enquiry.",
  }),
});

export type QuoteEnquiryInput = z.infer<typeof quoteEnquirySchema>;
