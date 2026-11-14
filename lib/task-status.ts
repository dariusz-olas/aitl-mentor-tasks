export type TaskStatus = "todo" | "doing" | "done";
export type Role = "mentor" | "mentee";

const FORWARD: Record<TaskStatus, TaskStatus | null> = {
  todo: "doing",
  doing: "done",
  done: null,
};

/** P4 domain rule: only todo→doing→done; mentors may reopen done→todo. */
export function canTransition(
  from: TaskStatus,
  to: TaskStatus,
  role: Role,
): boolean {
  if (from === to) return true;
  if (FORWARD[from] === to) return true;
  if (from === "done" && to === "todo" && role === "mentor") return true;
  return false;
}

export function assertTransition(
  from: TaskStatus,
  to: TaskStatus,
  role: Role,
): void {
  if (!canTransition(from, to, role)) {
    throw new Error(`Illegal status transition ${from} → ${to} for role ${role}`);
  }
}
