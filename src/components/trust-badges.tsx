import type { LucideIcon } from "lucide-react";
import { BadgeCheck, ShieldCheck, Star } from "lucide-react";
import { trustBadges } from "@/lib/data";

const icons: Record<(typeof trustBadges)[number]["icon"], LucideIcon> = {
  shield: ShieldCheck,
  "shield-check": ShieldCheck,
  badge: BadgeCheck,
  star: Star,
};

export function TrustBadges({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {trustBadges.map(({ label, icon }) => {
        const Icon = icons[icon];
        return (
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${
              dark ? "bg-white/10 text-white" : "border border-slate-200 bg-white text-slate-900 shadow-sm"
            }`}
            key={label}
          >
            <Icon className="text-[var(--primary-gold)]" size={18} />
            {label}
          </span>
        );
      })}
    </div>
  );
}
