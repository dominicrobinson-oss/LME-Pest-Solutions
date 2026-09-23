import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createQuote } from "@/app/admin/actions";
import { QuoteStatus } from "@/generated/prisma/client";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { matchesEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuotesAdminPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const params = (await searchParams) || {};
  const q = params.q?.trim();
  const status = params.status?.trim();
  const [quotes, customers] = await Promise.all([
    prisma.quote.findMany({
      where: {
        ...(q ? { OR: [{ quoteNumber: { contains: q, mode: "insensitive" } }, { title: { contains: q, mode: "insensitive" } }, { customer: { name: { contains: q, mode: "insensitive" } } }] } : {}),
        ...(matchesEnum(status, QuoteStatus) ? { status: matchesEnum(status, QuoteStatus) } : {}),
      },
      include: { customer: true, property: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customer.findMany({ include: { properties: true }, orderBy: { name: "asc" }, take: 100 }),
  ]);
  return (
    <AdminShell title="Quotes" userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section>
          <form className="mb-4 flex flex-wrap gap-3">
            <input className="field max-w-md" name="q" defaultValue={q} placeholder="Search quote/customer" />
            <select className="field max-w-xs" name="status" defaultValue={status || ""}>
              <option value="">All statuses</option>
              {["DRAFT","READY","SENT","VIEWED","ACCEPTED","DECLINED","EXPIRED","CONVERTED","CANCELLED"].map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
            <button className="btn-primary" type="submit">Filter</button>
          </form>
          <DataTable headers={["Quote", "Customer", "Status", "Total", "Actions"]}>
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/quotes/${quote.id}`}>{quote.quoteNumber}</Link><br />{quote.title}</Td>
                <Td>{quote.customer?.name || "No customer"}<br /><span className="text-slate-500">{quote.property?.postcode}</span></Td>
                <Td><span className="status-pill bg-amber-50 text-amber-800">{quote.status}</span></Td>
                <Td>£{Number(quote.total).toFixed(2)}</Td>
                <Td><Link className="btn-primary" href={`/admin/quotes/${quote.id}`}>Open</Link></Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Create manual quote">
          <form action={createQuote} className="grid gap-3">
            <select className="field" name="customerId" defaultValue="">
              <option value="">No customer</option>
              {customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}
            </select>
            <input className="field" name="pestType" placeholder="Pest type" />
            <input className="field" name="title" placeholder="Title" />
            <textarea className="field" name="description" placeholder="Description" />
            <input className="field" name="lineDescription" placeholder="Line item" />
            <input className="field" name="quantity" type="number" step="0.01" defaultValue="1" />
            <input className="field" name="unitPrice" type="number" step="0.01" placeholder="Unit price" />
            <input className="field" name="labour" type="number" step="0.01" placeholder="Labour" />
            <input className="field" name="materials" type="number" step="0.01" placeholder="Materials" />
            <input className="field" name="discount" type="number" step="0.01" placeholder="Discount" />
            <input className="field" name="vat" type="number" step="0.01" placeholder="VAT" />
            <button className="btn-primary" type="submit">Create quote</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}
