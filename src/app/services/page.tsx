import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { services as fallbackServices } from "@/lib/data";
import { prisma } from "@/lib/db";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Pest Control Services",
  description: "Explore LME Pest Solutions services for homes and businesses across Manchester and the North West.",
  path: "/services",
});

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    const cmsServices = await prisma.service.findMany({
      where: { status: "PUBLISHED", category: "PEST_CONTROL" },
      orderBy: { name: "asc" },
      select: { name: true, slug: true, intro: true },
    });
    return cmsServices.length ? cmsServices : fallbackServices;
  } catch {
    return fallbackServices;
  }
}

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <PublicShell>
      <PageHero title="Pest Control Services" copy="Service pages are CMS-ready and structured for signs, risks, treatment, prevention and local SEO." />
      <div className="container-lme grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link className="card p-6" href={`/services/${service.slug}`} key={service.slug}>
            <h2 className="text-xl font-black">{service.name}</h2>
            <p className="mt-2 text-slate-600">{service.intro}</p>
          </Link>
        ))}
      </div>
    </PublicShell>
  );
}
