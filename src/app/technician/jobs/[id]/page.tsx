import { Phone, MapPin, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { addJobMaterialUsage, addJobPhotoStub, completeTreatment, createJobExpense, scheduleJobFollowUp, updateJobStatus } from "@/app/admin/actions";
import { DataTable, Td } from "@/components/data-table";
import { OfflineFormDraft } from "@/components/offline-form-draft";
import { SignaturePad } from "@/components/signature-pad";
import { business } from "@/lib/data";
import { requireTechnicianAssignment } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { mapsProvider } from "@/lib/providers";
import { businessPhoneHref } from "@/lib/utils";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TechnicianJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTechnicianAssignment(id);
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      property: true,
      treatmentRecords: true,
      documents: true,
      expenses: true,
      jobMaterials: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!job) notFound();
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { productName: "asc" }, take: 80 });

  return (
    <main className="min-h-screen bg-[var(--background-dark)] p-4 text-white">
      <section className="mx-auto max-w-2xl">
        <a className="text-sm font-bold text-lime-300" href="/technician">Back to jobs</a>
        <div className="mt-4 rounded-lg bg-white p-5 text-slate-950">
          <p className="status-pill bg-lime-50 text-lime-800">{job.status}</p>
          <h1 className="mt-3 text-3xl font-black">{job.jobNumber}</h1>
          <p className="mt-2 text-slate-600">{job.jobType} · {job.pestType} · {job.priority}</p>
          <p className="mt-3 text-sm">{job.customer?.name || "No customer"} · {job.property?.address || "No property"} · {job.scheduledStart?.toLocaleString("en-GB") || "Unscheduled"}</p>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">{job.accessNotes || job.property?.accessInstructions || "No access notes recorded."}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a className="btn-primary" href={businessPhoneHref(job.customer?.phone || business.phone)}><Phone size={18} /> Call customer</a>
            <a className="btn-primary" href={mapsProvider.directionsUrl(job.property?.postcode || "")} target="_blank"><MapPin size={18} /> Open directions</a>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {["EN_ROUTE","ARRIVED","IN_PROGRESS","PAUSED","COMPLETED"].map((status) => (
              <form action={updateJobStatus} key={status}>
                <input type="hidden" name="jobId" value={job.id} />
                <input type="hidden" name="status" value={status} />
                <button className="btn-primary w-full" type="submit"><CheckCircle2 size={18} /> {status}</button>
              </form>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["NO_ACCESS", "CANCELLED"].map((status) => (
              <form action={updateJobStatus} className="grid gap-2 rounded-lg bg-slate-50 p-3" key={status}>
                <input type="hidden" name="jobId" value={job.id} />
                <input type="hidden" name="status" value={status} />
                <textarea className="field" name="note" placeholder={`${status.replace("_", " ").toLowerCase()} reason`} />
                <button className="btn-primary w-full" type="submit"><CheckCircle2 size={18} /> {status}</button>
              </form>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5">
          <section className="rounded-lg bg-white p-5 text-slate-950">
            <h2 className="text-xl font-black">Treatment record</h2>
            <OfflineFormDraft formId={`treatment-${job.id}`} storageKey={`lme-treatment-draft-${job.id}`} />
            <form action={completeTreatment} className="mt-4 grid gap-3" id={`treatment-${job.id}`}>
              <input type="hidden" name="jobId" value={job.id} />
              <input className="field" name="pestIdentified" placeholder="Pest found" />
              <select className="field" name="infestationSeverity"><option>Low</option><option>Moderate</option><option>High</option><option>Severe</option></select>
              <textarea className="field" name="areasInspected" placeholder="Areas inspected" />
              <textarea className="field" name="evidenceFound" placeholder="Evidence found" />
              <textarea className="field" name="treatmentMethod" placeholder="Treatment method" />
              <input className="field" name="productUsed" placeholder="Product used" />
              <input className="field" name="productQuantity" placeholder="Quantity" />
              <input className="field" name="productBatchNumber" placeholder="Batch number" />
              <input className="field" name="applicationArea" placeholder="Application area" />
              <textarea className="field" name="safetyPrecautions" placeholder="Safety precautions" />
              <textarea className="field" name="occupantInstructions" placeholder="Occupant instructions" />
              <textarea className="field" name="petInstructions" placeholder="Pet instructions" />
              <input className="field" name="reEntryTime" placeholder="Re-entry time" />
              <textarea className="field" name="followUpRecommendation" placeholder="Follow-up recommendation" />
              <textarea className="field" name="proofingRecommendations" placeholder="Proofing recommendations" />
              <textarea className="field" name="technicianNotes" placeholder="Technician notes" />
              <SignaturePad name="customerSignature" label="Customer signature" />
              <SignaturePad name="technicianSignature" label="Technician signature" defaultValue={user.name || user.email} />
              <label className="text-sm"><input name="customerAcknowledgement" type="checkbox" /> Customer acknowledged instructions</label>
              <button className="btn-primary" type="submit">Complete treatment</button>
            </form>
          </section>

          <section className="rounded-lg bg-white p-5 text-slate-950">
            <h2 className="text-xl font-black">Job expense</h2>
            <form action={createJobExpense} className="mt-4 grid gap-3">
              <input type="hidden" name="jobId" value={job.id} />
              <input className="field" name="description" placeholder="Expense description" />
              <input className="field" name="amount" type="number" step="0.01" placeholder="Amount" />
              <input className="field" name="vat" type="number" step="0.01" placeholder="VAT" />
              <select className="field" name="paymentMethod"><option>Card</option><option>Cash</option><option>Bank transfer</option><option>Other</option></select>
              <input className="field" name="receiptUrl" placeholder="Receipt URL / storage stub" />
              <button className="btn-primary" type="submit">Record expense</button>
            </form>
          </section>

          <section className="rounded-lg bg-white p-5 text-slate-950">
            <h2 className="text-xl font-black">Materials, photos and follow-up</h2>
            <div className="mt-4 grid gap-5">
              <form action={addJobMaterialUsage} className="grid gap-3 rounded-lg bg-slate-50 p-4">
                <input type="hidden" name="jobId" value={job.id} />
                <select className="field" name="productId" defaultValue=""><option value="">No linked product</option>{products.map((product) => <option value={product.id} key={product.id}>{product.productName}</option>)}</select>
                <input className="field" name="name" placeholder="Material name" />
                <input className="field" name="quantity" placeholder="Quantity" />
                <input className="field" name="batchNumber" placeholder="Batch number" />
                <input className="field" name="cost" type="number" step="0.01" placeholder="Cost" />
                <button className="btn-primary" type="submit">Add material</button>
              </form>
              <form action={addJobPhotoStub} className="grid gap-3 rounded-lg bg-slate-50 p-4">
                <input type="hidden" name="jobId" value={job.id} />
                <input className="field" name="title" placeholder="Photo title" />
                <input className="field" name="photo" type="file" accept="image/*" />
                <textarea className="field" name="notes" placeholder="Photo notes or fallback storage content" />
                <button className="btn-primary" type="submit">Add photo record</button>
              </form>
              <form action={scheduleJobFollowUp} className="grid gap-3 rounded-lg bg-slate-50 p-4">
                <input type="hidden" name="jobId" value={job.id} />
                <input className="field" name="followUpDate" type="datetime-local" />
                <textarea className="field" name="notes" placeholder="Follow-up notes" />
                <button className="btn-primary" type="submit">Schedule follow-up</button>
              </form>
            </div>
          </section>

          <section className="rounded-lg bg-white p-5 text-slate-950">
            <h2 className="text-xl font-black">History and records</h2>
            <DataTable headers={["Type", "Reference", "Detail", "Date"]}>
              {job.statusHistory.map((event) => <tr key={event.id}><Td>Status</Td><Td>{event.status}</Td><Td>{event.note || "-"}</Td><Td>{event.createdAt.toLocaleString("en-GB")}</Td></tr>)}
              {job.treatmentRecords.map((record) => <tr key={record.id}><Td>Treatment</Td><Td>{record.pestIdentified}</Td><Td>{record.infestationSeverity}</Td><Td>{record.createdAt.toLocaleString("en-GB")}</Td></tr>)}
              {job.expenses.map((expense) => <tr key={expense.id}><Td>Expense</Td><Td>{expense.expenseNumber}</Td><Td>£{Number(expense.total).toFixed(2)} · {expense.description}</Td><Td>{expense.createdAt.toLocaleString("en-GB")}</Td></tr>)}
              {job.jobMaterials.map((material) => <tr key={material.id}><Td>Material</Td><Td>{material.product?.productName || material.name}</Td><Td>{material.quantity} · {material.batchNumber || "No batch"}</Td><Td>£{Number(material.cost).toFixed(2)}</Td></tr>)}
              {job.photos.map((photo) => <tr key={photo}><Td>Photo</Td><Td>Storage record</Td><Td><a href={photo}>{photo}</a></Td><Td>-</Td></tr>)}
              {job.documents.map((document) => <tr key={document.id}><Td>Document</Td><Td>{document.category}</Td><Td><a href={document.url}>{document.title}</a></Td><Td>{document.createdAt.toLocaleString("en-GB")}</Td></tr>)}
            </DataTable>
          </section>
        </div>
      </section>
    </main>
  );
}
