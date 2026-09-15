import { describe, expect, it } from "vitest";
import { absoluteUrl, breadcrumbSchema, faqPageSchema, localBusinessSchema, publicMetadata, serviceSchema } from "@/lib/seo";

describe("SEO helpers", () => {
  it("builds canonical and Open Graph metadata from the public site URL", () => {
    const metadata = publicMetadata({
      title: "Pest Control Manchester | LME Pest Solutions",
      description: "Local pest control enquiries for Manchester.",
      path: "/pest-control/manchester",
    });

    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/pest-control/manchester"));
    expect(metadata.openGraph?.url).toBe(absoluteUrl("/pest-control/manchester"));
    expect(metadata.openGraph?.title).toBe("Pest Control Manchester | LME Pest Solutions");
  });

  it("renders safe LocalBusiness schema without unverified ratings or awards", () => {
    const schema = localBusinessSchema("/");
    const serialized = JSON.stringify(schema);

    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.name).toBe("LME Pest Solutions");
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain("review");
    expect(serialized).not.toContain("award");
    expect(serialized).not.toContain("foundingDate");
  });

  it("builds valid FAQPage schema from published FAQ content", () => {
    const schema = faqPageSchema([
      { question: "How quickly will you respond?", answer: "LME aims to respond quickly where capacity allows." },
      { question: "Do you support commercial sites?", answer: "Commercial accounts can hold multiple sites and reports." },
    ]);

    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "How quickly will you respond?",
      acceptedAnswer: { "@type": "Answer" },
    });
  });

  it("builds service and breadcrumb schema with canonical URLs", () => {
    const service = serviceSchema({
      name: "Rat Control",
      description: "Rat control across Manchester.",
      path: "/services/rat-control",
      areas: ["Manchester", "Salford"],
    });
    const breadcrumb = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Rat Control", path: "/services/rat-control" },
    ]);

    expect(service.url).toBe(absoluteUrl("/services/rat-control"));
    expect(service.areaServed).toEqual([{ "@type": "Place", name: "Manchester" }, { "@type": "Place", name: "Salford" }]);
    expect(breadcrumb.itemListElement[1].item).toBe(absoluteUrl("/services/rat-control"));
  });
});
