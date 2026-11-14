import type { Role, TaskStatus } from "./task-status";

export type { Role, TaskStatus };

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeUserId: string;
  createdByUserId: string;
  updatedAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};
