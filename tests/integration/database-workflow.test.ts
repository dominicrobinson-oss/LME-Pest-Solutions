import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { nextNumber } from "@/lib/numbering";
import { checkRateLimit } from "@/lib/rate-limit";

const created = {
  leadIds: [] as string[],
  customerIds: [] as string[],
  propertyIds: [] as string[],
  quoteIds: [] as string[],
  jobIds: [] as string[],
  invoiceIds: [] as string[],
  paymentIds: [] as string[],
  documentIds: [] as string[],
  auditIds: [] as string[],
  rateLimitKeys: [] as string[],
};

describe("database-backed operational workflow", () => {
  it("creates and links the core records from lead to paid invoice", async () => {
    const suffix = Date.now().toString(36);
    const lead = await prisma.lead.create({
      data: {
        leadNumber: await nextNumber("lead"),
        customerName: `Workflow Customer ${suffix}`,
        email: `workflow-${suffix}@example.com`,
        phone: "07301113276",
        postcode: "M1 1AA",
        pestType: "Rats",
        propertyType: "Domestic",
        urgency: "Soon",
        preferredContactMethod: "Phone",
        source: "Integration test",
      },
    });
    created.leadIds.push(lead.id);

    const customer = await prisma.customer.create({
      data: {
        customerNumber: await nextNumber("customer"),
        name: lead.customerName,
        email: lead.email,
        phone: lead.phone,
        customerType: "Residential",
        leads: { connect: { id: lead.id } },
      },
    });
    created.customerIds.push(customer.id);

    const property = await prisma.property.create({
      data: {
        customerId: customer.id,
        address: "1 Workflow Street, Manchester",
        postcode: lead.postcode,
        propertyType: "Domestic",
      },
    });
    created.propertyIds.push(property.id);

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: await nextNumber("quote"),
        customerId: customer.id,
        propertyId: property.id,
        leadId: lead.id,
        pestType: lead.pestType,
        title: "Initial pest treatment",
        subtotal: 100,
        vat: 20,
        total: 120,
        status: "ACCEPTED",
        acceptedAt: new Date(),
        items: { create: [{ description: "Treatment", quantity: 1, unitPrice: 100, total: 100 }] },
      },
      include: { items: true },
    });
    created.quoteIds.push(quote.id);

    const job = await prisma.job.create({
      data: {
        jobNumber: await nextNumber("job"),
        customerId: customer.id,
        propertyId: property.id,
        quoteId: quote.id,
        pestType: quote.pestType,
        jobType: "Initial treatment",
        status: "COMPLETED",
      },
    });
    created.jobIds.push(job.id);

    const treatment = await prisma.treatmentRecord.create({
      data: {
        jobId: job.id,
        customerId: customer.id,
        propertyId: property.id,
        pestIdentified: "Rats",
        infestationSeverity: "Moderate",
        areasInspected: "Kitchen and external perimeter",
        treatmentMethod: "Inspection and baiting",
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await nextNumber("invoice"),
        customerId: customer.id,
        propertyId: property.id,
        quoteId: quote.id,
        jobId: job.id,
        subtotal: 100,
        vat: 20,
        total: 120,
        amountOutstanding: 120,
        status: "SENT",
        items: { create: [{ description: "Treatment", quantity: 1, unitPrice: 120, total: 120 }] },
      },
    });
    created.invoiceIds.push(invoice.id);

    const payment = await prisma.payment.create({
      data: {
        paymentReference: await nextNumber("payment"),
        customerId: customer.id,
        invoiceId: invoice.id,
        amount: 120,
        method: "Bank transfer",
        status: "COMPLETED",
      },
    });
    created.paymentIds.push(payment.id);

    const paidInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { amountPaid: 120, amountOutstanding: 0, status: "PAID" },
    });

    const document = await prisma.document.create({
      data: {
        category: "Treatment report",
        title: "Workflow treatment report",
        url: `/api/reports/treatment/${treatment.id}`,
        customerId: customer.id,
        propertyId: property.id,
        jobId: job.id,
        invoiceId: invoice.id,
      },
    });
    created.documentIds.push(document.id);

    const audit = await prisma.auditLog.create({
      data: {
        action: "WORKFLOW_TEST_COMPLETED",
        entity: "Job",
        entityId: job.id,
        newValue: { treatmentId: treatment.id, invoiceId: invoice.id, paymentId: payment.id, documentId: document.id },
      },
    });
    created.auditIds.push(audit.id);

    expect(quote.items).toHaveLength(1);
    expect(paidInvoice.status).toBe("PAID");
    expect(Number(paidInvoice.amountOutstanding)).toBe(0);
    expect(document.url).toContain(treatment.id);
    expect(audit.entityId).toBe(job.id);
  });

  it("persists rate-limit counters in the database", async () => {
    const key = `integration-${Date.now()}`;
    created.rateLimitKeys.push(`rate-limit:${key}`);
    expect((await checkRateLimit(key, 2, 60_000)).ok).toBe(true);
    expect((await checkRateLimit(key, 2, 60_000)).ok).toBe(true);
    expect((await checkRateLimit(key, 2, 60_000)).ok).toBe(false);
  });
});

afterAll(async () => {
  await prisma.businessSetting.deleteMany({ where: { key: { in: created.rateLimitKeys } } });
  await prisma.auditLog.deleteMany({ where: { id: { in: created.auditIds } } });
  await prisma.document.deleteMany({ where: { id: { in: created.documentIds } } });
  await prisma.payment.deleteMany({ where: { id: { in: created.paymentIds } } });
  await prisma.invoice.deleteMany({ where: { id: { in: created.invoiceIds } } });
  await prisma.treatmentRecord.deleteMany({ where: { jobId: { in: created.jobIds } } });
  await prisma.job.deleteMany({ where: { id: { in: created.jobIds } } });
  await prisma.quote.deleteMany({ where: { id: { in: created.quoteIds } } });
  await prisma.property.deleteMany({ where: { id: { in: created.propertyIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: created.customerIds } } });
  await prisma.lead.deleteMany({ where: { id: { in: created.leadIds } } });
  await prisma.$disconnect();
});
