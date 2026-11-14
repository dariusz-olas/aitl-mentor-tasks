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
  const [mentees, setMentees] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const me = await fetch("/api/auth/me");
    if (!me.ok) {
      router.replace("/login");
      return;
    }
    const { user: u } = await me.json();
    setUser(u);
    setAssigneeUserId(u.id);
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
    if (u.role === "mentor") {
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        const body = await usersRes.json();
        setMentees(body.users ?? []);
      }
    }
  }

  useEffect(() => {
    void load();
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTask(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body: Record<string, string> = {
      title: title.trim(),
      description: description.trim(),
    };
    if (user?.role === "mentor" && assigneeUserId) {
      body.assigneeUserId = assigneeUserId;
    }
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Create failed");
      return;
    }
    setTitle("");
    setDescription("");
    await load();
  }

  function startEdit(t: Task) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description ?? "");
    setError(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim(),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Update failed");
      return;
    }
    setEditingId(null);
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

      <form onSubmit={createTask} className="space-y-2 rounded border p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
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
        </div>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Description (optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {user.role === "mentor" && (
          <label className="flex flex-col gap-1 text-sm">
            Assign to mentee
            <select
              className="rounded border px-3 py-2"
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
            >
              <option value={user.id}>Myself (mentor)</option>
              {mentees.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </label>
        )}
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {tasks.map((t) => (
          <li key={t.id} className="rounded border p-3">
            {editingId === t.id ? (
              <div className="space-y-2">
                <input
                  className="w-full rounded border px-3 py-2"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  aria-label="Edit title"
                />
                <textarea
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  aria-label="Edit description"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveEdit(t.id)}
                    className="rounded bg-black px-3 py-1 text-sm text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-neutral-600">{t.description || "—"}</p>
                  <p className="text-xs text-neutral-500">
                    status: {t.status} · assignee: {t.assigneeUserId}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-sm text-neutral-700 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
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
