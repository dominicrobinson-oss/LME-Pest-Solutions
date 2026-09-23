import type { ReactNode } from "react";
import { Camera, MessageCircle, X } from "lucide-react";
import { MobileContactBar } from "@/components/mobile-contact-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd, localBusinessSchema } from "@/lib/seo";
import { business } from "@/lib/data";
import { env } from "@/lib/env";
import { whatsappHref } from "@/lib/utils";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <JsonLd data={localBusinessSchema()} />
      <SiteFooter />
      <div className="fixed bottom-6 right-6 z-40 hidden w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl md:block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary-green)]">Need a hand?</p>
            <p className="mt-1 font-black text-slate-950">Get in touch now</p>
          </div>
          <X aria-hidden="true" className="text-slate-300" size={16} />
        </div>
        <p className="mt-2 text-sm text-slate-600">Free quote, quick advice or send us a photo.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a className="btn-primary px-2 text-sm" href={whatsappHref()}><MessageCircle size={16} /> WhatsApp</a>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-2 text-sm font-black text-slate-900" href={env.INSTAGRAM_URL || business.instagramUrl} target="_blank" rel="noreferrer"><Camera size={16} /> Instagram</a>
        </div>
        <a className="mt-2 block text-center text-sm font-black text-[var(--primary-green)]" href="/get-a-quote">Or get a free quote →</a>
      </div>
      <MobileContactBar />
    </>
  );
}
