import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ReportsAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const [leadTotal, quoteTotal, acceptedQuotes, jobsCompleted, payments, expenses, invoices, treatments] = await Promise.all([
    prisma.lead.count(),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: { in: ["ACCEPTED", "CONVERTED"] } } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.expense.aggregate({ _sum: { total: true } }),
    prisma.invoice.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.treatmentRecord.findMany({ include: { job: { include: { customer: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const revenue = Number(payments._sum.amount || 0);
  const expenseTotal = Number(expenses._sum.total || 0);
  const conversion = quoteTotal ? Math.round((acceptedQuotes / quoteTotal) * 100) : 0;

  return (
    <AdminShell title="Reports" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Lead volume" value={String(leadTotal)} />
        <MetricCard label="Quote conversion" value={`${conversion}%`} />
        <MetricCard label="Completed jobs" value={String(jobsCompleted)} />
        <MetricCard label="Estimated profit" value={`£${(revenue - expenseTotal).toFixed(2)}`} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <h3 className="text-xl font-black">Invoice report</h3>
          <DataTable headers={["Invoice", "Customer", "Status", "Total", "Outstanding"]}>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <Td>{invoice.invoiceNumber}</Td>
                <Td>{invoice.customer?.name || "-"}</Td>
                <Td>{invoice.status}</Td>
                <Td>£{Number(invoice.total).toFixed(2)}</Td>
                <Td>£{Number(invoice.amountOutstanding).toFixed(2)}</Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <section className="card p-5">
          <h3 className="text-xl font-black">Treatment reports</h3>
          <DataTable headers={["Date", "Job", "Customer", "Pest", "Severity"]}>
            {treatments.map((record) => (
              <tr key={record.id}>
                <Td>{record.createdAt.toLocaleDateString("en-GB")}</Td>
                <Td>{record.job.jobNumber}</Td>
                <Td>{record.job.customer?.name || "-"}</Td>
                <Td>{record.pestIdentified}</Td>
                <Td>{record.infestationSeverity}</Td>
              </tr>
            ))}
          </DataTable>
        </section>
      </div>
    </AdminShell>
  );
}
