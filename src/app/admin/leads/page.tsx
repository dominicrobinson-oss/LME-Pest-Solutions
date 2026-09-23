import Link from "next/link";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { assignLead, convertLeadToCustomer, updateLeadStatus } from "@/app/admin/actions";
import { LeadStatus } from "@/generated/prisma/client";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { matchesEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const params = (await searchParams) || {};
  const q = params.q?.trim();
  const status = params.status?.trim();
  const where = {
    ...(q ? { OR: [{ customerName: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" as const } }, { postcode: { contains: q, mode: "insensitive" as const } }, { leadNumber: { contains: q, mode: "insensitive" as const } }] } : {}),
    ...(matchesEnum(status, LeadStatus) ? { status: matchesEnum(status, LeadStatus) } : {}),
  };
  const [leads, staff, counts] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 50, include: { assignedStaff: true } }),
    prisma.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "SALES"] }, status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  return (
    <AdminShell title="Leads and Enquiries" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="New" value={String(counts.find((item) => item.status === "NEW")?._count || 0)} />
        <MetricCard label="Qualified" value={String(counts.find((item) => item.status === "QUALIFIED")?._count || 0)} />
        <MetricCard label="Won" value={String(counts.find((item) => item.status === "WON")?._count || 0)} />
      </div>
      <form className="my-5 flex flex-wrap gap-3">
        <input className="field max-w-sm" name="q" placeholder="Search name, phone, email, postcode or lead number" defaultValue={q} />
        <select className="field max-w-xs" name="status" defaultValue={status || ""}>
          <option value="">All statuses</option>
          {["NEW","CONTACT_ATTEMPTED","CONTACTED","QUALIFIED","SITE_VISIT_REQUIRED","QUOTE_IN_PROGRESS","QUOTE_SENT","WON","LOST","SPAM","CLOSED"].map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <button className="btn-primary" type="submit">Filter</button>
        <a className="btn-primary" href={`/api/admin/export/leads?q=${encodeURIComponent(q || "")}&status=${encodeURIComponent(status || "")}`}>Export CSV</a>
      </form>
      <DataTable headers={["Lead", "Customer", "Problem", "Status", "Assign", "Actions"]}>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/leads/${lead.id}`}>{lead.leadNumber}</Link><br /><span className="text-slate-500">{lead.createdAt.toLocaleDateString("en-GB")}</span></Td>
            <Td>{lead.customerName}<br /><span className="text-slate-500">{lead.phone} {lead.email}</span></Td>
            <Td>{lead.pestType}<br /><span className="text-slate-500">{lead.postcode} · {lead.urgency}</span></Td>
            <Td><span className="status-pill bg-amber-50 text-amber-800">{lead.status}</span></Td>
            <Td>
              <form action={assignLead} className="flex gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <select className="field" name="assignedStaffId" defaultValue={lead.assignedStaffId || ""}>
                  <option value="">Unassigned</option>
                  {staff.map((member) => <option value={member.id} key={member.id}>{member.name || member.email}</option>)}
                </select>
                <button className="btn-primary" type="submit">Save</button>
              </form>
            </Td>
            <Td>
              <div className="flex flex-wrap gap-2">
                <form action={updateLeadStatus} className="flex gap-2">
                  <input type="hidden" name="id" value={lead.id} />
                  <select className="field" name="status" defaultValue={lead.status}>
                    {["CONTACTED","QUALIFIED","QUOTE_IN_PROGRESS","QUOTE_SENT","WON","LOST","CLOSED"].map((item) => <option value={item} key={item}>{item}</option>)}
                  </select>
                  <button className="btn-primary" type="submit">Update</button>
                </form>
                <form action={convertLeadToCustomer}>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <button className="btn-primary" type="submit">Convert</button>
                </form>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
    </AdminShell>
  );
}
