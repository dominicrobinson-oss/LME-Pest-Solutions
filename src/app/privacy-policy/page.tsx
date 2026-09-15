import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Privacy Policy",
  description: "LME Pest Solutions privacy policy information for website and customer enquiries.",
  path: "/privacy-policy",
});

export default function Page() { return <PolicyPage title="Privacy Policy" />; }
