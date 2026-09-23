import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createJob } from "@/app/admin/actions";
import { JobStatus } from "@/generated/prisma/client";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { matchesEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JobsAdminPage({ searchParams }: { searchParams?: Promise<{ status?: string; staff?: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const params = (await searchParams) || {};
  const [jobs, customers] = await Promise.all([
    prisma.job.findMany({
      where: {
        ...(matchesEnum(params.status, JobStatus) ? { status: matchesEnum(params.status, JobStatus) } : {}),
        ...(params.staff ? { assignments: { some: { userId: params.staff } } } : {}),
      },
      include: { customer: true, property: true, assignments: { include: { user: true } } },
      orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
      take: 80,
    }),
    prisma.customer.findMany({ include: { properties: true }, orderBy: { name: "asc" }, take: 100 }),
  ]);
  return (
    <AdminShell title="Jobs and Scheduling" userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section>
          <form className="mb-4 flex flex-wrap gap-3">
            <select className="field max-w-xs" name="status" defaultValue={params.status || ""}>
              <option value="">All statuses</option>
              {["UNSCHEDULED","SCHEDULED","CONFIRMED","EN_ROUTE","ARRIVED","IN_PROGRESS","PAUSED","COMPLETED","FOLLOW_UP_REQUIRED","CANCELLED","NO_ACCESS","RESCHEDULED"].map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
            <button className="btn-primary" type="submit">Filter</button>
          </form>
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            {["UNSCHEDULED","SCHEDULED","COMPLETED"].map((status) => <div className="card p-4" key={status}><p className="text-sm font-black text-slate-500">{status}</p><p className="text-2xl font-black">{jobs.filter((job) => job.status === status).length}</p></div>)}
          </div>
          <DataTable headers={["Job", "Customer", "Schedule", "Status", "Assigned", "Actions"]}>
            {jobs.map((job) => (
              <tr key={job.id}>
                <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/jobs/${job.id}`}>{job.jobNumber}</Link><br />{job.jobType}</Td>
                <Td>{job.customer?.name || "No customer"}<br /><span className="text-slate-500">{job.property?.postcode}</span></Td>
                <Td>{job.scheduledStart?.toLocaleString("en-GB") || "Unscheduled"}</Td>
                <Td><span className="status-pill bg-amber-50 text-amber-800">{job.status}</span></Td>
                <Td>{job.assignments.map((assignment) => assignment.user.name || assignment.user.email).join(", ") || "Unassigned"}</Td>
                <Td><Link className="btn-primary" href={`/admin/jobs/${job.id}`}>Open</Link></Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Create job">
          <form action={createJob} className="grid gap-3">
            <select className="field" name="customerId" defaultValue="">
              <option value="">No customer</option>
              {customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}
            </select>
            <input className="field" name="pestType" placeholder="Pest type" />
            <select className="field" name="jobType" defaultValue="Inspection">
              {["Inspection","Initial treatment","Follow-up treatment","Proofing","Emergency callout","Commercial contract visit","Monitoring visit","Survey","Removal","Prevention work"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="field" name="priority" defaultValue="Normal"><option>Normal</option><option>High</option><option>Emergency</option></select>
            <input className="field" name="scheduledStart" type="datetime-local" />
            <input className="field" name="scheduledEnd" type="datetime-local" />
            <textarea className="field" name="description" placeholder="Description" />
            <textarea className="field" name="accessNotes" placeholder="Access notes" />
            <button className="btn-primary" type="submit">Create job</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}
