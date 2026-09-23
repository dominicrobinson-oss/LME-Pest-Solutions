import type { ReactNode } from "react";
import { MobileContactBar } from "@/components/mobile-contact-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCallButton } from "@/components/sticky-call-button";
import { JsonLd, localBusinessSchema } from "@/lib/seo";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <JsonLd data={localBusinessSchema()} />
      <div className="pb-14 md:pb-0">
        <SiteFooter />
      </div>
      <MobileContactBar />
      <StickyCallButton />
    </>
  );
}
