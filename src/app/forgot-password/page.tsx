import { requestPasswordReset } from "@/app/auth-actions";

export const metadata = { robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-14">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-black">Forgot Password</h1>
        <form action={requestPasswordReset} className="card grid gap-4 p-6">
          <label><span className="label">Staff email</span><input className="field" name="email" type="email" required /></label>
          <button className="btn-primary" type="submit">Send reset link</button>
        </form>
      </div>
    </main>
  );
}
