import { notFound } from "next/navigation";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const expense = await prisma.expense.findUnique({ where: { id }, include: { category: true, job: true, vehicle: true, createdBy: true } });
  if (!expense) notFound();

  return (
    <AdminShell title={`Expense ${expense.expenseNumber}`} userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total" value={`£${Number(expense.total).toFixed(2)}`} />
        <MetricCard label="VAT" value={`£${Number(expense.vat).toFixed(2)}`} />
        <MetricCard label="Approved" value={expense.approved ? "Yes" : "No"} />
      </div>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Expense details</h3>
        <DataTable headers={["Field", "Value"]}>
          <tr><Td>Description</Td><Td>{expense.description}</Td></tr>
          <tr><Td>Category</Td><Td>{expense.category?.name || "-"}</Td></tr>
          <tr><Td>Supplier</Td><Td>{expense.supplier || "-"}</Td></tr>
          <tr><Td>Date</Td><Td>{expense.expenseDate.toLocaleDateString("en-GB")}</Td></tr>
          <tr><Td>Job</Td><Td>{expense.job?.jobNumber || "-"}</Td></tr>
          <tr><Td>Vehicle</Td><Td>{expense.vehicle?.registration || "-"}</Td></tr>
          <tr><Td>Receipt</Td><Td>{expense.receiptUrl ? <a className="font-bold text-[var(--primary-green)]" href={expense.receiptUrl}>{expense.receiptUrl}</a> : "-"}</Td></tr>
          <tr><Td>Notes</Td><Td>{expense.notes || "-"}</Td></tr>
        </DataTable>
      </section>
    </AdminShell>
  );
}
