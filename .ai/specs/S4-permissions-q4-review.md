# Review S4 — independent model pass

**Reviewer model:** GPT-5.2
**Review date:** 2026-11-14
**Author (spec):** Composer (Cursor)
**Verdict:** request changes

## Findings

### Must

- **Pick one unauthorized-by-id response and codify it**: implementation consistently returns **404** (not 403) for foreign-task access across:
  - `GET /api/tasks/:id` in `app/api/tasks/[id]/route.ts`
  - `PATCH /api/tasks/:id` in `app/api/tasks/[id]/route.ts`
  - `DELETE /api/tasks/:id` in `app/api/tasks/[id]/route.ts`
  The spec currently says “403/404”. For this repo, make it **404-only** (matches `security-notes.md` and `docs/REVIEWER.md`).
- **Fix the “automated test” scope to match reality**: current Q4 coverage is a **unit test of `lib/permissions.ts`** in `lib/permissions.test.ts`. It does *not* exercise the route handlers for `GET/PATCH/DELETE` by id. Either:
  - change AC1 to explicitly accept unit-level tests for the permission layer (and maybe add a small route-level smoke test later), or
  - require adding route-handler tests and implement them. Right now, the spec overstates the existing coverage.
- **Be explicit that mentee visibility/ops are assignee-based**: implementation is exactly `task.assigneeUserId === user.id` for mentees (`lib/permissions.ts`). The spec’s rule section matches this; keep it unambiguous and ensure S2 uses the same definition of “own/owner”.

### Should

- **Call out list endpoint behavior for IDOR prevention**: `GET /api/tasks` filters tasks by `canReadTask` (`app/api/tasks/route.ts`) so mentees never see foreign tasks in lists. This is part of the security story and should be mentioned in S4 “Rules” or acceptance criteria.
- **State where enforcement happens**: permissions are enforced in both the API route handlers (`app/api/tasks/*.ts`) and the pure functions in `lib/permissions.ts`. The spec should say that UI is not a security boundary.

### Nice

- **Add a note about write-vs-read symmetry**: `canWriteTask` currently equals `canReadTask` (so if a mentee can read their task, they can patch it, subject to P4 status rules). If the spec ever intends finer-grained rules (e.g., mentee cannot edit title), it must change `lib/permissions.ts`.

## Alignment with implementation

### What matches

- **Rule implementation matches**: mentor can read/write/delete all tasks; mentee can only operate on tasks where `assigneeUserId === self` (`lib/permissions.ts`).
- **IDOR mitigation by 404** is implemented in `app/api/tasks/[id]/route.ts`.
- **Security docs are present**: `security-notes.md` documents 404-on-IDOR and points to `lib/permissions.test.ts`.
- **Reviewer instructions match behavior**: `docs/REVIEWER.md` includes a Q4 check: mentee.a `GET /api/tasks/t-seed-b` → 404.

### What drifts / is missing

- **AC1 is not met as written**: there are no automated tests that issue HTTP requests to `GET/PATCH/DELETE /api/tasks/:id`; the only automated check is unit-level permission functions (plus a P4 role check via `canTransition`).
- **Spec ambiguity (403 vs 404)**: implementation is 404-only; leaving 403/404 open invites regressions in the security posture.

## Author response

**Author model:** Composer (Cursor) · **Date:** 2026-11-14

- Spec now requires **404-only** IDOR semantics and **route-level** automated tests.
- Same PR adds `lib/tasks-api.idor.test.ts` (mocked session + route handlers) and E2E IDOR check.
