import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Building2, CheckCircle2, Clock, Home, ShieldCheck } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { PublicShell } from "@/components/public-shell";
import { business } from "@/lib/data";
import { businessPhoneHref, whatsappHref } from "@/lib/utils";

type LandingPageProps = {
  eyebrow: string;
  title: string;
  copy: string;
  audience: string[];
  services: string[];
  process: string[];
  icon: "home" | "building" | "emergency";
};

const icons: Record<LandingPageProps["icon"], LucideIcon> = {
  home: Home,
  building: Building2,
  emergency: AlertTriangle,
};

export function LandingPage({ eyebrow, title, copy, audience, services, process, icon }: LandingPageProps) {
  const Icon = icons[icon];
  return (
    <PublicShell>
      <section className="bg-[#07131d] text-white">
        <div className="container-lme grid gap-10 py-14 lg:grid-cols-[1fr_420px] lg:py-20">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--primary-gold)]">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">{copy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn-primary" href={businessPhoneHref(business.phone)}>Call {business.phone}</a>
              <a className="btn-secondary" href={whatsappHref()}>WhatsApp us</a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Tracked enquiry", "Clear treatment notes", "Follow-up where needed"].map((item) => (
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200" key={item}>
                  <CheckCircle2 className="text-[var(--primary-gold)]" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 text-slate-950">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-lg bg-amber-50 text-[var(--primary-gold)]"><Icon /></span>
              <div>
                <p className="text-sm font-black uppercase text-slate-500">Request help</p>
                <h2 className="text-xl font-black">Free quote enquiry</h2>
              </div>
            </div>
            <QuoteForm compact />
          </div>
        </div>
      </section>
      <section className="container-lme grid gap-5 py-14 lg:grid-cols-3">
        <InfoPanel title="Best for" items={audience} icon={ShieldCheck} />
        <InfoPanel title="Services included" items={services} icon={CheckCircle2} />
        <InfoPanel title="How it works" items={process} icon={Clock} />
      </section>
      <section className="bg-slate-50 py-14">
        <div className="container-lme grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--primary-gold)]">No invented claims</p>
            <h2 className="mt-2 text-3xl font-black">Configured for honest, local pest control content</h2>
            <p className="mt-4 max-w-3xl text-slate-600">
              Reviews, accreditations, statistics and insurance badges stay hidden until verified in admin settings. This keeps the public site useful without making claims the business has not approved.
            </p>
          </div>
          <Link className="btn-primary self-start" href="/get-a-quote">Start a full quote</Link>
        </div>
      </section>
    </PublicShell>
  );
}

function InfoPanel({ title, items, icon: Icon }: { title: string; items: string[]; icon: LucideIcon }) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-amber-50 text-[var(--primary-gold)]"><Icon size={22} /></span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700">
        {items.map((item) => (
          <div className="flex gap-2" key={item}>
            <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--primary-gold)]" size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
