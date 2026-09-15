import type { Metadata } from "next";
import { business, areas } from "@/lib/data";

const defaultSiteUrl = "https://lme-pest-solutions.vercel.app";
const defaultOgImage = "/brand/lme-supplied-logo-full.png";

export function siteUrl() {
  return (process.env.PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || defaultSiteUrl).replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalized}`;
}

export function canonicalPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? "/" : normalized.replace(/\/$/, "");
}

export function publicMetadata(input: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  image?: string;
}): Metadata {
  const path = canonicalPath(input.path);
  const title = input.title;
  const description = input.description;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: input.ogTitle || title,
      description: input.ogDescription || description,
      url: absoluteUrl(path),
      siteName: business.name,
      type: "website",
      images: [{ url: absoluteUrl(input.image || defaultOgImage), alt: `${business.name} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.ogTitle || title,
      description: input.ogDescription || description,
      images: [absoluteUrl(input.image || defaultOgImage)],
    },
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function localBusinessSchema(path = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${absoluteUrl("/")}#local-business`,
    name: business.name,
    url: absoluteUrl(path),
    telephone: business.phone,
    email: business.email,
    image: absoluteUrl(defaultOgImage),
    logo: absoluteUrl("/brand/lme-supplied-logo-badge.png"),
    areaServed: [
      { "@type": "City", name: business.primaryArea },
      { "@type": "AdministrativeArea", name: business.coverage },
      ...areas.slice(0, 12).map((area) => ({ "@type": "City", name: area.name })),
    ],
    priceRange: "$$",
    description: `${business.name} handles pest control enquiries for homes and businesses across ${business.primaryArea} and ${business.coverage}.`,
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(input: { name: string; description: string; path: string; areas?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    serviceType: input.name,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${absoluteUrl("/")}#local-business`,
      name: business.name,
      telephone: business.phone,
    },
    areaServed: (input.areas?.length ? input.areas : [business.primaryArea, business.coverage]).map((name) => ({
      "@type": "Place",
      name,
    })),
  };
}

export function faqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
