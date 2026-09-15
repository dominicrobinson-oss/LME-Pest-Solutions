import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { generateOperationalReminders } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function RemindersAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const now = new Date();
  const next30 = new Date(now);
  next30.setDate(now.getDate() + 30);
  const [quotes, invoices, contracts, followUps, vehicles, equipment, notifications] = await Promise.all([
    prisma.quote.findMany({ where: { status: { in: ["SENT", "VIEWED"] }, expiresAt: { lte: next30 } }, orderBy: { expiresAt: "asc" }, take: 30 }),
    prisma.invoice.findMany({ where: { amountOutstanding: { gt: 0 }, OR: [{ dueDate: { lte: next30 } }, { dueDate: null }] }, include: { customer: true }, orderBy: { dueDate: "asc" }, take: 30 }),
    prisma.commercialContract.findMany({ where: { renewalDate: { lte: next30 } }, include: { customer: true }, orderBy: { renewalDate: "asc" }, take: 30 }),
    prisma.job.findMany({ where: { followUpRequired: true, followUpDate: { lte: next30 } }, include: { customer: true }, orderBy: { followUpDate: "asc" }, take: 30 }),
    prisma.vehicle.findMany({ where: { OR: [{ motDate: { lte: next30 } }, { taxDate: { lte: next30 } }, { insuranceExpiry: { lte: next30 } }, { serviceDueDate: { lte: next30 } }] }, orderBy: { registration: "asc" }, take: 30 }),
    prisma.equipment.findMany({ where: { nextInspection: { lte: next30 } }, orderBy: { nextInspection: "asc" }, take: 30 }),
    prisma.notification.findMany({ where: { readAt: null, type: { contains: "REMINDER" } }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  const overdueInvoices = invoices.filter((invoice) => invoice.dueDate && invoice.dueDate < now);

  return (
    <AdminShell title="Reminders" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Quote follow-ups" value={String(quotes.length)} />
        <MetricCard label="Invoices due" value={String(invoices.length)} />
        <MetricCard label="Overdue invoices" value={String(overdueInvoices.length)} />
        <MetricCard label="Contract renewals" value={String(contracts.length)} />
        <MetricCard label="Job follow-ups" value={String(followUps.length)} />
        <MetricCard label="Asset dates" value={String(vehicles.length + equipment.length)} />
      </div>
      <form action={generateOperationalReminders} className="mt-5 rounded-lg bg-white p-4 shadow-sm">
        <button className="btn-primary" type="submit">Generate reminder notifications</button>
      </form>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <h3 className="text-xl font-black">Customer and finance reminders</h3>
          <DataTable headers={["Type", "Reference", "Customer", "Due"]}>
            {quotes.map((quote) => <tr key={quote.id}><Td>Quote</Td><Td>{quote.quoteNumber}</Td><Td>{quote.title}</Td><Td>{quote.expiresAt?.toLocaleDateString("en-GB") || "-"}</Td></tr>)}
            {invoices.map((invoice) => <tr key={invoice.id}><Td>{invoice.dueDate && invoice.dueDate < now ? "Overdue invoice" : "Invoice"}</Td><Td>{invoice.invoiceNumber}</Td><Td>{invoice.customer?.name || "-"}</Td><Td>{invoice.dueDate?.toLocaleDateString("en-GB") || "No due date"}</Td></tr>)}
            {contracts.map((contract) => <tr key={contract.id}><Td>Contract</Td><Td>{contract.contractNumber}</Td><Td>{contract.customer.name}</Td><Td>{contract.renewalDate?.toLocaleDateString("en-GB") || "-"}</Td></tr>)}
          </DataTable>
        </section>
        <section className="card p-5">
          <h3 className="text-xl font-black">Operations reminders</h3>
          <DataTable headers={["Type", "Reference", "Detail", "Due"]}>
            {followUps.map((job) => <tr key={job.id}><Td>Follow-up</Td><Td>{job.jobNumber}</Td><Td>{job.customer?.name || "-"}</Td><Td>{job.followUpDate?.toLocaleDateString("en-GB") || "-"}</Td></tr>)}
            {vehicles.map((vehicle) => <tr key={vehicle.id}><Td>Vehicle</Td><Td>{vehicle.registration}</Td><Td>MOT/tax/insurance/service</Td><Td>{[vehicle.motDate, vehicle.taxDate, vehicle.insuranceExpiry, vehicle.serviceDueDate].filter(Boolean).sort((a, b) => a!.getTime() - b!.getTime())[0]?.toLocaleDateString("en-GB") || "-"}</Td></tr>)}
            {equipment.map((item) => <tr key={item.id}><Td>Equipment</Td><Td>{item.equipmentName}</Td><Td>{item.condition || "-"}</Td><Td>{item.nextInspection?.toLocaleDateString("en-GB") || "-"}</Td></tr>)}
          </DataTable>
        </section>
        <section className="card p-5 xl:col-span-2">
          <h3 className="text-xl font-black">Generated notifications</h3>
          <DataTable headers={["Type", "Title", "Detail", "Created"]}>
            {notifications.map((notification) => <tr key={notification.id}><Td>{notification.type}</Td><Td>{notification.title}</Td><Td>{notification.body || "-"}</Td><Td>{notification.createdAt.toLocaleString("en-GB")}</Td></tr>)}
          </DataTable>
        </section>
      </div>
    </AdminShell>
  );
}
