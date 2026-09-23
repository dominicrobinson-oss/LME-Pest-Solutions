import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { homeMaintenanceServices as fallbackServices } from "@/lib/data";
import { prisma } from "@/lib/db";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Home Maintenance Services",
  description: "Gutter clearance, powerwashing, window cleaning, masonry restoration and other home maintenance services across Manchester and the North West.",
  path: "/home-maintenance",
});

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    const cmsServices = await prisma.service.findMany({
      where: { status: "PUBLISHED", category: "HOME_MAINTENANCE" },
      orderBy: { name: "asc" },
      select: { name: true, slug: true, intro: true },
    });
    return cmsServices.length ? cmsServices : fallbackServices;
  } catch {
    return fallbackServices;
  }
}

export default async function HomeMaintenancePage() {
  const homeMaintenanceServices = await getServices();
  return (
    <PublicShell>
      <PageHero
        title="Home Maintenance Services"
        copy="Alongside pest control, we offer a full range of home maintenance services for homes, landlords and businesses across Manchester and the North West."
      />
      <div className="container-lme grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {homeMaintenanceServices.map((service) => (
          <Link className="card p-6" href={`/home-maintenance/${service.slug}`} key={service.slug}>
            <h2 className="text-xl font-black">{service.name}</h2>
            <p className="mt-2 text-slate-600">{service.intro}</p>
          </Link>
        ))}
      </div>
    </PublicShell>
  );
}
