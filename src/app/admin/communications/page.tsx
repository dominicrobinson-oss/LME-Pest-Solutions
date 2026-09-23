import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createCommunication } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CommunicationsAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const [communications, customers, leads, jobs] = await Promise.all([
    prisma.communication.findMany({ include: { customer: true, lead: true, job: true, user: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, take: 80 }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
  ]);
  const sent = communications.filter((item) => item.status === "Sent").length;

  return (
    <AdminShell title="Communications" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Timeline events" value={String(communications.length)} />
        <MetricCard label="Sent" value={String(sent)} />
        <MetricCard label="Logged only" value={String(communications.length - sent)} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Communication timeline</h3>
          <DataTable headers={["When", "Type", "Subject", "Linked record", "Status"]}>
            {communications.map((item) => (
              <tr key={item.id}>
                <Td>{item.createdAt.toLocaleString("en-GB")}<br /><span className="text-slate-500">{item.user?.email || "system"}</span></Td>
                <Td>{item.type}</Td>
                <Td>{item.subject || "No subject"}<br /><span className="text-slate-500">{item.body}</span></Td>
                <Td>{item.customer?.name || item.lead?.leadNumber || item.job?.jobNumber || item.recipient || "-"}</Td>
                <Td><span className="status-pill bg-lime-50 text-lime-800">{item.status}</span></Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Log communication">
          <form action={createCommunication} className="grid gap-3">
            <select className="field" name="type"><option>Phone</option><option>Email</option><option>SMS</option><option>WhatsApp</option><option>Note</option></select>
            <input className="field" name="recipient" placeholder="Recipient" />
            <input className="field" name="subject" placeholder="Subject" />
            <textarea className="field min-h-32" name="body" placeholder="Message / call notes" />
            <select className="field" name="customerId" defaultValue=""><option value="">No customer</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select>
            <select className="field" name="leadId" defaultValue=""><option value="">No lead</option>{leads.map((lead) => <option value={lead.id} key={lead.id}>{lead.leadNumber} · {lead.customerName}</option>)}</select>
            <select className="field" name="jobId" defaultValue=""><option value="">No job</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.jobNumber} · {job.pestType}</option>)}</select>
            <label className="text-sm font-bold"><input name="markSent" type="checkbox" /> Mark as sent</label>
            <button className="btn-primary" type="submit">Log communication</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}
