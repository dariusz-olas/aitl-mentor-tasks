import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { listUsers } from "@/lib/db";

/** Mentor: list mentees for assignee picker. Others: empty list. */
export async function GET() {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "mentor") {
    return NextResponse.json({ users: [] });
  }
  const users = listUsers()
    .filter((u) => u.role === "mentee")
    .map(({ id, email, name, role }) => ({ id, email, name, role }));
  return NextResponse.json({ users });
}
