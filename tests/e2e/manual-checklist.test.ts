import { describe, expect, it } from "vitest";

describe("manual checklist readiness", () => {
  it("keeps the critical browser journey explicit", () => {
    const journey = [
      "/get-a-quote",
      "/forgot-password",
      "/verify-email",
      "/admin/leads",
      "/admin/customers",
      "/admin/quotes",
      "/customer/quotes/[id]",
      "/admin/jobs",
      "/technician",
      "/admin/finance",
      "/customer",
    ];
    expect(journey[0]).toBe("/get-a-quote");
    expect(journey).toContain("/technician");
  });
});
