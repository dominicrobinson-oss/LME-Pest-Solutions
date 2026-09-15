import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="container-lme py-20">
        <h1 className="text-5xl font-black">404</h1>
        <p className="mt-3 text-slate-600">That page could not be found.</p>
        <Link className="btn-primary mt-6" href="/">Return home</Link>
      </section>
    </PublicShell>
  );
}
