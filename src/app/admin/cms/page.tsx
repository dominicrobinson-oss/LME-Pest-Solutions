import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { saveContentPage, saveLocationContent, saveServiceContent } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CmsAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const [pages, services, locations, reviews, faqs] = await Promise.all([
    prisma.contentPage.findMany({ orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.service.findMany({ orderBy: { name: "asc" }, take: 40 }),
    prisma.locationPage.findMany({ orderBy: { locationName: "asc" }, take: 40 }),
    prisma.review.findMany({ orderBy: { reviewDate: "desc" }, take: 10 }),
    prisma.fAQ.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }], take: 20 }),
  ]);

  return (
    <AdminShell title="Content Management" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Content pages" value={String(pages.length)} />
        <MetricCard label="Services" value={String(services.length)} />
        <MetricCard label="Location pages" value={String(locations.length)} />
        <MetricCard label="Verified reviews" value={String(reviews.filter((review) => review.verified).length)} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="grid gap-5">
          <section className="card p-5">
            <h3 className="text-xl font-black">Editable pages</h3>
            <DataTable headers={["Slug", "Title", "Status", "Meta"]}>
              {pages.map((page) => (
                <tr key={page.id}>
                  <Td>{page.slug}</Td>
                  <Td>{page.title}</Td>
                  <Td><span className="status-pill bg-lime-50 text-lime-800">{page.status}</span></Td>
                  <Td>{page.metaTitle}<br /><span className="text-slate-500">{page.metaDescription}</span></Td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="card p-5">
            <h3 className="text-xl font-black">Services</h3>
            <DataTable headers={["Service", "Slug", "Status", "Intro"]}>
              {services.map((service) => (
                <tr key={service.id}>
                  <Td>{service.name}</Td>
                  <Td>{service.slug}</Td>
                  <Td><span className="status-pill bg-lime-50 text-lime-800">{service.status}</span></Td>
                  <Td>{service.intro}</Td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="card p-5">
            <h3 className="text-xl font-black">Location coverage</h3>
            <DataTable headers={["Location", "Region", "Status", "Services"]}>
              {locations.map((location) => (
                <tr key={location.id}>
                  <Td>{location.locationName}<br /><span className="text-slate-500">{location.slug}</span></Td>
                  <Td>{location.countyOrRegion}</Td>
                  <Td><span className="status-pill bg-lime-50 text-lime-800">{location.status}</span></Td>
                  <Td>{location.availableServices.join(", ") || "Not set"}</Td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="card p-5">
            <h3 className="text-xl font-black">FAQs awaiting editorial review</h3>
            <div className="mt-3 grid gap-3">
              {faqs.map((faq) => (
                <div className="rounded-lg bg-slate-50 p-3 text-sm" key={faq.id}>
                  <b>{faq.category}</b> · {faq.question}
                  <p className="mt-1 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <div className="grid gap-5">
          <AdminForm title="Save content page">
            <form action={saveContentPage} className="grid gap-3">
              <input className="field" name="slug" placeholder="slug, e.g. privacy-policy" />
              <input className="field" name="title" placeholder="Page title" />
              <input className="field" name="metaTitle" placeholder="SEO title" />
              <textarea className="field" name="metaDescription" placeholder="SEO description" />
              <input className="field" name="canonicalPath" placeholder="Canonical path, e.g. /privacy-policy" />
              <input className="field" name="ogTitle" placeholder="Open Graph title" />
              <textarea className="field" name="ogDescription" placeholder="Open Graph description" />
              <textarea className="field min-h-40" name="body" placeholder="Page body" />
              <select className="field" name="status" defaultValue="DRAFT"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
              <button className="btn-primary" type="submit">Save page</button>
            </form>
          </AdminForm>

          <AdminForm title="Save service">
            <form action={saveServiceContent} className="grid gap-3">
              <input className="field" name="name" placeholder="Service name" />
              <input className="field" name="slug" placeholder="service-slug" />
              <input className="field" name="seoTitle" placeholder="SEO title" />
              <textarea className="field" name="metaDescription" placeholder="Meta description" />
              <input className="field" name="canonicalPath" placeholder="Canonical path, e.g. /services/rat-control" />
              <input className="field" name="ogTitle" placeholder="Open Graph title" />
              <textarea className="field" name="ogDescription" placeholder="Open Graph description" />
              <textarea className="field" name="intro" placeholder="Intro copy" />
              <textarea className="field min-h-32" name="body" placeholder="Detailed service body copy" />
              <input className="field" name="signs" placeholder="Signs, comma separated" />
              <input className="field" name="risks" placeholder="Risks, comma separated" />
              <textarea className="field" name="treatment" placeholder="Treatment approach" />
              <textarea className="field" name="inspectionProcess" placeholder="Inspection process" />
              <input className="field" name="treatmentOptions" placeholder="Treatment options, comma separated" />
              <input className="field" name="preventionAdvice" placeholder="Prevention advice, comma separated" />
              <textarea className="field" name="ctaCopy" placeholder="Quote form CTA copy" />
              <select className="field" name="status" defaultValue="PUBLISHED"><option>PUBLISHED</option><option>DRAFT</option><option>ARCHIVED</option></select>
              <button className="btn-primary" type="submit">Save service</button>
            </form>
          </AdminForm>

          <AdminForm title="Save location page">
            <form action={saveLocationContent} className="grid gap-3">
              <input className="field" name="locationName" placeholder="Location name" />
              <input className="field" name="slug" placeholder="location-slug" />
              <input className="field" name="countyOrRegion" placeholder="County/region" />
              <input className="field" name="pageTitle" placeholder="Page title" />
              <input className="field" name="metaTitle" placeholder="Meta title" />
              <textarea className="field" name="metaDescription" placeholder="Meta description" />
              <input className="field" name="canonicalPath" placeholder="Canonical path, e.g. /pest-control/manchester" />
              <input className="field" name="ogTitle" placeholder="Open Graph title" />
              <textarea className="field" name="ogDescription" placeholder="Open Graph description" />
              <textarea className="field" name="heroCopy" placeholder="Hero copy" />
              <textarea className="field" name="localIntro" placeholder="Local intro" />
              <textarea className="field min-h-36" name="mainContent" placeholder="Unique local content" />
              <input className="field" name="commonPestIssues" placeholder="Common local pest issues, comma separated" />
              <textarea className="field" name="residentialNotes" placeholder="Residential local notes" />
              <textarea className="field" name="commercialNotes" placeholder="Commercial local notes" />
              <input className="field" name="nearbyAreas" placeholder="Nearby areas, comma separated" />
              <input className="field" name="availableServices" placeholder="Available services, comma separated" />
              <textarea className="field" name="ctaCopy" placeholder="Location quote CTA copy" />
              <label className="text-sm font-bold"><input name="activeCoverage" type="checkbox" defaultChecked /> Active coverage</label>
              <select className="field" name="status" defaultValue="PUBLISHED"><option>PUBLISHED</option><option>DRAFT</option><option>ARCHIVED</option></select>
              <button className="btn-primary" type="submit">Save location</button>
            </form>
          </AdminForm>
        </div>
      </div>
    </AdminShell>
  );
}
