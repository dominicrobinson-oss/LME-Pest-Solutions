import { notFound } from "next/navigation";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { bulkCreateContractInvoices, bulkCreateContractVisits, createContractInvoice, createContractVisit } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { id } = await params;
  const contract = await prisma.commercialContract.findUnique({
    where: { id },
    include: { customer: { include: { properties: true, jobs: true } }, sites: true, invoices: true },
  });
  if (!contract) notFound();
  const revenue = contract.invoices.reduce((sum, invoice) => sum + Number(invoice.amountPaid), 0);
  const accountManager = contract.accountManagerId
    ? await prisma.user.findUnique({ where: { id: contract.accountManagerId } })
    : null;
  const visitIntervalWeeks = contract.visitIntervalWeeks || 4;
  const visitDurationMinutes = contract.visitDurationMinutes || 60;
  const invoiceIntervalMonths = contract.invoiceIntervalMonths || 1;
  const lastVisit = await prisma.job.findFirst({ where: { recurringJobRef: contract.contractNumber }, orderBy: { scheduledStart: "desc" } });
  const nextVisitDue = lastVisit?.scheduledStart
    ? new Date(lastVisit.scheduledStart.getTime() + visitIntervalWeeks * 7 * 86_400_000)
    : contract.startDate;
  const lastInvoice = contract.invoices.filter((invoice) => invoice.dueDate).sort((a, b) => b.dueDate!.getTime() - a.dueDate!.getTime())[0];
  const nextInvoiceDue = lastInvoice?.dueDate
    ? (() => {
        const next = new Date(lastInvoice.dueDate!);
        next.setMonth(next.getMonth() + invoiceIntervalMonths);
        return next;
      })()
    : contract.startDate;

  return (
    <AdminShell title={`Contract ${contract.contractNumber}`} userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Status" value={contract.status} />
        <MetricCard label="Value" value={`£${Number(contract.contractValue).toFixed(2)}`} />
        <MetricCard label="Sites" value={String(contract.sites.length)} />
        <MetricCard label="Received" value={`£${revenue.toFixed(2)}`} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <h3 className="text-xl font-black">Contract details</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <Row label="Customer" value={contract.customer.name} />
            <Row label="Account manager" value={accountManager?.name || accountManager?.email || "-"} />
            <Row label="Start" value={contract.startDate?.toLocaleDateString("en-GB") || "-"} />
            <Row label="End" value={contract.endDate?.toLocaleDateString("en-GB") || "-"} />
            <Row label="Renewal" value={contract.renewalDate?.toLocaleDateString("en-GB") || "-"} />
            <Row label="Frequency" value={contract.serviceFrequency || "-"} />
            <Row label="Included" value={contract.includedServices || "-"} />
            <Row label="Excluded" value={contract.excludedServices || "-"} />
            <Row label="Visit recurrence" value={`Every ${visitIntervalWeeks} week(s), ${visitDurationMinutes} min`} />
            <Row label="Invoice recurrence" value={`Every ${invoiceIntervalMonths} month(s)`} />
            <Row label="Next visit due" value={nextVisitDue?.toLocaleDateString("en-GB") || "Not set"} />
            <Row label="Next invoice due" value={nextInvoiceDue?.toLocaleDateString("en-GB") || "Not set"} />
          </dl>
        </section>
        <section className="card p-5">
          <h3 className="text-xl font-black">Sites</h3>
          <DataTable headers={["Site", "Risk", "Recommendations"]}>
            {contract.sites.map((site) => (
              <tr key={site.id}>
                <Td>{site.siteName}</Td>
                <Td>{site.riskAssessment || "-"}</Td>
                <Td>{site.recommendations || "-"}</Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <section className="card p-5 xl:col-span-2">
          <h3 className="text-xl font-black">Customer jobs and contract invoices</h3>
          <DataTable headers={["Type", "Reference", "Status", "Date/Amount"]}>
            {contract.customer.jobs.slice(0, 20).map((job) => (
              <tr key={job.id}><Td>Job</Td><Td>{job.jobNumber}</Td><Td>{job.status}</Td><Td>{job.scheduledStart?.toLocaleString("en-GB") || "Unscheduled"}</Td></tr>
            ))}
            {contract.invoices.slice(0, 20).map((invoice) => (
              <tr key={invoice.id}><Td>Invoice</Td><Td>{invoice.invoiceNumber}</Td><Td>{invoice.status}</Td><Td>£{Number(invoice.total).toFixed(2)}</Td></tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Create recurring visit">
          <form action={createContractVisit} className="grid gap-3">
            <input type="hidden" name="contractId" value={contract.id} />
            <input className="field" name="pestType" placeholder="Service / pest type" defaultValue="Commercial Pest Control" />
            <input className="field" name="scheduledStart" type="datetime-local" />
            <input className="field" name="scheduledEnd" type="datetime-local" />
            <select className="field" name="priority" defaultValue="Normal"><option>Normal</option><option>High</option><option>Emergency</option></select>
            <textarea className="field" name="description" placeholder="Visit notes" defaultValue={contract.includedServices || ""} />
            <button className="btn-primary" type="submit">Create visit job</button>
          </form>
        </AdminForm>
        <AdminForm title="Create recurring invoice">
          <form action={createContractInvoice} className="grid gap-3">
            <input type="hidden" name="contractId" value={contract.id} />
            <input className="field" name="amount" type="number" step="0.01" defaultValue={Number(contract.contractValue).toFixed(2)} />
            <input className="field" name="dueDate" type="date" />
            <input className="field" name="description" placeholder="Invoice line description" defaultValue={`Contract service ${contract.contractNumber}`} />
            <textarea className="field" name="paymentTerms" placeholder="Payment terms" defaultValue="Payment by bank transfer using the invoice reference." />
            <button className="btn-primary" type="submit">Create invoice</button>
          </form>
        </AdminForm>
        <AdminForm title="Bulk generate visits">
          <form action={bulkCreateContractVisits} className="grid gap-3">
            <input type="hidden" name="contractId" value={contract.id} />
            <p className="text-xs text-slate-500">Leave &quot;First visit&quot; blank to continue automatically after the last generated visit ({nextVisitDue?.toLocaleDateString("en-GB") || "not set"}). Generation stops at the contract end date if one is set.</p>
            <input className="field" name="pestType" placeholder="Service / pest type" defaultValue="Commercial Pest Control" />
            <input className="field" name="firstStart" type="datetime-local" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="field" name="count" type="number" min="1" max="52" defaultValue="6" />
              <input className="field" name="intervalWeeks" type="number" min="1" max="52" defaultValue={visitIntervalWeeks} />
              <input className="field" name="durationMinutes" type="number" min="15" max="480" step="15" defaultValue={visitDurationMinutes} />
            </div>
            <select className="field" name="priority" defaultValue="Normal"><option>Normal</option><option>High</option><option>Emergency</option></select>
            <textarea className="field" name="description" placeholder="Visit notes" defaultValue={contract.includedServices || ""} />
            <button className="btn-primary" type="submit">Create visit batch</button>
          </form>
        </AdminForm>
        <AdminForm title="Bulk generate invoices">
          <form action={bulkCreateContractInvoices} className="grid gap-3">
            <input type="hidden" name="contractId" value={contract.id} />
            <p className="text-xs text-slate-500">Leave &quot;First due date&quot; blank to continue automatically after the last generated invoice ({nextInvoiceDue?.toLocaleDateString("en-GB") || "not set"}). Generation stops at the contract end date if one is set.</p>
            <input className="field" name="amount" type="number" step="0.01" defaultValue={Number(contract.contractValue).toFixed(2)} />
            <input className="field" name="firstDueDate" type="date" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" name="count" type="number" min="1" max="24" defaultValue="3" />
              <input className="field" name="intervalMonths" type="number" min="1" max="12" defaultValue={invoiceIntervalMonths} />
            </div>
            <input className="field" name="description" placeholder="Invoice line description" defaultValue={`Contract service ${contract.contractNumber}`} />
            <textarea className="field" name="paymentTerms" placeholder="Payment terms" defaultValue="Payment by bank transfer using the invoice reference." />
            <button className="btn-primary" type="submit">Create invoice batch</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="font-black text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
