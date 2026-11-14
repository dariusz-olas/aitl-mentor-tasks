/**
 * Deterministic guard: block shell commands that would stage/commit/push .env* files.
 * - Literal .env / multi-segment (.env.production.local) / quotes / globs
 * - Broad force-add of the tree when any .env* exists on disk
 * - Staged-index check for commit/push (and add when cache already dirty)
 * Demo: docs/hook-demo.md · scripts/verify-hook.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

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

const isAdd = /\bgit(?:\.exe)?\b[\s\S]*\b(add|stage)\b/i.test(command);
const isCommitOrPush = /\bgit(?:\.exe)?\b[\s\S]*\b(commit|push)\b/i.test(command);
const hasForce = /(^|[\s])(-f|--force)([\s]|$)/i.test(command);
const isBroadAdd =
  isAdd &&
  (/(^|[\s])(-A|--all)([\s]|$)/i.test(command) ||
    /(^|[\s])\.(?:[\s]|$)/.test(command) ||
    /git(?:\.exe)?\s+(?:-C\s+\S+\s+)?add\s*$/i.test(command.trim()));

/** Allowed committed templates (never secrets). */
const ENV_ALLOWLIST = new Set([".env.example", ".env.sample"]);

/** .env, .env.local, .env.production.local, ".env*", path/.env … */
function pathLooksLikeEnv(p) {
  const base = path.basename(String(p).replace(/["']/g, ""));
  if (ENV_ALLOWLIST.has(base)) return false;
  return /^\.env(\.[A-Za-z0-9_-]+)*$/.test(base) || base === ".env" || /^\.env\*/.test(base);
}

/** Strip allowlisted template filenames before literal matching. */
const commandForLiteralScan = command.replace(
  /(^|[\s"'=/\\])\.env\.(example|sample)\b/gi,
  "$1",
);

const touchesEnvLiteral =
  /(^|[\s"'=/\\])\.env(\.[A-Za-z0-9_-]+)*(\*|["']|$|\s)/i.test(commandForLiteralScan) ||
  /(^|[\s"'=/\\])\.env["']/i.test(commandForLiteralScan);

function envFilesOnDisk(cwd) {
  try {
    return fs.readdirSync(cwd).filter((name) => pathLooksLikeEnv(name));
  } catch {
    return [];
  }
}

function stagedEnvPaths(cwd) {
  try {
    const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter(pathLooksLikeEnv);
  } catch {
    return [];
  }
}

function deny(msg) {
  console.error(`HOOK DENY: ${msg}`);
  process.exit(2);
}

if (isGitMutating) {
  const cwd = process.cwd();

  if (touchesEnvLiteral) {
    deny("refusing git add/commit/push/stage involving .env* (literal path in command)");
  }

  if (isAdd && hasForce && isBroadAdd && envFilesOnDisk(cwd).length > 0) {
    deny("refusing force/broad git add while .env* files exist on disk");
  }

  if (isCommitOrPush || isAdd) {
    const staged = stagedEnvPaths(cwd);
    if (staged.length > 0) {
      deny(`refusing git mutating command with staged .env*: ${staged.join(", ")}`);
    }
  }
}

process.exit(0);
