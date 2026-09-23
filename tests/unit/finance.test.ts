import { describe, expect, it } from "vitest";
import { calculateQuoteTotals, nextInvoiceStatus } from "@/lib/finance";
import { paymentProvider } from "@/lib/providers";

describe("finance helpers", () => {
  it("calculates quote totals with VAT and discount", () => {
    expect(calculateQuoteTotals({ quantity: 2, unitPrice: 50, labour: 25, discount: 10, vat: 23 })).toEqual({
      itemTotal: 100,
      subtotal: 115,
      total: 138,
    });
  });

  it("derives invoice status from payment totals", () => {
    expect(nextInvoiceStatus(100, 0)).toBe("SENT");
    expect(nextInvoiceStatus(100, 50)).toBe("PARTIALLY_PAID");
    expect(nextInvoiceStatus(100, 100)).toBe("PAID");
  });

  it("creates a bank-transfer payment request with remittance details", async () => {
    const request = await paymentProvider.createBankTransferRequest({ amount: 120, reference: "INV-TEST" });
    expect(request.status).toBe("AWAITING_BANK_TRANSFER");
    expect(request.reference).toBe("INV-TEST");
    expect(request.bankDetails.accountName).toBeTruthy();
  });
});
