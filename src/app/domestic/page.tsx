import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Domestic Pest Control",
  description: "Domestic pest control enquiries for homes, landlords and tenants across Manchester and the North West.",
  path: "/domestic",
});

export default function DomesticPage() {
  return (
    <LandingPage
      eyebrow="Domestic pest control"
      title="Pest control for homes, landlords and tenants"
      copy="Request help for pest activity in kitchens, lofts, gardens, bedrooms, rented homes and shared spaces. Enquiries are tracked into the LME lead dashboard for follow-up."
      audience={["Homeowners needing discreet help", "Tenants and landlords managing property issues", "Families who need clear safety and re-entry instructions"]}
      services={["Rats, mice, ants, fleas, bed bugs and wasps", "Inspection, treatment and prevention advice", "Treatment reports and follow-up recommendations"]}
      process={["Submit a quote enquiry or call LME", "The office team reviews the lead and confirms next steps", "A technician records treatment notes, safety advice and any follow-up"]}
      icon="home"
    />
  );
}
