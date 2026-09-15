import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { createCustomerMessage } from "@/app/admin/actions";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CustomerMessagesPage() {
  const user = await requireUser();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES"].includes(user.role);
  const customer = isAdmin
    ? await prisma.customer.findFirst({ include: { communications: { orderBy: { createdAt: "desc" }, take: 50 } } })
    : await prisma.customer.findFirst({ where: { userId: user.id }, include: { communications: { orderBy: { createdAt: "desc" }, take: 50 } } });
  if (!customer) notFound();

  return (
    <AdminShell title="Messages" userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Message history</h3>
          <DataTable headers={["Date", "Subject", "Message", "Status"]}>
            {customer.communications.map((message) => (
              <tr key={message.id}>
                <Td>{message.createdAt.toLocaleString("en-GB")}</Td>
                <Td>{message.subject || message.type}</Td>
                <Td>{message.body}</Td>
                <Td>{message.status}</Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <section className="card p-5">
          <h3 className="text-xl font-black">Send message</h3>
          <form action={createCustomerMessage} className="mt-4 grid gap-3">
            <input type="hidden" name="customerId" value={customer.id} />
            <select className="field" name="type"><option>Customer message</option><option>Question</option><option>Complaint</option><option>Follow-up request</option></select>
            <input className="field" name="subject" placeholder="Subject" />
            <textarea className="field min-h-36" name="body" placeholder="Message" />
            <button className="btn-primary" type="submit">Send message</button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
