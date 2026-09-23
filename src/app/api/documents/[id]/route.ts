import { notFound } from "next/navigation";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAnyRole(adminRoles);
  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || !document.customerId) notFound();
  if (document.expiryDate && document.expiryDate < new Date()) notFound();
  return new Response(null, { status: 302, headers: { Location: new URL(document.url, process.env.PUBLIC_SITE_URL || "http://localhost:3000").toString(), "Cache-Control": "no-store" } });
}
