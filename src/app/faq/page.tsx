import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { faqs as fallbackFaqs } from "@/lib/data";
import { prisma } from "@/lib/db";
import { JsonLd, faqPageSchema, publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Frequently Asked Questions",
  description: "Frequently asked questions about LME Pest Solutions enquiries, treatments and commercial support.",
  path: "/faq",
});

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const cmsFaqs = await prisma.fAQ.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ category: "asc" }, { order: "asc" }] });
  const faqs = cmsFaqs.length ? cmsFaqs : fallbackFaqs.map((faq, index) => ({ id: String(index), category: "General", ...faq }));

  return (
    <PublicShell>
      <PageHero title="Frequently Asked Questions" copy="Answers are CMS-backed where records are published, with safe fallback copy for development." />
      <div className="container-lme grid gap-4 py-14">
        {faqs.map((faq) => (
          <details className="card p-5" key={faq.id}>
            <summary className="cursor-pointer font-black">{faq.question}</summary>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--primary-green)]">{faq.category}</p>
            <p className="mt-3 text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqPageSchema(faqs)} />
    </PublicShell>
  );
}
