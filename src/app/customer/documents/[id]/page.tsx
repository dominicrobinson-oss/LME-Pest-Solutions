import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { requireCustomerOwnership } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CustomerDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id }, include: { customer: true, job: true, invoice: true, quote: true } });
  if (!document || !document.customerId) notFound();
  const user = await requireCustomerOwnership(document.customerId);

  return (
    <AdminShell title={document.title} userName={user.name || user.email}>
      <section className="card p-5">
        <h3 className="text-xl font-black">Protected document</h3>
        <p className="mt-2 text-sm text-slate-600">This page is customer-scoped. The download URL is produced through the storage provider interface.</p>
        <div className="mt-4">
          <a className="btn-primary" href={`/api/documents/${document.id}`}>Open protected download</a>
        </div>
        <div className="mt-5">
          <DataTable headers={["Field", "Value"]}>
            <tr><Td>Category</Td><Td>{document.category}</Td></tr>
            <tr><Td>Version</Td><Td>{document.version}</Td></tr>
            <tr><Td>Created</Td><Td>{document.createdAt.toLocaleString("en-GB")}</Td></tr>
            <tr><Td>Expires</Td><Td>{document.expiryDate?.toLocaleDateString("en-GB") || "-"}</Td></tr>
            <tr><Td>Related job</Td><Td>{document.job?.jobNumber || "-"}</Td></tr>
            <tr><Td>Related invoice</Td><Td>{document.invoice?.invoiceNumber || "-"}</Td></tr>
            <tr><Td>Notes</Td><Td>{document.notes || "-"}</Td></tr>
          </DataTable>
        </div>
      </section>
    </AdminShell>
  );
}
