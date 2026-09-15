import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";

export function PolicyPage({ title }: { title: string }) {
  return (
    <PublicShell>
      <PageHero title={title} copy="Editable legal and business policy content. Replace with reviewed, business-specific text before production launch." />
      <article className="container-lme py-14">
        <div className="card max-w-3xl p-6 leading-7 text-slate-700">
          This policy page is a structured placeholder for reviewed business content. Do not treat it as legal advice or a final compliance document.
        </div>
      </article>
    </PublicShell>
  );
}
