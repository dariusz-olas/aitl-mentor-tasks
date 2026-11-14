import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { findUserByEmail } from "./db";
import type { SessionUser } from "./types";

const COOKIE = "aitl_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      "AUTH_SECRET is required (min 16 chars). Copy .env.example → .env before npm run dev.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as SessionUser["role"],
    };
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<SessionUser | null> {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export { COOKIE };
