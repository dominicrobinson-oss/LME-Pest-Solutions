import { NextResponse } from "next/server";
import { LeadStatus } from "@/generated/prisma/client";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { matchesEnum } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await requireAnyRole(adminRoles);
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status")?.trim();
  const leads = await prisma.lead.findMany({
    where: {
      ...(q ? { OR: [{ customerName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }, { postcode: { contains: q, mode: "insensitive" } }, { leadNumber: { contains: q, mode: "insensitive" } }] } : {}),
      ...(matchesEnum(status, LeadStatus) ? { status: matchesEnum(status, LeadStatus) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  await audit("CUSTOMER_DATA_EXPORTED", "Lead", { userId: user.id, metadata: { count: leads.length, q, status } });
  const rows = [
    ["Lead number", "Name", "Email", "Phone", "Postcode", "Pest", "Urgency", "Status", "Created"],
    ...leads.map((lead) => [lead.leadNumber, lead.customerName, lead.email || "", lead.phone, lead.postcode, lead.pestType, lead.urgency, lead.status, lead.createdAt.toISOString()]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="lme-leads.csv"`,
    },
  });
}
