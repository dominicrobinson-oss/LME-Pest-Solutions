import { PublicShell } from "@/components/public-shell";
import { areas as fallbackAreas } from "@/lib/data";
import { PageHero } from "@/components/page-hero";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Areas We Cover",
  description: "Pest control coverage areas across Manchester and the North West.",
  path: "/areas-we-cover",
});

export const dynamic = "force-dynamic";

async function getAreas() {
  try {
    const locations = await prisma.locationPage.findMany({
      where: { status: "PUBLISHED", activeCoverage: true },
      orderBy: { locationName: "asc" },
      select: { locationName: true, slug: true },
    });
    return locations.length ? locations.map((location) => ({ name: location.locationName, slug: location.slug })) : fallbackAreas;
  } catch {
    return fallbackAreas;
  }
}

export default async function AreasPage() {
  const areas = await getAreas();
  return (
    <PublicShell>
      <PageHero title="Areas We Cover" copy="North West coverage areas can be managed and activated in admin settings." />
      <div className="container-lme grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {areas.map((area) => <Link className="card p-5 font-black" href={`/pest-control/${area.slug}`} key={area.slug}>{area.name}</Link>)}
      </div>
    </PublicShell>
  );
}
