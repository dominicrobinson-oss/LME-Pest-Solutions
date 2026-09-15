import { requestEmailVerification, verifyEmail } from "@/app/auth-actions";
import { PageHero } from "@/components/page-hero";
import { PublicShell } from "@/components/public-shell";

export const metadata = { robots: { index: false, follow: false } };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string; email?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <PublicShell>
      <PageHero title="Verify Email" copy="Confirm the email address attached to your customer account." />
      <div className="container-lme grid gap-5 py-14 md:grid-cols-2">
        <form action={requestEmailVerification} className="card grid gap-4 p-6">
          <h2 className="text-xl font-black">Send verification link</h2>
          <label><span className="label">Email</span><input className="field" name="email" type="email" defaultValue={params.email || ""} required /></label>
          <button className="btn-primary" type="submit">Send verification</button>
        </form>
        <form action={verifyEmail} className="card grid gap-4 p-6">
          <h2 className="text-xl font-black">Confirm token</h2>
          {params.error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">The verification link is invalid or expired.</p> : null}
          <input name="token" type="hidden" value={params.token || ""} />
          <label><span className="label">Email</span><input className="field" name="email" type="email" defaultValue={params.email || ""} required /></label>
          <button className="btn-primary" disabled={!params.token} type="submit">Verify email</button>
        </form>
      </div>
    </PublicShell>
  );
}
