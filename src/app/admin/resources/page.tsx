import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { createEquipment, createProduct, createSupplier, createVehicle } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ResourcesAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const [staff, vehicles, equipment, suppliers, products] = await Promise.all([
    prisma.staffProfile.findMany({ include: { user: true, vehicle: true }, orderBy: { user: { email: "asc" } }, take: 50 }),
    prisma.vehicle.findMany({ orderBy: { registration: "asc" }, take: 50 }),
    prisma.equipment.findMany({ orderBy: { equipmentName: "asc" }, take: 50 }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, take: 50 }),
    prisma.product.findMany({ include: { supplier: true }, orderBy: { productName: "asc" }, take: 80 }),
  ]);

  return (
    <AdminShell title="Resources" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Staff" value={String(staff.length)} />
        <MetricCard label="Vehicles" value={String(vehicles.length)} />
        <MetricCard label="Equipment" value={String(equipment.length)} />
        <MetricCard label="Suppliers" value={String(suppliers.length)} />
        <MetricCard label="Products" value={String(products.length)} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="grid gap-5">
          <section className="card p-5">
            <h3 className="text-xl font-black">Staff</h3>
            <DataTable headers={["Name", "Role", "Phone", "Vehicle", "Skills"]}>
              {staff.map((member) => (
                <tr key={member.id}>
                  <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/resources/staff/${member.id}`}>{member.user.name || member.user.email}</Link></Td>
                  <Td>{member.user.role}</Td>
                  <Td>{member.phone || "-"}</Td>
                  <Td>{member.vehicle?.registration || "-"}</Td>
                  <Td>{member.skills.join(", ") || "-"}</Td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="card p-5">
            <h3 className="text-xl font-black">Vehicles</h3>
            <DataTable headers={["Registration", "Vehicle", "Mileage", "MOT", "Service"]}>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/resources/vehicles/${vehicle.id}`}>{vehicle.registration}</Link></Td>
                  <Td>{vehicle.make} {vehicle.model}</Td>
                  <Td>{vehicle.mileage || "-"}</Td>
                  <Td>{vehicle.motDate?.toLocaleDateString("en-GB") || "-"}</Td>
                  <Td>{vehicle.serviceDueDate?.toLocaleDateString("en-GB") || "-"}</Td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="card p-5">
            <h3 className="text-xl font-black">Inventory</h3>
            <DataTable headers={["Product", "Category", "Supplier", "Stock", "Reorder"]}>
              {products.map((product) => (
                <tr key={product.id}>
                  <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/resources/products/${product.id}`}>{product.productName}</Link><br /><span className="text-slate-500">{product.productCode || "No code"}</span></Td>
                  <Td>{product.category}</Td>
                  <Td>{product.supplier?.name || "-"}</Td>
                  <Td>{Number(product.currentStock).toFixed(2)} {product.unit}</Td>
                  <Td>{Number(product.reorderLevel).toFixed(2)} {product.unit}</Td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="card p-5">
            <h3 className="text-xl font-black">Equipment</h3>
            <DataTable headers={["Name", "Serial", "Condition", "Next inspection"]}>
              {equipment.map((item) => (
                <tr key={item.id}>
                  <Td><Link className="font-black text-[var(--primary-gold)]" href={`/admin/resources/equipment/${item.id}`}>{item.equipmentName}</Link></Td>
                  <Td>{item.serialNumber || "-"}</Td>
                  <Td>{item.condition || "-"}</Td>
                  <Td>{item.nextInspection?.toLocaleDateString("en-GB") || "-"}</Td>
                </tr>
              ))}
            </DataTable>
          </section>
        </section>

        <div className="grid gap-5">
          <AdminForm title="Add supplier">
            <form action={createSupplier} className="grid gap-3">
              <input className="field" name="name" placeholder="Supplier name" />
              <input className="field" name="email" placeholder="Email" />
              <input className="field" name="phone" placeholder="Phone" />
              <textarea className="field" name="notes" placeholder="Notes" />
              <button className="btn-primary" type="submit">Add supplier</button>
            </form>
          </AdminForm>

          <AdminForm title="Add product">
            <form action={createProduct} className="grid gap-3">
              <input className="field" name="productName" placeholder="Product name" />
              <input className="field" name="productCode" placeholder="Code" />
              <input className="field" name="category" placeholder="Category" />
              <select className="field" name="supplierId" defaultValue=""><option value="">No supplier</option>{suppliers.map((supplier) => <option value={supplier.id} key={supplier.id}>{supplier.name}</option>)}</select>
              <input className="field" name="costPrice" type="number" step="0.01" placeholder="Cost price" />
              <input className="field" name="defaultSalePrice" type="number" step="0.01" placeholder="Sale price" />
              <input className="field" name="unit" placeholder="Unit" />
              <input className="field" name="currentStock" type="number" step="0.01" placeholder="Current stock" />
              <input className="field" name="reorderLevel" type="number" step="0.01" placeholder="Reorder level" />
              <input className="field" name="safetyDataSheet" placeholder="SDS URL" />
              <label className="text-sm font-bold"><input name="batchTracking" type="checkbox" /> Batch tracking</label>
              <label className="text-sm font-bold"><input name="expiryTracking" type="checkbox" /> Expiry tracking</label>
              <button className="btn-primary" type="submit">Add product</button>
            </form>
          </AdminForm>

          <AdminForm title="Add vehicle">
            <form action={createVehicle} className="grid gap-3">
              <input className="field" name="registration" placeholder="Registration" />
              <input className="field" name="make" placeholder="Make" />
              <input className="field" name="model" placeholder="Model" />
              <input className="field" name="year" type="number" placeholder="Year" />
              <input className="field" name="mileage" type="number" placeholder="Mileage" />
              <input className="field" name="motDate" type="date" />
              <input className="field" name="taxDate" type="date" />
              <input className="field" name="insuranceExpiry" type="date" />
              <input className="field" name="serviceDueDate" type="date" />
              <textarea className="field" name="notes" placeholder="Notes" />
              <button className="btn-primary" type="submit">Add vehicle</button>
            </form>
          </AdminForm>

          <AdminForm title="Add equipment">
            <form action={createEquipment} className="grid gap-3">
              <input className="field" name="equipmentName" placeholder="Equipment name" />
              <input className="field" name="serialNumber" placeholder="Serial number" />
              <input className="field" name="condition" placeholder="Condition" />
              <input className="field" name="inspectionDate" type="date" />
              <input className="field" name="nextInspection" type="date" />
              <textarea className="field" name="notes" placeholder="Notes" />
              <button className="btn-primary" type="submit">Add equipment</button>
            </form>
          </AdminForm>
        </div>
      </div>
    </AdminShell>
  );
}
