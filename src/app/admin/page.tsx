import Link from "next/link";
import { AdminShell, DataPanel, MetricCard } from "@/components/admin-shell";
import { LoginForm } from "@/components/login-form";
import { getSessionUser, adminRoles } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const resetMessages: Record<string, string> = {
  requested: "If that email matches a staff account, a reset link is on its way.",
  complete: "Password updated. You can now log in.",
  limited: "Too many reset requests. Please wait a while and try again.",
};

type Props = { searchParams: Promise<{ callbackUrl?: string; reset?: string }> };

export default async function AdminDashboard({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getSessionUser();
  const authorized = user && (user.role === "SUPER_ADMIN" || adminRoles.includes(user.role));

  if (!user || !authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-14">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-center text-2xl font-black">LME Admin Login</h1>
          <p className="mb-6 text-center text-sm text-slate-600">Staff access only.</p>
          {user ? (
            <div className="card grid gap-3 p-6 text-center">
              <p className="text-sm font-bold text-red-700">This account does not have admin access.</p>
              <Link className="btn-primary justify-self-center" href="/api/auth/signout">Logout</Link>
            </div>
          ) : (
            <>
              {params.reset && resetMessages[params.reset] ? (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-center text-sm font-bold text-slate-800">{resetMessages[params.reset]}</p>
              ) : null}
              <LoginForm callbackUrl={params.callbackUrl || "/admin"} />
            </>
          )}
        </div>
      </main>
    );
  }

  const now = new Date();
  const next30 = new Date(now);
  next30.setDate(now.getDate() + 30);
  const [
    newLeads,
    quotesAwaiting,
    jobsToday,
    outstandingInvoices,
    paidInvoices,
    expenses,
    quoteStatusCounts,
    upcomingJobs,
    overdueInvoicesCount,
    contractRenewalsCount,
    expiringVehiclesCount,
    expiringEquipmentCount,
    products,
  ] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.quote.count({ where: { status: { in: ["READY", "SENT", "VIEWED"] } } }),
    prisma.job.count({ where: { scheduledStart: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
    prisma.invoice.count({ where: { amountOutstanding: { gt: 0 } } }),
    prisma.invoice.aggregate({ _sum: { amountPaid: true }, where: { status: { in: ["PAID", "PARTIALLY_PAID"] } } }),
    prisma.expense.aggregate({ _sum: { total: true } }),
    prisma.quote.groupBy({ by: ["status"], _count: true }),
    prisma.job.findMany({ where: { scheduledStart: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } }, include: { customer: true }, orderBy: { scheduledStart: "asc" }, take: 5 }),
    prisma.invoice.count({ where: { amountOutstanding: { gt: 0 }, dueDate: { lt: now } } }),
    prisma.commercialContract.count({ where: { renewalDate: { lte: next30 } } }),
    prisma.vehicle.count({ where: { OR: [{ motDate: { lte: next30 } }, { taxDate: { lte: next30 } }, { insuranceExpiry: { lte: next30 } }, { serviceDueDate: { lte: next30 } }] } }),
    prisma.equipment.count({ where: { nextInspection: { lte: next30 } } }),
    prisma.product.findMany({ where: { active: true }, select: { currentStock: true, reorderLevel: true } }),
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
  const countByStatus = (status: string) => quoteStatusCounts.find((row) => row.status === status)?._count || 0;
  const stockLowCount = products.filter((product) => Number(product.currentStock) <= Number(product.reorderLevel)).length;
  return (
    <AdminShell title="Dashboard" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value]) => <MetricCard label={label} value={value} key={label} />)}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <DataPanel
          title="Upcoming jobs"
          items={
            upcomingJobs.length
              ? upcomingJobs.map((job) => ({ label: `${job.jobNumber} · ${job.customer?.name || "No customer"}`, value: job.scheduledStart?.toLocaleDateString("en-GB"), href: `/admin/jobs/${job.id}` }))
              : [{ label: "No upcoming scheduled jobs.", href: "/admin/jobs" }]
          }
        />
        <DataPanel
          title="Quote pipeline"
          items={[
            { label: "Draft", value: String(countByStatus("DRAFT")), href: "/admin/quotes?status=DRAFT" },
            { label: "Ready", value: String(countByStatus("READY")), href: "/admin/quotes?status=READY" },
            { label: "Sent", value: String(countByStatus("SENT")), href: "/admin/quotes?status=SENT" },
            { label: "Accepted", value: String(countByStatus("ACCEPTED")), href: "/admin/quotes?status=ACCEPTED" },
            { label: "Converted", value: String(countByStatus("CONVERTED")), href: "/admin/quotes?status=CONVERTED" },
          ]}
        />
        <DataPanel
          title="Alerts"
          items={[
            { label: "Overdue invoices", value: String(overdueInvoicesCount), href: "/admin/finance" },
            { label: "Contract renewals due", value: String(contractRenewalsCount), href: "/admin/contracts" },
            { label: "Vehicle/equipment dates due", value: String(expiringVehiclesCount + expiringEquipmentCount), href: "/admin/reminders" },
            { label: "Stock low", value: String(stockLowCount), href: "/admin/resources" },
          ]}
        />
      </div>
    </AdminShell>
  );
}
