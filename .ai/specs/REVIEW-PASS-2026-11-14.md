# Review pass summary — 2026-11-14 (independent)

This is a consolidated summary of the four independent spec reviews performed against the **current repository implementation** in `C:\Users\NowyDariusz\Projects\aitl-mentor-tasks`.

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
- **Do not overclaim UI parity**:
  - `/tasks` UI (`app/tasks/page.tsx`) does not support editing title/description or mentor assignment UI, even though the API supports patching title/description and mentor-only assignment on create. Specs must either explicitly allow “UI may lag API” or require the missing UI work.
- **Make Q4 response semantics strict and testable**:
  - The implementation uses **404-only** for foreign task IDs across GET/PATCH/DELETE (`app/api/tasks/[id]/route.ts`). Update S4 to require 404 (not “403/404”).
- **Fix test coverage claims**:
  - Q4 is currently covered by **unit tests** (`lib/permissions.test.ts`), not by route-level HTTP tests.
  - CRUD “service layer” tests do not exist; only P4/Q4 unit tests plus one Playwright critical-path E2E exist (`e2e/critical-path.spec.ts`).

