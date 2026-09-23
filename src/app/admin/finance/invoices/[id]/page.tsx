import { notFound } from "next/navigation";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { markBankPaymentReceived, recordPayment } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true, job: true, quote: true, items: true, payments: true, documents: true } });
  if (!invoice) notFound();

  return (
    <AdminShell title={`Invoice ${invoice.invoiceNumber}`} userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Status" value={invoice.status} />
        <MetricCard label="Total" value={`£${Number(invoice.total).toFixed(2)}`} />
        <MetricCard label="Paid" value={`£${Number(invoice.amountPaid).toFixed(2)}`} />
        <MetricCard label="Outstanding" value={`£${Number(invoice.amountOutstanding).toFixed(2)}`} />
      </div>
      <div className="mt-4">
        <a className="btn-secondary" href={`/api/reports/invoice/${invoice.id}`} target="_blank" rel="noopener noreferrer">Download PDF</a>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Line items and payments</h3>
          <DataTable headers={["Type", "Reference", "Detail", "Amount"]}>
            {invoice.items.map((item) => <tr key={item.id}><Td>Item</Td><Td>{item.description}</Td><Td>{Number(item.quantity).toFixed(2)} x £{Number(item.unitPrice).toFixed(2)}</Td><Td>£{Number(item.total).toFixed(2)}</Td></tr>)}
            {invoice.payments.map((payment) => (
              <tr key={payment.id}>
                <Td>Payment</Td>
                <Td>{payment.paymentReference}</Td>
                <Td>
                  {payment.method} · {payment.status}
                  {payment.method === "Bank transfer" && payment.status === "PENDING" ? (
                    <form action={markBankPaymentReceived} className="mt-2 grid gap-2">
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input className="field" name="transactionReference" placeholder="Bank transaction reference" />
                      <button className="btn-primary" type="submit">Mark received</button>
                    </form>
                  ) : null}
                </Td>
                <Td>£{Number(payment.amount).toFixed(2)}</Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <section className="card p-5">
          <h3 className="text-xl font-black">Record payment</h3>
          <form action={recordPayment} className="mt-4 grid gap-3">
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <input className="field" name="amount" type="number" step="0.01" defaultValue={Number(invoice.amountOutstanding).toFixed(2)} />
            <select className="field" name="method"><option>Bank transfer</option><option>Cash</option><option>Card</option><option>Deposit</option><option>Cheque</option><option>Other</option></select>
            <input className="field" name="transactionReference" placeholder="Transaction reference" />
            <textarea className="field" name="notes" placeholder="Payment notes" />
            <button className="btn-primary" type="submit">Record payment</button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
