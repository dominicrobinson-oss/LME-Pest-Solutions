import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { acceptQuote, declineQuote } from "@/app/admin/actions";
import { requireCustomerOwnership } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CustomerQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id }, include: { items: true, customer: true } });
  if (!quote) notFound();
  if (quote.customerId) await requireCustomerOwnership(quote.customerId);
  return (
    <PublicShell>
      <section className="container-lme py-12">
        <div className="card p-6">
          <p className="status-pill bg-lime-50 text-lime-800">{quote.status}</p>
          <h1 className="mt-4 text-3xl font-black">{quote.quoteNumber}: {quote.title}</h1>
          <p className="mt-2 text-slate-600">{quote.description}</p>
          <div className="mt-6 grid gap-3">
            {quote.items.map((item) => <div className="flex justify-between border-b border-slate-100 py-3" key={item.id}><span>{item.description}</span><b>£{Number(item.total).toFixed(2)}</b></div>)}
          </div>
          <p className="mt-6 text-2xl font-black">Total: £{Number(quote.total).toFixed(2)}</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <form action={acceptQuote} className="grid gap-3 rounded-lg bg-lime-50 p-4">
              <input type="hidden" name="quoteId" value={quote.id} />
              <input className="field" name="name" placeholder="Your name" defaultValue={quote.customer?.name || ""} />
              <input className="field" name="email" placeholder="Email" defaultValue={quote.customer?.email || ""} />
              <textarea className="field" name="comment" placeholder="Comment" />
              <button className="btn-primary" type="submit">Accept quote</button>
            </form>
            <form action={declineQuote} className="grid gap-3 rounded-lg bg-slate-50 p-4">
              <input type="hidden" name="quoteId" value={quote.id} />
              <textarea className="field" name="reason" placeholder="Reason for declining" />
              <button className="rounded-lg border border-slate-300 px-4 py-3 font-black" type="submit">Decline quote</button>
            </form>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
