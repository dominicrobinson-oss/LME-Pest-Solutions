import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center" aria-label="LME Pest Solutions home">
      <Image
        src="/brand/lme-gold-badge.png"
        alt="LME Pest Solutions"
        width={110}
        height={110}
        className="h-[86px] w-auto object-contain drop-shadow-[0_4px_14px_rgba(200,162,74,0.28)]"
        priority
      />
    </Link>
  );
}

export function LogoPlaceholderNote() {
  return (
    <p className="text-xs text-slate-500">
      Supplied LME badge logo is installed under public/brand.
    </p>
  );
}
