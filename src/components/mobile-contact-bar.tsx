import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { business } from "@/lib/data";
import { businessPhoneHref, whatsappHref } from "@/lib/utils";

export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-slate-200 bg-white text-xs font-black shadow-2xl md:hidden">
      <a className="grid min-h-14 place-items-center text-slate-900" href={businessPhoneHref(business.phone)}>
        <Phone size={18} />
        Call
      </a>
      <a className="grid min-h-14 place-items-center text-slate-900" href={whatsappHref()}>
        <MessageCircle size={18} />
        WhatsApp
      </a>
      <Link className="grid min-h-14 place-items-center bg-[var(--primary-gold)] text-white" href="/get-a-quote">
        Quote
      </Link>
    </div>
  );
}
