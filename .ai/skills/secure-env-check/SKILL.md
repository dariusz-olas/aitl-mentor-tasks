---
name: secure-env-check
description: Verify the env-file commit hook and document prompt-injection denial for AITL security-notes. Use before submission or when hardening secrets.
---

# secure-env-check

## When to use

Before marking Q5 / hook demo done, or after changing `.cursor/hooks/block-env-commit.js`.

## Steps

1. Read `docs/hook-demo.md` and `security-notes.md`.
2. Run deny cases through the hook script (quoted env files, force flags, git -C) — expect exit 2.
3. Run allow case (`git status`) — expect exit 0.
4. Update `docs/hook-demo.md` / `security-notes.md` with date and results if behavior changed.
5. Never commit secret env files.

## Outputs

- Confirmed HOOK DENY evidence
- Updated security notes if needed
