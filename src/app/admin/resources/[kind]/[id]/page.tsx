import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ResourceDetailPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const user = await requireAnyRole(adminRoles);
  const { kind, id } = await params;
  const resource = await loadResource(kind, id);
  if (!resource) notFound();

  return (
    <AdminShell title={resource.title} userName={user.name || user.email}>
      <section className="card p-5">
        <h3 className="text-xl font-black">Record details</h3>
        <DataTable headers={["Field", "Value"]}>
          {resource.rows.map(([label, value]) => <tr key={label}><Td>{label}</Td><Td>{value || "-"}</Td></tr>)}
        </DataTable>
      </section>
    </AdminShell>
  );
}

async function loadResource(kind: string, id: string) {
  if (kind === "staff") {
    const item = await prisma.staffProfile.findUnique({ where: { id }, include: { user: true, vehicle: true } });
    if (!item) return null;
    return { title: `Staff: ${item.user.name || item.user.email}`, rows: [["Email", item.user.email], ["Role", item.user.role], ["Phone", item.phone], ["Status", item.employmentStatus], ["Vehicle", item.vehicle?.registration], ["Skills", item.skills.join(", ")], ["Qualifications", item.qualifications.join(", ")], ["Notes", item.notes]] };
  }
  if (kind === "vehicles") {
    const item = await prisma.vehicle.findUnique({ where: { id } });
    if (!item) return null;
    return { title: `Vehicle: ${item.registration}`, rows: [["Make", item.make], ["Model", item.model], ["Year", item.year?.toString()], ["Mileage", item.mileage?.toString()], ["MOT", item.motDate?.toLocaleDateString("en-GB")], ["Tax", item.taxDate?.toLocaleDateString("en-GB")], ["Insurance", item.insuranceExpiry?.toLocaleDateString("en-GB")], ["Service", item.serviceDueDate?.toLocaleDateString("en-GB")], ["Notes", item.notes]] };
  }
  if (kind === "equipment") {
    const item = await prisma.equipment.findUnique({ where: { id } });
    if (!item) return null;
    return { title: `Equipment: ${item.equipmentName}`, rows: [["Serial", item.serialNumber], ["Condition", item.condition], ["Inspection", item.inspectionDate?.toLocaleDateString("en-GB")], ["Next inspection", item.nextInspection?.toLocaleDateString("en-GB")], ["Notes", item.notes]] };
  }
  if (kind === "suppliers") {
    const item = await prisma.supplier.findUnique({ where: { id }, include: { products: true } });
    if (!item) return null;
    return { title: `Supplier: ${item.name}`, rows: [["Email", item.email], ["Phone", item.phone], ["Products", item.products.map((product) => product.productName).join(", ")], ["Notes", item.notes]] };
  }
  if (kind === "products") {
    const item = await prisma.product.findUnique({ where: { id }, include: { supplier: true, movements: true } });
    if (!item) return null;
    return { title: `Product: ${item.productName}`, rows: [["Code", item.productCode], ["Category", item.category], ["Supplier", item.supplier?.name], ["Cost", `£${Number(item.costPrice).toFixed(2)}`], ["Sale price", `£${Number(item.defaultSalePrice).toFixed(2)}`], ["Stock", `${Number(item.currentStock).toFixed(2)} ${item.unit}`], ["Reorder", `${Number(item.reorderLevel).toFixed(2)} ${item.unit}`], ["SDS", item.safetyDataSheet], ["Movements", item.movements.length.toString()]] };
  }
  return null;
}
