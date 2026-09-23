import type { MetadataRoute } from "next";
import { adviceArticles, areas, services } from "@/lib/data";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

function contentPageUrl(page: { slug: string; canonicalPath: string | null }) {
  if (page.canonicalPath) return page.canonicalPath;
  if (page.slug.startsWith("advice-")) return `/advice/${page.slug.replace(/^advice-/, "")}`;
  return `/${page.slug}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/services", "/areas-we-cover", "/domestic", "/commercial", "/emergency", "/advice", "/about-us", "/reviews", "/faq", "/get-a-quote", "/contact", "/privacy-policy", "/cookie-policy", "/terms-and-conditions", "/complaints-policy", "/sitemap"];
  try {
    const [cmsServices, cmsLocations, cmsPages] = await Promise.all([
      prisma.service.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, canonicalPath: true, updatedAt: true } }),
      prisma.locationPage.findMany({ where: { status: "PUBLISHED", activeCoverage: true }, select: { slug: true, canonicalPath: true, updatedAt: true } }),
      prisma.contentPage.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, canonicalPath: true, updatedAt: true } }),
    ]);
    return [
      ...staticRoutes.map((route) => ({ url: absoluteUrl(route || "/") })),
      ...cmsServices.map((service) => ({ url: absoluteUrl(service.canonicalPath || `/services/${service.slug}`), lastModified: service.updatedAt })),
      ...cmsLocations.map((location) => ({ url: absoluteUrl(location.canonicalPath || `/pest-control/${location.slug}`), lastModified: location.updatedAt })),
      ...cmsPages.map((page) => ({ url: absoluteUrl(contentPageUrl(page)), lastModified: page.updatedAt })),
    ];
  } catch {
    // Vercel/public preview can build before a hosted database is connected.
  }
  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route || "/") })),
    ...services.map((service) => ({ url: absoluteUrl(`/services/${service.slug}`) })),
    ...areas.map((area) => ({ url: absoluteUrl(`/pest-control/${area.slug}`) })),
    ...adviceArticles.map((article) => ({ url: absoluteUrl(`/advice/${article.slug}`) })),
  ];
}
