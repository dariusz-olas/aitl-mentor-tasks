"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  assigneeUserId: string;
};

type User = { id: string; email: string; name: string; role: string };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    if (user) map.set(user.id, user.name);
    for (const m of mentees) map.set(m.id, m.name);
    return map;
  }, [user, mentees]);

  function assigneeLabel(id: string) {
    return nameById.get(id) ?? id;
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;

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

  if (!user) {
    return (
      <main className="bg-paper flex min-h-screen items-center justify-center p-6 text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    <main className="bg-paper min-h-screen text-foreground">
      <header className="border-b border-ink/10 bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-4 items-end gap-0.5" aria-hidden>
              <span className="h-2 w-0.5 rounded-sm bg-ink-accent" />
              <span className="h-3.5 w-0.5 rounded-sm bg-ink-accent" />
              <span className="h-2.5 w-0.5 rounded-sm bg-ink-accent" />
            </span>
            <p className="font-display text-lg text-ink-foreground">
              Mentor Tasks
              <span className="ml-2 font-sans text-xs tracking-[0.08em] text-ink-muted">
                — AITL
              </span>
            </p>
          </div>
          <button type="button" onClick={logout} className="mt-btn-ghost text-ink-muted hover:bg-white/5 hover:text-ink-foreground">
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-10 px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Your next step forward
            </p>
            <h1 className="font-display text-5xl leading-none tracking-tight sm:text-[3.8rem]">
              Tasks<span className="text-primary">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              aria-hidden
            >
              {initials(user.name)}
            </span>
            <p>
              {user.name} · {user.role} · {user.email}
            </p>
          </div>
        </div>

        <section
          aria-label="Create task"
          className="space-y-5 rounded-[7px] border border-border bg-card p-6 shadow-task"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-medium">+ New task</h2>
            <p className="text-sm italic text-muted-foreground">
              Make room for progress.
            </p>
          </div>

          <form onSubmit={createTask} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              New task title
              <input
                className="mt-input"
                placeholder="New task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              Description (optional)
              <textarea
                className="mt-input min-h-[4.5rem] py-2"
                placeholder="Description (optional)"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            {user.role === "mentor" && (
              <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                Assign to mentee
                <select
                  className="mt-input"
                  value={assigneeUserId}
                  onChange={(e) => setAssigneeUserId(e.target.value)}
                >
                  <option value={user.id}>Myself (mentor)</option>
                  {mentees.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                One small step is a good place to start.
              </p>
              <button type="submit" className="mt-btn-primary shrink-0 self-end sm:self-auto">
                Create
              </button>
            </div>
          </form>
        </section>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <section aria-label="Tasks" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-medium">
              {user.role === "mentor" ? "Everyone’s tasks" : "Your tasks"}{" "}
              <span className="text-muted-foreground">{tasks.length}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              {doneCount} of {tasks.length} complete
            </p>
          </div>

          <ul className="space-y-3">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="rounded-[7px] border border-border bg-card p-5 shadow-task"
              >
                {editingId === t.id ? (
                  <div className="space-y-3">
                    <input
                      className="mt-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      aria-label="Edit title"
                    />
                    <textarea
                      className="mt-input min-h-[4rem] py-2 text-sm"
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      aria-label="Edit description"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(t.id)}
                        className="mt-btn-primary h-9"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="mt-btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                      <p className="text-base font-medium leading-snug">
                        {t.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.description || "—"}
                      </p>
                      <p className="pt-1 text-xs text-primary/80">
                        status: {t.status} · assignee: {assigneeLabel(t.assigneeUserId)}
                        {/* keep raw id discoverable for regressions / reviewers */}
                        <span className="sr-only"> ({t.assigneeUserId})</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        className="text-sm text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(["todo", "doing", "done"] as const).map((s) => {
                    const active = t.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(t.id, s)}
                        className={`mt-status ${active ? "mt-status-active" : ""}`}
                        disabled={active}
                        aria-pressed={active}
                      >
                        {active ? s : `→ ${s}`}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mx-auto flex max-w-3xl items-center justify-between px-6 pb-8 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Mentor Tasks — AITL</span>
        <span className="hidden sm:inline">Small steps. Lasting change.</span>
      </footer>
    </main>
  );
}
