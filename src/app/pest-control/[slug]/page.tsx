import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/quote-form";
import { PublicShell } from "@/components/public-shell";
import { areas as fallbackAreas, services as fallbackServices } from "@/lib/data";
import { prisma } from "@/lib/db";
import { JsonLd, breadcrumbSchema, canonicalPath, publicMetadata, serviceSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return fallbackAreas.map((area) => ({ slug: area.slug }));
}

async function getLocation(slug: string) {
  try {
    const location = await prisma.locationPage.findUnique({ where: { slug } });
    if (location?.status === "PUBLISHED" && location.activeCoverage) return location;
  } catch {
    // Fall back to static public content when a database is not available during preview builds.
  }
  const area = fallbackAreas.find((item) => item.slug === slug);
  return area
    ? {
        locationName: area.name,
        slug: area.slug,
        countyOrRegion: "North West England",
        pageTitle: `Pest Control ${area.name}`,
        metaTitle: `Pest Control ${area.name}`,
        metaDescription: `Request pest control in ${area.name} from LME Pest Solutions.`,
        canonicalPath: `/pest-control/${area.slug}`,
        ogTitle: null,
        ogDescription: null,
        heroCopy: `Local pest control enquiries for ${area.name}. This page is ready for unique editable local content in the CMS.`,
        localIntro: null,
        mainContent: `LME Pest Solutions supports pest control enquiries across Manchester and the North West. Exact coverage, emergency availability and service scope for ${area.name} should be confirmed by the team and managed in admin settings.`,
        commonPestIssues: ["Rats and mice", "Wasps and insects", "Commercial pest concerns"],
        residentialNotes: null,
        commercialNotes: null,
        nearbyAreas: fallbackAreas.filter((item) => item.slug !== area.slug).slice(0, 4).map((item) => item.name),
        availableServices: fallbackServices.slice(0, 9).map((service) => service.name),
        ctaCopy: null,
      }
    : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocation(slug);
  if (!location) return {};
  return publicMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: location.canonicalPath || `/pest-control/${location.slug}`,
    ogTitle: location.ogTitle,
    ogDescription: location.ogDescription,
  });
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = await getLocation(slug);
  if (!location) notFound();
  const path = canonicalPath(location.canonicalPath || `/pest-control/${location.slug}`);
  const serviceLinks = fallbackServices.filter((service) => location.availableServices.includes(service.name)).slice(0, 12);
  return (
    <PublicShell>
      <section className="bg-[var(--background-dark)] py-14 text-white">
        <div className="container-lme">
          <nav className="mb-5 text-sm text-slate-300"><Link href="/">Home</Link> / <Link href="/areas-we-cover">Areas</Link> / {location.locationName}</nav>
          <h1 className="text-4xl font-black sm:text-5xl">{location.pageTitle}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{location.heroCopy}</p>
        </div>
      </section>
      <div className="container-lme grid gap-10 py-14 lg:grid-cols-[1fr_420px]">
        <article className="space-y-6">
          <section className="card p-6">
          <h2 className="text-2xl font-black">Pest control in {location.locationName}</h2>
          <p className="mt-4 leading-7 text-slate-700">
            {location.localIntro || location.mainContent}
          </p>
          </section>
          {location.localIntro ? (
            <section className="card p-6">
              <h2 className="text-2xl font-black">Local coverage notes</h2>
              <p className="mt-4 leading-7 text-slate-700">{location.mainContent}</p>
            </section>
          ) : null}
          <section className="card p-6">
          <h2 className="text-2xl font-black">Common pest issues</h2>
          <ul className="mt-4 grid gap-2 text-slate-700">
            {location.commonPestIssues.map((issue) => <li key={issue}>- {issue}</li>)}
          </ul>
          </section>
          {location.residentialNotes || location.commercialNotes ? (
            <section className="grid gap-4 md:grid-cols-2">
              {location.residentialNotes ? <div className="card p-5"><h2 className="text-xl font-black">Residential</h2><p className="mt-3 text-slate-700">{location.residentialNotes}</p></div> : null}
              {location.commercialNotes ? <div className="card p-5"><h2 className="text-xl font-black">Commercial</h2><p className="mt-3 text-slate-700">{location.commercialNotes}</p></div> : null}
            </section>
          ) : null}
          <section className="card p-6">
          <h3 className="mt-8 text-xl font-black">Available services</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(serviceLinks.length ? serviceLinks : fallbackServices.slice(0, 9)).map((service) => <Link className="status-pill bg-lime-50 text-lime-800" href={`/services/${service.slug}`} key={service.slug}>{service.name}</Link>)}
          </div>
          </section>
          <section className="card p-6">
            <h2 className="text-2xl font-black">Nearby areas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {location.nearbyAreas.map((area) => <span className="status-pill bg-slate-100 text-slate-700" key={area}>{area}</span>)}
            </div>
          </section>
        </article>
        <aside className="card h-fit p-5">
          <h2 className="text-2xl font-black">Request pest control in {location.locationName}</h2>
          <p className="mb-5 mt-1 text-sm text-slate-600">{location.ctaCopy || "Submit the form and the enquiry will be logged for follow-up."}</p>
          <QuoteForm compact />
        </aside>
      </div>
      <JsonLd data={serviceSchema({ name: `Pest Control ${location.locationName}`, description: location.metaDescription, path, areas: [location.locationName, location.countyOrRegion] })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Areas We Cover", path: "/areas-we-cover" }, { name: location.locationName, path }])} />
    </PublicShell>
  );
}
