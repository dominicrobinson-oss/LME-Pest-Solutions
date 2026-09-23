import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { LoginForm } from "@/components/login-form";

export const metadata = { robots: { index: false, follow: false } };

export default function CustomerLoginPage() {
  return (
    <PublicShell>
      <PageHero title="Customer Login" copy="Secure customer access for quotes, jobs, invoices, documents and messages." />
      <div className="container-lme max-w-md py-14">
        <LoginForm />
      </div>
    </PublicShell>
  );
}
