import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { nextNumber } from "@/lib/numbering";
import { checkRateLimit } from "@/lib/rate-limit";
import { quoteEnquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = await checkRateLimit(`quote:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many enquiries. Please wait a minute and try again." }, { status: 429 });
  }

  const formData = await request.formData();
  const parsed = quoteEnquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid enquiry" }, { status: 400 });
  }

  const data = parsed.data;
  const leadNumber = await nextNumber("lead");

  const lead = await prisma.lead.create({
    data: {
      leadNumber,
      customerName: data.name,
      email: data.email || null,
      phone: data.phone,
      postcode: data.postcode,
      pestType: data.pestProblem,
      propertyType: data.propertyType,
      urgency: data.urgency,
      preferredContactMethod: data.preferredContactMethod,
      description: data.description || null,
      source: "Website",
      consentText: "Customer consented to be contacted about this quote enquiry.",
      consentRecords: {
        create: {
          type: "Quote enquiry",
          text: "Customer consented to be contacted about this quote enquiry.",
          granted: true,
        },
      },
    },
  });

  await audit("LEAD_CREATED", "Lead", {
    entityId: lead.id,
    ipAddress: ip,
    newValue: {
      leadNumber,
      source: "Website",
      pestType: data.pestProblem,
      postcode: data.postcode,
    },
  });

  await prisma.notification.create({
    data: {
      type: "NEW_LEAD",
      title: `New website lead ${leadNumber}`,
      body: `${data.name} requested help with ${data.pestProblem}.`,
    },
  });

  return NextResponse.json({ ok: true, leadNumber });
}
