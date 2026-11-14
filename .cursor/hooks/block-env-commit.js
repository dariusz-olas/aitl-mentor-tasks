/**
 * Cursor beforeShellExecution guard: keep .env* files out of git.
 *
 * It reads the hook payload from stdin and exits 2 (deny) when:
 *   0. the payload has no command to inspect (fail closed),
 *   1. a git add/stage carries a force flag in any form,
 *   2. a git index-plumbing write is used (update-index --add / --cacheinfo),
 *   3. a git add/commit/push/stage names a .env* path literally,
 *   4. a git add/commit/push/stage runs while a .env* file is tracked, staged,
 *      or untracked and not ignored (so a broad add would pick it up).
 *
 * This is a guardrail on the shell channel, not a security boundary.
 * Known limits are listed in security-notes.md.
 * Demo: docs/hook-demo.md · Regression test: scripts/verify-hook.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function deny(msg) {
  console.error(`HOOK DENY: ${msg}`);
  process.exit(2);
}

let input = "";
try {
  input = fs.readFileSync(0, "utf8");
} catch {
  input = "";
}

let command;
let payloadCwd;
if (input.trim() === "") {
  deny("empty hook payload: no command to inspect (failing closed)");
}
try {
  const payload = JSON.parse(input);
  if (payload && typeof payload === "object") {
    command = payload.command;
    payloadCwd = payload.cwd;
  }
} catch {
  // Not JSON: treat the raw text as the command, so it is still inspected.
  command = input;
}
if (typeof command !== "string" || command.trim() === "") {
  deny("hook payload has no command string (failing closed)");
}

const cwd =
  typeof payloadCwd === "string" && payloadCwd && fs.existsSync(payloadCwd)
    ? payloadCwd
    : process.cwd();

/** Quotes, backticks and carets removed, so `"-f"` or -`f cannot hide a flag. */
const bare = command.replace(/["'`^]/g, "");

const mentionsGit = /\bgit(?:\.exe)?\b/i.test(bare);
const isAdd = mentionsGit && /\b(add|stage)\b/i.test(bare);
const isCommitOrPush = mentionsGit && /\b(commit|push)\b/i.test(bare);
const isIndexPlumbing =
  mentionsGit && /\bupdate-index\b[\s\S]*--(add|cacheinfo)\b/i.test(bare);

/**
 * -f alone or inside a cluster of `git add` short options (-fA, -Af, -nfv),
 * or --force and its accepted prefixes (--f, --fo, --for, --forc).
 */
const hasForceFlag =
  /(^|\s)-[nvipeuAN]*f[nvfipeuAN]*(?=\s|$)/.test(bare) ||
  /(^|\s)--f(o(r(c(e)?)?)?)?(?=\s|=|$)/.test(bare);

/** Committed templates that never hold secrets. */
const ENV_ALLOWLIST = new Set([".env.example", ".env.sample"]);

/** .env, .env.local, .env.production.local, dir/.env, .env* */
function pathLooksLikeEnv(p) {
  const base = path.basename(String(p).replace(/["']/g, ""));
  if (ENV_ALLOWLIST.has(base)) return false;
  return /^\.env(\.[A-Za-z0-9_-]+)*$/.test(base) || /^\.env\*/.test(base);
}

/** Allowlisted template names removed before the literal scan. */
const commandForLiteralScan = command.replace(
  /(^|[\s"'=/\\])\.env\.(example|sample)\b/gi,
  "$1",
);

const touchesEnvLiteral =
  /(^|[\s"'=/\\])\.env(\.[A-Za-z0-9_-]+)*(\*|["']|$|\s)/i.test(commandForLiteralScan) ||
  /(^|[\s"'=/\\])\.env["']/i.test(commandForLiteralScan);

/**
 * .env* files git would carry: tracked or staged (--cached), or untracked and
 * not ignored (--others --exclude-standard). An ignored .env is the normal,
 * safe state and is not listed. Outside a git repo the list is empty.
 */
function envFilesGitWouldCarry(dir) {
  try {
    const out = execFileSync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard"],
      { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return [
      ...new Set(
        out
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .filter(pathLooksLikeEnv),
      ),
    ];
  } catch {
    return [];
  }
}

if (isAdd && hasForceFlag) {
  deny("refusing git add/stage with a force flag (it can add ignored .env* files)");
}

if (isIndexPlumbing) {
  deny("refusing git update-index --add/--cacheinfo (bypasses .gitignore)");
}

if (isAdd || isCommitOrPush) {
  if (touchesEnvLiteral) {
    deny("refusing git add/commit/push/stage involving .env* (literal path in command)");
  }

  const exposed = envFilesGitWouldCarry(cwd);
  if (exposed.length > 0) {
    deny(
      `refusing git add/commit/push/stage while .env* is tracked, staged or not ignored: ${exposed.join(", ")}`,
    );
  }
}

process.exit(0);
