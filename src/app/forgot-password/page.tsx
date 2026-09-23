import { requestPasswordReset } from "@/app/auth-actions";
import { PageHero } from "@/components/page-hero";
import { PublicShell } from "@/components/public-shell";

export const metadata = { robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <PublicShell>
      <PageHero title="Forgot Password" copy="Request a secure reset link for your LME Pest Solutions account." />
      <div className="container-lme max-w-md py-14">
        <form action={requestPasswordReset} className="card grid gap-4 p-6">
          <label><span className="label">Email</span><input className="field" name="email" type="email" required /></label>
          <button className="btn-primary" type="submit">Send reset link</button>
        </form>
      </div>
    </PublicShell>
  );
}
