import type { SessionUser, Task } from "./types";

/** Q4: mentee only sees/ops own assignee tasks; mentor sees all. */
export function canReadTask(user: SessionUser, task: Task): boolean {
  if (user.role === "mentor") return true;
  return task.assigneeUserId === user.id;
}

export function canWriteTask(user: SessionUser, task: Task): boolean {
  return canReadTask(user, task);
}

export function canDeleteTask(user: SessionUser, task: Task): boolean {
  if (user.role === "mentor") return true;
  return task.assigneeUserId === user.id;
}
