import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { areas, homeMaintenanceServices, services } from "@/lib/data";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-[0_6px_28px_rgba(15,23,42,0.06)]">
      <div className="container-lme flex min-h-[96px] flex-wrap items-center justify-between gap-3 py-2">
        <Logo />
        <nav className="hidden flex-wrap items-center gap-4 text-sm font-black text-slate-800 lg:flex xl:gap-5" aria-label="Main navigation">
          <Link className="hover:text-[var(--primary-gold-hover)]" href="/">Home</Link>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-[var(--primary-gold-hover)]">Services <ChevronDown size={14} /></summary>
            <div className="absolute left-0 top-8 grid w-72 gap-1 rounded-lg bg-white p-3 text-slate-800 shadow-xl">
              {services.slice(0, 10).map((service) => (
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href={`/services/${service.slug}`} key={service.slug}>
                  {service.name}
                </Link>
              ))}
            </div>
          </details>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-[var(--primary-gold-hover)]">Home Maintenance <ChevronDown size={14} /></summary>
            <div className="absolute left-0 top-8 grid w-72 gap-1 rounded-lg bg-white p-3 text-slate-800 shadow-xl">
              {homeMaintenanceServices.slice(0, 10).map((service) => (
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href={`/home-maintenance/${service.slug}`} key={service.slug}>
                  {service.name}
                </Link>
              ))}
            </div>
          </details>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-[var(--primary-gold-hover)]">Areas We Cover <ChevronDown size={14} /></summary>
            <div className="absolute left-0 top-8 grid w-64 gap-1 rounded-lg bg-white p-3 text-slate-800 shadow-xl">
              {areas.slice(0, 10).map((area) => (
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href={`/pest-control/${area.slug}`} key={area.slug}>
                  {area.name}
                </Link>
              ))}
            </div>
          </details>
          <Link className="hover:text-[var(--primary-gold-hover)]" href="/domestic">Domestic</Link>
          <Link className="hover:text-[var(--primary-gold-hover)]" href="/commercial">Commercial</Link>
          <Link className="hover:text-[var(--primary-gold-hover)]" href="/emergency">Emergency</Link>
          <Link className="hover:text-[var(--primary-gold-hover)]" href="/advice">Advice</Link>
          <Link className="hover:text-[var(--primary-gold-hover)]" href="/about-us">About Us</Link>
          <Link className="hover:text-[var(--primary-gold-hover)]" href="/contact">Contact</Link>
        </nav>
        <details className="relative lg:hidden">
          <summary aria-label="Open menu" className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-slate-300 text-slate-800">
            <Menu aria-hidden="true" />
          </summary>
          <nav className="absolute right-0 top-14 grid w-72 gap-2 rounded-lg bg-white p-4 text-slate-900 shadow-xl">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/home-maintenance">Home Maintenance</Link>
            <Link href="/areas-we-cover">Areas We Cover</Link>
            <Link href="/domestic">Domestic</Link>
            <Link href="/commercial">Commercial</Link>
            <Link href="/emergency">Emergency</Link>
            <Link href="/advice">Advice</Link>
            <Link href="/about-us">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link className="btn-primary text-white" href="/get-a-quote">Get a Free Quote</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
