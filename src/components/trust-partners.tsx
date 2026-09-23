import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Clock3, ShieldCheck, Star, ThumbsUp } from "lucide-react";
import { trustPartners } from "@/lib/data";

const icons: Record<(typeof trustPartners)[number]["icon"], LucideIcon> = {
  google: Star,
  checkatrade: BadgeCheck,
  trustpilot: ThumbsUp,
  rsph: ShieldCheck,
  clock: Clock3,
};

export function TrustPartners() {
  return (
    <section className="bg-[#04101A] py-6 text-white">
      <div className="container-lme flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
        <p className="text-sm font-black uppercase tracking-wide text-slate-300">Trusted across Manchester &amp; the North West</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustPartners.map(({ label, icon }) => {
            const Icon = icons[icon];
            return (
              <span className="flex items-center gap-2 text-sm font-black" key={label}>
                <Icon className="text-[var(--primary-gold)]" size={20} />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
