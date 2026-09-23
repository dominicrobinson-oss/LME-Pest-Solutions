import { notFound } from "next/navigation";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { brandedPdf, moneyLine } from "@/lib/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAnyRole(adminRoles);
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id }, include: { customer: true, property: true, items: true } });
  if (!quote) notFound();
  const pdf = brandedPdf({
    title: "Pest Control Quote",
    reference: quote.quoteNumber,
    subtitle: quote.title,
    status: quote.status,
    sections: [
      {
        title: "Customer And Site",
        fields: [
          { label: "Customer", value: quote.customer?.name },
          { label: "Email", value: quote.customer?.email },
          { label: "Phone", value: quote.customer?.phone },
          { label: "Property", value: quote.property?.address },
          { label: "Postcode", value: quote.property?.postcode },
          { label: "Pest type", value: quote.pestType },
        ],
      },
      {
        title: "Scope",
        fields: [
          { label: "Description", value: quote.description },
          { label: "Terms", value: quote.terms },
          { label: "Expires", value: quote.expiresAt?.toLocaleDateString("en-GB") },
        ],
      },
      {
        title: "Line Items",
        lines: quote.items.map((item) => `${item.description} - ${Number(item.quantity).toFixed(2)} x GBP ${Number(item.unitPrice).toFixed(2)} = GBP ${Number(item.total).toFixed(2)}`),
      },
    ],
    totals: [
      moneyLine("Subtotal", Number(quote.subtotal)),
      moneyLine("VAT", Number(quote.vat)),
      moneyLine("Discount", Number(quote.discount)),
      moneyLine("Deposit required", Number(quote.depositRequired)),
      moneyLine("Total", Number(quote.total)),
    ],
    footerNote: "Acceptance confirms permission for LME Pest Solutions to arrange the treatment described in this quote. Safety instructions will be provided where applicable.",
  });
  return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"` } });
}
