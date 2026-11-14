/**
 * Deterministic guard: block shell commands that would stage/commit/push .env* files.
 * Covers quoted paths, -f force, git -C, and glob .env*.
 * Demo: see docs/hook-demo.md
 */
const fs = require("fs");

let input = "";
try {
  input = fs.readFileSync(0, "utf8");
} catch {
  input = "";
}

let payload = {};
try {
  payload = JSON.parse(input || "{}");
} catch {
  payload = { command: String(input || "") };
}

const command = String(payload.command || payload.cmd || "");

const isGitMutating =
  /\bgit(?:\.exe)?\b[\s\S]*\b(add|commit|push|stage)\b/i.test(command);

/** Match .env, .env.local, ".env", '.env*', path/.env, -f .env*, etc. */
const touchesEnv =
  /(^|[\s"'=/\\])\.env(\.[A-Za-z0-9_-]+)?(\*|["']|$|\s)/i.test(command) ||
  /(^|[\s"'=/\\])\.env["']/i.test(command);

if (isGitMutating && touchesEnv) {
  console.error(
    "HOOK DENY: refusing git add/commit/push/stage involving .env* (AITL security hook)",
  );
  process.exit(2);
}

process.exit(0);
