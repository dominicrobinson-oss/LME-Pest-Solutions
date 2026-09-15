import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Commercial Pest Control",
  description: "Commercial pest control enquiries for offices, hospitality, landlords and multi-site businesses.",
  path: "/commercial",
});

export default function CommercialPage() {
  return (
    <LandingPage
      eyebrow="Commercial pest control"
      title="Pest management for workplaces and commercial sites"
      copy="Log commercial pest control enquiries for offices, food-handling premises, landlords, facilities teams and multi-site customers. The platform supports customers, sites, contracts, jobs and visit reports."
      audience={["Offices, hospitality and retail premises", "Landlords, agents and facilities teams", "Multi-site customers needing recurring visit records"]}
      services={["Site inspections and treatment plans", "Recurring visit scheduling and contract records", "Commercial visit reports, documents and audit history"]}
      process={["Capture the enquiry and site details", "Create or link customer, property and contract records", "Schedule visits and store reports for customer access"]}
      icon="building"
    />
  );
}
