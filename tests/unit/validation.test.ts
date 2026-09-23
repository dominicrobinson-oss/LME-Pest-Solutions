import { describe, expect, it } from "vitest";
import { quoteEnquirySchema } from "@/lib/validation";

describe("quote enquiry validation", () => {
  it("accepts a complete website quote enquiry", () => {
    const parsed = quoteEnquirySchema.safeParse({
      name: "Jane Customer",
      phone: "07301 113 276",
      email: "jane@example.com",
      postcode: "M1 1AA",
      propertyType: "Domestic",
      pestProblem: "Rat Control",
      urgency: "Today",
      preferredContactMethod: "Phone",
      description: "Activity in kitchen",
      consent: "on",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a missing email", () => {
    const parsed = quoteEnquirySchema.safeParse({
      name: "Jane Customer",
      phone: "07301 113 276",
      postcode: "M1 1AA",
      propertyType: "Domestic",
      pestProblem: "Rat Control",
      urgency: "Today",
      preferredContactMethod: "Phone",
      consent: "on",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing consent", () => {
    const parsed = quoteEnquirySchema.safeParse({
      name: "Jane Customer",
      phone: "07301 113 276",
      postcode: "M1 1AA",
      propertyType: "Domestic",
      pestProblem: "Rat Control",
      urgency: "Today",
      preferredContactMethod: "Phone",
    });
    expect(parsed.success).toBe(false);
  });
});
