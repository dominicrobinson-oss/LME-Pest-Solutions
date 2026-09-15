import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Cookie Policy",
  description: "LME Pest Solutions cookie policy for the website and online enquiries.",
  path: "/cookie-policy",
});

export default function Page() { return <PolicyPage title="Cookie Policy" />; }
