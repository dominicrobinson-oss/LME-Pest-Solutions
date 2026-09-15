import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Emergency Pest Control",
  description: "Urgent pest control enquiries across Manchester and the North West where technician capacity allows.",
  path: "/emergency",
});

export default function EmergencyPage() {
  return (
    <LandingPage
      eyebrow="Emergency pest control"
      title="Urgent pest control enquiries"
      copy="For urgent pest problems, call LME or submit the quote form with Emergency selected. Availability depends on technician capacity and location, so the site avoids promising response times that have not been verified."
      audience={["Active pest sightings needing quick triage", "Businesses managing hygiene or access concerns", "Customers who need clear safety instructions"]}
      services={["Urgency triage and lead prioritisation", "Technician job assignment and status updates", "Treatment records, reports and follow-up advice"]}
      process={["Call or submit the emergency enquiry", "Office staff review urgency and availability", "Technician actions are tracked through the mobile portal"]}
      icon="emergency"
    />
  );
}
