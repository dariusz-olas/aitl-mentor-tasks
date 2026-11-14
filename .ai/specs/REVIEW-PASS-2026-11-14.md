# Review pass summary — 2026-11-14 (independent)

**Snapshot:** pre-fix state of the repository **before** the S2 UI / route-level Q4 work landed in PR #3 (`feat/s2-ui-and-evidence`). Findings below describe that baseline.

**Post-fix (same PR):** Must items applied in specs + code (UI edit/assign, `lib/tasks-api.idor.test.ts`, AUTH_SECRET required, etc.). See author responses in each `*-review.md`.

This is a consolidated summary of the four independent spec reviews performed by **GPT-5.2**.

## Verdicts

- **S1 — Auth + roles**: **request changes**
- **S2 — Task CRUD**: **request changes**
- **S3 — Status P4**: **approve with changes**
- **S4 — Permissions Q4 (IDOR)**: **request changes**

## Top Must items (spec author must apply)

- **Specs must reflect the actual auth + persistence stack**:
  - Auth is **custom HS256 JWT** via `jose` in `lib/auth.ts`, cookie name `aitl_session`, endpoints in `app/api/auth/*`.
  - Persistence is a **JSON file DB** in `lib/db.ts` (seed written to `data/db.json`), not SQLite.
- **Demo accounts must be consistent across specs/docs/code**:
  - Code seeds **3 users** (mentor + mentee A + mentee B) in `lib/db.ts`; specs must not claim “two demo users”.
- **Define “own/owner” unambiguously as assignee-based**:
  - Mentee permissions are `task.assigneeUserId === user.id` (`lib/permissions.ts`). S2 must use the same definition when it says “owner”.
- **Do not overclaim UI parity** *(baseline)*:
  - At review time `/tasks` UI did not support editing title/description or mentor assignment. Specs required either “UI may lag API” or implementing the missing UI (done in PR #3).
- **Make Q4 response semantics strict and testable**:
  - The implementation uses **404-only** for foreign task IDs across GET/PATCH/DELETE. Update S4 to require 404 (not “403/404”).
- **Fix test coverage claims** *(baseline)*:
  - Q4 was unit-only at review time; route-level HTTP tests were required and added in PR #3.
