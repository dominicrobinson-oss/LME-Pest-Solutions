"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setError("");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const twoFactorCode = String(formData.get("twoFactorCode") || "");
    const result = await signIn("credentials", { email, password, twoFactorCode, callbackUrl: "/customer", redirect: false });
    if (result?.error) setError("Login failed. If 2FA is enabled, enter the emailed security code and try again.");
    if (result?.url) window.location.href = result.url;
  }

  return (
    <form className="card grid gap-4 p-6" action={submit}>
      <label><span className="label">Email</span><input className="field" name="email" type="email" autoComplete="email" required /></label>
      <label><span className="label">Password</span><input className="field" name="password" type="password" autoComplete="current-password" required /></label>
      <label><span className="label">Security code</span><input className="field" name="twoFactorCode" inputMode="numeric" autoComplete="one-time-code" placeholder="Only needed when 2FA is enabled" /></label>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <button className="btn-primary" type="submit">Login</button>
      <div className="flex flex-wrap gap-3 text-sm font-bold text-[var(--primary-green)]">
        <Link href="/forgot-password">Forgot password</Link>
        <Link href="/verify-email">Verify email</Link>
      </div>
    </form>
  );
}
