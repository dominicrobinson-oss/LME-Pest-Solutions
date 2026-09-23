import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createExpense, markBankPaymentReceived, recordPayment } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FinanceAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const [invoices, payments, expenses, categories, revenue, expenseTotal, vatSummary, quoteTotal, acceptedQuotes, completedJobs] = await Promise.all([
    prisma.invoice.findMany({ include: { customer: true, payments: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.payment.findMany({ include: { customer: true, invoice: true }, orderBy: { paymentDate: "desc" }, take: 30 }),
    prisma.expense.findMany({ include: { category: true, job: true }, orderBy: { expenseDate: "desc" }, take: 30 }),
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.expense.aggregate({ _sum: { total: true } }),
    prisma.invoice.aggregate({ _sum: { vat: true } }),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: { in: ["ACCEPTED", "CONVERTED"] } } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
  ]);
  const revenueValue = Number(revenue._sum.amount || 0);
  const expenseValue = Number(expenseTotal._sum.total || 0);
  const outstanding = invoices.reduce((sum, invoice) => sum + Number(invoice.amountOutstanding), 0);
  const overdue = invoices.filter((invoice) => invoice.dueDate && invoice.dueDate < new Date() && Number(invoice.amountOutstanding) > 0).length;
  const pendingBank = payments.filter((payment) => payment.method === "Bank transfer" && payment.status === "PENDING").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const quoteConversion = quoteTotal ? Math.round((acceptedQuotes / quoteTotal) * 100) : 0;
  const jobProfit = completedJobs ? (revenueValue - expenseValue) / completedJobs : 0;
  const paymentMethods = payments.reduce<Record<string, number>>((summary, payment) => {
    summary[payment.method] = (summary[payment.method] || 0) + Number(payment.amount);
    return summary;
  }, {});
  return (
    <AdminShell title="Finance" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Revenue" value={`£${revenueValue.toFixed(2)}`} note="Payments received." />
        <MetricCard label="Expenses" value={`£${expenseValue.toFixed(2)}`} />
        <MetricCard label="Estimated profit" value={`£${(revenueValue - expenseValue).toFixed(2)}`} />
        <MetricCard label="Outstanding invoices" value={`£${outstanding.toFixed(2)}`} />
        <MetricCard label="Overdue invoices" value={String(overdue)} />
        <MetricCard label="Average job value" value={`£${(invoices.length ? invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0) / invoices.length : 0).toFixed(2)}`} />
        <MetricCard label="Pending bank transfers" value={`£${pendingBank.toFixed(2)}`} />
        <MetricCard label="VAT on invoices" value={`£${Number(vatSummary._sum.vat || 0).toFixed(2)}`} />
        <MetricCard label="Quote conversion" value={`${quoteConversion}%`} />
        <MetricCard label="Profit / completed job" value={`£${jobProfit.toFixed(2)}`} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="grid gap-5">
          <section className="card p-5">
            <h3 className="text-xl font-black">Invoices</h3>
            <DataTable headers={["Invoice", "Customer", "Status", "Total", "Outstanding", "Payment"]}>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/finance/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link><br /><span className="text-slate-500">{invoice.issueDate.toLocaleDateString("en-GB")}</span></Td>
                  <Td>{invoice.customer?.name || "No customer"}</Td>
                  <Td><span className="status-pill bg-amber-50 text-amber-800">{invoice.status}</span></Td>
                  <Td>£{Number(invoice.total).toFixed(2)}</Td>
                  <Td>£{Number(invoice.amountOutstanding).toFixed(2)}</Td>
                  <Td>
                    <form action={recordPayment} className="grid gap-2">
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <input className="field" name="amount" type="number" step="0.01" placeholder="Amount" />
                      <select className="field" name="method"><option>Bank transfer</option><option>Cash</option><option>Card</option><option>Deposit</option><option>Cheque</option><option>Other</option></select>
                      <button className="btn-primary" type="submit">Record</button>
                    </form>
                  </Td>
                </tr>
              ))}
            </DataTable>
          </section>
          <section className="card p-5">
            <h3 className="text-xl font-black">Payments</h3>
            <div className="my-3 grid gap-2 text-sm md:grid-cols-3">
              {Object.entries(paymentMethods).map(([method, amount]) => <div className="rounded-lg bg-slate-50 p-3" key={method}><b>{method}</b><br />£{amount.toFixed(2)}</div>)}
            </div>
            <DataTable headers={["Reference", "Customer", "Method", "Amount", "Date"]}>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/finance/payments/${payment.id}`}>{payment.paymentReference}</Link></Td>
                  <Td>{payment.customer?.name || "-"}</Td>
                  <Td>{payment.method} · {payment.status}</Td>
                  <Td>£{Number(payment.amount).toFixed(2)}</Td>
                  <Td>
                    {payment.paymentDate.toLocaleDateString("en-GB")}
                    {payment.method === "Bank transfer" && payment.status === "PENDING" ? (
                      <form action={markBankPaymentReceived} className="mt-2 grid gap-2">
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <input className="field" name="transactionReference" placeholder="Bank reference" />
                        <button className="btn-primary" type="submit">Mark received</button>
                      </form>
                    ) : null}
                  </Td>
                </tr>
              ))}
            </DataTable>
          </section>
        </section>
        <div className="grid gap-5">
          <AdminForm title="Record expense">
            <form action={createExpense} className="grid gap-3">
              <select className="field" name="categoryId" defaultValue="">
                <option value="">Category</option>
                {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
              <input className="field" name="supplier" placeholder="Supplier" />
              <input className="field" name="description" placeholder="Description" />
              <input className="field" name="amount" type="number" step="0.01" placeholder="Amount" />
              <input className="field" name="vat" type="number" step="0.01" placeholder="VAT" />
              <input className="field" name="expenseDate" type="date" />
              <select className="field" name="paymentMethod"><option>Card</option><option>Cash</option><option>Bank transfer</option><option>Other</option></select>
              <label><input name="approved" type="checkbox" /> Approved</label>
              <button className="btn-primary" type="submit">Save expense</button>
            </form>
          </AdminForm>
          <section className="card p-5">
            <h3 className="text-xl font-black">Recent expenses</h3>
            <div className="mt-3 grid gap-2">
              {expenses.map((expense) => <Link className="rounded-lg bg-slate-50 p-3 text-sm" href={`/admin/finance/expenses/${expense.id}`} key={expense.id}><b>{expense.expenseNumber}</b> {expense.description}<br />£{Number(expense.total).toFixed(2)} · {expense.category?.name || "Uncategorised"}</Link>)}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
