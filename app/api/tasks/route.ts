import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { createTask, findUserById, listTasks } from "@/lib/db";
import { canReadTask } from "@/lib/permissions";
import { z } from "zod";

export async function GET() {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tasks = listTasks().filter((t) => canReadTask(user, t));
  return NextResponse.json({ tasks });
}

const createSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  assigneeUserId: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const assigneeUserId = parsed.data.assigneeUserId ?? user.id;
  if (assigneeUserId !== user.id) {
    if (user.role !== "mentor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const target = findUserById(assigneeUserId);
    if (!target || target.role !== "mentee") {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  const task = createTask({
    title: parsed.data.title,
    description: parsed.data.description,
    assigneeUserId,
    createdByUserId: user.id,
  });
  return NextResponse.json({ task }, { status: 201 });
}
