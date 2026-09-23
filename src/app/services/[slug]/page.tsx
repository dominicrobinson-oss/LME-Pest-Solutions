import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/quote-form";
import { PublicShell } from "@/components/public-shell";
import { areas, services as fallbackServices, specialistServiceContent } from "@/lib/data";
import { prisma } from "@/lib/db";
import { JsonLd, breadcrumbSchema, canonicalPath, publicMetadata, serviceSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return fallbackServices.map((service) => ({ slug: service.slug }));
}

async function getService(slug: string) {
  try {
    const service = await prisma.service.findUnique({ where: { slug } });
    if (service?.status === "PUBLISHED" && service.category === "PEST_CONTROL") return service;
  } catch {
    // Fall back to static public content when a database is not available during preview builds.
  }
  const fallback = fallbackServices.find((item) => item.slug === slug);
  if (!fallback) return null;
  const specialist = specialistServiceContent[fallback.slug];
  return {
    ...fallback,
    intro: specialist?.intro || fallback.intro,
    seoTitle: `${fallback.name} Manchester`,
    metaDescription: `Request ${fallback.name.toLowerCase()} across Manchester and North West England from LME Pest Solutions.`,
    canonicalPath: `/services/${fallback.slug}`,
    ogTitle: null,
    ogDescription: null,
    body: null,
    signs: specialist?.signs || ["Sightings or activity", "Droppings, damage or nesting evidence", "Unusual smells, noise or bite marks"],
    risks: specialist?.risks || ["Property damage", "Health and hygiene issues", "Spread to other rooms or neighbouring areas"],
    treatment: specialist?.treatment || "Inspection, treatment recommendations and targeted follow-up where needed.",
    inspectionProcess: specialist?.inspectionProcess || "A technician checks activity, access points, property risks and customer safety requirements.",
    treatmentOptions: specialist?.treatmentOptions || ["Inspection and advice", "Targeted treatment", "Proofing and prevention", "Follow-up support"],
    preventionAdvice: specialist?.preventionAdvice || ["Remove food sources", "Seal access points", "Monitor activity", "Keep records for commercial sites"],
    ctaCopy: null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return publicMetadata({
    title: service.seoTitle,
    description: service.metaDescription,
    path: service.canonicalPath || `/services/${service.slug}`,
    ogTitle: service.ogTitle,
    ogDescription: service.ogDescription,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const sections = [
    ["Common signs", service.signs],
    ["Risks and concerns", service.risks],
    ["Treatment options", service.treatmentOptions],
    ["Prevention advice", service.preventionAdvice],
  ];
  const path = canonicalPath(service.canonicalPath || `/services/${service.slug}`);

  return (
    <PublicShell>
      <section className="bg-[var(--background-dark)] py-14 text-white">
        <div className="container-lme">
          <nav className="mb-5 text-sm text-slate-300"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / {service.name}</nav>
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
          {service.body ? (
            <section className="card p-6">
              <h2 className="text-2xl font-black">About this service</h2>
              <p className="mt-4 leading-7 text-slate-700">{service.body}</p>
            </section>
          ) : null}
          <section className="card p-6">
            <h2 className="text-2xl font-black">Inspection and treatment approach</h2>
            <p className="mt-4 leading-7 text-slate-700">{service.inspectionProcess}</p>
            <p className="mt-4 leading-7 text-slate-700">{service.treatment}</p>
          </section>
          <section className="card p-6">
            <h2 className="text-2xl font-black">Relevant locations</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {areas.slice(0, 8).map((area) => <Link className="status-pill bg-amber-50 text-amber-800" href={`/pest-control/${area.slug}`} key={area.slug}>{area.name}</Link>)}
            </div>
          </section>
        </article>
        <aside className="card h-fit p-5">
          <h2 className="text-2xl font-black">Request a quote</h2>
          <p className="mb-5 mt-1 text-sm text-slate-600">{service.ctaCopy || "This creates a lead record for follow-up."}</p>
          <QuoteForm compact presetService={{ category: "pest", name: service.name }} />
        </aside>
      </div>
      <JsonLd data={serviceSchema({ name: service.name, description: service.metaDescription, path, areas: areas.map((area) => area.name) })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.name, path }])} />
    </PublicShell>
  );
}
