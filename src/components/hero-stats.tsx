import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock3, ShieldCheck, UsersRound } from "lucide-react";
import { heroStats } from "@/lib/data";

const icons: Record<(typeof heroStats)[number]["icon"], LucideIcon> = {
  users: UsersRound,
  clock: Clock3,
  "shield-check": ShieldCheck,
  check: CheckCircle2,
};

export function HeroStats() {
  return (
    <section className="bg-[var(--primary-gold)] py-6 text-white">
      <div className="container-lme grid grid-cols-2 gap-4 md:grid-cols-4">
        {heroStats.map(({ label, value, icon }) => {
          const Icon = icons[icon];
          return (
            <div className="flex items-center justify-center gap-3 text-center md:text-left" key={label}>
              <Icon className="shrink-0" size={32} />
              <div>
                <p className="text-xl font-black leading-tight">{value}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-white/90">{label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
