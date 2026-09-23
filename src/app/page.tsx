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
  HomeIcon,
  MapPin,
  MessageCircle,
  Mouse,
  Phone,
  ShieldCheck,
  Siren,
  Star,
  UsersRound,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { QuoteForm } from "@/components/quote-form";
import { areas, benefits, business, faqs, homeMaintenanceServices, pestFacts, pestServices, trustMarks, workflowSteps } from "@/lib/data";
import { publicMetadata } from "@/lib/seo";
import { env } from "@/lib/env";
import { businessPhoneHref, whatsappHref } from "@/lib/utils";

const pestIcons = [Mouse, Bug, Bed, Bug, Bug, Bug, HomeIcon, ShieldCheck];

export const metadata: Metadata = publicMetadata({
  title: "LME Pest Solutions | Pest Control Manchester & North West",
  description: "Fast, discreet and effective pest control for homes and businesses across Manchester and the North West.",
  path: "/",
});

export default function Home() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#07131D] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,26,0.98),rgba(4,16,26,0.76)_46%,rgba(4,16,26,0.46)_72%,rgba(4,16,26,0.84)),url('/brand/lme-hero.svg')] bg-cover bg-center" />
        <div className="container-lme relative grid min-h-[560px] gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-wide text-[var(--primary-green)]">Professional pest control</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Across Manchester <br />& The <span className="text-[var(--primary-green)]">North West</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-100">
              Fast, discreet and effective pest control for homes and businesses. Same-day callouts available where possible.
            </p>
            <div className="mt-7 grid gap-4 text-sm font-black text-slate-100 sm:grid-cols-4">
              {[
                ["Verified reviews only", Star],
                ["Same-day response", Clock3],
                ["Insurance if verified", ShieldCheck],
                ["Domestic & commercial", HomeIcon],
              ].map(([label, Icon]) => (
                <span className="flex items-center gap-2" key={label as string}>
                  <Icon className="text-[var(--primary-green)]" size={26} />
                  {label as string}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a className="btn-primary" href={businessPhoneHref(business.phone)}>
                <Phone size={19} /> Call {business.phone}
              </a>
              <a className="btn-secondary" href={whatsappHref()}>
                <MessageCircle size={19} /> WhatsApp Us
              </a>
              <Link className="btn-secondary" href="/get-a-quote">
                Get a Free Quote
              </Link>
            </div>
            <div className="mt-7 flex gap-3 text-sm font-bold text-slate-200">
              <MapPin className="shrink-0 text-[var(--primary-green)]" />
              <p>
                <b>Covering the whole of the North West</b>
                <br />
                Manchester · Salford · Bolton · Stockport · Wigan · Liverpool & more
              </p>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[360px] rounded-lg bg-white p-7 text-slate-950 shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <h2 className="text-3xl font-black">Get Your Free Quote</h2>
            <p className="mb-5 mt-1 text-sm text-slate-600">Quick, easy and obligation free.</p>
            <QuoteForm compact />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-lme">
          <div className="text-center">
            <h2 className="text-3xl font-black uppercase">Pests We Treat</h2>
            <div className="mx-auto mt-2 h-px w-32 bg-[var(--primary-green)]" />
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {pestServices.slice(0, 8).map((service, index) => {
              const Icon = pestIcons[index] || Bug;
              return (
                <Link
                  className="group rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-lime-500 hover:shadow-xl"
                  href={`/services/${service.slug}`}
                  key={service.slug}
                >
                  <Icon className="mx-auto size-12 text-slate-950 transition group-hover:text-[var(--primary-green)]" />
                  <h3 className="mt-4 text-base font-black uppercase text-[var(--primary-green)]">{service.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{service.intro.replace("Professional ", "").slice(0, 78)}.</p>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <Link className="inline-flex items-center gap-2 rounded-md border border-lime-700 px-6 py-3 text-sm font-black text-lime-800" href="/services">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="container-lme">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--primary-green)]">More than pest control</p>
              <h2 className="mt-2 text-3xl font-black">Home maintenance services</h2>
              <p className="mt-3 max-w-2xl text-slate-600">Practical exterior, hygiene and environmental cleaning services from the same trusted local team.</p>
            </div>
            <Link className="btn-primary" href="/get-a-quote">Ask about a service <ArrowRight size={17} /></Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {homeMaintenanceServices.map((service) => (
              <Link className="rounded-lg border border-slate-200 bg-white p-4 font-black shadow-sm transition hover:-translate-y-1 hover:border-lime-500" href={`/services/${service.slug}`} key={service.slug}>
                {service.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-lme grid gap-8 lg:grid-cols-[310px_1fr_1fr] lg:items-center">
          <div className="relative min-h-[285px] overflow-hidden rounded-lg bg-[linear-gradient(145deg,#111827,#020617)] shadow-xl">
            <div className="absolute inset-x-8 top-8 h-32 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative grid min-h-[285px] place-items-center p-5 text-white">
              <Image
                src="/brand/lme-supplied-logo-badge.png"
                alt="LME Pest Solutions Manchester based professional and reliable badge"
                width={270}
                height={286}
                className="max-h-[250px] w-auto object-contain drop-shadow-[0_14px_34px_rgba(86,190,255,0.28)]"
              />
            </div>
            <div className="absolute bottom-5 left-5 rounded-lg bg-white p-3 text-sm font-black text-slate-950 shadow-xl">
              <span className="text-[var(--primary-green)]">Reviews</span>
              <br />
              Shown only when verified
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase text-[var(--primary-green)]">Local experts. Proven process.</p>
            <h2 className="mt-2 text-4xl font-black">Why Choose LME?</h2>
            <p className="mt-4 leading-7 text-slate-700">
              We are a local pest control team focused on quick response, honest pricing and properly recorded treatments for homes and businesses across the North West.
            </p>
            <div className="mt-5 grid gap-2">
              {benefits.slice(0, 6).map((benefit) => (
                <span className="flex items-center gap-2 text-sm font-bold" key={benefit}>
                  <CheckCircle2 className="text-[var(--primary-green)]" size={18} /> {benefit}
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
                <Icon className="size-12 text-[var(--primary-green)]" />
                <h3 className="mt-4 font-black">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-lme rounded-lg bg-[#04101A] py-6 text-white shadow-xl">
        <div className="grid gap-4 px-6 text-center md:grid-cols-5">
          {[
            ["Years Experience", "Hidden", UsersRound],
            ["Properties Protected", "Live data", HomeIcon],
            ["5-Star Reviews", "Verified only", Star],
            ["First Visit Success", "Not claimed", Clock3],
            ["Insurance", "If verified", ShieldCheck],
          ].map(([label, value, Icon]) => (
            <div className="border-white/10 px-4 md:border-r last:border-0" key={label as string}>
              <Icon className="mx-auto size-10 text-[var(--primary-green)]" />
              <p className="mt-2 text-2xl font-black">{value as string}</p>
              <p className="text-xs font-bold text-slate-300">{label as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="container-lme grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[330px] overflow-hidden rounded-lg bg-[#07131D] shadow-xl">
            <Image src="/brand/lme-hero.svg" alt="LME Pest Solutions service artwork" fill className="object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#04101A] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 max-w-sm text-white">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--primary-green)]">LME field notes</p>
              <h2 className="mt-2 text-3xl font-black">Small signs can point to bigger problems.</h2>
              <p className="mt-3 text-slate-200">Send a photo on WhatsApp and we can help you understand the next best step.</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--primary-green)]">Useful facts</p>
            <h2 className="mt-2 text-3xl font-black">Know what to look for</h2>
            <div className="mt-5 grid gap-3">
              {pestFacts.map(([title, copy]) => (
                <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={title}>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-10">
        <div className="container-lme grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--primary-green)]">Professional standards</p>
            <h2 className="mt-2 text-3xl font-black">Trust matters when work is in your home or business.</h2>
            <p className="mt-3 text-slate-600">RSPH and BPCA accreditation details can be verified with LME before booking. Official supplied artwork can be added here when provided.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {trustMarks.map(([mark, label]) => (
              <div className="flex items-center gap-4 rounded-lg border-2 border-[#B89A63] bg-[#07131D] p-5 text-white shadow-sm" key={mark}>
                <span className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-[#D6B778] text-xl font-black text-[#D6B778]">{mark}</span>
                <div>
                  <h3 className="font-black">{mark} badge</h3>
                  <p className="mt-1 text-sm text-slate-300">{label}</p>
                </div>
              </div>
            ))}
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
                  <span className="mx-auto grid size-8 place-items-center rounded-full bg-[var(--primary-green)] text-sm font-black text-white">{index + 1}</span>
                  <p className="mt-3 text-sm font-black">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black uppercase">What Our Customers Say</h2>
            <p className="mt-4 text-slate-600">See the latest customer feedback on Google, or ask LME for review details before booking.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="btn-primary" href={env.GOOGLE_REVIEWS_URL || business.googleReviewsUrl} target="_blank" rel="noreferrer"><Star size={17} /> Google reviews</a>
              <Link className="btn-secondary border-slate-300 text-slate-900" href="/reviews">Verified reviews</Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black uppercase">Areas We Cover</h2>
            <p className="mt-3 text-sm text-slate-600">Coverage can be activated or deactivated in admin.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {areas.slice(0, 12).map((area) => (
                <Link className="flex items-center gap-2 font-bold" href={`/pest-control/${area.slug}`} key={area.slug}>
                  <CheckCircle2 size={15} className="text-[var(--primary-green)]" /> {area.name}
                </Link>
              ))}
            </div>
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[var(--primary-green)]" href="/areas-we-cover">
              View all areas <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#04101A] py-8 text-white">
        <div className="container-lme grid gap-6 lg:grid-cols-[1fr_260px_1fr] lg:items-center">
          <div className="flex items-center gap-5">
            <Siren className="size-16 shrink-0 text-[var(--primary-green)]" />
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
                <CheckCircle2 className="text-[var(--primary-green)]" size={18} /> {item}
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
    </PublicShell>
  );
}

function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--primary-green)]">{eyebrow}</p>
      <h2 className={`mt-2 text-3xl font-black sm:text-4xl ${light ? "text-white" : "text-slate-950"}`}>{title}</h2>
    </div>
  );
}
