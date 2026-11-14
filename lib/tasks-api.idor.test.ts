import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetDbForTests } from "./db";
import type { SessionUser } from "./types";

const menteeA: SessionUser = {
  id: "u-mentee-a",
  email: "mentee.a@demo.local",
  name: "Mentee A",
  role: "mentee",
};

vi.mock("@/lib/auth", () => ({
  readSession: vi.fn(),
}));

import { readSession } from "@/lib/auth";
import { GET, PATCH, DELETE } from "@/app/api/tasks/[id]/route";

describe("Q4 route-level IDOR → 404", () => {
  beforeEach(() => {
    resetDbForTests();
    vi.mocked(readSession).mockResolvedValue(menteeA);
  });

  const ctx = { params: Promise.resolve({ id: "t-seed-b" }) };

  it("GET foreign task returns 404", async () => {
    const res = await GET(new Request("http://localhost/api/tasks/t-seed-b"), ctx);
    expect(res.status).toBe(404);
  });

  it("PATCH foreign task returns 404", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/tasks/t-seed-b", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "hacked" }),
      }),
      ctx,
    );
    expect(res.status).toBe(404);
  });

  it("DELETE foreign task returns 404", async () => {
    const res = await DELETE(
      new Request("http://localhost/api/tasks/t-seed-b", { method: "DELETE" }),
      ctx,
    );
    expect(res.status).toBe(404);
  });
});
