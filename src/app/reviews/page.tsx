import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { prisma } from "@/lib/db";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Reviews",
  description: "Verified LME Pest Solutions reviews. Unverified claims remain hidden until approved.",
  path: "/reviews",
});

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { verified: true, status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { reviewDate: "desc" }],
    take: 20,
  });

  return (
    <PublicShell>
      <PageHero title="Reviews" copy="Only verified and published review records are shown here." />
      <div className="container-lme grid gap-5 py-14 md:grid-cols-2">
        {reviews.length ? reviews.map((review) => (
          <article className="card p-5" key={review.id}>
            <p className="text-sm font-black text-[var(--primary-gold)]">{review.source || "Verified review"}</p>
            <h2 className="mt-2 text-xl font-black">{review.customerName}</h2>
            <p className="mt-1 text-sm text-slate-500">{review.location || "Location hidden"} · {review.rating}/5</p>
            <p className="mt-4 text-slate-700">{review.content}</p>
          </article>
        )) : (
          <div className="card p-6 md:col-span-2">No public reviews are displayed until verified review records are published in the CMS.</div>
        )}
      </div>
    </PublicShell>
  );
}
