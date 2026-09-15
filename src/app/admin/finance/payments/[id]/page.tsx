import { notFound } from "next/navigation";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const payment = await prisma.payment.findUnique({ where: { id }, include: { customer: true, invoice: true, refunds: true } });
  if (!payment) notFound();

  return (
    <AdminShell title={`Payment ${payment.paymentReference}`} userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Status" value={payment.status} />
        <MetricCard label="Amount" value={`£${Number(payment.amount).toFixed(2)}`} />
        <MetricCard label="Method" value={payment.method} />
      </div>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Payment details</h3>
        <DataTable headers={["Field", "Value"]}>
          <tr><Td>Customer</Td><Td>{payment.customer?.name || "-"}</Td></tr>
          <tr><Td>Invoice</Td><Td>{payment.invoice?.invoiceNumber || "-"}</Td></tr>
          <tr><Td>Date</Td><Td>{payment.paymentDate.toLocaleString("en-GB")}</Td></tr>
          <tr><Td>Transaction reference</Td><Td>{payment.transactionReference || "-"}</Td></tr>
          <tr><Td>Processing fee</Td><Td>£{Number(payment.processingFee).toFixed(2)}</Td></tr>
          <tr><Td>Notes</Td><Td>{payment.notes || "-"}</Td></tr>
        </DataTable>
      </section>
    </AdminShell>
  );
}
