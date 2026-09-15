import { Phone, MapPin, CheckCircle2 } from "lucide-react";
import { completeTreatment, updateJobStatus } from "@/app/admin/actions";
import { SignaturePad } from "@/components/signature-pad";
import { business } from "@/lib/data";
import { requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { mapsProvider } from "@/lib/providers";
import { businessPhoneHref } from "@/lib/utils";

export const metadata = { robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function TechnicianPortalPage({ searchParams }: { searchParams?: Promise<{ view?: string; date?: string }> }) {
  const user = await requireAnyRole(["TECHNICIAN", "SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER"]);
  const params = (await searchParams) || {};
  const start = params.date ? new Date(`${params.date}T00:00:00`) : null;
  const end = start ? new Date(start) : null;
  if (end) end.setDate(end.getDate() + 1);
  const jobs = await prisma.job.findMany({
    where: {
      ...(user.role === "TECHNICIAN" ? { assignments: { some: { userId: user.id } } } : {}),
      ...(params.view === "completed" ? { status: "COMPLETED" as const } : { status: { notIn: ["COMPLETED", "CANCELLED"] } }),
      ...(start && end ? { scheduledStart: { gte: start, lt: end } } : {}),
    },
    include: { customer: true, property: true },
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
    take: 20,
  });
  return (
    <main className="min-h-screen bg-[var(--background-dark)] p-4 text-white">
      <section className="mx-auto max-w-md">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-lime-300">Technician mobile</p>
        <h1 className="mt-2 text-3xl font-black">Today&apos;s Jobs</h1>
        <form className="mt-5 grid gap-3 rounded-lg bg-white/10 p-3">
          <select className="field" name="view" defaultValue={params.view || "active"}>
            <option value="active">Active/upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <input className="field" name="date" type="date" defaultValue={params.date || ""} />
          <button className="btn-primary" type="submit">Filter jobs</button>
        </form>
        <div className="mt-6 grid gap-5">
          {jobs.map((job) => (
            <div className="rounded-lg bg-white p-5 text-slate-950" key={job.id}>
              <p className="status-pill bg-lime-50 text-lime-800">{job.status}</p>
              <h2 className="mt-4 text-xl font-black">{job.jobNumber}: {job.jobType}</h2>
              <p className="mt-2 text-sm text-slate-600">{job.customer?.name || "No customer"} · {job.property?.address || "No property"} · {job.scheduledStart?.toLocaleString("en-GB") || "Unscheduled"}</p>
              <p className="mt-3 text-sm">{job.accessNotes || job.property?.accessInstructions || "No access notes recorded."}</p>
              <div className="mt-5 grid gap-3">
                <a className="btn-primary" href={`/technician/jobs/${job.id}`}>Open job detail</a>
                <a className="btn-primary" href={businessPhoneHref(job.customer?.phone || business.phone)}><Phone size={18} /> Call customer</a>
                <a className="btn-primary" href={mapsProvider.directionsUrl(job.property?.postcode || "")} target="_blank"><MapPin size={18} /> Open directions</a>
                {["EN_ROUTE","ARRIVED","IN_PROGRESS","PAUSED","COMPLETED","NO_ACCESS"].map((status) => (
                  <form action={updateJobStatus} key={status}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <input type="hidden" name="status" value={status} />
                    <button className="btn-primary w-full" type="submit"><CheckCircle2 size={18} /> {status}</button>
                  </form>
                ))}
              </div>
              <form action={completeTreatment} className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4">
                <input type="hidden" name="jobId" value={job.id} />
                <input className="field" name="pestIdentified" placeholder="Pest found" />
                <select className="field" name="infestationSeverity"><option>Low</option><option>Moderate</option><option>High</option><option>Severe</option></select>
                <textarea className="field" name="areasInspected" placeholder="Areas inspected" />
                <textarea className="field" name="evidenceFound" placeholder="Evidence found" />
                <textarea className="field" name="treatmentMethod" placeholder="Treatment method" />
                <input className="field" name="productUsed" placeholder="Product used" />
                <input className="field" name="productQuantity" placeholder="Quantity" />
                <input className="field" name="productBatchNumber" placeholder="Batch number" />
                <textarea className="field" name="safetyPrecautions" placeholder="Safety precautions" />
                <textarea className="field" name="petInstructions" placeholder="Pet instructions" />
                <input className="field" name="reEntryTime" placeholder="Re-entry time" />
                <textarea className="field" name="followUpRecommendation" placeholder="Follow-up recommendation" />
                <textarea className="field" name="proofingRecommendations" placeholder="Proofing recommendations" />
                <textarea className="field" name="technicianNotes" placeholder="Technician notes" />
                <SignaturePad name="customerSignature" label="Customer signature" />
                <SignaturePad name="technicianSignature" label="Technician signature" defaultValue={user.name || user.email} />
                <label className="text-sm"><input name="customerAcknowledgement" type="checkbox" /> Customer acknowledged instructions</label>
                <button className="btn-primary" type="submit">Complete treatment form</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
