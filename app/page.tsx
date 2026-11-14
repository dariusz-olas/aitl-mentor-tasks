import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-grain flex min-h-screen flex-col text-ink-foreground">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-8 py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          — Built around your growth
        </p>
        <h1 className="font-display text-5xl leading-none tracking-tight sm:text-6xl">
          Mentor Tasks<span className="text-ink-accent">.</span>
        </h1>
        <p className="max-w-md text-ink-muted">
          AITL distinction project — mentoring task tracker with roles, CRUD,
          status workflow (P4) and IDOR protections (Q4).
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link className="mt-btn-ink w-auto px-5" href="/login">
            Login
          </Link>
          <Link
            className="inline-flex h-[51px] items-center justify-center rounded-md border border-ink-border px-5 text-sm text-ink-muted transition-colors hover:border-ink-muted hover:text-ink-foreground"
            href="/tasks"
          >
            Tasks
          </Link>
        </div>
      </div>
    </main>
  );
}
