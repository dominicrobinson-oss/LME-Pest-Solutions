import { Phone } from "lucide-react";
import { business } from "@/lib/data";
import { businessPhoneHref } from "@/lib/utils";

export function StickyCallButton() {
  return (
    <a
      className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-[var(--primary-gold)] px-5 py-4 font-black text-white shadow-[0_14px_30px_rgba(200,162,74,0.45)] transition hover:bg-[var(--primary-gold-hover)] md:flex"
      href={businessPhoneHref(business.phone)}
    >
      <Phone size={20} />
      Call {business.phone}
    </a>
  );
}
