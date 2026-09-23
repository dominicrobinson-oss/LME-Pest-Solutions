import { notFound } from "next/navigation";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { brandedPdf } from "@/lib/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAnyRole(adminRoles);
  const { id } = await params;
  const record = await prisma.treatmentRecord.findUnique({ where: { id }, include: { job: { include: { customer: true, property: true } }, materials: true } });
  if (!record) notFound();
  const signatures = record.signatures && typeof record.signatures === "object" && !Array.isArray(record.signatures) ? record.signatures as Record<string, unknown> : {};
  const pdf = brandedPdf({
    title: "Treatment Report",
    reference: record.job.jobNumber,
    status: record.job.status,
    sections: [
      {
        title: "Customer And Site",
        fields: [
          { label: "Customer", value: record.job.customer?.name },
          { label: "Property", value: record.job.property?.address },
          { label: "Postcode", value: record.job.property?.postcode },
          { label: "Job type", value: record.job.jobType },
        ],
      },
      {
        title: "Inspection Findings",
        fields: [
          { label: "Pest identified", value: record.pestIdentified },
          { label: "Severity", value: record.infestationSeverity },
          { label: "Areas inspected", value: record.areasInspected },
          { label: "Evidence found", value: record.evidenceFound },
        ],
      },
      {
        title: "Treatment Applied",
        fields: [
          { label: "Method", value: record.treatmentMethod },
          { label: "Product", value: record.productUsed },
          { label: "Quantity", value: record.productQuantity },
          { label: "Batch number", value: record.productBatchNumber },
          { label: "Application area", value: record.applicationArea },
        ],
      },
      {
        title: "Safety And Advice",
        fields: [
          { label: "Safety precautions", value: record.safetyPrecautions },
          { label: "Occupant instructions", value: record.occupantInstructions },
          { label: "Pet instructions", value: record.petInstructions },
          { label: "Re-entry time", value: record.reEntryTime },
          { label: "Follow-up", value: record.followUpRecommendation },
          { label: "Proofing advice", value: record.proofingRecommendations },
        ],
      },
      {
        title: "Materials",
        lines: record.materials.length ? record.materials.map((material) => `${material.name} - ${material.quantity} - batch ${material.batchNumber || "not recorded"}`) : ["No linked materials recorded."],
      },
      {
        title: "Signatures And Acknowledgement",
        fields: [
          { label: "Customer acknowledged", value: record.customerAcknowledgement ? "Yes" : "No" },
          { label: "Customer signature", value: signatures.customer ? "Captured digitally" : "Not captured" },
          { label: "Technician signature", value: signatures.technician ? "Captured digitally" : "Not captured" },
        ],
      },
    ],
    footerNote: record.technicianNotes || "Treatment record generated from the technician completion workflow.",
  });
  return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="treatment-${record.job.jobNumber}.pdf"` } });
}
