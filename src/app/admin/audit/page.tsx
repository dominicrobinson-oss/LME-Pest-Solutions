import { AdminShell, MetricCard } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AuditAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const [logs, mutationCount, documentCount] = await Promise.all([
    prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.auditLog.count({ where: { action: { contains: "CREATED" } } }),
    prisma.auditLog.count({ where: { entity: "Document" } }),
  ]);

  return (
    <AdminShell title="Audit Log" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Audit entries" value={String(logs.length)} />
        <MetricCard label="Create events" value={String(mutationCount)} />
        <MetricCard label="Document events" value={String(documentCount)} />
      </div>
      <section className="mt-5 card p-5">
        <h3 className="text-xl font-black">Immutable activity trail</h3>
        <DataTable headers={["When", "User", "Action", "Entity", "Metadata"]}>
          {logs.map((log) => (
            <tr key={log.id}>
              <Td>{log.createdAt.toLocaleString("en-GB")}</Td>
              <Td>{log.user?.email || "system"}</Td>
              <Td>{log.action}</Td>
              <Td>{log.entity}<br /><span className="text-slate-500">{log.entityId || "-"}</span></Td>
              <Td><pre className="max-w-md whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs">{JSON.stringify(log.metadata || log.newValue || {}, null, 2)}</pre></Td>
            </tr>
          ))}
        </DataTable>
      </section>
    </AdminShell>
  );
}
