import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createCustomer } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomersAdminPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const q = (await searchParams)?.q?.trim();
  const customers = await prisma.customer.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { companyName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { customerNumber: { contains: q, mode: "insensitive" } }] } : {},
    include: { properties: true, invoices: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <AdminShell title="Customer CRM" userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section>
          <form className="mb-4 flex gap-3">
            <input className="field max-w-md" name="q" defaultValue={q} placeholder="Search customers" />
            <button className="btn-primary" type="submit">Search</button>
          </form>
          <DataTable headers={["Customer", "Type", "Properties", "Balance", "Actions"]}>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <Td><Link className="font-black text-[var(--primary-green)]" href={`/admin/customers/${customer.id}`}>{customer.customerNumber}</Link><br />{customer.name}<br /><span className="text-slate-500">{customer.email} {customer.phone}</span></Td>
                <Td>{customer.customerType}</Td>
                <Td>{customer.properties.length}</Td>
                <Td>£{Number(customer.accountBalance).toFixed(2)}</Td>
                <Td><Link className="btn-primary" href={`/admin/customers/${customer.id}`}>Open</Link></Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Create customer">
          <form action={createCustomer} className="grid gap-3">
            <input className="field" name="name" placeholder="Name" />
            <input className="field" name="companyName" placeholder="Company name" />
            <input className="field" name="email" placeholder="Email" />
            <input className="field" name="phone" placeholder="Phone" />
            <input className="field" name="billingAddress" placeholder="Billing address" />
            <select className="field" name="customerType" defaultValue="Residential">
              {["Residential","Landlord","Letting agent","Business","Restaurant","Retail","Office","Warehouse","School","Care facility","Other commercial"].map((type) => <option key={type}>{type}</option>)}
            </select>
            <input className="field" name="tags" placeholder="Tags, comma separated" />
            <label className="flex gap-2 text-sm"><input name="marketingConsent" type="checkbox" /> Marketing consent</label>
            <button className="btn-primary" type="submit">Create</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}
