"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mentee.a@demo.local");
  const [password, setPassword] = useState("demo-mentee-a");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("Login failed");
      return;
    }
    router.push("/tasks");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Mentor Tasks — login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            className="rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            className="rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Sign in
        </button>
      </form>
      <p className="text-xs text-neutral-500">
        Demo: mentor@demo.local / demo-mentor · mentee.a@demo.local /
        demo-mentee-a · mentee.b@demo.local / demo-mentee-b
      </p>
    </main>
  );
}
