import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { updateCustomerProfile } from "@/app/admin/actions";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CustomerProfilePage() {
  const user = await requireUser();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES"].includes(user.role);
  const customer = isAdmin ? await prisma.customer.findFirst() : await prisma.customer.findFirst({ where: { userId: user.id } });
  if (!customer) notFound();

  return (
    <AdminShell title="Customer Profile" userName={user.name || user.email}>
      <section className="card max-w-3xl p-5">
        <h3 className="text-xl font-black">Account details</h3>
        <form action={updateCustomerProfile} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="customerId" value={customer.id} />
          <input className="field" name="name" defaultValue={customer.name} placeholder="Name" />
          <input className="field" name="email" defaultValue={customer.email || ""} placeholder="Email" />
          <input className="field" name="phone" defaultValue={customer.phone || ""} placeholder="Phone" />
          <label className="flex items-center gap-2 text-sm font-bold"><input name="marketingConsent" type="checkbox" defaultChecked={customer.marketingConsent} /> Marketing consent</label>
          <textarea className="field md:col-span-2" name="notes" defaultValue={customer.notes || ""} placeholder="Account notes or preferences" />
          <button className="btn-primary md:col-span-2" type="submit">Save profile</button>
        </form>
      </section>
    </AdminShell>
  );
}
