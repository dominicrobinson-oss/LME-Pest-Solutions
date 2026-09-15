import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createProperty, createQuote } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id }, include: { properties: true, contacts: true, leads: true, quotes: true, jobs: true, invoices: true, payments: true, documents: true, communications: true } });
  if (!customer) notFound();
  return (
    <AdminShell title={customer.name} userName={user.name || user.email}>
      <section className="card p-5">
        <p className="font-black">{customer.customerNumber} · {customer.customerType}</p>
        <p className="mt-2 text-slate-600">{customer.companyName || "No company"} · {customer.email || "No email"} · {customer.phone || "No phone"}</p>
        <p className="mt-2">Balance: £{Number(customer.accountBalance).toFixed(2)} · Lifetime value: £{Number(customer.lifetimeValue).toFixed(2)}</p>
      </section>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminForm title="Add property/site">
          <form action={createProperty} className="grid gap-3">
            <input type="hidden" name="customerId" value={customer.id} />
            <input className="field" name="propertyName" placeholder="Property name" />
            <input className="field" name="address" placeholder="Full address" />
            <input className="field" name="postcode" placeholder="Postcode" />
            <input className="field" name="propertyType" placeholder="Property type" />
            <textarea className="field" name="accessInstructions" placeholder="Access instructions" />
            <textarea className="field" name="previousPestHistory" placeholder="Previous pest history" />
            <textarea className="field" name="recurringRequirements" placeholder="Recurring treatment requirements" />
            <label><input name="petsPresent" type="checkbox" /> Pets present</label>
            <label><input name="childrenPresent" type="checkbox" /> Children present</label>
            <label><input name="vulnerableOccupants" type="checkbox" /> Vulnerable occupants</label>
            <label><input name="foodHandlingArea" type="checkbox" /> Food handling area</label>
            <button className="btn-primary" type="submit">Add property</button>
          </form>
        </AdminForm>
        <AdminForm title="Create quote">
          <form action={createQuote} className="grid gap-3">
            <input type="hidden" name="customerId" value={customer.id} />
            <select className="field" name="propertyId" defaultValue="">
              <option value="">No property</option>
              {customer.properties.map((property) => <option value={property.id} key={property.id}>{property.propertyName || property.address}</option>)}
            </select>
            <input className="field" name="pestType" placeholder="Pest type" />
            <input className="field" name="title" placeholder="Quote title" />
            <input className="field" name="lineDescription" placeholder="Line item" />
            <input className="field" name="quantity" type="number" step="0.01" defaultValue="1" />
            <input className="field" name="unitPrice" type="number" step="0.01" placeholder="Unit price" />
            <input className="field" name="vat" type="number" step="0.01" placeholder="VAT" />
            <button className="btn-primary" type="submit">Create quote</button>
          </form>
        </AdminForm>
      </div>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Customer history</h3>
        <DataTable headers={["Tab", "Records", "Latest"]}>
          <tr><Td>Properties</Td><Td>{customer.properties.length}</Td><Td>{customer.properties[0]?.postcode || "-"}</Td></tr>
          <tr><Td>Leads</Td><Td>{customer.leads.length}</Td><Td>{customer.leads[0]?.leadNumber || "-"}</Td></tr>
          <tr><Td>Quotes</Td><Td>{customer.quotes.length}</Td><Td>{customer.quotes[0]?.quoteNumber || "-"}</Td></tr>
          <tr><Td>Jobs</Td><Td>{customer.jobs.length}</Td><Td>{customer.jobs[0]?.jobNumber || "-"}</Td></tr>
          <tr><Td>Invoices</Td><Td>{customer.invoices.length}</Td><Td>{customer.invoices[0]?.invoiceNumber || "-"}</Td></tr>
          <tr><Td>Documents</Td><Td>{customer.documents.length}</Td><Td>{customer.documents[0]?.title || "-"}</Td></tr>
        </DataTable>
      </section>
    </AdminShell>
  );
}
