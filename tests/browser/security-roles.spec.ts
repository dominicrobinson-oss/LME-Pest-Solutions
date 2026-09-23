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

async function attemptLogin(page: Page, email: string, password: string) {
  await prisma.businessSetting.deleteMany({ where: { key: `rate-limit:login:${email.toLowerCase()}` } });
  await page.goto("/admin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

test("admin can log in at /admin and access operational modules", async ({ page }) => {
  await attemptLogin(page, "admin@lme.local", "ChangeMe123!");
  await expect(page).toHaveURL(/\/admin(?:[/?#]|$)/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.goto("/admin/jobs");
  await expect(page.getByRole("heading", { name: "Jobs and Scheduling" })).toBeVisible();
});

test("customer staff records have no login credentials", async ({ page }) => {
  await attemptLogin(page, "customer@lme.local", "ChangeMe123!");
  await expect(page.getByRole("heading", { name: "LME Admin Login" })).toBeVisible();
});

test("unauthenticated visits to admin subpages redirect back to the /admin login", async ({ page }) => {
  await page.goto("/admin/finance");
  await expect(page).toHaveURL(/\/admin\?callbackUrl=%2Fadmin%2Ffinance/);
  await expect(page.getByRole("heading", { name: "LME Admin Login" })).toBeVisible();
});
