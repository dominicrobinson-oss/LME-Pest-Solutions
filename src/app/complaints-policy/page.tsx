import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Complaints Policy",
  description: "LME Pest Solutions complaints policy and customer service information.",
  path: "/complaints-policy",
});

export default function Page() { return <PolicyPage title="Complaints Policy" />; }
