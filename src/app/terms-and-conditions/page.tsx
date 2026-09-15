import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Terms and Conditions",
  description: "LME Pest Solutions terms and conditions for pest control enquiries and services.",
  path: "/terms-and-conditions",
});

export default function Page() { return <PolicyPage title="Terms and Conditions" />; }
