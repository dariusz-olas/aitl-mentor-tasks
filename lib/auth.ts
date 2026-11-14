import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { findUserByEmail, findUserById } from "./db";
import type { SessionUser } from "./types";

const COOKIE = "aitl_session";

const BLOCKED_SECRETS = new Set([
  "CHANGE_ME",
  "change_me",
  "replace-me-with-a-long-local-secret",
  "replace-me-in-local-env",
]);

export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new AuthConfigError(
      "AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.",
    );
  }
  if (BLOCKED_SECRETS.has(secret.trim())) {
    throw new AuthConfigError(
      "AUTH_SECRET is a documented placeholder — set a unique local secret in .env.",
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

  let id: string;
  try {
    const verified = await jwtVerify(token, secretKey());
    id = String(verified.payload.id ?? "");
  } catch (e) {
    if (e instanceof AuthConfigError) throw e;
    return null;
  }

  if (!id) return null;
  const user = findUserById(id);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function login(email: string, password: string): Promise<SessionUser | null> {
  if (
    process.env.NODE_ENV === "production" &&
    (email.endsWith("@demo.local") ||
      password === "demo-mentor" ||
      password === "demo-mentee-a" ||
      password === "demo-mentee-b")
  ) {
    throw new AuthConfigError("Demo credentials disabled in production");
  }
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
