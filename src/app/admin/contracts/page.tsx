import Link from "next/link";
import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createCommercialContract } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ContractsAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const [contracts, customers, managers] = await Promise.all([
    prisma.commercialContract.findMany({ include: { customer: true, sites: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, take: 100 }),
    prisma.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "SALES"] } }, orderBy: { email: "asc" } }),
  ]);
  const active = contracts.filter((contract) => contract.status === "ACTIVE").length;
  const renewalWindowEnd = new Date();
  renewalWindowEnd.setDate(renewalWindowEnd.getDate() + 60);
  const renewalSoon = contracts.filter((contract) => contract.renewalDate && contract.renewalDate <= renewalWindowEnd).length;

  return (
    <AdminShell title="Commercial Contracts" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Contracts" value={String(contracts.length)} />
        <MetricCard label="Active" value={String(active)} />
        <MetricCard label="Renewal due soon" value={String(renewalSoon)} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Contract register</h3>
          <DataTable headers={["Contract", "Customer", "Status", "Frequency", "Renewal", "Sites"]}>
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <Td><Link className="font-black text-[var(--primary-green)]" href={`/admin/contracts/${contract.id}`}>{contract.contractNumber}</Link></Td>
                <Td>{contract.customer.name}</Td>
                <Td><span className="status-pill bg-lime-50 text-lime-800">{contract.status}</span></Td>
                <Td>{contract.serviceFrequency || "-"}</Td>
                <Td>{contract.renewalDate?.toLocaleDateString("en-GB") || "-"}</Td>
                <Td>{contract.sites.length}</Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Create contract">
          <form action={createCommercialContract} className="grid gap-3">
            <select className="field" name="customerId" defaultValue=""><option value="">Customer</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select>
            <select className="field" name="status" defaultValue="DRAFT"><option>DRAFT</option><option>ACTIVE</option><option>PAUSED</option><option>EXPIRED</option><option>CANCELLED</option></select>
            <input className="field" name="contractValue" type="number" step="0.01" placeholder="Contract value" />
            <input className="field" name="serviceFrequency" placeholder="Visit frequency, e.g. Monthly" />
            <input className="field" name="startDate" type="date" />
            <input className="field" name="endDate" type="date" />
            <input className="field" name="renewalDate" type="date" />
            <select className="field" name="accountManagerId" defaultValue=""><option value="">Account manager</option>{managers.map((manager) => <option value={manager.id} key={manager.id}>{manager.name || manager.email}</option>)}</select>
            <textarea className="field" name="includedServices" placeholder="Included services" />
            <textarea className="field" name="excludedServices" placeholder="Excluded services" />
            <input className="field" name="siteName" placeholder="Initial site name" />
            <textarea className="field" name="riskAssessment" placeholder="Site risk assessment" />
            <textarea className="field" name="recommendations" placeholder="Site recommendations" />
            <button className="btn-primary" type="submit">Create contract</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}
