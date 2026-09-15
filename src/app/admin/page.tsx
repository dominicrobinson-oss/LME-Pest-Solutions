import { AdminShell, DataPanel, MetricCard } from "@/components/admin-shell";
import { requireAnyRole, adminRoles } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireAnyRole(adminRoles);
  const [newLeads, quotesAwaiting, jobsToday, outstandingInvoices, paidInvoices, expenses] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.quote.count({ where: { status: { in: ["READY", "SENT", "VIEWED"] } } }),
    prisma.job.count({ where: { scheduledStart: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
    prisma.invoice.count({ where: { amountOutstanding: { gt: 0 } } }),
    prisma.invoice.aggregate({ _sum: { amountPaid: true }, where: { status: { in: ["PAID", "PARTIALLY_PAID"] } } }),
    prisma.expense.aggregate({ _sum: { total: true } }),
  ]);
  const revenue = Number(paidInvoices._sum.amountPaid || 0);
  const expenseTotal = Number(expenses._sum.total || 0);
  const metrics = [
    ["New leads", String(newLeads)],
    ["Quotes awaiting action", String(quotesAwaiting)],
    ["Jobs today", String(jobsToday)],
    ["Outstanding invoices", String(outstandingInvoices)],
    ["Revenue received", `£${revenue.toFixed(2)}`],
    ["Estimated profit", `£${(revenue - expenseTotal).toFixed(2)}`],
  ];
  return (
    <AdminShell title="Dashboard" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value]) => <MetricCard label={label} value={value} note="Live once database is connected and seeded." key={label} />)}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <DataPanel title="Upcoming jobs" items={["Use Jobs to schedule and assign technician work.", "Calendar views are provided in the jobs module."]} />
        <DataPanel title="Quote pipeline" items={["Draft", "Ready", "Sent", "Accepted", "Converted"]} />
        <DataPanel title="Alerts" items={["Overdue invoices", "Contract renewals", "Certificate expiry", "Stock low"]} />
      </div>
    </AdminShell>
  );
}
