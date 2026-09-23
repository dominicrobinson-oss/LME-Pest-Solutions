import Link from "next/link";
import { addDays, format, startOfDay } from "date-fns";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { CalendarDragBoard } from "@/components/calendar-drag-board";
import { DataTable, Td } from "@/components/data-table";
import { scheduleJobAdmin } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CalendarAdminPage({ searchParams }: { searchParams?: Promise<{ view?: string; technicianId?: string; date?: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const params = (await searchParams) || {};
  const baseDay = startOfDay(params.date ? new Date(`${params.date}T00:00:00`) : new Date());
  const daysToShow = params.view === "day" ? 1 : params.view === "month" ? 30 : 7;
  const end = addDays(baseDay, daysToShow);
  const technicians = await prisma.user.findMany({ where: { role: "TECHNICIAN", status: "ACTIVE" }, orderBy: { name: "asc" } });
  const jobs = await prisma.job.findMany({
    where: {
      OR: [{ scheduledStart: { gte: baseDay, lte: end } }, { scheduledStart: null }],
      ...(params.technicianId ? { assignments: { some: { userId: params.technicianId } } } : {}),
    },
    include: { customer: true, property: true, assignments: { include: { user: true } } },
    orderBy: [{ scheduledStart: "asc" }, { priority: "asc" }],
    take: 120,
  });
  const unassigned = jobs.filter((job) => job.assignments.length === 0).length;
  const unscheduled = jobs.filter((job) => !job.scheduledStart).length;
  const days = Array.from({ length: daysToShow }, (_, index) => addDays(baseDay, index));
  const dragJobs = jobs
    .filter((job) => !job.scheduledStart)
    .map((job) => ({ id: job.id, jobNumber: job.jobNumber, label: `${job.customer?.name || job.pestType} · ${job.priority}` }));
  const dragDays = days.slice(0, 14).map((day) => ({ iso: format(day, "yyyy-MM-dd"), label: format(day, "EEE d MMM") }));

  return (
    <AdminShell title="Calendar" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={`${daysToShow}-day scheduled`} value={String(jobs.filter((job) => job.scheduledStart).length)} />
        <MetricCard label="Unscheduled" value={String(unscheduled)} />
        <MetricCard label="Unassigned" value={String(unassigned)} />
      </div>
      <form className="mt-5 flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow-sm">
        <select className="field max-w-40" name="view" defaultValue={params.view || "week"}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <input className="field max-w-48" name="date" type="date" defaultValue={format(baseDay, "yyyy-MM-dd")} />
        <select className="field max-w-64" name="technicianId" defaultValue={params.technicianId || ""}>
          <option value="">All technicians</option>
          {technicians.map((technician) => <option value={technician.id} key={technician.id}>{technician.name || technician.email}</option>)}
        </select>
        <button className="btn-primary" type="submit">Update calendar</button>
      </form>
      <section className="mt-5 grid gap-4 lg:grid-cols-7">
        {days.map((day) => {
          const dayJobs = jobs.filter((job) => job.scheduledStart && format(job.scheduledStart, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));
          return (
            <div className="card min-h-44 p-3" key={day.toISOString()}>
              <p className="text-xs font-black uppercase text-slate-500">{format(day, "EEE")}</p>
              <h3 className="font-black">{format(day, "d MMM")}</h3>
              <div className="mt-3 grid gap-2">
                {dayJobs.map((job) => (
                  <Link className="rounded-lg bg-lime-50 p-2 text-xs font-bold text-lime-900" href={`/admin/jobs/${job.id}`} key={job.id}>
                    {format(job.scheduledStart!, "HH:mm")} · {job.jobNumber}
                    <br /><span className="font-normal">{job.customer?.name || job.pestType}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Drag schedule assistant</h3>
        <p className="mt-1 text-sm text-slate-600">Drag an unscheduled job onto a date, choose the time and duration, then submit. Server-side conflict checks still run before saving.</p>
        {dragJobs.length ? (
          <form action={scheduleJobAdmin}>
            <CalendarDragBoard jobs={dragJobs} days={dragDays} />
            <button className="btn-primary mt-4" type="submit">Schedule dragged job</button>
          </form>
        ) : (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No unscheduled jobs are waiting for drag scheduling.</p>
        )}
      </section>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Unscheduled and unassigned queue</h3>
        <DataTable headers={["Job", "Customer", "Status", "Priority", "Assigned", "Quick schedule"]}>
          {jobs.filter((job) => !job.scheduledStart || job.assignments.length === 0).map((job) => (
            <tr key={job.id}>
              <Td><Link className="font-black text-[var(--primary-green)]" href={`/admin/jobs/${job.id}`}>{job.jobNumber}</Link><br />{job.jobType}</Td>
              <Td>{job.customer?.name || "No customer"}<br /><span className="text-slate-500">{job.property?.postcode}</span></Td>
              <Td>{job.status}</Td>
              <Td>{job.priority}</Td>
              <Td>{job.assignments.map((assignment) => assignment.user.name || assignment.user.email).join(", ") || "Unassigned"}</Td>
              <Td>
                <form action={scheduleJobAdmin} className="grid min-w-56 gap-2">
                  <input type="hidden" name="jobId" value={job.id} />
                  <input className="field" name="scheduledStart" type="datetime-local" />
                  <input className="field" name="scheduledEnd" type="datetime-local" />
                  <button className="btn-primary" type="submit">Schedule</button>
                </form>
              </Td>
            </tr>
          ))}
        </DataTable>
      </section>
    </AdminShell>
  );
}
