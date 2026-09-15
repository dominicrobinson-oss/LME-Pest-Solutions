import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { PublicShell } from "@/components/public-shell";
import { adviceArticles } from "@/lib/data";
import { prisma } from "@/lib/db";
import { breadcrumbSchema, JsonLd, publicMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return adviceArticles.map((article) => ({ slug: article.slug }));
}

async function getArticle(slug: string) {
  try {
    const page = await prisma.contentPage.findUnique({ where: { slug: `advice-${slug}` } });
    if (page?.status === "PUBLISHED") {
      return {
        title: page.title,
        description: page.metaDescription,
        body: page.body,
        slug,
        canonicalPath: page.canonicalPath || `/advice/${slug}`,
        ogTitle: page.ogTitle,
        ogDescription: page.ogDescription,
      };
    }
  } catch {
    // Static fallback keeps the page buildable without a database connection.
  }
  const fallback = adviceArticles.find((article) => article.slug === slug);
  return fallback ? { ...fallback, canonicalPath: `/advice/${fallback.slug}`, ogTitle: null, ogDescription: null } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return publicMetadata({
    title: article.ogTitle || `${article.title} | LME Pest Solutions`,
    description: article.ogDescription || article.description,
    path: article.canonicalPath,
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
  });
}

export default async function AdviceDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  return (
    <PublicShell>
      <PageHero title={article.title} copy={article.description} />
      <article className="container-lme max-w-3xl py-14">
        <div className="prose prose-slate max-w-none">
          {article.body.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <Link className="btn-outline mt-8 inline-flex" href="/advice">Back to advice</Link>
      </article>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Advice", path: "/advice" }, { name: article.title, path: article.canonicalPath }])} />
    </PublicShell>
  );
}
