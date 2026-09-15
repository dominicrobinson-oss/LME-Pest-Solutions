import { resetPassword } from "@/app/auth-actions";
import { PageHero } from "@/components/page-hero";
import { PublicShell } from "@/components/public-shell";

export const metadata = { robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; email?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <PublicShell>
      <PageHero title="Reset Password" copy="Choose a new password for your secure account." />
      <div className="container-lme max-w-md py-14">
        <form action={resetPassword} className="card grid gap-4 p-6">
          {params.error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">The reset link is invalid or expired.</p> : null}
          <input name="token" type="hidden" value={params.token || ""} />
          <label><span className="label">Email</span><input className="field" name="email" type="email" defaultValue={params.email || ""} required /></label>
          <label><span className="label">New password</span><input className="field" name="password" type="password" minLength={10} required /></label>
          <button className="btn-primary" type="submit">Update password</button>
        </form>
      </div>
    </PublicShell>
  );
}
