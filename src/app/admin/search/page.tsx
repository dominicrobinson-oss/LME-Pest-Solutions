import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminSearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const params = (await searchParams) || {};
  const q = (params.q || "").trim();
  const results = q.length >= 2 ? await searchAll(q) : [];

  return (
    <AdminShell title="Global Search" userName={user.name || user.email}>
      <section className="card p-5">
        <form className="flex flex-wrap gap-3">
          <input className="field max-w-xl" name="q" defaultValue={q} placeholder="Search names, numbers, postcode, email or phone" />
          <button className="btn-primary" type="submit">Search</button>
        </form>
      </section>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Results</h3>
        <DataTable headers={["Type", "Reference", "Summary", "Open"]}>
          {results.map((result) => (
            <tr key={`${result.type}-${result.href}`}>
              <Td>{result.type}</Td>
              <Td>{result.reference}</Td>
              <Td>{result.summary}</Td>
              <Td><Link className="btn-primary" href={result.href}>Open</Link></Td>
            </tr>
          ))}
        </DataTable>
      </section>
    </AdminShell>
  );
}

async function searchAll(q: string) {
  const contains = { contains: q, mode: "insensitive" as const };
  const [leads, customers, quotes, jobs, invoices] = await Promise.all([
    prisma.lead.findMany({ where: { OR: [{ leadNumber: contains }, { customerName: contains }, { email: contains }, { phone: contains }, { postcode: contains }] }, take: 10 }),
    prisma.customer.findMany({ where: { OR: [{ customerNumber: contains }, { name: contains }, { email: contains }, { phone: contains }] }, take: 10 }),
    prisma.quote.findMany({ where: { OR: [{ quoteNumber: contains }, { title: contains }, { pestType: contains }] }, take: 10 }),
    prisma.job.findMany({ where: { OR: [{ jobNumber: contains }, { pestType: contains }, { jobType: contains }] }, take: 10 }),
    prisma.invoice.findMany({ where: { invoiceNumber: contains }, take: 10 }),
  ]);
  return [
    ...leads.map((lead) => ({ type: "Lead", reference: lead.leadNumber, summary: `${lead.customerName} · ${lead.postcode}`, href: `/admin/leads/${lead.id}` })),
    ...customers.map((customer) => ({ type: "Customer", reference: customer.customerNumber, summary: `${customer.name} · ${customer.email || customer.phone || ""}`, href: `/admin/customers/${customer.id}` })),
    ...quotes.map((quote) => ({ type: "Quote", reference: quote.quoteNumber, summary: `${quote.title} · £${Number(quote.total).toFixed(2)}`, href: `/admin/quotes/${quote.id}` })),
    ...jobs.map((job) => ({ type: "Job", reference: job.jobNumber, summary: `${job.jobType} · ${job.status}`, href: `/admin/jobs/${job.id}` })),
    ...invoices.map((invoice) => ({ type: "Invoice", reference: invoice.invoiceNumber, summary: `${invoice.status} · £${Number(invoice.total).toFixed(2)}`, href: `/admin/finance/invoices/${invoice.id}` })),
  ];
}
