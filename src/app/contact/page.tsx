import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { QuoteForm } from "@/components/quote-form";
import { business } from "@/lib/data";
import { publicMetadata } from "@/lib/seo";
import { businessPhoneHref, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = publicMetadata({
  title: "Contact",
  description: "Contact LME Pest Solutions for pest control enquiries across Manchester and the North West.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PublicShell>
      <PageHero title="Contact LME Pest Solutions" copy="Call, WhatsApp or submit a tracked quote enquiry so the team can follow up from the lead dashboard." />
      <div className="container-lme grid gap-6 py-14 lg:grid-cols-[1fr_440px]">
        <section className="grid gap-4">
          <ContactCard icon={Phone} title="Phone" text={business.phone} href={businessPhoneHref(business.phone)} />
          <ContactCard icon={MessageCircle} title="WhatsApp" text="Start a WhatsApp enquiry" href={whatsappHref()} />
          <ContactCard icon={Mail} title="Email" text={business.email} />
          <ContactCard icon={MapPin} title="Coverage" text="Manchester and North West England" />
        </section>
        <section className="card p-5">
          <h2 className="text-2xl font-black">Send a quote enquiry</h2>
          <p className="mt-2 text-sm text-slate-600">This creates a validated lead record for follow-up.</p>
          <div className="mt-5">
            <QuoteForm compact />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function ContactCard({ icon: Icon, title, text, href }: { icon: typeof Phone; title: string; text: string; href?: string }) {
  const content = (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid size-12 place-items-center rounded-lg bg-amber-50 text-[var(--primary-gold)]"><Icon /></span>
      <div>
        <h2 className="font-black">{title}</h2>
        <p className="text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}
