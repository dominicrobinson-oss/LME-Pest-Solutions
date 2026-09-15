import { notFound } from "next/navigation";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { createCustomerBankPaymentRequest } from "@/app/admin/actions";
import { requireCustomerOwnership } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CustomerInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true, items: true, payments: true, documents: true } });
  if (!invoice || !invoice.customerId) notFound();
  const user = await requireCustomerOwnership(invoice.customerId);
  const pendingBankPayment = invoice.payments.find((payment) => payment.method === "Bank transfer" && payment.status === "PENDING");

  return (
    <AdminShell title={`Invoice ${invoice.invoiceNumber}`} userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Status" value={invoice.status} />
        <MetricCard label="Total" value={`£${Number(invoice.total).toFixed(2)}`} />
        <MetricCard label="Outstanding" value={`£${Number(invoice.amountOutstanding).toFixed(2)}`} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Invoice activity</h3>
          <DataTable headers={["Type", "Reference", "Detail", "Amount"]}>
            {invoice.items.map((item) => <tr key={item.id}><Td>Item</Td><Td>{item.description}</Td><Td>{Number(item.quantity).toFixed(2)} x £{Number(item.unitPrice).toFixed(2)}</Td><Td>£{Number(item.total).toFixed(2)}</Td></tr>)}
            {invoice.payments.map((payment) => <tr key={payment.id}><Td>Payment</Td><Td>{payment.paymentReference}</Td><Td>{payment.method} · {payment.status}</Td><Td>£{Number(payment.amount).toFixed(2)}</Td></tr>)}
          </DataTable>
        </section>
        <section className="card p-5">
          <h3 className="text-xl font-black">Bank transfer</h3>
          <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm">
            <p><b>Account name:</b> {env.BANK_ACCOUNT_NAME}</p>
            <p><b>Sort code:</b> {env.BANK_SORT_CODE}</p>
            <p><b>Account number:</b> {env.BANK_ACCOUNT_NUMBER}</p>
            <p><b>Reference:</b> {pendingBankPayment?.paymentReference || invoice.invoiceNumber}</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">{env.BANK_PAYMENT_NOTES}</p>
          {pendingBankPayment ? (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-900">Bank transfer requested. We will mark this invoice paid after the transfer appears in the business bank account.</p>
          ) : (
          <form action={createCustomerBankPaymentRequest} className="mt-4">
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <button className="btn-primary w-full" disabled={Number(invoice.amountOutstanding) <= 0} type="submit">Request bank transfer reference</button>
          </form>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
