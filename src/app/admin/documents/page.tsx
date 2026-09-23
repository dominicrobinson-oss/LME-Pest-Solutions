import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createDocumentStub } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function DocumentsAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const expiryWindowEnd = new Date();
  expiryWindowEnd.setDate(expiryWindowEnd.getDate() + 30);
  const [documents, customers, jobs, expiring] = await Promise.all([
    prisma.document.findMany({ include: { customer: true, job: true, uploadedBy: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, take: 100 }),
    prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.document.count({ where: { expiryDate: { lte: expiryWindowEnd } } }),
  ]);

  return (
    <AdminShell title="Documents" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Documents" value={String(documents.length)} />
        <MetricCard label="Expiring in 30 days" value={String(expiring)} />
        <MetricCard label="Protected mode" value="Ownership checked" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Document register</h3>
          <DataTable headers={["Title", "Category", "Linked record", "Expiry", "URL"]}>
            {documents.map((document) => (
              <tr key={document.id}>
                <Td>{document.title}<br /><span className="text-slate-500">v{document.version} · {document.uploadedBy?.email || "system"}</span></Td>
                <Td>{document.category}</Td>
                <Td>{document.customer?.name || document.job?.jobNumber || "-"}</Td>
                <Td>{document.expiryDate?.toLocaleDateString("en-GB") || "-"}</Td>
                <Td><a className="font-bold text-[var(--primary-gold)]" href={`/api/documents/${document.id}`}>Protected link</a></Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Create protected document record">
          <form action={createDocumentStub} className="grid gap-3">
            <input className="field" name="title" placeholder="Document title" />
            <select className="field" name="category"><option>Treatment report</option><option>Invoice</option><option>Quote</option><option>SDS</option><option>Insurance</option><option>Certificate</option><option>Other</option></select>
            <select className="field" name="customerId" defaultValue=""><option value="">No customer</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select>
            <select className="field" name="jobId" defaultValue=""><option value="">No job</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.jobNumber} · {job.pestType}</option>)}</select>
            <input className="field" name="expiryDate" type="date" />
            <input className="field" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,text/plain" />
            <textarea className="field" name="notes" placeholder="Document notes or fallback stub content" />
            <button className="btn-primary" type="submit">Save document</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}
