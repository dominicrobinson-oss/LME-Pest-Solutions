import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/lme_pest_solutions",
  }),
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("public quote form creates a tracked enquiry", async ({ page }) => {
  await prisma.businessSetting.deleteMany({ where: { key: "rate-limit:quote:local" } });
  await page.goto("/get-a-quote");
  await expect(page.getByRole("heading", { name: /quote/i }).first()).toBeVisible();

  const suffix = Date.now().toString(36);
  await page.getByLabel("Name").fill(`Browser Test ${suffix}`);
  await page.getByLabel("Phone number").fill("07301113276");
  await page.getByRole("textbox", { name: "Email" }).fill(`browser-${suffix}@example.com`);
  await page.getByLabel("Postcode").fill("M1 1AA");
  await page.getByLabel("Property type").selectOption("Domestic");
  await page.getByLabel("Pest problem").selectOption("Rat Control");
  await page.getByLabel("Urgency").selectOption("This week");
  await page.getByLabel("Preferred contact").selectOption("Phone");
  await page.getByLabel("Short description").fill("Browser E2E public quote submission.");
  await page.getByLabel(/I consent/).check();
  await page.getByRole("button", { name: /submit enquiry/i }).click();

  await expect(page.getByText(/Your enquiry has been logged/i)).toBeVisible();
});

test("homepage exposes canonical and safe LocalBusiness schema", async ({ page }) => {
  await page.goto("/");
  const canonical = await page.locator("link[rel='canonical']").getAttribute("href");
  expect(canonical).toBeTruthy();
  expect(new URL(canonical as string).pathname).toBe("/");

  const jsonLd = await page.locator("script[type='application/ld+json']").allTextContents();
  const localBusiness = jsonLd.map((item) => JSON.parse(item)).find((item) => item["@type"] === "LocalBusiness");
  expect(localBusiness).toMatchObject({ name: "LME Pest Solutions", telephone: "07301 113 276" });
  expect(JSON.stringify(localBusiness)).not.toContain("aggregateRating");
});

test("public polish routes render without placeholder dead ends", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Across Manchester/i })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByText("info@lmepestsolutions.co.uk")).toBeVisible();

  for (const route of ["/domestic", "/commercial", "/emergency", "/advice", "/advice/prepare-for-pest-control-visit", "/services", "/areas-we-cover", "/contact"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  }
});
