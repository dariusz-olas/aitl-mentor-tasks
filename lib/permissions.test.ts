import { beforeEach, describe, expect, it } from "vitest";
import { resetDbForTests, getTask } from "./db";
import { canDeleteTask, canReadTask, canWriteTask } from "./permissions";
import { canTransition } from "./task-status";
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

describe("Q4 permissions / IDOR", () => {
  beforeEach(() => {
    resetDbForTests();
  });

  it("mentee A cannot read mentee B task", () => {
    const taskB = getTask("t-seed-b")!;
    expect(canReadTask(menteeA, taskB)).toBe(false);
    expect(canWriteTask(menteeA, taskB)).toBe(false);
    expect(canDeleteTask(menteeA, taskB)).toBe(false);
  });

  it("mentee A can read own task", () => {
    const taskA = getTask("t-seed-a")!;
    expect(canReadTask(menteeA, taskA)).toBe(true);
  });

  it("mentor can read all", () => {
    const taskB = getTask("t-seed-b")!;
    expect(canReadTask(mentor, taskB)).toBe(true);
    expect(canDeleteTask(mentor, taskB)).toBe(true);
  });

  it("mentee cannot reopen done (role+P4)", () => {
    expect(canTransition("done", "todo", "mentee")).toBe(false);
    expect(canTransition("done", "todo", "mentor")).toBe(true);
  });
});
