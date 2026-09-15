import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { adminNav } from "@/lib/data";

export function AdminShell({ title, children, userName }: { title: string; children: ReactNode; userName?: string | null }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-[var(--background-darker)] p-5 text-white lg:block">
        <h1 className="text-xl font-black">LME Operations</h1>
        <nav className="mt-8 grid gap-2 text-sm font-bold">
          {adminNav.map(([label, href]) => (
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href={href} key={href}>{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--primary-green)]">Business management</p>
              <h2 className="text-3xl font-black">{title}</h2>
              {userName ? <p className="mt-1 text-sm text-slate-500">Signed in as {userName}</p> : null}
            </div>
            <Link className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold" href="/api/auth/signout">
              <LogOut size={16} />
              Logout
            </Link>
          </div>
        </header>
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}

export function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-black uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      {note ? <p className="mt-2 text-sm text-slate-600">{note}</p> : null}
    </div>
  );
}

export function DataPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="card p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item) => <div className="rounded-lg bg-slate-50 p-3 text-sm font-bold" key={item}>{item}</div>)}
      </div>
    </section>
  );
}
