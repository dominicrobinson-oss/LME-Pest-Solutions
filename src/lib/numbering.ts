import { prisma } from "@/lib/db";

const prefixes: Record<string, string> = {
  lead: "LME-LEAD",
  customer: "LME-CUS",
  quote: "LME-QTE",
  job: "LME-JOB",
  invoice: "LME-INV",
  expense: "LME-EXP",
  payment: "LME-PAY",
  contract: "LME-CON",
};

async function numberExists(key: keyof typeof prefixes, candidate: string) {
  if (key === "lead") return Boolean(await prisma.lead.findUnique({ where: { leadNumber: candidate }, select: { id: true } }));
  if (key === "customer") return Boolean(await prisma.customer.findUnique({ where: { customerNumber: candidate }, select: { id: true } }));
  if (key === "quote") return Boolean(await prisma.quote.findUnique({ where: { quoteNumber: candidate }, select: { id: true } }));
  if (key === "job") return Boolean(await prisma.job.findUnique({ where: { jobNumber: candidate }, select: { id: true } }));
  if (key === "invoice") return Boolean(await prisma.invoice.findUnique({ where: { invoiceNumber: candidate }, select: { id: true } }));
  if (key === "expense") return Boolean(await prisma.expense.findUnique({ where: { expenseNumber: candidate }, select: { id: true } }));
  if (key === "payment") return Boolean(await prisma.payment.findUnique({ where: { paymentReference: candidate }, select: { id: true } }));
  if (key === "contract") return Boolean(await prisma.commercialContract.findUnique({ where: { contractNumber: candidate }, select: { id: true } }));
  return false;
}

export async function nextNumber(key: keyof typeof prefixes) {
  const year = new Date().getFullYear();
  const prefix = prefixes[key];
  const sequenceKey = `${key}:${year}`;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const sequence = await prisma.numberSequence.upsert({
      where: { key: sequenceKey },
      update: { nextValue: { increment: 1 } },
      create: { key: sequenceKey, prefix, year, nextValue: 2 },
    });
    const candidate = `${prefix}-${year}-${String(sequence.nextValue - 1).padStart(4, "0")}`;
    if (!(await numberExists(key, candidate))) return candidate;
  }

  throw new Error(`Could not allocate a unique ${key} number`);
}
