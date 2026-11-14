import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "./task-status";

describe("P4 task status transitions", () => {
  it("allows todo → doing → done", () => {
    expect(canTransition("todo", "doing", "mentee")).toBe(true);
    expect(canTransition("doing", "done", "mentee")).toBe(true);
  });

  it("blocks todo → done jump", () => {
    expect(canTransition("todo", "done", "mentee")).toBe(false);
    expect(canTransition("todo", "done", "mentor")).toBe(false);
  });

  it("allows mentor to reopen done → todo", () => {
    expect(canTransition("done", "todo", "mentor")).toBe(true);
    expect(canTransition("done", "todo", "mentee")).toBe(false);
  });

  it("assertTransition throws on illegal move", () => {
    expect(() => assertTransition("todo", "done", "mentee")).toThrow(/Illegal/);
  });
});
