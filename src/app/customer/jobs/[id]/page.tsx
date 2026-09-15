import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { DataTable, Td } from "@/components/data-table";
import { requestAppointmentReschedule } from "@/app/admin/actions";
import { requireCustomerOwnership } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CustomerJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { customer: true, property: true, documents: true, treatmentRecords: true, communications: true } });
  if (!job || !job.customerId) notFound();
  const user = await requireCustomerOwnership(job.customerId);

  return (
    <AdminShell title={`Appointment ${job.jobNumber}`} userName={user.name || user.email}>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Appointment details</h3>
          <DataTable headers={["Field", "Value"]}>
            <tr><Td>Status</Td><Td>{job.status}</Td></tr>
            <tr><Td>Type</Td><Td>{job.jobType}</Td></tr>
            <tr><Td>Pest</Td><Td>{job.pestType}</Td></tr>
            <tr><Td>Scheduled</Td><Td>{job.scheduledStart?.toLocaleString("en-GB") || "Unscheduled"}</Td></tr>
            <tr><Td>Property</Td><Td>{job.property?.address || "-"}</Td></tr>
            <tr><Td>Customer instructions</Td><Td>{job.customerInstructions || "-"}</Td></tr>
          </DataTable>
        </section>
        <section className="card p-5">
          <h3 className="text-xl font-black">Request reschedule</h3>
          <form action={requestAppointmentReschedule} className="mt-4 grid gap-3">
            <input type="hidden" name="jobId" value={job.id} />
            <input className="field" name="requestedDate" type="date" />
            <input className="field" name="requestedTime" type="time" />
            <textarea className="field" name="reason" placeholder="Reason or availability notes" />
            <button className="btn-primary" type="submit">Send request</button>
          </form>
        </section>
        <section className="card p-5 xl:col-span-2">
          <h3 className="text-xl font-black">Reports and messages</h3>
          <DataTable headers={["Type", "Reference", "Detail"]}>
            {job.treatmentRecords.map((record) => <tr key={record.id}><Td>Treatment</Td><Td>{record.pestIdentified}</Td><Td>{record.infestationSeverity} · {record.createdAt.toLocaleDateString("en-GB")}</Td></tr>)}
            {job.documents.map((document) => <tr key={document.id}><Td>Document</Td><Td>{document.title}</Td><Td><a className="font-bold text-[var(--primary-green)]" href={`/customer/documents/${document.id}`}>Open protected view</a></Td></tr>)}
            {job.communications.map((message) => <tr key={message.id}><Td>Message</Td><Td>{message.subject || message.type}</Td><Td>{message.body}</Td></tr>)}
          </DataTable>
        </section>
      </div>
    </AdminShell>
  );
}
