import { expect, test, type Page } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/lme_pest_solutions",
  }),
});

test.describe.configure({ mode: "serial" });
test.afterAll(async () => {
  await prisma.$disconnect();
});

async function login(page: Page, email: string, password = "ChangeMe123!") {
  await prisma.businessSetting.deleteMany({ where: { key: `rate-limit:login:${email.toLowerCase()}` } });
  await page.context().clearCookies();
  await page.goto("/admin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

function dateTimeLocal(offsetDays: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}

test("full admin-only workflow from public enquiry to paid invoice and document access", async ({ page }) => {
  test.setTimeout(180_000);
  const suffix = Date.now().toString(36);
  const customerEmail = `full-workflow-${suffix}@example.com`;
  const customerName = `Full Workflow ${suffix}`;
  const customerPhone = `07900${Date.now().toString().slice(-6)}`;

  await page.goto("/get-a-quote");
  await page.getByLabel("Name").fill(customerName);
  await page.getByLabel("Phone number").fill(customerPhone);
  await page.getByRole("textbox", { name: "Email" }).fill(customerEmail);
  await page.getByLabel("Postcode").fill("M1 1AA");
  await page.getByLabel("Property type").selectOption("Domestic");
  await page.getByLabel("Pest problem").selectOption("Rat Control");
  await page.getByLabel("Urgency").selectOption("Today");
  await page.getByLabel("Preferred contact").selectOption("Email");
  await page.getByLabel("Short description").fill("Full workflow browser test.");
  await page.getByLabel(/I consent/).check();
  await page.getByRole("button", { name: /submit enquiry/i }).click();
  await expect(page.getByText(/Your enquiry has been logged/i)).toBeVisible();

  const lead = await prisma.lead.findFirstOrThrow({ where: { email: customerEmail }, orderBy: { createdAt: "desc" } });

  await login(page, "admin@lme.local");
  await page.goto(`/admin/leads/${lead.id}`);
  await page.getByPlaceholder(/Call notes/i).fill("Qualified from browser workflow.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Qualified from browser workflow.")).toBeVisible();
  await page.getByRole("button", { name: "Convert to customer and property" }).click();
  await expect(page).toHaveURL(/\/admin\/customers\//);
  await expect(page.getByRole("heading", { name: new RegExp(customerName, "i") })).toBeVisible();

  const customer = await prisma.customer.findFirstOrThrow({ where: { email: customerEmail }, include: { properties: true } });

  await page.getByPlaceholder("Pest type").fill("Rat Control");
  await page.getByPlaceholder("Quote title").fill("Rat treatment workflow quote");
  await page.getByPlaceholder("Line item").fill("Inspection and treatment");
  await page.getByPlaceholder("Unit price").fill("165");
  await page.getByPlaceholder("VAT").fill("33");
  await page.getByRole("button", { name: "Create quote" }).click();
  await expect(page.getByRole("heading", { name: /LME-QTE-/ })).toBeVisible();

  const quote = await prisma.quote.findFirstOrThrow({ where: { customerId: customer.id, title: "Rat treatment workflow quote" }, orderBy: { createdAt: "desc" } });
  await page.getByRole("button", { name: "Send quote" }).click();
  await page.getByRole("button", { name: "Mark accepted" }).click();
  await expect(page.getByText("Status: ACCEPTED")).toBeVisible();

  await page.getByRole("button", { name: "Convert to job" }).click();
  await expect(page.getByRole("heading", { name: /LME-JOB-/ })).toBeVisible();

  const job = await prisma.job.findFirstOrThrow({ where: { quoteId: quote.id }, orderBy: { createdAt: "desc" } });
  const staffMember = await prisma.user.findFirstOrThrow({ where: { email: "admin@lme.local" } });
  await prisma.jobAssignment.upsert({ where: { jobId_userId: { jobId: job.id, userId: staffMember.id } }, update: {}, create: { jobId: job.id, userId: staffMember.id } });

  await page.locator('input[name="scheduledStart"]').fill(dateTimeLocal(1, 9));
  await page.locator('input[name="scheduledEnd"]').fill(dateTimeLocal(1, 10));
  await page.getByRole("button", { name: "Update schedule" }).click();

  await page.getByRole("button", { name: "COMPLETED", exact: true }).click();
  await expect(page.getByText(/COMPLETED/i).first()).toBeVisible();

  await page.getByRole("button", { name: "Create invoice" }).click();
  await expect(page).toHaveURL(/\/admin\/finance/);

  const invoice = await prisma.invoice.findFirstOrThrow({ where: { jobId: job.id }, orderBy: { createdAt: "desc" } });
  await page.goto("/admin/finance");
  const invoiceRow = page.getByRole("row").filter({ hasText: invoice.invoiceNumber });
  await invoiceRow.getByPlaceholder("Amount").fill(String(invoice.total));
  await invoiceRow.getByRole("button", { name: "Record" }).click();
  await expect
    .poll(async () => {
      const paidInvoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoice.id } });
      return paidInvoice.status;
    })
    .toBe("PAID");

  const document = await prisma.document.findFirst({ where: { jobId: job.id, customerId: customer.id }, orderBy: { createdAt: "desc" } });
  if (document) {
    const download = await page.request.get(`/api/documents/${document.id}`);
    expect(download.status()).toBeLessThan(400);
  }

  await page.context().clearCookies();
  const anonymousAttempt = await page.request.get(`/api/documents/${document?.id ?? "missing"}`, { maxRedirects: 0 });
  expect(anonymousAttempt.status()).toBeGreaterThanOrEqual(300);
});
