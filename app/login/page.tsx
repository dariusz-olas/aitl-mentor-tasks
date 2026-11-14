"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_ERROR_FALLBACK, loginErrorMessage } from "@/lib/login-error";

const DEMO_ACCOUNTS = [
  {
    label: "Mentor",
    email: "mentor@demo.local",
    password: "demo-mentor",
  },
  {
    label: "Mentee A",
    email: "mentee.a@demo.local",
    password: "demo-mentee-a",
  },
  {
    label: "Mentee B",
    email: "mentee.b@demo.local",
    password: "demo-mentee-b",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mentee.a@demo.local");
  const [password, setPassword] = useState("demo-mentee-a");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        setError(loginErrorMessage(body));
        return;
      }
      router.push("/tasks");
      router.refresh();
    } catch {
      setError(LOGIN_ERROR_FALLBACK);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="bg-grain relative flex min-h-screen flex-col text-ink-foreground">
      <header className="flex items-center justify-between border-b border-ink-border/50 px-6 py-4 text-xs tracking-[0.14em] text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="flex h-4 items-end gap-0.5" aria-hidden>
            <span className="h-2 w-0.5 rounded-sm bg-ink-accent" />
            <span className="h-3.5 w-0.5 rounded-sm bg-ink-accent" />
            <span className="h-2.5 w-0.5 rounded-sm bg-ink-accent" />
          </span>
          <span className="font-medium text-ink-foreground">AITL</span>
        </div>
        <p className="hidden uppercase sm:block">A little progress, every day.</p>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10 px-6 py-12">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted">
            — Built around your growth
          </p>
          <h1 className="font-display text-[clamp(3.25rem,12vw,5.375rem)] leading-[1.05] tracking-tight text-ink-foreground">
            Mentor Tasks
            <span className="text-ink-accent">.</span>
            <span className="sr-only"> — login</span>
          </h1>
          <p className="text-base text-ink-muted">
            Good guidance. Meaningful progress.
          </p>
        </div>

        <section className="space-y-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-medium text-ink-foreground">
              Welcome back
            </h2>
            <span className="text-sm text-ink-muted">— login</span>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
              Email
              <input
                className="mt-input-ink"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder="you@example.com"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
              Password
              <input
                type="password"
                className="mt-input-ink"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </label>
            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="mt-btn-ink" disabled={pending}>
              Sign in
              <span aria-hidden>→</span>
            </button>
          </form>

          <div className="border-t border-ink-border/60 pt-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
              Demo accounts
            </p>
            <ul className="grid gap-3 text-xs text-ink-muted sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email} className="space-y-1">
                  <p className="font-medium text-ink-foreground/90">
                    {account.label}
                  </p>
                  <p className="break-all leading-relaxed">
                    {account.email} / {account.password}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-between border-t border-ink-border/50 px-6 py-4 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        <span>Mentor Tasks — AITL</span>
        <span className="hidden sm:inline">Small steps. Lasting change.</span>
      </footer>
    </main>
  );
}
