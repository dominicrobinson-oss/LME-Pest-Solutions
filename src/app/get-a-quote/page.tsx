import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { QuoteForm } from "@/components/quote-form";
import { PageHero } from "@/components/page-hero";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Get a Free Pest Control Quote",
  description: "Submit a pest control enquiry for LME Pest Solutions across Manchester and the North West.",
  path: "/get-a-quote",
});

export default function QuotePage() {
  return (
    <PublicShell>
      <PageHero title="Get a Free Quote" copy="Submit the form and LME will receive a validated lead record for follow-up." />
      <div className="container-lme max-w-3xl py-14">
        <div className="card p-6">
          <QuoteForm />
        </div>
      </div>
    </PublicShell>
  );
}
