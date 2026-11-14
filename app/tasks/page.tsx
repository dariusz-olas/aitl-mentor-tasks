"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  assigneeUserId: string;
};

type User = { id: string; email: string; name: string; role: string };

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const me = await fetch("/api/auth/me");
    if (!me.ok) {
      router.replace("/login");
      return;
    }
    const { user: u } = await me.json();
    setUser(u);
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
  }

  useEffect(() => {
    void load();
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTask(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      setError("Create failed");
      return;
    }
    setTitle("");
    await load();
  }

  async function setStatus(id: string, status: Task["status"]) {
    setError(null);
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Status change failed");
      return;
    }
    await load();
  }

  async function remove(id: string) {
    setError(null);
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    await load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!user) return <main className="p-6">Loading…</main>;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-neutral-600">
            {user.name} · {user.role} · {user.email}
          </p>
        </div>
        <button onClick={logout} className="rounded border px-3 py-1 text-sm">
          Log out
        </button>
      </header>

      <form onSubmit={createTask} className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Create
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {tasks.map((t) => (
          <li key={t.id} className="rounded border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-neutral-600">{t.description || "—"}</p>
                <p className="text-xs text-neutral-500">
                  status: {t.status} · assignee: {t.assigneeUserId}
                </p>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["todo", "doing", "done"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(t.id, s)}
                  className="rounded border px-2 py-1 text-xs"
                  disabled={t.status === s}
                >
                  → {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
