import { expect, test, type Page } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

test.describe.configure({ mode: "serial" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/lme_pest_solutions",
  }),
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

async function login(page: Page, email: string) {
  await prisma.businessSetting.deleteMany({ where: { key: `rate-limit:login:${email.toLowerCase()}` } });
  await page.goto("/customer-login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("ChangeMe123!");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/customer(?:[/?#]|$)/);
}

test("admin can access dashboard and operational modules", async ({ page }) => {
  await login(page, "admin@lme.local");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.goto("/admin/calendar");
  await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
});

test("customer is isolated from admin and technician areas", async ({ page }) => {
  await login(page, "customer@lme.local");
  await page.goto("/customer");
  await expect(page.getByRole("heading", { name: /Customer Portal|Dashboard/i })).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

  await page.goto("/technician");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});

test("technician can access technician work but not finance", async ({ page }) => {
  await login(page, "technician@lme.local");
  await page.goto("/technician");
  await expect(page.getByRole("heading", { name: /Today/i })).toBeVisible();

  await page.goto("/admin/finance");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
