import { describe, expect, it } from "vitest";
import { brandedPdf, moneyLine } from "@/lib/pdf";

describe("branded PDF renderer", () => {
  it("generates a valid PDF with LME branding and totals", () => {
    const pdf = brandedPdf({
      title: "Invoice",
      reference: "INV-TEST",
      status: "SENT",
      sections: [{ title: "Customer", fields: [{ label: "Name", value: "Test Customer" }] }],
      totals: [moneyLine("Total", 120)],
    });

    const text = pdf.toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("LME Pest Solutions");
    expect(text).toContain("INV-TEST");
    expect(text).toContain("GBP 120.00");
  });
});
