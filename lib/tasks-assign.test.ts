import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTask, resetDbForTests } from "./db";
import type { SessionUser } from "./types";

const menteeA: SessionUser = {
  id: "u-mentee-a",
  email: "mentee.a@demo.local",
  name: "Mentee A",
  role: "mentee",
};

const mentor: SessionUser = {
  id: "u-mentor",
  email: "mentor@demo.local",
  name: "Demo Mentor",
  role: "mentor",
};

vi.mock("@/lib/auth", () => ({
  readSession: vi.fn(),
  AuthConfigError: class AuthConfigError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthConfigError";
    }
  },
}));

import { readSession } from "@/lib/auth";
import { POST } from "@/app/api/tasks/route";
import { GET as getUsers } from "@/app/api/users/route";

describe("mentor assign + users picker", () => {
  beforeEach(() => {
    resetDbForTests();
  });

  it("mentor can create task assigned to mentee", async () => {
    vi.mocked(readSession).mockResolvedValue(mentor);
    const res = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Assigned by mentor",
          description: "for A",
          assigneeUserId: "u-mentee-a",
        }),
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    const task = getTask(body.task.id)!;
    expect(task.assigneeUserId).toBe("u-mentee-a");
    expect(task.createdByUserId).toBe("u-mentor");
  });

  it("mentee cannot assign another user", async () => {
    vi.mocked(readSession).mockResolvedValue(menteeA);
    const res = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Should fail",
          assigneeUserId: "u-mentee-b",
        }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("mentor users list returns id+name only", async () => {
    vi.mocked(readSession).mockResolvedValue(mentor);
    const res = await getUsers();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users.length).toBeGreaterThan(0);
    for (const u of body.users) {
      expect(u).toHaveProperty("id");
      expect(u).toHaveProperty("name");
      expect(u).not.toHaveProperty("email");
      expect(u).not.toHaveProperty("password");
    }
  });
});
