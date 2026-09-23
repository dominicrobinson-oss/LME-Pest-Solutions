import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Bed,
  Bug,
  CheckCircle2,
  Clock3,
  Droplets,
  HomeIcon,
  Lightbulb,
  MapPin,
  MessageCircle,
  Mouse,
  Phone,
  Rat,
  ShieldCheck,
  Siren,
  Sparkles,
  Squirrel,
  Star,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { QuoteForm } from "@/components/quote-form";
import { TrustBadges } from "@/components/trust-badges";
import { HeroStats } from "@/components/hero-stats";
import { TrustPartners } from "@/components/trust-partners";
import { areas, benefits, business, faqs, homeMaintenanceServices, pestFacts, services, workflowSteps } from "@/lib/data";
import { publicMetadata } from "@/lib/seo";
import { businessPhoneHref, whatsappHref } from "@/lib/utils";

const pestIcons = [Rat, Mouse, Squirrel, Bug, Bug, Bed, Bug, Bug];

export const metadata: Metadata = publicMetadata({
  title: "LME Pest Solutions | Pest Control Manchester & North West",
  description: "Fast, discreet and effective pest control for homes and businesses across Manchester and the North West.",
  path: "/",
});

export default function Home() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#07131D] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,26,1)_0%,rgba(4,16,26,0.98)_58%,rgba(4,16,26,0.55)_78%,rgba(4,16,26,0.75)_100%),url('/brand/lme-hero.svg')] bg-cover bg-center" />
        <div className="absolute right-6 top-6 z-10 hidden flex-col items-end gap-3 sm:flex">
          <span className="flex items-center gap-2 rounded-full bg-[var(--danger)] px-4 py-2 text-xs font-black uppercase shadow-lg">
            <Siren size={14} /> 24/7 Emergency
          </span>
          <div className="rounded-lg bg-white px-4 py-3 text-center text-slate-950 shadow-xl">
            <div className="flex justify-center gap-0.5 text-[var(--primary-gold)]">
              {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}
            </div>
            <p className="mt-1 text-xs font-black">5-Star Google Reviews</p>
          </div>
        </div>
        <div className="container-lme relative flex min-h-[520px] items-center py-12">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-black uppercase tracking-wide text-[var(--primary-gold)]">Professional pest control</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Across Manchester <br />& The <span className="text-[var(--primary-gold)]">North West</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-100">
              Fast, discreet and effective pest control for homes and businesses. Same-day callouts available where possible.
            </p>
            <div className="mt-7 grid gap-4 text-sm font-black text-slate-100 sm:grid-cols-4">
              {[
                ["Same-day response", Clock3],
                ["Domestic & commercial", HomeIcon],
                ["Free site survey", CheckCircle2],
                ["No hidden fees", BadgeCheck],
              ].map(([label, Icon]) => (
                <span className="flex items-center gap-2" key={label as string}>
                  <Icon className="text-[var(--primary-gold)]" size={26} />
                  {label as string}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <TrustBadges dark />
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link className="btn-primary bg-[var(--danger)] shadow-[0_14px_30px_rgba(214,69,69,0.35)] hover:bg-[#b93a3a]" href="/get-a-quote">
                Get a Free Quote
              </Link>
              <a className="btn-secondary" href={businessPhoneHref(business.phone)}>
                <Phone size={19} /> Call {business.phone}
              </a>
              <a className="btn-secondary" href={whatsappHref()}>
                <MessageCircle size={19} /> WhatsApp Us
              </a>
            </div>
            <div className="mt-7 flex gap-3 text-sm font-bold text-slate-200">
              <MapPin className="shrink-0 text-[var(--primary-gold)]" />
              <p>
                <b>Covering the whole of the North West</b>
                <br />
                Manchester · Salford · Bolton · Stockport · Wigan · Liverpool & more
              </p>
            </div>
          </div>
        </div>
      </section>

      <HeroStats />

      <section className="py-10">
        <div className="container-lme grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-3xl font-black uppercase">Pests We Treat</h2>
            <div className="mt-2 h-px w-32 bg-[var(--primary-gold)]" />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 8).map((service, index) => {
                const Icon = pestIcons[index] || Bug;
                return (
                  <Link
                    className="group rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-amber-500 hover:shadow-xl"
                    href={`/services/${service.slug}`}
                    key={service.slug}
                  >
                    <Icon className="mx-auto size-12 text-slate-950 transition group-hover:text-[var(--primary-gold)]" />
                    <h3 className="mt-4 text-base font-black uppercase text-[var(--primary-gold)]">{service.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{service.intro.replace("Professional ", "").slice(0, 78)}.</p>
                  </Link>
                );
              })}
              <Link
                className="group rounded-lg border border-[var(--danger)] bg-[var(--danger)] p-5 text-center text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                href="/emergency"
              >
                <Siren className="mx-auto size-12" />
                <h3 className="mt-4 text-base font-black uppercase">Emergency Callouts</h3>
                <p className="mt-2 text-sm leading-6 text-white/90">24/7 rapid response where available.</p>
              </Link>
            </div>
            <div className="mt-6 text-center">
              <Link className="inline-flex items-center gap-2 rounded-md border border-amber-700 px-6 py-3 text-sm font-black text-amber-800" href="/services">
                View All Services <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="h-fit rounded-lg bg-white p-6 text-slate-950 shadow-[0_18px_50px_rgba(7,19,29,0.12)]">
            <h2 className="text-2xl font-black">Get Your Free Quote</h2>
            <p className="mb-5 mt-1 text-sm text-slate-600">Quick, easy and obligation free.</p>
            <QuoteForm compact />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-lme grid gap-8 lg:grid-cols-[310px_1fr_1fr] lg:items-center">
          <div className="relative min-h-[285px] overflow-hidden rounded-lg bg-[linear-gradient(145deg,#111827,#020617)] shadow-xl">
            <div className="absolute inset-x-8 top-8 h-32 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative grid min-h-[285px] place-items-center p-5 text-white">
              <Image
                src="/brand/lme-gold-badge.png"
                alt="LME Pest Solutions Manchester based professional and reliable badge"
                width={270}
                height={286}
                className="max-h-[250px] w-auto object-contain drop-shadow-[0_14px_34px_rgba(200,162,74,0.28)]"
              />
            </div>
            <div className="absolute bottom-5 left-5 rounded-lg bg-white p-3 text-sm font-black text-slate-950 shadow-xl">
              <span className="text-[var(--primary-gold)]">RSPH Certified</span>
              <br />
              BPCA Member
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase text-[var(--primary-gold)]">Local experts. Proven process.</p>
            <h2 className="mt-2 text-4xl font-black">Why Choose LME?</h2>
            <p className="mt-4 leading-7 text-slate-700">
              We are a local pest control team focused on quick response, honest pricing and properly recorded treatments for homes and businesses across the North West.
            </p>
            <div className="mt-5 grid gap-2">
              {benefits.slice(0, 6).map((benefit) => (
                <span className="flex items-center gap-2 text-sm font-bold" key={benefit}>
                  <CheckCircle2 className="text-[var(--primary-gold)]" size={18} /> {benefit}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Rapid Response", "Same-day appointments available where possible.", Clock3],
              ["Expert Treatments", "Modern equipment and recorded treatment methods.", ShieldCheck],
              ["Honest Pricing", "Free quotes with clear line items.", BadgeCheck],
              ["Local & Trusted", "Proudly serving the North West.", MapPin],
            ].map(([title, copy, Icon]) => (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={title as string}>
                <Icon className="size-12 text-[var(--primary-gold)]" />
                <h3 className="mt-4 font-black">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-10">
        <div className="container-lme grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-amber-50 text-[var(--primary-gold)]"><Lightbulb size={22} /></span>
              <h2 className="text-xl font-black uppercase">Did You Know?</h2>
            </div>
            <ul className="mt-4 grid gap-3 text-sm text-slate-700">
              {pestFacts.slice(0, 4).map((fact) => (
                <li className="flex gap-2" key={fact}>
                  <Sparkles className="mt-0.5 shrink-0 text-[var(--primary-gold)]" size={16} />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(145deg,#0f2a12,#07131d)] p-6 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-white/10 text-[var(--primary-gold)]"><Droplets size={22} /></span>
              <h2 className="text-xl font-black uppercase">Home Maintenance Too</h2>
            </div>
            <p className="mt-4 text-slate-300">
              Beyond pest control, we cover gutter clearance, powerwashing, window cleaning, masonry restoration and more for homes and landlords across the North West.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-slate-200">
              {homeMaintenanceServices.slice(0, 6).map((service) => (
                <span className="rounded-full bg-white/10 px-3 py-1" key={service.slug}>{service.name}</span>
              ))}
            </div>
            <Link className="btn-primary mt-5 inline-flex" href="/home-maintenance">
              View Home Maintenance Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-lme grid gap-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-black uppercase">How It Works</h2>
            <ol className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-6">
              {workflowSteps.map((step, index) => (
                <li className="text-center" key={step}>
                  <span className="mx-auto grid size-8 place-items-center rounded-full bg-[var(--primary-gold)] text-sm font-black text-white">{index + 1}</span>
                  <p className="mt-3 text-sm font-black">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black uppercase">What Our Customers Say</h2>
            <div className="mt-4 flex items-center gap-1 text-[var(--primary-gold)]">
              {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={20} fill="currentColor" />)}
            </div>
            <p className="mt-3 text-slate-600">Rated 5 stars on Google. Individual review quotes appear here once published in admin settings.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black uppercase">Areas We Cover</h2>
            <p className="mt-3 text-sm text-slate-600">Coverage can be activated or deactivated in admin.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {areas.slice(0, 12).map((area) => (
                <Link className="flex items-center gap-2 font-bold" href={`/pest-control/${area.slug}`} key={area.slug}>
                  <CheckCircle2 size={15} className="text-[var(--primary-gold)]" /> {area.name}
                </Link>
              ))}
            </div>
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[var(--primary-gold)]" href="/areas-we-cover">
              View all areas <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#04101A] py-8 text-white">
        <div className="container-lme grid gap-6 lg:grid-cols-[1fr_260px_1fr] lg:items-center">
          <div className="flex items-center gap-5">
            <Siren className="size-16 shrink-0 text-[var(--primary-gold)]" />
            <div>
              <h2 className="text-3xl font-black">Pest Emergency?</h2>
              <p className="mt-2 text-slate-300">Call now for rapid response across the North West where available.</p>
            </div>
          </div>
          <a className="btn-primary" href={businessPhoneHref(business.phone)}>
            <Phone size={20} /> Call {business.phone}
          </a>
          <div className="grid gap-2 text-sm font-bold">
            {["Same-day callouts where available", "Fast response", "Local technicians"].map((item) => (
              <span className="flex items-center gap-2" key={item}>
                <CheckCircle2 className="text-[var(--primary-gold)]" size={18} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-lme">
          <SectionTitle eyebrow="FAQ" title="Common questions" />
          <div className="mt-6 grid gap-3">
            {faqs.map((faq) => (
              <details className="card p-4" key={faq.question}>
                <summary className="cursor-pointer font-black">{faq.question}</summary>
                <p className="mt-3 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <TrustPartners />
    </PublicShell>
  );
}

function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--primary-gold)]">{eyebrow}</p>
      <h2 className={`mt-2 text-3xl font-black sm:text-4xl ${light ? "text-white" : "text-slate-950"}`}>{title}</h2>
    </div>
  );
}
