import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { areas, services } from "@/lib/data";

export default function SitemapPage() {
  return (
    <PublicShell>
      <PageHero title="Sitemap" copy="Public pages and SEO-friendly service/location routes." />
      <div className="container-lme grid gap-8 py-14 md:grid-cols-2">
        <section className="card p-6"><h2 className="font-black">Services</h2><div className="mt-4 grid gap-2">{services.map((s) => <Link href={`/services/${s.slug}`} key={s.slug}>{s.name}</Link>)}</div></section>
        <section className="card p-6"><h2 className="font-black">Areas</h2><div className="mt-4 grid gap-2">{areas.map((a) => <Link href={`/pest-control/${a.slug}`} key={a.slug}>{a.name}</Link>)}</div></section>
      </div>
    </PublicShell>
  );
}
