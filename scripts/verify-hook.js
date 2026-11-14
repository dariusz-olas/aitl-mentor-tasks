/**
 * Regression test for .cursor/hooks/block-env-commit.js (runs in CI).
 *
 * Feeds command strings to the hook through stdin, the way Cursor's
 * beforeShellExecution does. No command under test is executed.
 * The state cases build throwaway git repos in the OS temp directory.
 *
 * Sensitive patterns live in this file, not in the outer shell command line
 * (the hook scans the command string of the shell that starts this script).
 */
const { spawnSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const hook = path.join(__dirname, "..", ".cursor", "hooks", "block-env-commit.js");
const repoRoot = path.join(__dirname, "..");

const DENY = 2;
const ALLOW = 0;

function runHookRaw(stdin, cwd = repoRoot) {
  const r = spawnSync(process.execPath, [hook], {
    input: stdin,
    encoding: "utf8",
    cwd,
  });
  return r.status ?? 1;
}

function runHook(cmd, cwd = repoRoot, payloadCwd) {
  const payload = { command: cmd };
  if (payloadCwd) payload.cwd = payloadCwd;
  return runHookRaw(JSON.stringify(payload), cwd);
}

let failed = 0;
function check(label, got, expect) {
  const ok = got === expect;
  console.log(`${ok ? "OK" : "FAIL"} expect=${expect} got=${got} :: ${label}`);
  if (!ok) failed += 1;
}

console.log("# 1. Literal .env* paths");
for (const [cmd, expect] of [
  ["git add .env.local", DENY],
  ['git add ".env"', DENY],
  ["git add .env*", DENY],
  ["git -C . add .env", DENY],
  ["git add .env.production.local", DENY],
  ["git stage .env", DENY],
  ["git add app/.env", DENY],
  ["git add .env.example", ALLOW],
]) {
  check(cmd, runHook(cmd), expect);
}

console.log("# 2. Forced add in any form (denied even with no .env on disk)");
for (const cmd of [
  "git add -f .env",
  "git add -f .",
  "git add -f ./",
  "git add -f .\\",
  "git add -f *",
  "git add -f :/",
  "git add -fA",
  "git add -Af",
  "git add -nfv .",
  "git add --force .",
  "git add --forc .",
  "git add --f .",
  'git add "-f" .',
  "git add -`f .",
  "git stage -f .",
  "git -c core.excludesFile=NUL add -f -A",
  "git add -f ./ ; git commit -m wip ; git push",
]) {
  check(cmd, runHook(cmd), DENY);
}

console.log("# 3. Index plumbing");
for (const cmd of [
  "git update-index --add secrets.txt",
  "git update-index --add --cacheinfo 100644,abc,secrets.txt",
]) {
  check(cmd, runHook(cmd), DENY);
}

console.log("# 4. Fail closed on a payload without a command");
check("(empty stdin)", runHookRaw(""), DENY);
check("(whitespace stdin)", runHookRaw("  \n"), DENY);
check("{} (no command key)", runHookRaw("{}"), DENY);
check('{"cmd": "git status"} (unknown key)', runHookRaw('{"cmd":"git status"}'), DENY);
check('{"command": 42}', runHookRaw('{"command":42}'), DENY);
check('{"command": ""}', runHookRaw('{"command":""}'), DENY);
check("null", runHookRaw("null"), DENY);
check("raw text: git add .env (inspected as a command)", runHookRaw("git add .env"), DENY);
check("raw text: git status", runHookRaw("git status"), ALLOW);

console.log("# 5. Ordinary work stays allowed");
for (const cmd of [
  "git status",
  "git add lib/login-error.ts",
  "git add -A",
  "git add .",
  'git commit -m "feat: login error feedback"',
  "git commit -F message.txt",
  "git push origin feat/s5-login-error-feedback",
  "git diff --stat",
  "npm test",
  "Remove-Item -Recurse -Force .next",
  "rm -rf .next",
]) {
  check(cmd, runHook(cmd), ALLOW);
}

console.log("# 6. Repository state (throwaway repos)");
function git(cwd, args) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}
function makeRepo(ignoreEnv) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aitl-hook-"));
  git(dir, ["init", "-q"]);
  fs.writeFileSync(path.join(dir, "app.txt"), "x", "utf8");
  if (ignoreEnv) {
    fs.writeFileSync(path.join(dir, ".gitignore"), ".env*\n!.env.example\n", "utf8");
  }
  fs.writeFileSync(path.join(dir, ".env"), "CANARY=not-a-real-secret", "utf8");
  return dir;
}
const repos = [];
try {
  // 6a. .env ignored: the normal state. Broad add is allowed, forced add is not.
  const ignored = makeRepo(true);
  repos.push(ignored);
  check("ignored .env: git add -A", runHook("git add -A", ignored), ALLOW);
  check("ignored .env: git commit -m x", runHook("git commit -m x", ignored), ALLOW);
  check("ignored .env: git add -f .", runHook("git add -f .", ignored), DENY);

  // 6b. .env not ignored (no .gitignore): any add or commit is refused.
  const exposed = makeRepo(false);
  repos.push(exposed);
  check("unignored .env: git add app.txt", runHook("git add app.txt", exposed), DENY);
  check("unignored .env: git add -A", runHook("git add -A", exposed), DENY);
  check("unignored .env: git commit -am x", runHook("git commit -am x", exposed), DENY);
  check("unignored .env: git status", runHook("git status", exposed), ALLOW);

  // 6c. .env already staged behind the hook's back: commit and push are refused.
  const staged = makeRepo(true);
  repos.push(staged);
  git(staged, ["add", "--force", "--", ".env"]);
  check("staged .env: git commit -m x", runHook("git commit -m x", staged), DENY);
  check("staged .env: git push", runHook("git push", staged), DENY);
  check("staged .env: git add app.txt", runHook("git add app.txt", staged), DENY);

  // 6d. The hook uses the payload's cwd when Cursor sends one.
  check(
    "payload.cwd points at the staged repo: git push",
    runHook("git push", repoRoot, staged),
    DENY,
  );
} finally {
  for (const dir of repos) fs.rmSync(dir, { recursive: true, force: true });
}

console.log(failed ? `\n${failed} case(s) FAILED` : "\nAll hook cases passed");
process.exit(failed ? 1 : 0);
