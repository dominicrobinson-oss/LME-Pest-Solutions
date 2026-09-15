import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center" aria-label="LME Pest Solutions home">
      <Image
        src="/brand/lme-supplied-logo-badge.png"
        alt="LME Pest Solutions"
        width={92}
        height={98}
        className="h-[62px] w-auto object-contain drop-shadow-[0_4px_14px_rgba(86,190,255,0.28)]"
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
