import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "About LME Pest Solutions",
  description: "Business profile for LME Pest Solutions, a Manchester-based pest control company serving North West England.",
  path: "/about-us",
});

export default function AboutPage() {
  return (
    <PublicShell>
      <PageHero title="About LME Pest Solutions" copy="A configurable business profile for a Manchester-based pest control company serving North West England." />
      <div className="container-lme py-14">
        <div className="card max-w-3xl p-6 leading-7 text-slate-700">
          Business identity, opening hours, insurance details, company number, VAT status and accreditations are intentionally managed in settings and should only be published when verified.
        </div>
      </div>
    </PublicShell>
  );
}
