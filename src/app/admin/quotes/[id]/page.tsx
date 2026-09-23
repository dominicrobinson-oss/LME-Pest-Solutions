import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { convertQuoteToJob, sendQuote } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id }, include: { customer: true, property: true, lead: true, items: true, revisions: true, acceptances: true, jobs: true } });
  if (!quote) notFound();
  return (
    <AdminShell title={quote.quoteNumber} userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="card p-5">
          <h3 className="text-2xl font-black">{quote.title}</h3>
          <p className="mt-2 text-slate-600">{quote.customer?.name || quote.lead?.customerName || "No customer"} · {quote.pestType}</p>
          <p className="mt-4">{quote.description}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <p><b>Status:</b> {quote.status}</p>
            <p><b>Subtotal:</b> £{Number(quote.subtotal).toFixed(2)}</p>
            <p><b>Total:</b> £{Number(quote.total).toFixed(2)}</p>
            <p><b>Deposit:</b> £{Number(quote.depositRequired).toFixed(2)}</p>
            <p><b>Sent:</b> {quote.sentAt?.toLocaleString("en-GB") || "-"}</p>
            <p><b>Accepted:</b> {quote.acceptedAt?.toLocaleString("en-GB") || "-"}</p>
          </div>
        </section>
        <div className="grid gap-5">
          <AdminForm title="Actions">
            <form action={sendQuote}><input type="hidden" name="id" value={quote.id} /><button className="btn-primary w-full" type="submit">Send quote</button></form>
            <form action={convertQuoteToJob} className="grid gap-3">
              <input type="hidden" name="quoteId" value={quote.id} />
              <input className="field" name="jobType" defaultValue="Initial treatment" />
              <select className="field" name="priority" defaultValue="Normal"><option>Normal</option><option>High</option><option>Emergency</option></select>
              <button className="btn-primary" type="submit">Convert to job</button>
            </form>
            <Link className="btn-primary" href={`/customer/quotes/${quote.id}`}>Open customer view</Link>
          </AdminForm>
        </div>
      </div>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Line items</h3>
        <DataTable headers={["Description", "Qty", "Unit", "Total"]}>
          {quote.items.map((item) => <tr key={item.id}><Td>{item.description}</Td><Td>{Number(item.quantity).toFixed(2)}</Td><Td>£{Number(item.unitPrice).toFixed(2)}</Td><Td>£{Number(item.total).toFixed(2)}</Td></tr>)}
        </DataTable>
      </section>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Acceptance and revision history</h3>
        <DataTable headers={["Type", "Detail", "Date"]}>
          {quote.acceptances.map((item) => <tr key={item.id}><Td>Acceptance</Td><Td>{item.name} {item.accepted ? "accepted" : "declined"}</Td><Td>{item.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          {quote.revisions.map((item) => <tr key={item.id}><Td>Revision {item.version}</Td><Td>Snapshot recorded</Td><Td>{item.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          {quote.jobs.map((job) => <tr key={job.id}><Td>Job</Td><Td><Link href={`/admin/jobs/${job.id}`}>{job.jobNumber}</Link></Td><Td>{job.createdAt.toLocaleString("en-GB")}</Td></tr>)}
        </DataTable>
      </section>
    </AdminShell>
  );
}
