import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/quote-form";
import { PublicShell } from "@/components/public-shell";
import { areas, homeMaintenanceServices as fallbackServices } from "@/lib/data";
import { prisma } from "@/lib/db";
import { JsonLd, breadcrumbSchema, canonicalPath, publicMetadata, serviceSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return fallbackServices.map((service) => ({ slug: service.slug }));
}

async function getService(slug: string) {
  try {
    const service = await prisma.service.findUnique({ where: { slug } });
    if (service?.status === "PUBLISHED" && service.category === "HOME_MAINTENANCE") return service;
  } catch {
    // Fall back to static public content when a database is not available during preview builds.
  }
  const fallback = fallbackServices.find((item) => item.slug === slug);
  if (!fallback) return null;
  return {
    ...fallback,
    seoTitle: `${fallback.name} Manchester`,
    metaDescription: `Request ${fallback.name.toLowerCase()} across Manchester and North West England from LME Pest Solutions.`,
    canonicalPath: `/home-maintenance/${fallback.slug}`,
    whatIncluded: ["On-site assessment", "Clear, itemised quote", "Fully equipped local team", "Tidy, safe completion of works"],
    process: ["Enquiry and free quote", "Appointment booked", "Work carried out", "Final check and sign-off"],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return publicMetadata({
    title: service.seoTitle,
    description: service.metaDescription,
    path: service.canonicalPath || `/home-maintenance/${service.slug}`,
  });
}

export default async function HomeMaintenanceServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const whatIncluded = "whatIncluded" in service ? service.whatIncluded : service.treatmentOptions;
  const process = "process" in service ? service.process : service.preventionAdvice;
  const sections = [
    ["What's included", whatIncluded],
    ["How it works", process],
  ];
  const path = canonicalPath(service.canonicalPath || `/home-maintenance/${service.slug}`);

  return (
    <PublicShell>
      <section className="bg-[var(--background-dark)] py-14 text-white">
        <div className="container-lme">
          <nav className="mb-5 text-sm text-slate-300">
            <Link href="/">Home</Link> / <Link href="/home-maintenance">Home Maintenance</Link> / {service.name}
          </nav>
          <h1 className="max-w-4xl text-4xl font-black sm:text-5xl">{service.name} in Manchester</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{service.intro}</p>
        </div>
      </section>
      <div className="container-lme grid gap-10 py-14 lg:grid-cols-[1fr_420px]">
        <article className="space-y-8">
          {sections.map(([title, items]) => (
            <section className="card p-6" key={title as string}>
              <h2 className="text-2xl font-black">{title}</h2>
              <ul className="mt-4 grid gap-2 text-slate-700">
                {(items as string[]).map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </section>
          ))}
          <section className="card p-6">
            <h2 className="text-2xl font-black">Relevant locations</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {areas.slice(0, 8).map((area) => <Link className="status-pill bg-amber-50 text-amber-800" href={`/pest-control/${area.slug}`} key={area.slug}>{area.name}</Link>)}
            </div>
          </section>
        </article>
        <aside className="card h-fit p-5">
          <h2 className="text-2xl font-black">Request a quote</h2>
          <p className="mb-5 mt-1 text-sm text-slate-600">This creates a lead record for follow-up.</p>
          <QuoteForm compact presetService={{ category: "maintenance", name: service.name }} />
        </aside>
      </div>
      <JsonLd data={serviceSchema({ name: service.name, description: service.metaDescription, path, areas: areas.map((area) => area.name) })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Home Maintenance", path: "/home-maintenance" }, { name: service.name, path }])} />
    </PublicShell>
  );
}
