"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import type { JobStatus, LeadStatus } from "@/generated/prisma/client";
import { audit } from "@/lib/audit";
import { adminRoles, requireAnyRole, requireCustomerOwnership, requireTechnicianAssignment } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { emailTemplates } from "@/lib/email-templates";
import { env } from "@/lib/env";
import { nextNumber } from "@/lib/numbering";
import { emailProvider, paymentProvider, storageProvider } from "@/lib/providers";
import { validatedUpload } from "@/lib/uploads";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function money(formData: FormData, key: string) {
  const parsed = Number(value(formData, key) || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

async function inviteCustomerPortalUser(customer: { id: string; name: string; email: string | null; userId: string | null }) {
  if (!customer.email) return null;
  const email = customer.email.toLowerCase().trim();
  let user = await prisma.user.findUnique({ where: { email }, include: { customer: true } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: customer.name,
        role: "CUSTOMER",
        status: "ACTIVE",
      },
      include: { customer: true },
    });
  }
  if (!customer.userId && (!user.customer || user.customer.id === customer.id)) {
    await prisma.customer.update({ where: { id: customer.id }, data: { userId: user.id } });
  }
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { identifier: `password-reset:${email}` } });
  await prisma.verificationToken.create({
    data: {
      identifier: `password-reset:${email}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const resetUrl = `${env.PUBLIC_SITE_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  await emailProvider.send({ to: email, ...emailTemplates.customerPortalInvite(resetUrl) });
  return { userId: user.id, email, resetUrl };
}

export async function updateLeadStatus(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const id = value(formData, "id");
  const status = value(formData, "status") as LeadStatus;
  const lostReason = value(formData, "lostReason") || undefined;
  const previous = await prisma.lead.findUniqueOrThrow({ where: { id } });
  const lead = await prisma.lead.update({ where: { id }, data: { status, lostReason } });
  await audit("LEAD_STATUS_CHANGED", "Lead", { userId: user.id, entityId: id, previousValue: previous, newValue: lead });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function addLeadNote(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const leadId = value(formData, "leadId");
  const body = z.string().min(1).parse(value(formData, "body"));
  const note = await prisma.leadNote.create({ data: { leadId, body, createdBy: user.id } });
  await audit("LEAD_NOTE_CREATED", "LeadNote", { userId: user.id, entityId: note.id, newValue: note });
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function assignLead(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const id = value(formData, "id");
  const assignedStaffId = value(formData, "assignedStaffId") || null;
  const lead = await prisma.lead.update({ where: { id }, data: { assignedStaffId } });
  await audit("LEAD_ASSIGNED", "Lead", { userId: user.id, entityId: id, newValue: { assignedStaffId } });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${lead.id}`);
}

export async function convertLeadToCustomer(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const leadId = value(formData, "leadId");
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  let customer = lead.email
    ? await prisma.customer.findFirst({ where: { OR: [{ email: lead.email }, { phone: lead.phone }] } })
    : await prisma.customer.findFirst({ where: { phone: lead.phone } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        customerNumber: await nextNumber("customer"),
        name: lead.customerName,
        email: lead.email,
        phone: lead.phone,
        customerType: lead.market || lead.propertyType || "Residential",
        marketingConsent: false,
      },
    });
  }
  const portalInvite = await inviteCustomerPortalUser(customer);
  const property = await prisma.property.create({
    data: {
      customerId: customer.id,
      propertyName: "Primary site",
      address: lead.fullAddress || lead.postcode,
      postcode: lead.postcode,
      propertyType: lead.propertyType,
    },
  });
  await prisma.lead.update({ where: { id: leadId }, data: { customerId: customer.id, propertyId: property.id, status: "QUALIFIED" } });
  await audit("LEAD_CONVERTED_TO_CUSTOMER", "Lead", { userId: user.id, entityId: leadId, newValue: { customerId: customer.id, propertyId: property.id, portalInvite: portalInvite ? { userId: portalInvite.userId, email: portalInvite.email } : null } });
  redirect(`/admin/customers/${customer.id}`);
}

export async function createCustomer(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const customer = await prisma.customer.create({
    data: {
      customerNumber: await nextNumber("customer"),
      name: z.string().min(2).parse(value(formData, "name")),
      companyName: value(formData, "companyName") || null,
      email: value(formData, "email") || null,
      phone: value(formData, "phone") || null,
      billingAddress: value(formData, "billingAddress") || null,
      customerType: value(formData, "customerType") || "Residential",
      tags: value(formData, "tags").split(",").map((tag) => tag.trim()).filter(Boolean),
      marketingConsent: formData.get("marketingConsent") === "on",
    },
  });
  await audit("CUSTOMER_CREATED", "Customer", { userId: user.id, entityId: customer.id, newValue: customer });
  redirect(`/admin/customers/${customer.id}`);
}

export async function createProperty(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const customerId = value(formData, "customerId");
  const property = await prisma.property.create({
    data: {
      customerId,
      propertyName: value(formData, "propertyName") || null,
      address: z.string().min(2).parse(value(formData, "address")),
      postcode: z.string().min(3).parse(value(formData, "postcode")).toUpperCase(),
      propertyType: value(formData, "propertyType") || "Other",
      accessInstructions: value(formData, "accessInstructions") || null,
      parkingInstructions: value(formData, "parkingInstructions") || null,
      keyholderDetails: value(formData, "keyholderDetails") || null,
      alarmDetails: value(formData, "alarmDetails") || null,
      petsPresent: formData.get("petsPresent") === "on",
      childrenPresent: formData.get("childrenPresent") === "on",
      vulnerableOccupants: formData.get("vulnerableOccupants") === "on",
      foodHandlingArea: formData.get("foodHandlingArea") === "on",
      siteContact: value(formData, "siteContact") || null,
      previousPestHistory: value(formData, "previousPestHistory") || null,
      recurringRequirements: value(formData, "recurringRequirements") || null,
    },
  });
  await audit("PROPERTY_CREATED", "Property", { userId: user.id, entityId: property.id, newValue: property });
  revalidatePath(`/admin/customers/${customerId}`);
}

export async function createQuote(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const leadId = value(formData, "leadId") || undefined;
  const customerId = value(formData, "customerId") || undefined;
  const propertyId = value(formData, "propertyId") || undefined;
  const lineDescription = value(formData, "lineDescription") || value(formData, "title");
  const quantity = money(formData, "quantity") || 1;
  const unitPrice = money(formData, "unitPrice");
  const labour = money(formData, "labour");
  const materials = money(formData, "materials");
  const callOutFee = money(formData, "callOutFee");
  const travelCharge = money(formData, "travelCharge");
  const discount = money(formData, "discount");
  const vat = money(formData, "vat");
  const itemTotal = quantity * unitPrice;
  const subtotal = itemTotal + labour + materials + callOutFee + travelCharge - discount;
  const total = subtotal + vat;
  const quote = await prisma.quote.create({
    data: {
      quoteNumber: await nextNumber("quote"),
      leadId,
      customerId,
      propertyId,
      pestType: value(formData, "pestType") || "General Pest Control",
      title: z.string().min(2).parse(value(formData, "title")),
      description: value(formData, "description") || null,
      labour,
      materials,
      callOutFee,
      travelCharge,
      discount,
      vat,
      subtotal,
      total,
      depositRequired: money(formData, "depositRequired"),
      expiresAt: value(formData, "expiresAt") ? new Date(value(formData, "expiresAt")) : null,
      terms: value(formData, "terms") || "Quote valid until expiry date. Treatment safety instructions will be provided where applicable.",
      status: "READY",
      createdById: user.id,
      items: { create: [{ description: lineDescription, quantity, unitPrice, total: itemTotal }] },
      revisions: { create: [{ version: 1, snapshot: { subtotal, total, lineDescription }, createdBy: user.id }] },
    },
  });
  if (leadId) await prisma.lead.update({ where: { id: leadId }, data: { status: "QUOTE_IN_PROGRESS" } });
  await audit("QUOTE_CREATED", "Quote", { userId: user.id, entityId: quote.id, newValue: quote });
  redirect(`/admin/quotes/${quote.id}`);
}

export async function sendQuote(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const id = value(formData, "id");
  const quote = await prisma.quote.update({ where: { id }, data: { status: "SENT", sentAt: new Date() }, include: { customer: true, lead: true } });
  const recipient = quote.customer?.email || quote.lead?.email;
  if (recipient) await emailProvider.send({ to: recipient, ...emailTemplates.quoteSent(quote.quoteNumber, `${env.PUBLIC_SITE_URL}/customer/quotes/${quote.id}`) });
  await audit("QUOTE_SENT", "Quote", { userId: user.id, entityId: id, newValue: { status: "SENT", recipient } });
  revalidatePath(`/admin/quotes/${id}`);
}

export async function acceptQuote(formData: FormData) {
  const id = value(formData, "quoteId");
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id }, include: { customer: true } });
  if (quote.customerId) await requireCustomerOwnership(quote.customerId);
  const acceptance = await prisma.digitalAcceptance.create({
    data: {
      quoteId: id,
      name: z.string().min(2).parse(value(formData, "name")),
      email: value(formData, "email") || null,
      terms: quote.terms || "Accepted quote terms",
      comment: value(formData, "comment") || null,
      accepted: true,
    },
  });
  await prisma.quote.update({ where: { id }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
  const staff = await prisma.user.findFirst({ where: { role: { in: ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER"] }, status: "ACTIVE" } });
  if (staff?.email) await emailProvider.send({ to: staff.email, ...emailTemplates.quoteAccepted(quote.quoteNumber) });
  await audit("QUOTE_ACCEPTED", "Quote", { entityId: id, newValue: acceptance });
  revalidatePath(`/customer/quotes/${id}`);
}

export async function declineQuote(formData: FormData) {
  const id = value(formData, "quoteId");
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } });
  if (quote.customerId) await requireCustomerOwnership(quote.customerId);
  await prisma.quote.update({ where: { id }, data: { status: "DECLINED", declinedAt: new Date(), rejectionReason: value(formData, "reason") || null } });
  await audit("QUOTE_DECLINED", "Quote", { entityId: id, newValue: { reason: value(formData, "reason") } });
  revalidatePath(`/customer/quotes/${id}`);
}

export async function convertQuoteToJob(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const quoteId = value(formData, "quoteId");
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id: quoteId } });
  const job = await prisma.job.create({
    data: {
      jobNumber: await nextNumber("job"),
      quoteId,
      customerId: quote.customerId,
      propertyId: quote.propertyId,
      pestType: quote.pestType,
      jobType: value(formData, "jobType") || "Initial treatment",
      priority: value(formData, "priority") || "Normal",
      status: "UNSCHEDULED",
      description: quote.description,
      treatmentPlan: quote.title,
    },
  });
  await prisma.quote.update({ where: { id: quoteId }, data: { status: "CONVERTED" } });
  await audit("QUOTE_CONVERTED_TO_JOB", "Quote", { userId: user.id, entityId: quoteId, newValue: { jobId: job.id } });
  redirect(`/admin/jobs/${job.id}`);
}

export async function createJob(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const job = await prisma.job.create({
    data: {
      jobNumber: await nextNumber("job"),
      customerId: value(formData, "customerId") || undefined,
      propertyId: value(formData, "propertyId") || undefined,
      pestType: value(formData, "pestType") || "General Pest Control",
      jobType: value(formData, "jobType") || "Inspection",
      priority: value(formData, "priority") || "Normal",
      status: "UNSCHEDULED",
      scheduledStart: value(formData, "scheduledStart") ? new Date(value(formData, "scheduledStart")) : null,
      scheduledEnd: value(formData, "scheduledEnd") ? new Date(value(formData, "scheduledEnd")) : null,
      description: value(formData, "description") || null,
      accessNotes: value(formData, "accessNotes") || null,
      treatmentPlan: value(formData, "treatmentPlan") || null,
    },
  });
  await audit("JOB_CREATED", "Job", { userId: user.id, entityId: job.id, newValue: job });
  redirect(`/admin/jobs/${job.id}`);
}

export async function assignJob(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const jobId = value(formData, "jobId");
  const userId = value(formData, "userId");
  await prisma.jobAssignment.upsert({ where: { jobId_userId: { jobId, userId } }, update: {}, create: { jobId, userId } });
  await prisma.notification.create({ data: { userId, type: "NEW_JOB_ASSIGNED", title: "New job assigned", body: jobId } });
  await audit("JOB_ASSIGNED", "Job", { userId: user.id, entityId: jobId, newValue: { userId } });
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function scheduleJobAdmin(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const jobId = value(formData, "jobId");
  const scheduledStart = value(formData, "scheduledStart") ? new Date(value(formData, "scheduledStart")) : null;
  const scheduledEnd = value(formData, "scheduledEnd") ? new Date(value(formData, "scheduledEnd")) : null;
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId }, include: { assignments: true } });
  const conflicts = scheduledStart && scheduledEnd && job.assignments.length
    ? await prisma.job.findMany({
        where: {
          id: { not: jobId },
          assignments: { some: { userId: { in: job.assignments.map((assignment) => assignment.userId) } } },
          scheduledStart: { lt: scheduledEnd },
          scheduledEnd: { gt: scheduledStart },
          status: { notIn: ["CANCELLED", "COMPLETED"] },
        },
        select: { jobNumber: true },
      })
    : [];
  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      scheduledStart,
      scheduledEnd,
      status: scheduledStart ? "SCHEDULED" : job.status,
      internalInstructions: conflicts.length ? `Scheduling conflict warning: ${conflicts.map((conflict) => conflict.jobNumber).join(", ")}` : job.internalInstructions,
    },
  });
  await audit("JOB_SCHEDULED", "Job", { userId: user.id, entityId: jobId, newValue: { scheduledStart, scheduledEnd, conflicts, status: updated.status } });
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/admin/calendar");
}

export async function updateJobStatus(formData: FormData) {
  const jobId = value(formData, "jobId");
  const user = await requireTechnicianAssignment(jobId);
  const status = value(formData, "status") as JobStatus;
  const data: Record<string, Date | string | boolean | null> = { status };
  if (status === "ARRIVED") data.actualArrival = new Date();
  if (status === "COMPLETED") data.actualDeparture = new Date();
  await prisma.job.update({ where: { id: jobId }, data });
  await prisma.jobStatusHistory.create({ data: { jobId, status, note: value(formData, "note") || null, createdBy: user.id } });
  await audit("JOB_STATUS_CHANGED", "Job", { userId: user.id, entityId: jobId, newValue: { status } });
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/technician");
}

export async function completeTreatment(formData: FormData) {
  const jobId = value(formData, "jobId");
  const user = await requireTechnicianAssignment(jobId);
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const treatment = await prisma.treatmentRecord.create({
    data: {
      jobId,
      customerId: job.customerId,
      propertyId: job.propertyId,
      pestIdentified: z.string().min(1).parse(value(formData, "pestIdentified")),
      infestationSeverity: value(formData, "infestationSeverity") || "Moderate",
      areasInspected: value(formData, "areasInspected") || "Recorded on site",
      evidenceFound: value(formData, "evidenceFound") || null,
      treatmentMethod: value(formData, "treatmentMethod") || "Inspection and targeted treatment",
      productUsed: value(formData, "productUsed") || null,
      productQuantity: value(formData, "productQuantity") || null,
      productBatchNumber: value(formData, "productBatchNumber") || null,
      applicationArea: value(formData, "applicationArea") || null,
      safetyPrecautions: value(formData, "safetyPrecautions") || null,
      occupantInstructions: value(formData, "occupantInstructions") || null,
      petInstructions: value(formData, "petInstructions") || null,
      reEntryTime: value(formData, "reEntryTime") || null,
      followUpRecommendation: value(formData, "followUpRecommendation") || null,
      proofingRecommendations: value(formData, "proofingRecommendations") || null,
      technicianNotes: value(formData, "technicianNotes") || null,
      customerAcknowledgement: formData.get("customerAcknowledgement") === "on",
      signatures: { customer: value(formData, "customerSignature"), technician: value(formData, "technicianSignature") },
    },
  });
  await prisma.job.update({ where: { id: jobId }, data: { status: "COMPLETED", completionNotes: value(formData, "technicianNotes") || null, actualDeparture: new Date() } });
  const document = await prisma.document.create({
    data: {
      category: "Treatment report",
      title: `Treatment report for ${job.jobNumber}`,
      url: `/api/reports/treatment/${treatment.id}`,
      jobId,
      customerId: job.customerId,
      propertyId: job.propertyId,
      uploadedById: user.id,
    },
  });
  await audit("TREATMENT_RECORD_CREATED", "TreatmentRecord", { userId: user.id, entityId: treatment.id, newValue: treatment });
  await audit("DOCUMENT_GENERATED", "Document", { userId: user.id, entityId: document.id, newValue: document });
  revalidatePath("/technician");
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function createInvoiceFromJob(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const jobId = value(formData, "jobId");
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId }, include: { quote: { include: { items: true } } } });
  const total = Number(job.quote?.total || money(formData, "total"));
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextNumber("invoice"),
      customerId: job.customerId,
      propertyId: job.propertyId,
      quoteId: job.quoteId,
      jobId,
      dueDate: value(formData, "dueDate") ? new Date(value(formData, "dueDate")) : null,
      subtotal: Number(job.quote?.subtotal || total),
      vat: Number(job.quote?.vat || 0),
      total,
      amountOutstanding: total,
      paymentTerms: value(formData, "paymentTerms") || "Payment due on receipt unless otherwise agreed.",
      status: "SENT",
      items: { create: [{ description: job.quote?.title || job.jobType, quantity: 1, unitPrice: total, total }] },
    },
  });
  await audit("INVOICE_CREATED", "Invoice", { userId: user.id, entityId: invoice.id, newValue: invoice });
  const customer = invoice.customerId ? await prisma.customer.findUnique({ where: { id: invoice.customerId } }) : null;
  if (customer?.email) await emailProvider.send({ to: customer.email, ...emailTemplates.invoiceIssued(invoice.invoiceNumber, `${env.PUBLIC_SITE_URL}/customer/invoices/${invoice.id}`, Number(invoice.total)) });
  redirect(`/admin/finance?invoice=${invoice.id}`);
}

export async function recordPayment(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const invoiceId = value(formData, "invoiceId");
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  const amount = money(formData, "amount");
  const payment = await prisma.payment.create({
    data: {
      paymentReference: await nextNumber("payment"),
      customerId: invoice.customerId,
      invoiceId,
      amount,
      method: value(formData, "method") || "Bank transfer",
      transactionReference: value(formData, "transactionReference") || null,
      processingFee: money(formData, "processingFee"),
      notes: value(formData, "notes") || null,
      recordedBy: user.id,
      status: "COMPLETED",
    },
  });
  const paid = Number(invoice.amountPaid) + amount;
  const outstanding = Math.max(Number(invoice.total) - paid, 0);
  await prisma.invoice.update({ where: { id: invoiceId }, data: { amountPaid: paid, amountOutstanding: outstanding, status: outstanding === 0 ? "PAID" : "PARTIALLY_PAID" } });
  await audit("PAYMENT_RECORDED", "Payment", { userId: user.id, entityId: payment.id, newValue: payment });
  revalidatePath("/admin/finance");
}

export async function markBankPaymentReceived(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const paymentId = value(formData, "paymentId");
  const transactionReference = value(formData, "transactionReference");
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { invoice: true } });
  if (!payment.invoiceId || !payment.invoice) throw new Error("Payment is not linked to an invoice.");
  if (payment.status === "COMPLETED") redirect(`/admin/finance?payment=${payment.id}`);

  const paid = Number(payment.invoice.amountPaid) + Number(payment.amount);
  const outstanding = Math.max(Number(payment.invoice.total) - paid, 0);
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "COMPLETED",
      transactionReference: transactionReference || payment.transactionReference,
      notes: [payment.notes, value(formData, "notes")].filter(Boolean).join("\n"),
    },
  });
  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: { amountPaid: paid, amountOutstanding: outstanding, status: outstanding === 0 ? "PAID" : "PARTIALLY_PAID" },
  });
  await audit("BANK_PAYMENT_RECEIVED", "Payment", { userId: user.id, entityId: payment.id, newValue: updatedPayment });
  revalidatePath("/admin/finance");
  revalidatePath(`/admin/finance/invoices/${payment.invoiceId}`);
  redirect(`/admin/finance?payment=${payment.id}`);
}

export async function createExpense(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const amount = money(formData, "amount");
  const vat = money(formData, "vat");
  const expense = await prisma.expense.create({
    data: {
      expenseNumber: await nextNumber("expense"),
      categoryId: value(formData, "categoryId") || null,
      supplier: value(formData, "supplier") || null,
      description: z.string().min(2).parse(value(formData, "description")),
      amount,
      vat,
      total: amount + vat,
      expenseDate: value(formData, "expenseDate") ? new Date(value(formData, "expenseDate")) : new Date(),
      paymentMethod: value(formData, "paymentMethod") || "Card",
      jobId: value(formData, "jobId") || null,
      vehicleId: value(formData, "vehicleId") || null,
      employeeId: value(formData, "employeeId") || null,
      reimbursable: formData.get("reimbursable") === "on",
      approved: formData.get("approved") === "on",
      notes: value(formData, "notes") || null,
      createdById: user.id,
    },
  });
  await audit("EXPENSE_CREATED", "Expense", { userId: user.id, entityId: expense.id, newValue: expense });
  revalidatePath("/admin/finance");
}

export async function createDocumentStub(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const file = await validatedUpload(formData, "file");
  const stored = await storageProvider.put({
    name: file?.name || value(formData, "title") || "document",
    contentType: file?.contentType || "text/plain",
    data: file?.data || Buffer.from(value(formData, "notes") || ""),
    ownerId: user.id,
  });
  const document = await prisma.document.create({
    data: {
      category: value(formData, "category") || "Other",
      title: z.string().min(2).parse(value(formData, "title")),
      url: stored.url,
      notes: value(formData, "notes") || null,
      expiryDate: value(formData, "expiryDate") ? new Date(value(formData, "expiryDate")) : null,
      uploadedById: user.id,
      customerId: value(formData, "customerId") || null,
      jobId: value(formData, "jobId") || null,
    },
  });
  await audit("DOCUMENT_UPLOADED", "Document", { userId: user.id, entityId: document.id, newValue: document });
  revalidatePath("/admin/documents");
  revalidatePath("/admin/cms");
}

function csv(formData: FormData, key: string) {
  return value(formData, key).split(",").map((item) => item.trim()).filter(Boolean);
}

function jsonSetting(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { text: raw };
  }
}

export async function saveBusinessSetting(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const key = z.string().min(2).parse(value(formData, "key"));
  const setting = await prisma.businessSetting.upsert({
    where: { key },
    update: { value: jsonSetting(formData, "value") },
    create: { key, value: jsonSetting(formData, "value") },
  });
  await audit("BUSINESS_SETTING_SAVED", "BusinessSetting", { userId: user.id, entityId: setting.id, newValue: setting });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function updateTwoFactorPreference(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const enabled = formData.get("enabled") === "on";
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: enabled, twoFactorCodeHash: null, twoFactorExpires: null },
  });
  await audit("TWO_FACTOR_PREFERENCE_UPDATED", "User", { userId: user.id, entityId: user.id, newValue: { enabled: updated.twoFactorEnabled } });
  revalidatePath("/admin/settings");
}

export async function saveContentPage(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const slug = z.string().min(2).parse(value(formData, "slug"));
  const page = await prisma.contentPage.upsert({
    where: { slug },
    update: {
      title: z.string().min(2).parse(value(formData, "title")),
      metaTitle: value(formData, "metaTitle") || value(formData, "title"),
      metaDescription: value(formData, "metaDescription") || value(formData, "title"),
      canonicalPath: value(formData, "canonicalPath") || null,
      ogTitle: value(formData, "ogTitle") || null,
      ogDescription: value(formData, "ogDescription") || null,
      body: value(formData, "body") || "",
      status: (value(formData, "status") || "DRAFT") as never,
    },
    create: {
      slug,
      title: z.string().min(2).parse(value(formData, "title")),
      metaTitle: value(formData, "metaTitle") || value(formData, "title"),
      metaDescription: value(formData, "metaDescription") || value(formData, "title"),
      canonicalPath: value(formData, "canonicalPath") || null,
      ogTitle: value(formData, "ogTitle") || null,
      ogDescription: value(formData, "ogDescription") || null,
      body: value(formData, "body") || "",
      status: (value(formData, "status") || "DRAFT") as never,
    },
  });
  await audit("CONTENT_PAGE_SAVED", "ContentPage", { userId: user.id, entityId: page.id, newValue: page });
  revalidatePath("/admin/cms");
}

export async function saveServiceContent(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const slug = z.string().min(2).parse(value(formData, "slug"));
  const service = await prisma.service.upsert({
    where: { slug },
    update: {
      name: z.string().min(2).parse(value(formData, "name")),
      seoTitle: value(formData, "seoTitle") || value(formData, "name"),
      metaDescription: value(formData, "metaDescription") || value(formData, "intro"),
      canonicalPath: value(formData, "canonicalPath") || null,
      ogTitle: value(formData, "ogTitle") || null,
      ogDescription: value(formData, "ogDescription") || null,
      intro: value(formData, "intro"),
      body: value(formData, "body") || null,
      signs: csv(formData, "signs"),
      risks: csv(formData, "risks"),
      treatment: value(formData, "treatment"),
      inspectionProcess: value(formData, "inspectionProcess"),
      treatmentOptions: csv(formData, "treatmentOptions"),
      preventionAdvice: csv(formData, "preventionAdvice"),
      ctaCopy: value(formData, "ctaCopy") || null,
      status: (value(formData, "status") || "PUBLISHED") as never,
    },
    create: {
      slug,
      name: z.string().min(2).parse(value(formData, "name")),
      seoTitle: value(formData, "seoTitle") || value(formData, "name"),
      metaDescription: value(formData, "metaDescription") || value(formData, "intro"),
      canonicalPath: value(formData, "canonicalPath") || null,
      ogTitle: value(formData, "ogTitle") || null,
      ogDescription: value(formData, "ogDescription") || null,
      intro: value(formData, "intro"),
      body: value(formData, "body") || null,
      signs: csv(formData, "signs"),
      risks: csv(formData, "risks"),
      treatment: value(formData, "treatment"),
      inspectionProcess: value(formData, "inspectionProcess"),
      treatmentOptions: csv(formData, "treatmentOptions"),
      preventionAdvice: csv(formData, "preventionAdvice"),
      ctaCopy: value(formData, "ctaCopy") || null,
      status: (value(formData, "status") || "PUBLISHED") as never,
    },
  });
  await audit("SERVICE_CONTENT_SAVED", "Service", { userId: user.id, entityId: service.id, newValue: service });
  revalidatePath("/admin/cms");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
}

export async function saveLocationContent(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const slug = z.string().min(2).parse(value(formData, "slug"));
  const location = await prisma.locationPage.upsert({
    where: { slug },
    update: {
      locationName: z.string().min(2).parse(value(formData, "locationName")),
      countyOrRegion: value(formData, "countyOrRegion") || "North West",
      activeCoverage: formData.get("activeCoverage") === "on",
      pageTitle: value(formData, "pageTitle") || value(formData, "locationName"),
      metaTitle: value(formData, "metaTitle") || value(formData, "pageTitle"),
      metaDescription: value(formData, "metaDescription") || value(formData, "heroCopy"),
      canonicalPath: value(formData, "canonicalPath") || null,
      ogTitle: value(formData, "ogTitle") || null,
      ogDescription: value(formData, "ogDescription") || null,
      heroCopy: value(formData, "heroCopy"),
      localIntro: value(formData, "localIntro") || null,
      mainContent: value(formData, "mainContent"),
      commonPestIssues: csv(formData, "commonPestIssues"),
      residentialNotes: value(formData, "residentialNotes") || null,
      commercialNotes: value(formData, "commercialNotes") || null,
      nearbyAreas: csv(formData, "nearbyAreas"),
      availableServices: csv(formData, "availableServices"),
      ctaCopy: value(formData, "ctaCopy") || null,
      status: (value(formData, "status") || "PUBLISHED") as never,
    },
    create: {
      slug,
      locationName: z.string().min(2).parse(value(formData, "locationName")),
      countyOrRegion: value(formData, "countyOrRegion") || "North West",
      activeCoverage: formData.get("activeCoverage") === "on",
      pageTitle: value(formData, "pageTitle") || value(formData, "locationName"),
      metaTitle: value(formData, "metaTitle") || value(formData, "pageTitle"),
      metaDescription: value(formData, "metaDescription") || value(formData, "heroCopy"),
      canonicalPath: value(formData, "canonicalPath") || null,
      ogTitle: value(formData, "ogTitle") || null,
      ogDescription: value(formData, "ogDescription") || null,
      heroCopy: value(formData, "heroCopy"),
      localIntro: value(formData, "localIntro") || null,
      mainContent: value(formData, "mainContent"),
      commonPestIssues: csv(formData, "commonPestIssues"),
      residentialNotes: value(formData, "residentialNotes") || null,
      commercialNotes: value(formData, "commercialNotes") || null,
      nearbyAreas: csv(formData, "nearbyAreas"),
      availableServices: csv(formData, "availableServices"),
      ctaCopy: value(formData, "ctaCopy") || null,
      status: (value(formData, "status") || "PUBLISHED") as never,
    },
  });
  await audit("LOCATION_CONTENT_SAVED", "LocationPage", { userId: user.id, entityId: location.id, newValue: location });
  revalidatePath("/admin/cms");
  revalidatePath("/areas-we-cover");
  revalidatePath(`/pest-control/${slug}`);
}

export async function createSupplier(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const supplier = await prisma.supplier.create({
    data: {
      name: z.string().min(2).parse(value(formData, "name")),
      email: value(formData, "email") || null,
      phone: value(formData, "phone") || null,
      notes: value(formData, "notes") || null,
    },
  });
  await audit("SUPPLIER_CREATED", "Supplier", { userId: user.id, entityId: supplier.id, newValue: supplier });
  revalidatePath("/admin/resources");
}

export async function createProduct(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const product = await prisma.product.create({
    data: {
      productName: z.string().min(2).parse(value(formData, "productName")),
      productCode: value(formData, "productCode") || null,
      category: value(formData, "category") || "Treatment product",
      supplierId: value(formData, "supplierId") || null,
      costPrice: money(formData, "costPrice"),
      defaultSalePrice: money(formData, "defaultSalePrice"),
      unit: value(formData, "unit") || "unit",
      currentStock: money(formData, "currentStock"),
      reorderLevel: money(formData, "reorderLevel"),
      batchTracking: formData.get("batchTracking") === "on",
      expiryTracking: formData.get("expiryTracking") === "on",
      safetyDataSheet: value(formData, "safetyDataSheet") || null,
    },
  });
  await audit("PRODUCT_CREATED", "Product", { userId: user.id, entityId: product.id, newValue: product });
  revalidatePath("/admin/resources");
}

export async function createVehicle(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const vehicle = await prisma.vehicle.create({
    data: {
      registration: z.string().min(2).parse(value(formData, "registration")).toUpperCase(),
      make: value(formData, "make") || "Unknown",
      model: value(formData, "model") || "Unknown",
      year: value(formData, "year") ? Number(value(formData, "year")) : null,
      motDate: value(formData, "motDate") ? new Date(value(formData, "motDate")) : null,
      taxDate: value(formData, "taxDate") ? new Date(value(formData, "taxDate")) : null,
      insuranceExpiry: value(formData, "insuranceExpiry") ? new Date(value(formData, "insuranceExpiry")) : null,
      serviceDueDate: value(formData, "serviceDueDate") ? new Date(value(formData, "serviceDueDate")) : null,
      mileage: value(formData, "mileage") ? Number(value(formData, "mileage")) : null,
      notes: value(formData, "notes") || null,
    },
  });
  await audit("VEHICLE_CREATED", "Vehicle", { userId: user.id, entityId: vehicle.id, newValue: vehicle });
  revalidatePath("/admin/resources");
}

export async function createEquipment(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const equipment = await prisma.equipment.create({
    data: {
      equipmentName: z.string().min(2).parse(value(formData, "equipmentName")),
      serialNumber: value(formData, "serialNumber") || null,
      assignedTechnicianId: value(formData, "assignedTechnicianId") || null,
      inspectionDate: value(formData, "inspectionDate") ? new Date(value(formData, "inspectionDate")) : null,
      nextInspection: value(formData, "nextInspection") ? new Date(value(formData, "nextInspection")) : null,
      condition: value(formData, "condition") || null,
      notes: value(formData, "notes") || null,
    },
  });
  await audit("EQUIPMENT_CREATED", "Equipment", { userId: user.id, entityId: equipment.id, newValue: equipment });
  revalidatePath("/admin/resources");
}

export async function createCommunication(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const communication = await prisma.communication.create({
    data: {
      type: value(formData, "type") || "Note",
      subject: value(formData, "subject") || null,
      body: z.string().min(2).parse(value(formData, "body")),
      recipient: value(formData, "recipient") || null,
      status: value(formData, "status") || "Logged",
      sentAt: formData.get("markSent") === "on" ? new Date() : null,
      userId: user.id,
      customerId: value(formData, "customerId") || null,
      leadId: value(formData, "leadId") || null,
      quoteId: value(formData, "quoteId") || null,
      jobId: value(formData, "jobId") || null,
    },
  });
  await audit("COMMUNICATION_LOGGED", "Communication", { userId: user.id, entityId: communication.id, newValue: communication });
  revalidatePath("/admin/communications");
}

export async function createJobExpense(formData: FormData) {
  const jobId = value(formData, "jobId");
  const user = await requireTechnicianAssignment(jobId);
  const amount = money(formData, "amount");
  const vat = money(formData, "vat");
  const expense = await prisma.expense.create({
    data: {
      expenseNumber: await nextNumber("expense"),
      description: z.string().min(2).parse(value(formData, "description")),
      amount,
      vat,
      total: amount + vat,
      expenseDate: new Date(),
      paymentMethod: value(formData, "paymentMethod") || "Card",
      jobId,
      receiptUrl: value(formData, "receiptUrl") || null,
      reimbursable: true,
      createdById: user.id,
    },
  });
  await audit("JOB_EXPENSE_CREATED", "Expense", { userId: user.id, entityId: expense.id, newValue: expense });
  revalidatePath("/technician");
  revalidatePath(`/technician/jobs/${jobId}`);
}

export async function requestCustomerService(formData: FormData) {
  const customerId = value(formData, "customerId");
  const user = await requireCustomerOwnership(customerId);
  const lead = await prisma.lead.create({
    data: {
      leadNumber: await nextNumber("lead"),
      customerId,
      customerName: value(formData, "customerName"),
      email: value(formData, "email") || null,
      phone: z.string().min(5).parse(value(formData, "phone")),
      postcode: z.string().min(3).parse(value(formData, "postcode")).toUpperCase(),
      pestType: value(formData, "pestType") || "General Pest Control",
      propertyType: value(formData, "propertyType") || "Existing customer",
      urgency: value(formData, "urgency") || "Routine",
      preferredContactMethod: value(formData, "preferredContactMethod") || "Phone",
      description: value(formData, "description") || null,
      source: "Customer portal",
    },
  });
  await audit("CUSTOMER_SERVICE_REQUESTED", "Lead", { userId: user.id, entityId: lead.id, newValue: lead });
  revalidatePath("/customer");
}

export async function createCommercialContract(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const customerId = z.string().min(1).parse(value(formData, "customerId"));
  const contract = await prisma.commercialContract.create({
    data: {
      customerId,
      contractNumber: await nextNumber("contract"),
      status: value(formData, "status") || "DRAFT",
      startDate: value(formData, "startDate") ? new Date(value(formData, "startDate")) : null,
      endDate: value(formData, "endDate") ? new Date(value(formData, "endDate")) : null,
      renewalDate: value(formData, "renewalDate") ? new Date(value(formData, "renewalDate")) : null,
      contractValue: money(formData, "contractValue"),
      serviceFrequency: value(formData, "serviceFrequency") || null,
      includedServices: value(formData, "includedServices") || null,
      excludedServices: value(formData, "excludedServices") || null,
      accountManagerId: value(formData, "accountManagerId") || null,
      sites: value(formData, "siteName")
        ? { create: [{ siteName: value(formData, "siteName"), riskAssessment: value(formData, "riskAssessment") || null, recommendations: value(formData, "recommendations") || null }] }
        : undefined,
    },
  });
  await audit("COMMERCIAL_CONTRACT_CREATED", "CommercialContract", { userId: user.id, entityId: contract.id, newValue: contract });
  redirect(`/admin/contracts/${contract.id}`);
}

export async function createContractVisit(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const contractId = value(formData, "contractId");
  const contract = await prisma.commercialContract.findUniqueOrThrow({ where: { id: contractId }, include: { customer: { include: { properties: true } }, sites: true } });
  const property = contract.customer.properties[0];
  const job = await prisma.job.create({
    data: {
      jobNumber: await nextNumber("job"),
      customerId: contract.customerId,
      propertyId: property?.id,
      pestType: value(formData, "pestType") || "Commercial Pest Control",
      jobType: "Commercial contract visit",
      priority: value(formData, "priority") || "Normal",
      status: value(formData, "scheduledStart") ? "SCHEDULED" : "UNSCHEDULED",
      scheduledStart: value(formData, "scheduledStart") ? new Date(value(formData, "scheduledStart")) : null,
      scheduledEnd: value(formData, "scheduledEnd") ? new Date(value(formData, "scheduledEnd")) : null,
      description: value(formData, "description") || contract.includedServices,
      recurringJobRef: contract.contractNumber,
      internalInstructions: `Contract ${contract.contractNumber}. Frequency: ${contract.serviceFrequency || "not set"}. Sites: ${contract.sites.map((site) => site.siteName).join(", ") || "customer properties"}.`,
    },
  });
  await prisma.notification.create({ data: { type: "CONTRACT_VISIT_CREATED", title: `Contract visit ${job.jobNumber}`, body: contract.contractNumber } });
  await audit("CONTRACT_VISIT_CREATED", "Job", { userId: user.id, entityId: job.id, newValue: { contractId, job } });
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/admin/calendar");
}

export async function bulkCreateContractVisits(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const contractId = value(formData, "contractId");
  const count = Math.min(Math.max(Number(value(formData, "count") || "1"), 1), 52);
  const intervalWeeks = Math.min(Math.max(Number(value(formData, "intervalWeeks") || "4"), 1), 52);
  const durationMinutes = Math.min(Math.max(Number(value(formData, "durationMinutes") || "60"), 15), 480);
  const firstStart = value(formData, "firstStart") ? new Date(value(formData, "firstStart")) : new Date();
  const contract = await prisma.commercialContract.findUniqueOrThrow({ where: { id: contractId }, include: { customer: { include: { properties: true } }, sites: true } });
  const property = contract.customer.properties[0];
  const jobs = [];
  for (let index = 0; index < count; index += 1) {
    const scheduledStart = new Date(firstStart);
    scheduledStart.setDate(firstStart.getDate() + index * intervalWeeks * 7);
    const scheduledEnd = new Date(scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + durationMinutes);
    const job = await prisma.job.create({
      data: {
        jobNumber: await nextNumber("job"),
        customerId: contract.customerId,
        propertyId: property?.id,
        pestType: value(formData, "pestType") || "Commercial Pest Control",
        jobType: "Commercial contract visit",
        priority: value(formData, "priority") || "Normal",
        status: "SCHEDULED",
        scheduledStart,
        scheduledEnd,
        description: value(formData, "description") || contract.includedServices,
        recurringJobRef: contract.contractNumber,
        internalInstructions: `Bulk generated from contract ${contract.contractNumber}. Frequency: every ${intervalWeeks} week(s). Sites: ${contract.sites.map((site) => site.siteName).join(", ") || "customer properties"}.`,
      },
    });
    jobs.push(job);
  }
  await prisma.notification.create({ data: { type: "CONTRACT_VISITS_BULK_CREATED", title: `${jobs.length} contract visits created`, body: contract.contractNumber } });
  await audit("CONTRACT_VISITS_BULK_CREATED", "Job", { userId: user.id, entityId: contractId, newValue: { contractId, count: jobs.length, jobNumbers: jobs.map((job) => job.jobNumber) } });
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/admin/calendar");
}

export async function createContractInvoice(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const contractId = value(formData, "contractId");
  const contract = await prisma.commercialContract.findUniqueOrThrow({ where: { id: contractId } });
  const amount = money(formData, "amount") || Number(contract.contractValue);
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextNumber("invoice"),
      customerId: contract.customerId,
      subtotal: amount,
      total: amount,
      amountOutstanding: amount,
      dueDate: value(formData, "dueDate") ? new Date(value(formData, "dueDate")) : null,
      paymentTerms: value(formData, "paymentTerms") || "Payment by bank transfer using the invoice reference.",
      notes: `Recurring contract invoice for ${contract.contractNumber}`,
      status: "SENT",
      items: { create: [{ description: value(formData, "description") || `Contract service ${contract.contractNumber}`, quantity: 1, unitPrice: amount, total: amount }] },
    },
  });
  await audit("CONTRACT_INVOICE_CREATED", "Invoice", { userId: user.id, entityId: invoice.id, newValue: { contractId, invoice } });
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/admin/finance");
}

export async function bulkCreateContractInvoices(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const contractId = value(formData, "contractId");
  const count = Math.min(Math.max(Number(value(formData, "count") || "1"), 1), 24);
  const intervalMonths = Math.min(Math.max(Number(value(formData, "intervalMonths") || "1"), 1), 12);
  const amount = money(formData, "amount");
  const firstDueDate = value(formData, "firstDueDate") ? new Date(value(formData, "firstDueDate")) : new Date();
  const contract = await prisma.commercialContract.findUniqueOrThrow({ where: { id: contractId } });
  const invoiceAmount = amount || Number(contract.contractValue);
  const invoices = [];
  for (let index = 0; index < count; index += 1) {
    const dueDate = new Date(firstDueDate);
    dueDate.setMonth(firstDueDate.getMonth() + index * intervalMonths);
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await nextNumber("invoice"),
        customerId: contract.customerId,
        subtotal: invoiceAmount,
        total: invoiceAmount,
        amountOutstanding: invoiceAmount,
        dueDate,
        paymentTerms: value(formData, "paymentTerms") || "Payment by bank transfer using the invoice reference.",
        notes: `Bulk recurring contract invoice for ${contract.contractNumber}`,
        status: "SENT",
        items: { create: [{ description: value(formData, "description") || `Contract service ${contract.contractNumber}`, quantity: 1, unitPrice: invoiceAmount, total: invoiceAmount }] },
      },
    });
    invoices.push(invoice);
  }
  await prisma.notification.create({ data: { type: "CONTRACT_INVOICES_BULK_CREATED", title: `${invoices.length} contract invoices created`, body: contract.contractNumber } });
  await audit("CONTRACT_INVOICES_BULK_CREATED", "Invoice", { userId: user.id, entityId: contractId, newValue: { contractId, count: invoices.length, invoiceNumbers: invoices.map((invoice) => invoice.invoiceNumber) } });
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath("/admin/finance");
}

export async function createQuoteTemplate(formData: FormData) {
  const user = await requireAnyRole(adminRoles);
  const template = await prisma.quoteTemplate.create({
    data: {
      name: z.string().min(2).parse(value(formData, "name")),
      description: value(formData, "description") || null,
      pestType: value(formData, "pestType") || null,
      terms: value(formData, "terms") || null,
      items: {
        lineDescription: value(formData, "lineDescription") || value(formData, "name"),
        quantity: money(formData, "quantity") || 1,
        unitPrice: money(formData, "unitPrice"),
        labour: money(formData, "labour"),
        materials: money(formData, "materials"),
        vat: money(formData, "vat"),
      },
      status: (value(formData, "status") || "PUBLISHED") as never,
    },
  });
  await audit("QUOTE_TEMPLATE_CREATED", "QuoteTemplate", { userId: user.id, entityId: template.id, newValue: template });
  revalidatePath("/admin/quote-templates");
}

export async function updateCustomerProfile(formData: FormData) {
  const customerId = value(formData, "customerId");
  const user = await requireCustomerOwnership(customerId);
  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: z.string().min(2).parse(value(formData, "name")),
      email: value(formData, "email") || null,
      phone: value(formData, "phone") || null,
      marketingConsent: formData.get("marketingConsent") === "on",
      notes: value(formData, "notes") || null,
    },
  });
  await audit("CUSTOMER_PROFILE_UPDATED", "Customer", { userId: user.id, entityId: customer.id, newValue: customer });
  revalidatePath("/customer");
  revalidatePath("/customer/profile");
}

export async function requestAppointmentReschedule(formData: FormData) {
  const jobId = value(formData, "jobId");
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  if (job.customerId) await requireCustomerOwnership(job.customerId);
  const message = `Requested appointment change to ${value(formData, "requestedDate") || "a new date"} ${value(formData, "requestedTime") || ""}. ${value(formData, "reason")}`;
  const communication = await prisma.communication.create({
    data: {
      type: "Customer portal",
      subject: "Appointment reschedule request",
      body: message,
      status: "Logged",
      customerId: job.customerId,
      jobId,
    },
  });
  await audit("APPOINTMENT_RESCHEDULE_REQUESTED", "Job", { entityId: jobId, newValue: communication });
  revalidatePath(`/customer/jobs/${jobId}`);
  revalidatePath("/customer");
}

export async function createCustomerMessage(formData: FormData) {
  const customerId = value(formData, "customerId");
  const user = await requireCustomerOwnership(customerId);
  const message = await prisma.communication.create({
    data: {
      type: value(formData, "type") || "Customer message",
      subject: value(formData, "subject") || "Customer portal message",
      body: z.string().min(2).parse(value(formData, "body")),
      status: "Logged",
      userId: user.id,
      customerId,
    },
  });
  await audit("CUSTOMER_MESSAGE_CREATED", "Communication", { userId: user.id, entityId: message.id, newValue: message });
  revalidatePath("/customer/messages");
}

export async function createCustomerBankPaymentRequest(formData: FormData) {
  const invoiceId = value(formData, "invoiceId");
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { customer: true } });
  if (invoice.customerId) await requireCustomerOwnership(invoice.customerId);
  const amount = Number(invoice.amountOutstanding || invoice.total);
  const paymentReference = `${invoice.invoiceNumber}-${await nextNumber("payment")}`;
  const request = await paymentProvider.createBankTransferRequest({
    amount,
    reference: paymentReference,
    customerEmail: invoice.customer?.email || undefined,
  });
  const payment = await prisma.payment.create({
    data: {
      paymentReference,
      customerId: invoice.customerId,
      invoiceId,
      amount,
      method: "Bank transfer",
      transactionReference: request.id,
      status: "PENDING",
      notes: `Awaiting customer bank transfer. Payee: ${request.bankDetails.accountName}. Sort code: ${request.bankDetails.sortCode}. Account: ${request.bankDetails.accountNumber}.`,
    },
  });
  if (invoice.customer?.email) await emailProvider.send({ to: invoice.customer.email, ...emailTemplates.bankPaymentRequested(paymentReference, amount) });
  await audit("CUSTOMER_BANK_PAYMENT_REQUESTED", "Payment", { entityId: payment.id, newValue: { payment, request } });
  revalidatePath(`/customer/invoices/${invoiceId}`);
  revalidatePath("/customer");
}

export async function addJobMaterialUsage(formData: FormData) {
  const jobId = value(formData, "jobId");
  const user = await requireTechnicianAssignment(jobId);
  const material = await prisma.jobMaterial.create({
    data: {
      jobId,
      productId: value(formData, "productId") || null,
      name: z.string().min(1).parse(value(formData, "name")),
      quantity: value(formData, "quantity") || "1",
      batchNumber: value(formData, "batchNumber") || null,
      cost: money(formData, "cost"),
    },
  });
  await audit("JOB_MATERIAL_ADDED", "JobMaterial", { userId: user.id, entityId: material.id, newValue: material });
  revalidatePath(`/technician/jobs/${jobId}`);
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function addJobPhotoStub(formData: FormData) {
  const jobId = value(formData, "jobId");
  const user = await requireTechnicianAssignment(jobId);
  const file = await validatedUpload(formData, "photo");
  const stored = await storageProvider.put({
    name: file?.name || value(formData, "title") || "job-photo",
    contentType: file?.contentType || "text/plain",
    data: file?.data || Buffer.from(value(formData, "notes") || ""),
    ownerId: user.id,
  });
  const job = await prisma.job.update({ where: { id: jobId }, data: { photos: { push: stored.url } } });
  await audit("JOB_PHOTO_ADDED", "Job", { userId: user.id, entityId: jobId, newValue: { url: stored.url, photos: job.photos } });
  revalidatePath(`/technician/jobs/${jobId}`);
}

export async function scheduleJobFollowUp(formData: FormData) {
  const jobId = value(formData, "jobId");
  const user = await requireTechnicianAssignment(jobId);
  const job = await prisma.job.update({
    where: { id: jobId },
    data: {
      followUpRequired: true,
      followUpDate: value(formData, "followUpDate") ? new Date(value(formData, "followUpDate")) : null,
      completionNotes: value(formData, "notes") || undefined,
    },
  });
  await audit("JOB_FOLLOW_UP_SCHEDULED", "Job", { userId: user.id, entityId: jobId, newValue: job });
  revalidatePath(`/technician/jobs/${jobId}`);
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function generateOperationalReminders() {
  const user = await requireAnyRole(adminRoles);
  const next30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const [quotes, invoices, contracts, followUps, vehicles, equipment] = await Promise.all([
    prisma.quote.findMany({ where: { status: { in: ["SENT", "VIEWED"] }, expiresAt: { lte: next30 } }, select: { quoteNumber: true, expiresAt: true } }),
    prisma.invoice.findMany({ where: { amountOutstanding: { gt: 0 }, OR: [{ dueDate: { lte: next30 } }, { dueDate: null }] }, select: { invoiceNumber: true, dueDate: true, amountOutstanding: true } }),
    prisma.commercialContract.findMany({ where: { renewalDate: { lte: next30 } }, select: { contractNumber: true, renewalDate: true } }),
    prisma.job.findMany({ where: { followUpRequired: true, followUpDate: { lte: next30 } }, select: { jobNumber: true, followUpDate: true } }),
    prisma.vehicle.findMany({ where: { OR: [{ motDate: { lte: next30 } }, { taxDate: { lte: next30 } }, { insuranceExpiry: { lte: next30 } }, { serviceDueDate: { lte: next30 } }] }, select: { registration: true } }),
    prisma.equipment.findMany({ where: { nextInspection: { lte: next30 } }, select: { equipmentName: true, nextInspection: true } }),
  ]);
  const reminders = [
    ...quotes.map((item) => ({ type: "QUOTE_REMINDER", title: `Quote follow-up ${item.quoteNumber}`, body: item.expiresAt ? `Quote expires ${item.expiresAt.toLocaleDateString("en-GB")}` : "Quote awaiting customer action." })),
    ...invoices.map((item) => ({ type: "INVOICE_REMINDER", title: `Invoice due ${item.invoiceNumber}`, body: `Outstanding £${Number(item.amountOutstanding).toFixed(2)}${item.dueDate ? ` due ${item.dueDate.toLocaleDateString("en-GB")}` : ""}` })),
    ...contracts.map((item) => ({ type: "CONTRACT_RENEWAL", title: `Contract renewal ${item.contractNumber}`, body: item.renewalDate ? `Renewal due ${item.renewalDate.toLocaleDateString("en-GB")}` : "Renewal date approaching." })),
    ...followUps.map((item) => ({ type: "JOB_FOLLOW_UP", title: `Follow-up ${item.jobNumber}`, body: item.followUpDate ? `Follow-up due ${item.followUpDate.toLocaleDateString("en-GB")}` : "Follow-up due." })),
    ...vehicles.map((item) => ({ type: "VEHICLE_REMINDER", title: `Vehicle reminder ${item.registration}`, body: `Upcoming MOT, tax, insurance or service date for ${item.registration}.` })),
    ...equipment.map((item) => ({ type: "EQUIPMENT_REMINDER", title: `Equipment inspection ${item.equipmentName}`, body: item.nextInspection ? `Inspection due ${item.nextInspection.toLocaleDateString("en-GB")}` : "Inspection due." })),
  ];
  for (const reminder of reminders) {
    const exists = await prisma.notification.findFirst({ where: { type: reminder.type, title: reminder.title, readAt: null } });
    if (!exists) await prisma.notification.create({ data: reminder });
  }
  await audit("OPERATIONAL_REMINDERS_GENERATED", "Notification", { userId: user.id, newValue: { count: reminders.length } });
  revalidatePath("/admin/reminders");
  revalidatePath("/admin");
}
