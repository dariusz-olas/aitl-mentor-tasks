import { describe, expect, it } from "vitest";
import { LOGIN_ERROR_FALLBACK, loginErrorMessage } from "./login-error";

describe("loginErrorMessage (S5)", () => {
  it("returns the API message", () => {
    expect(loginErrorMessage({ error: "Invalid credentials" })).toBe(
      "Invalid credentials",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(loginErrorMessage({ error: "  Invalid body \n" })).toBe(
      "Invalid body",
    );
  });

  it("returns a message of exactly 200 characters", () => {
    const message = "a".repeat(200);
    expect(loginErrorMessage({ error: message })).toBe(message);
  });

  it("trims before applying the length limit", () => {
    const message = "a".repeat(200);
    expect(loginErrorMessage({ error: `  ${message}  ` })).toBe(message);
  });

  it("falls back for a message of 201 characters", () => {
    expect(loginErrorMessage({ error: "a".repeat(201) })).toBe(
      LOGIN_ERROR_FALLBACK,
    );
  });

  it("accepts a class instance with an own string error", () => {
    class ApiError {
      error = "Demo credentials disabled in production";
    }
    expect(loginErrorMessage(new ApiError())).toBe(
      "Demo credentials disabled in production",
    );
  });

  it.each([
    ["error missing", {}],
    ["error is a number", { error: 42 }],
    ["error is an object", { error: { message: "x" } }],
    ["error is empty", { error: "" }],
    ["error is whitespace only", { error: " \t\n" }],
    ["error is inherited", Object.create({ error: "inherited" })],
    ["body is null", null],
    ["body is undefined", undefined],
    ["body is an array", ["Invalid credentials"]],
    ["body is a string", "Invalid credentials"],
  ])("falls back when %s", (_name, body) => {
    expect(loginErrorMessage(body)).toBe(LOGIN_ERROR_FALLBACK);
  });

  it("uses the documented fallback text", () => {
    expect(LOGIN_ERROR_FALLBACK).toBe("Login failed");
  });
});
