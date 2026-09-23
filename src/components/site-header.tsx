import Link from "next/link";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { areas, business, services } from "@/lib/data";
import { businessPhoneHref } from "@/lib/utils";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#04101A] shadow-[0_6px_28px_rgba(0,0,0,0.28)]">
      <div className="container-lme flex min-h-[78px] items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-black text-white lg:flex" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1">Services <ChevronDown size={14} /></summary>
            <div className="absolute left-0 top-8 grid w-72 gap-1 rounded-lg bg-white p-3 text-slate-800 shadow-xl">
              {services.slice(0, 10).map((service) => (
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href={`/services/${service.slug}`} key={service.slug}>
                  {service.name}
                </Link>
              ))}
            </div>
          </details>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1">Areas We Cover <ChevronDown size={14} /></summary>
            <div className="absolute left-0 top-8 grid w-64 gap-1 rounded-lg bg-white p-3 text-slate-800 shadow-xl">
              {areas.slice(0, 10).map((area) => (
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href={`/pest-control/${area.slug}`} key={area.slug}>
                  {area.name}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/domestic">Domestic</Link>
          <Link href="/commercial">Commercial</Link>
          <Link href="/emergency">Emergency</Link>
          <Link href="/advice">Advice</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/customer-login">Customer Login</Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <a className="flex items-center gap-3 font-black text-white" href={businessPhoneHref(business.phone)}>
            <span className="grid size-11 place-items-center rounded-full bg-lime-600/20 text-lime-400"><Phone size={23} /></span>
            <span className="leading-tight">
              <span className="block text-base">{business.phone}</span>
              <span className="block text-xs uppercase text-lime-400">Rapid callout</span>
            </span>
          </a>
          <Link className="btn-primary min-w-40" href="/get-a-quote">
            Get a Free Quote
          </Link>
        </div>
        <details className="relative lg:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-white/20 text-white">
            <Menu aria-label="Open menu" />
          </summary>
          <nav className="absolute right-0 top-14 grid w-72 gap-2 rounded-lg bg-white p-4 text-slate-900 shadow-xl">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/areas-we-cover">Areas We Cover</Link>
            <Link href="/domestic">Domestic</Link>
            <Link href="/commercial">Commercial</Link>
            <Link href="/emergency">Emergency</Link>
            <Link href="/advice">Advice</Link>
            <Link href="/about-us">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/customer-login">Customer Login</Link>
            <Link className="btn-primary text-white" href="/get-a-quote">Get a Free Quote</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
