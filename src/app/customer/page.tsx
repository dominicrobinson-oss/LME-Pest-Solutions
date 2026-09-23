import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { requestCustomerService } from "@/app/admin/actions";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function CustomerPortalPage() {
  const user = await requireUser();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES"].includes(user.role);
  const customer = isAdmin
    ? await prisma.customer.findFirst({ include: { properties: true, quotes: true, jobs: true, invoices: true, documents: true, payments: true } })
    : await prisma.customer.findFirst({ where: { userId: user.id }, include: { properties: true, quotes: true, jobs: true, invoices: true, documents: true, payments: true } });
  return (
    <AdminShell title="Customer Portal" userName={user.name || user.email}>
      {!customer ? (
        <div className="card p-6">No customer account is linked to this login yet.</div>
      ) : (
        <div className="grid gap-5">
          <section className="card p-5">
            <h3 className="text-2xl font-black">{customer.name}</h3>
            <p className="mt-2 text-slate-600">{customer.email} · {customer.phone}</p>
          </section>
          <section className="card p-5">
            <h3 className="text-xl font-black">Request another service</h3>
            <form action={requestCustomerService} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="customerId" value={customer.id} />
              <input type="hidden" name="customerName" value={customer.name} />
              <input type="hidden" name="email" value={customer.email || ""} />
              <input className="field" name="phone" defaultValue={customer.phone || ""} placeholder="Phone" />
              <input className="field" name="postcode" defaultValue={customer.properties[0]?.postcode || ""} placeholder="Postcode" />
              <input className="field" name="pestType" placeholder="Pest type" />
              <select className="field" name="urgency" defaultValue="Routine"><option>Routine</option><option>Soon</option><option>Urgent</option><option>Emergency</option></select>
              <input className="field" name="propertyType" defaultValue={customer.properties[0]?.propertyType || "Existing customer"} placeholder="Property type" />
              <select className="field" name="preferredContactMethod" defaultValue="Phone"><option>Phone</option><option>Email</option><option>WhatsApp</option></select>
              <textarea className="field md:col-span-2" name="description" placeholder="What do you need help with?" />
              <button className="btn-primary md:col-span-2" type="submit">Send request</button>
            </form>
          </section>
          <section className="card p-5">
            <h3 className="text-xl font-black">Quotes</h3>
            <DataTable headers={["Quote", "Status", "Total", "Action"]}>
              {customer.quotes.map((quote) => <tr key={quote.id}><Td>{quote.quoteNumber}</Td><Td>{quote.status}</Td><Td>£{Number(quote.total).toFixed(2)}</Td><Td><Link className="btn-primary" href={`/customer/quotes/${quote.id}`}>View</Link></Td></tr>)}
            </DataTable>
          </section>
          <section className="card p-5">
            <h3 className="text-xl font-black">Jobs and invoices</h3>
            <DataTable headers={["Type", "Reference", "Status", "Detail"]}>
              {customer.jobs.map((job) => <tr key={job.id}><Td>Job</Td><Td><Link className="font-black text-[var(--primary-green)]" href={`/customer/jobs/${job.id}`}>{job.jobNumber}</Link></Td><Td>{job.status}</Td><Td>{job.scheduledStart?.toLocaleString("en-GB") || "Unscheduled"}</Td></tr>)}
              {customer.invoices.map((invoice) => <tr key={invoice.id}><Td>Invoice</Td><Td><Link className="font-black text-[var(--primary-green)]" href={`/customer/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link></Td><Td>{invoice.status}</Td><Td>Outstanding £{Number(invoice.amountOutstanding).toFixed(2)}</Td></tr>)}
              {customer.documents.map((document) => <tr key={document.id}><Td>Document</Td><Td><Link className="font-black text-[var(--primary-green)]" href={`/customer/documents/${document.id}`}>{document.title}</Link></Td><Td>{document.category}</Td><Td>Protected view</Td></tr>)}
            </DataTable>
          </section>
          <section className="grid gap-3 md:grid-cols-3">
            <Link className="btn-primary" href="/customer/profile">Profile</Link>
            <Link className="btn-primary" href="/customer/messages">Messages</Link>
            <Link className="btn-primary" href="/get-a-quote">New quote</Link>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
