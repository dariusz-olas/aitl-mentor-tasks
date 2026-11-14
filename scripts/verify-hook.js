/**
 * Run hook denial cases without putting sensitive patterns in the shell command line
 * (Cursor beforeShellExecution scans the command string).
 */
const { spawnSync } = require("child_process");
const path = require("path");

const hook = path.join(__dirname, "..", ".cursor", "hooks", "block-env-commit.js");

const cases = [
  { cmd: "git add .env.local", expect: 2 },
  { cmd: 'git add ".env"', expect: 2 },
  { cmd: "git add -f .env*", expect: 2 },
  { cmd: "git -C . add .env", expect: 2 },
  { cmd: "git status", expect: 0 },
];

let failed = 0;
for (const c of cases) {
  const r = spawnSync(process.execPath, [hook], {
    input: JSON.stringify({ command: c.cmd }),
    encoding: "utf8",
  });
  const code = r.status ?? 1;
  const ok = code === c.expect;
  console.log(`${ok ? "OK" : "FAIL"} expect=${c.expect} got=${code} :: ${c.cmd}`);
  if (!ok) failed += 1;
}
process.exit(failed ? 1 : 0);
