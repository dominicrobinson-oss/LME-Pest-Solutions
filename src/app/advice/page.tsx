import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PublicShell } from "@/components/public-shell";
import { adviceArticles } from "@/lib/data";
import { prisma } from "@/lib/db";
import { publicMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = publicMetadata({
  title: "Pest Control Advice | LME Pest Solutions",
  description: "Helpful pest control advice and preparation guides from LME Pest Solutions.",
  path: "/advice",
});

async function getArticles() {
  try {
    const pages = await prisma.contentPage.findMany({
      where: { status: "PUBLISHED", slug: { startsWith: "advice-" } },
      orderBy: { updatedAt: "desc" },
      select: { title: true, slug: true, metaDescription: true, updatedAt: true },
    });
    if (pages.length) {
      return pages.map((page) => ({
        title: page.title,
        slug: page.slug.replace(/^advice-/, ""),
        description: page.metaDescription,
        updatedAt: page.updatedAt,
      }));
    }
  } catch {
    // Keep the public advice hub available during empty database preview builds.
  }
  return adviceArticles.map((article) => ({ ...article, updatedAt: null }));
}

export default async function AdvicePage() {
  const articles = await getArticles();
  return (
    <PublicShell>
      <PageHero title="Pest Control Advice" copy="Practical guides for preparing, spotting pest activity and keeping useful treatment records." />
      <section className="container-lme grid gap-4 py-14 md:grid-cols-3">
        {articles.map((article) => (
          <Link className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg" href={`/advice/${article.slug}`} key={article.slug}>
            <h2 className="text-xl font-black">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{article.description}</p>
            <p className="mt-5 text-sm font-black text-[var(--primary-gold)]">Read guide</p>
          </Link>
        ))}
      </section>
    </PublicShell>
  );
}
