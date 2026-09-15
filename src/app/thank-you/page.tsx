import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";

export const metadata = { robots: { index: false, follow: false } };

export default function ThankYouPage() {
  return (
    <PublicShell>
      <PageHero title="Thank You" copy="Your enquiry has been received." />
    </PublicShell>
  );
}
