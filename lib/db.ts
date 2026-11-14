import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import type { Task, User } from "./types";

function resolveDbPath(): string {
  if (process.env.AITL_DB_PATH) return path.resolve(process.env.AITL_DB_PATH);
  return path.join(process.cwd(), "data", "db.json");
}

function dbPath(): string {
  return resolveDbPath();
}

function dataDir(): string {
  return path.dirname(dbPath());
}

type DbShape = { users: User[]; tasks: Task[] };

const SEED_USERS: User[] = [
  {
    id: "u-mentor",
    email: "mentor@demo.local",
    name: "Demo Mentor",
    role: "mentor",
    password: "demo-mentor",
  },
  {
    id: "u-mentee-a",
    email: "mentee.a@demo.local",
    name: "Mentee A",
    role: "mentee",
    password: "demo-mentee-a",
  },
  {
    id: "u-mentee-b",
    email: "mentee.b@demo.local",
    name: "Mentee B",
    role: "mentee",
    password: "demo-mentee-b",
  },
];

function seedShape(): DbShape {
  return {
    users: SEED_USERS,
    tasks: [
      {
        id: "t-seed-a",
        title: "Prepare mentoring notes",
        description: "Owned by mentee A",
        status: "todo",
        assigneeUserId: "u-mentee-a",
        createdByUserId: "u-mentee-a",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "t-seed-b",
        title: "Secret B task",
        description: "Owned by mentee B — IDOR target",
        status: "doing",
        assigneeUserId: "u-mentee-b",
        createdByUserId: "u-mentee-b",
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}

function ensureDb(): DbShape {
  const file = dbPath();
  const dir = dataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) {
    const seed = seedShape();
    atomicWrite(file, JSON.stringify(seed, null, 2));
    return structuredClone(seed);
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as DbShape;
}

function atomicWrite(file: string, contents: string): void {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  try {
    fs.renameSync(tmp, file);
  } catch {
    // Windows may deny rename over an existing file — replace via copy.
    fs.copyFileSync(tmp, file);
    fs.unlinkSync(tmp);
  }
}

function save(db: DbShape): void {
  atomicWrite(dbPath(), JSON.stringify(db, null, 2));
}

export function listUsers(): User[] {
  return ensureDb().users;
}

export function findUserByEmail(email: string): User | undefined {
  return ensureDb().users.find((u) => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return ensureDb().users.find((u) => u.id === id);
}

export function listTasks(): Task[] {
  return ensureDb().tasks;
}

export function getTask(id: string): Task | undefined {
  return ensureDb().tasks.find((t) => t.id === id);
}

export function createTask(input: {
  title: string;
  description?: string;
  assigneeUserId: string;
  createdByUserId: string;
}): Task {
  const db = ensureDb();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? "",
    status: "todo",
    assigneeUserId: input.assigneeUserId,
    createdByUserId: input.createdByUserId,
    updatedAt: new Date().toISOString(),
  };
  db.tasks.push(task);
  save(db);
  return task;
}

export function updateTask(id: string, patch: Partial<Omit<Task, "id">>): Task | undefined {
  const db = ensureDb();
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx < 0) return undefined;
  db.tasks[idx] = {
    ...db.tasks[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  save(db);
  return db.tasks[idx];
}

export function deleteTask(id: string): boolean {
  const db = ensureDb();
  const before = db.tasks.length;
  db.tasks = db.tasks.filter((t) => t.id !== id);
  if (db.tasks.length === before) return false;
  save(db);
  return true;
}

export function resetDbForTests(): void {
  if (process.env.NODE_ENV !== "test" && !process.env.AITL_DB_PATH) {
    throw new Error("resetDbForTests refused: set NODE_ENV=test or AITL_DB_PATH");
  }
  const file = dbPath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
  ensureDb();
}
