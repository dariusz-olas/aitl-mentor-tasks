/**
 * Run hook denial cases without putting sensitive patterns in the outer shell
 * command line (Cursor beforeShellExecution scans the command string).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const hook = path.join(__dirname, "..", ".cursor", "hooks", "block-env-commit.js");
const repoRoot = path.join(__dirname, "..");

function runHook(cmd, cwd = repoRoot) {
  const r = spawnSync(process.execPath, [hook], {
    input: JSON.stringify({ command: cmd }),
    encoding: "utf8",
    cwd,
  });
  return r.status ?? 1;
}

const cases = [
  { cmd: "git add .env.local", expect: 2 },
  { cmd: 'git add ".env"', expect: 2 },
  { cmd: "git add -f .env*", expect: 2 },
  { cmd: "git -C . add .env", expect: 2 },
  { cmd: "git add .env.production.local", expect: 2 },
  { cmd: "git add .env.example", expect: 0 },
  { cmd: "git status", expect: 0 },
];

let failed = 0;
for (const c of cases) {
  const code = runHook(c.cmd);
  const ok = code === c.expect;
  console.log(`${ok ? "OK" : "FAIL"} expect=${c.expect} got=${code} :: ${c.cmd}`);
  if (!ok) failed += 1;
}

/** Broad force-add deny when a .env* file exists on disk */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aitl-hook-"));
fs.writeFileSync(path.join(tmp, ".env"), "SECRET=1", "utf8");
const broad = runHook("git add -f .", tmp);
const broadOk = broad === 2;
console.log(
  `${broadOk ? "OK" : "FAIL"} expect=2 got=${broad} :: git add -f . (with .env on disk)`,
);
if (!broadOk) failed += 1;
fs.rmSync(tmp, { recursive: true, force: true });

process.exit(failed ? 1 : 0);
