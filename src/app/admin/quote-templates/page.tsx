import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createQuoteTemplate } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function QuoteTemplatesPage() {
  const user = await requireAnyRole(adminRoles);
  const templates = await prisma.quoteTemplate.findMany({ orderBy: { updatedAt: "desc" }, take: 80 });

  return (
    <AdminShell title="Quote Templates" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Templates" value={String(templates.length)} />
        <MetricCard label="Published" value={String(templates.filter((template) => template.status === "PUBLISHED").length)} />
        <MetricCard label="Drafts" value={String(templates.filter((template) => template.status === "DRAFT").length)} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Template library</h3>
          <DataTable headers={["Name", "Pest", "Status", "Items"]}>
            {templates.map((template) => (
              <tr key={template.id}>
                <Td>{template.name}<br /><span className="text-slate-500">{template.description || "No description"}</span></Td>
                <Td>{template.pestType || "-"}</Td>
                <Td>{template.status}</Td>
                <Td><pre className="max-w-md whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs">{JSON.stringify(template.items, null, 2)}</pre></Td>
              </tr>
            ))}
          </DataTable>
        </section>
        <AdminForm title="Create template">
          <form action={createQuoteTemplate} className="grid gap-3">
            <input className="field" name="name" placeholder="Template name" />
            <input className="field" name="pestType" placeholder="Pest type" />
            <textarea className="field" name="description" placeholder="Description" />
            <input className="field" name="lineDescription" placeholder="Default line description" />
            <input className="field" name="quantity" type="number" step="0.01" placeholder="Quantity" />
            <input className="field" name="unitPrice" type="number" step="0.01" placeholder="Unit price" />
            <input className="field" name="labour" type="number" step="0.01" placeholder="Labour" />
            <input className="field" name="materials" type="number" step="0.01" placeholder="Materials" />
            <input className="field" name="vat" type="number" step="0.01" placeholder="VAT" />
            <textarea className="field" name="terms" placeholder="Default terms" />
            <select className="field" name="status" defaultValue="PUBLISHED"><option>PUBLISHED</option><option>DRAFT</option><option>ARCHIVED</option></select>
            <button className="btn-primary" type="submit">Create template</button>
          </form>
        </AdminForm>
      </div>
    </AdminShell>
  );
}
