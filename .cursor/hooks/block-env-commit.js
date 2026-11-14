/**
 * Deterministic guard: block shell commands that would commit/add .env* files.
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
const blocked =
  /\bgit\s+(add|commit|push)\b/i.test(command) &&
  /(^|[\s/\\])\.env(\.|$|\s)/i.test(command);

if (blocked) {
  console.error(
    "HOOK DENY: refusing git add/commit/push involving .env* (AITL security hook)",
  );
  process.exit(2);
}

process.exit(0);
