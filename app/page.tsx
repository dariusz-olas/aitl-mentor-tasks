import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">Mentor Tasks</h1>
      <p className="text-neutral-600">
        AITL distinction project — mentoring task tracker with roles, CRUD, status
        workflow (P4) and IDOR protections (Q4).
      </p>
      <div className="flex gap-3">
        <Link className="rounded bg-black px-4 py-2 text-white" href="/login">
          Login
        </Link>
        <Link className="rounded border px-4 py-2" href="/tasks">
          Tasks
        </Link>
      </div>
    </main>
  );
}
