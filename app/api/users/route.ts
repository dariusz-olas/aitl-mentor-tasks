import { NextResponse } from "next/server";
import { AuthConfigError, readSession } from "@/lib/auth";
import { listUsers } from "@/lib/db";

/** Mentor: list mentees for assignee picker (id + name only). */
export async function GET() {
  try {
    const user = await readSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "mentor") {
      return NextResponse.json({ users: [] });
    }
    const users = listUsers()
      .filter((u) => u.role === "mentee")
      .map(({ id, name }) => ({ id, name }));
    return NextResponse.json({ users });
  } catch (e) {
    if (e instanceof AuthConfigError) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    throw e;
  }
}
