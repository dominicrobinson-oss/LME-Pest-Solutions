import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { assignJob, createInvoiceFromJob, scheduleJobAdmin, updateJobStatus } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const [job, staffMembers] = await Promise.all([
    prisma.job.findUnique({ where: { id }, include: { customer: true, property: true, quote: true, assignments: { include: { user: true } }, statusHistory: { orderBy: { createdAt: "desc" } }, treatmentRecords: true, invoices: true, documents: true } }),
    prisma.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "SALES"] }, status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);
  if (!job) notFound();
  return (
    <AdminShell title={job.jobNumber} userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="card p-5">
          <h3 className="text-2xl font-black">{job.jobType}</h3>
          <p className="mt-2 text-slate-600">{job.customer?.name || "No customer"} · {job.property?.address || "No property"}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <p><b>Status:</b> {job.status}</p>
            <p><b>Priority:</b> {job.priority}</p>
            <p><b>Pest:</b> {job.pestType}</p>
            <p><b>Scheduled:</b> {job.scheduledStart?.toLocaleString("en-GB") || "Unscheduled"}</p>
            <p><b>Arrival:</b> {job.actualArrival?.toLocaleString("en-GB") || "-"}</p>
            <p><b>Departure:</b> {job.actualDeparture?.toLocaleString("en-GB") || "-"}</p>
          </div>
          <p className="mt-4">{job.description}</p>
          {job.internalInstructions?.includes("Scheduling conflict warning") ? (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-900">{job.internalInstructions}</p>
          ) : null}
        </section>
        <div className="grid gap-5">
          <AdminForm title="Assign staff">
            <form action={assignJob} className="grid gap-3">
              <input type="hidden" name="jobId" value={job.id} />
              <select className="field" name="userId">
                {staffMembers.map((staffMember) => <option value={staffMember.id} key={staffMember.id}>{staffMember.name || staffMember.email}</option>)}
              </select>
              <button className="btn-primary" type="submit">Assign</button>
            </form>
          </AdminForm>
          <AdminForm title="Schedule job">
            <form action={scheduleJobAdmin} className="grid gap-3">
              <input type="hidden" name="jobId" value={job.id} />
              <input className="field" name="scheduledStart" type="datetime-local" />
              <input className="field" name="scheduledEnd" type="datetime-local" />
              <p className="text-xs text-slate-600">Assigned staff conflicts are logged into the job if detected.</p>
              <button className="btn-primary" type="submit">Update schedule</button>
            </form>
          </AdminForm>
          <AdminForm title="Create invoice">
            <form action={createInvoiceFromJob} className="grid gap-3">
              <input type="hidden" name="jobId" value={job.id} />
              <input className="field" name="total" type="number" step="0.01" placeholder="Manual total if no quote" />
              <input className="field" name="dueDate" type="date" />
              <button className="btn-primary" type="submit">Create invoice</button>
            </form>
          </AdminForm>
        </div>
      </div>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Job status controls</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {["CONFIRMED","EN_ROUTE","ARRIVED","IN_PROGRESS","PAUSED","COMPLETED","NO_ACCESS","RESCHEDULED"].map((status) => (
            <form action={updateJobStatus} key={status}>
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="status" value={status} />
              <button className="btn-primary" type="submit">{status}</button>
            </form>
          ))}
        </div>
      </section>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">History</h3>
        <DataTable headers={["Type", "Detail", "Date"]}>
          {job.statusHistory.map((item) => <tr key={item.id}><Td>Status</Td><Td>{item.status} {item.note}</Td><Td>{item.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          {job.treatmentRecords.map((item) => <tr key={item.id}><Td>Treatment</Td><Td>{item.pestIdentified} · {item.infestationSeverity} · <a className="font-bold text-[var(--primary-gold)]" href={`/api/reports/treatment/${item.id}`} target="_blank" rel="noopener noreferrer">Download PDF</a></Td><Td>{item.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          {job.invoices.map((item) => <tr key={item.id}><Td>Invoice</Td><Td>{item.invoiceNumber}</Td><Td>{item.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          {job.documents.map((item) => <tr key={item.id}><Td>Document</Td><Td>{item.title}</Td><Td>{item.createdAt.toLocaleString("en-GB")}</Td></tr>)}
        </DataTable>
      </section>
    </AdminShell>
  );
}
