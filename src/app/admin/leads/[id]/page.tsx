import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { addLeadNote, convertLeadToCustomer, createQuote, updateLeadStatus } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: "desc" } }, quotes: true, communications: true, consentRecords: true } });
  if (!lead) notFound();
  return (
    <AdminShell title={lead.leadNumber} userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">{lead.customerName}</h3>
          <p className="mt-2 text-slate-600">{lead.phone} · {lead.email || "No email"} · {lead.postcode}</p>
          <p className="mt-4">{lead.description || "No description supplied."}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <p><b>Pest:</b> {lead.pestType}</p>
            <p><b>Property:</b> {lead.propertyType}</p>
            <p><b>Urgency:</b> {lead.urgency}</p>
            <p><b>Preferred contact:</b> {lead.preferredContactMethod}</p>
            <p><b>Status:</b> {lead.status}</p>
            <p><b>Follow-up:</b> {lead.nextFollowUpAt?.toLocaleDateString("en-GB") || "Not set"}</p>
          </div>
        </section>
        <div className="grid gap-5">
          <AdminForm title="Update status">
            <form action={updateLeadStatus} className="grid gap-3">
              <input type="hidden" name="id" value={lead.id} />
              <select className="field" name="status" defaultValue={lead.status}>
                {["NEW","CONTACT_ATTEMPTED","CONTACTED","QUALIFIED","SITE_VISIT_REQUIRED","QUOTE_IN_PROGRESS","QUOTE_SENT","WON","LOST","SPAM","CLOSED"].map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
              <input className="field" name="lostReason" placeholder="Lost reason, if applicable" />
              <button className="btn-primary" type="submit">Save status</button>
            </form>
          </AdminForm>
          <AdminForm title="Convert">
            <form action={convertLeadToCustomer}>
              <input type="hidden" name="leadId" value={lead.id} />
              <button className="btn-primary w-full" type="submit">Convert to customer and property</button>
            </form>
          </AdminForm>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminForm title="Create quote">
          <form action={createQuote} className="grid gap-3">
            <input type="hidden" name="leadId" value={lead.id} />
            <input name="pestType" className="field" defaultValue={lead.pestType} />
            <input name="title" className="field" placeholder="Quote title" defaultValue={`${lead.pestType} treatment`} />
            <textarea name="description" className="field" placeholder="Description" defaultValue={lead.description || ""} />
            <input name="lineDescription" className="field" placeholder="Line item" defaultValue="Inspection and treatment" />
            <input name="quantity" className="field" type="number" step="0.01" defaultValue="1" />
            <input name="unitPrice" className="field" type="number" step="0.01" placeholder="Unit price" />
            <input name="vat" className="field" type="number" step="0.01" placeholder="VAT" />
            <input name="depositRequired" className="field" type="number" step="0.01" placeholder="Deposit required" />
            <button className="btn-primary" type="submit">Create quote</button>
          </form>
        </AdminForm>
        <AdminForm title="Add note">
          <form action={addLeadNote} className="grid gap-3">
            <input type="hidden" name="leadId" value={lead.id} />
            <textarea className="field min-h-32" name="body" placeholder="Call notes, follow-up, customer preferences" />
            <button className="btn-primary" type="submit">Add note</button>
          </form>
        </AdminForm>
      </div>

      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Timeline</h3>
        <DataTable headers={["Type", "Detail", "Date"]}>
          {lead.notes.map((note) => <tr key={note.id}><Td>Note</Td><Td>{note.body}</Td><Td>{note.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          {lead.quotes.map((quote) => <tr key={quote.id}><Td>Quote</Td><Td><Link href={`/admin/quotes/${quote.id}`}>{quote.quoteNumber}</Link></Td><Td>{quote.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          {lead.consentRecords.map((consent) => <tr key={consent.id}><Td>Consent</Td><Td>{consent.text}</Td><Td>{consent.createdAt.toLocaleString("en-GB")}</Td></tr>)}
        </DataTable>
      </section>
    </AdminShell>
  );
}
