import Link from "next/link";
import Image from "next/image";
import { Camera, Mail, MapPin, Phone, Star } from "lucide-react";
import { areas, business, services } from "@/lib/data";
import { env } from "@/lib/env";

export function SiteFooter() {
  return (
    <footer className="bg-[#04101A] pb-20 pt-14 text-white md:pb-10">
      <div className="container-lme grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_1.2fr]">
        <div className="space-y-4">
          <Image
            src="/brand/lme-supplied-logo-badge.png"
            alt="LME Pest Solutions"
            width={132}
            height={140}
            className="h-24 w-auto object-contain drop-shadow-[0_6px_18px_rgba(86,190,255,0.25)]"
          />
          <p className="text-sm text-slate-300">Professional pest control enquiries across Manchester and North West England.</p>
          <div className="flex gap-3 text-slate-300" aria-label="Social links">
            <a href={env.INSTAGRAM_URL || business.instagramUrl} target="_blank" rel="noreferrer" aria-label="LME Pest Solutions on Instagram"><Camera size={18} /></a>
            <a href={env.GOOGLE_REVIEWS_URL || business.googleReviewsUrl} target="_blank" rel="noreferrer" aria-label="LME Pest Solutions Google reviews"><Star size={18} /></a>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-black">Services</h3>
          <div className="grid gap-2 text-sm text-slate-300">
            {services.slice(0, 7).map((service) => <Link href={`/services/${service.slug}`} key={service.slug}>{service.name}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-black">Areas Covered</h3>
          <div className="grid gap-2 text-sm text-slate-300">
            {areas.slice(0, 7).map((area) => <Link href={`/pest-control/${area.slug}`} key={area.slug}>{area.name}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-black">Quick Links</h3>
          <div className="grid gap-2 text-sm text-slate-300">
            <Link href="/get-a-quote">Get a Quote</Link>
            <Link href="/domestic">Domestic Pest Control</Link>
            <Link href="/commercial">Commercial Pest Control</Link>
            <Link href="/emergency">Emergency Pest Control</Link>
            <Link href="/advice">Advice</Link>
            <Link href="/customer-login">Customer Login</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
            <Link href="/terms-and-conditions">Terms and Conditions</Link>
            <Link href="/complaints-policy">Complaints Policy</Link>
            <Link href="/admin" rel="nofollow">Staff</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-black">Contact Us</h3>
          <div className="grid gap-3 text-sm text-slate-300">
            <a className="flex gap-2" href={`tel:${business.phone.replace(/\s/g, "")}`}><Phone size={16} className="text-[var(--primary-green)]" /> {business.phone}</a>
            <a className="flex gap-2" href={`mailto:${business.email}`}><Mail size={16} className="text-[var(--primary-green)]" /> {business.email}</a>
            <span className="flex gap-2"><MapPin size={16} className="text-[var(--primary-green)]" /> Manchester, North West</span>
            <span>{business.openingHours}</span>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-black">Professional standards</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[#B89A63] p-3 text-center text-sm font-black text-[#D6B778]">RSPH</div>
            <div className="rounded-lg border border-[#B89A63] p-3 text-center text-sm font-black text-[#D6B778]">BPCA</div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Ask LME to verify accreditation details before booking.</p>
        </div>
      </div>
      <div className="container-lme mt-10 grid gap-2 border-t border-white/10 pt-6 text-sm text-slate-400">
        <p>Copyright {new Date().getFullYear()} {env.BUSINESS_LEGAL_NAME || business.name}. Reviews, accreditations and insurance claims are shown only after verification.</p>
        {env.BUSINESS_REGISTERED_ADDRESS ? <p>Registered/trading address: {env.BUSINESS_REGISTERED_ADDRESS}</p> : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {env.BUSINESS_COMPANY_NUMBER ? <span>Company number: {env.BUSINESS_COMPANY_NUMBER}</span> : null}
          {env.BUSINESS_VAT_NUMBER ? <span>VAT number: {env.BUSINESS_VAT_NUMBER}</span> : null}
        </div>
      </div>
    </footer>
  );
}
