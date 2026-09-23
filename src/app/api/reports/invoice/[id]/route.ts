import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { brandedPdf, moneyLine } from "@/lib/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true, items: true, payments: true } });
  if (!invoice) notFound();
  const paymentReference = invoice.payments.find((payment) => payment.status === "PENDING")?.paymentReference || invoice.invoiceNumber;
  const pdf = brandedPdf({
    title: "Invoice",
    reference: invoice.invoiceNumber,
    status: invoice.status,
    sections: [
      {
        title: "Customer",
        fields: [
          { label: "Name", value: invoice.customer?.name },
          { label: "Email", value: invoice.customer?.email },
          { label: "Phone", value: invoice.customer?.phone },
          { label: "Billing address", value: invoice.customer?.billingAddress },
        ],
      },
      {
        title: "Invoice Dates",
        fields: [
          { label: "Issue date", value: invoice.issueDate.toLocaleDateString("en-GB") },
          { label: "Due date", value: invoice.dueDate?.toLocaleDateString("en-GB") },
          { label: "Payment terms", value: invoice.paymentTerms },
        ],
      },
      {
        title: "Line Items",
        lines: invoice.items.map((item) => `${item.description} - ${Number(item.quantity).toFixed(2)} x GBP ${Number(item.unitPrice).toFixed(2)} = GBP ${Number(item.total).toFixed(2)}`),
      },
      {
        title: "Bank Transfer Details",
        fields: [
          { label: "Account name", value: env.BANK_ACCOUNT_NAME },
          { label: "Sort code", value: env.BANK_SORT_CODE },
          { label: "Account number", value: env.BANK_ACCOUNT_NUMBER },
          { label: "Reference", value: paymentReference },
          { label: "Notes", value: env.BANK_PAYMENT_NOTES },
        ],
      },
      {
        title: "Payments",
        lines: invoice.payments.map((payment) => `${payment.paymentReference} - ${payment.method} - GBP ${Number(payment.amount).toFixed(2)} - ${payment.status}`),
      },
    ],
    totals: [
      moneyLine("Subtotal", Number(invoice.subtotal)),
      moneyLine("VAT", Number(invoice.vat)),
      moneyLine("Discount", Number(invoice.discount)),
      moneyLine("Total", Number(invoice.total)),
      moneyLine("Paid", Number(invoice.amountPaid)),
      moneyLine("Outstanding", Number(invoice.amountOutstanding)),
    ],
    footerNote: "Please use the payment reference shown above when making a bank transfer so the payment can be reconciled quickly.",
  });
  return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"` } });
}
