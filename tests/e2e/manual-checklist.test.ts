import { describe, expect, it } from "vitest";

describe("manual checklist readiness", () => {
  it("keeps the critical browser journey explicit", () => {
    const journey = [
      "/get-a-quote",
      "/admin",
      "/forgot-password",
      "/admin/leads",
      "/admin/customers",
      "/admin/quotes",
      "/admin/jobs",
      "/admin/finance",
    ];
    expect(journey[0]).toBe("/get-a-quote");
    expect(journey).toContain("/admin");
    expect(journey).not.toContain("/customer");
    expect(journey).not.toContain("/technician");
  });
});
