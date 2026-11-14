# Spec S3 — Domain rule P4 (status workflow)

**Author model:** Composer (Cursor)  
**Epic:** EPIC-1  
**Depends on:** S2  
**Code seed:** `lib/task-status.ts` (already present)

## Goal

Enforce domain status transitions independent of RBAC/IDOR.

## Rule

- Allowed forward: `todo → doing → done` only (no `todo → done`).
- Reopen: `done → todo` **only** if role is `mentor`.
- Same status is no-op OK.

## Acceptance criteria

1. Unit tests in `lib/task-status.test.ts` stay green and cover jump block + mentor reopen.
2. API/UI status change calls `assertTransition` (or equivalent) before persist — illegal transition → 400 + no DB change.
3. REVIEWER.md documents P4 in one sentence with pointer to tests.
4. P4 evidence ≠ Q4 evidence (separate from IDOR tests).

## Out of scope

- Custom workflows, multiple boards
