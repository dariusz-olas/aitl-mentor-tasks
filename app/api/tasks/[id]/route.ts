import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { deleteTask, getTask, updateTask } from "@/lib/db";
import { canDeleteTask, canReadTask, canWriteTask } from "@/lib/permissions";
import { assertTransition } from "@/lib/task-status";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const task = getTask(id);
  if (!task || !canReadTask(user, task)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ task });
}

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const task = getTask(id);
  if (!task || !canWriteTask(user, task)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (parsed.data.status && parsed.data.status !== task.status) {
    try {
      assertTransition(task.status, parsed.data.status, user.role);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Illegal transition" },
        { status: 400 },
      );
    }
  }
  const updated = updateTask(id, parsed.data);
  return NextResponse.json({ task: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const task = getTask(id);
  if (!task || !canDeleteTask(user, task)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  deleteTask(id);
  return NextResponse.json({ ok: true });
}
