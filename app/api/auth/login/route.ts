import { NextResponse } from "next/server";
import { COOKIE, createSessionToken, login } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const user = await login(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await createSessionToken(user);
  const res = NextResponse.json({ user });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
