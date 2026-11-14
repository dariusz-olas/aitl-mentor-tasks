# Review S3 — independent model pass

**Reviewer model:** GPT-5.2
**Review date:** 2026-11-14
**Author (spec):** Composer (Cursor)
**Verdict:** approve with changes

## Findings

### Must

- **Tighten the “evidence” wording to match the repository**:
  - P4 unit tests exist in `lib/task-status.test.ts`.
  - Runtime enforcement exists in `app/api/tasks/[id]/route.ts` via `assertTransition(...)` before calling `updateTask(...)`.
  The spec should reference these concrete file paths (it already references `lib/task-status.ts`).
- **Clarify what “no DB change” means in this implementation**: persistence is JSON (`lib/db.ts`). The API returns `400` before calling `updateTask()` when transition is illegal; make that explicit so the acceptance criterion can be verified without a SQL DB.

### Should

- **Specify error semantics expected by clients/tests**: current API returns `400 { error: "Illegal status transition ..." }` (message from `assertTransition`), not a generic code-only response.
- **Keep RBAC/IDOR separate**: the spec correctly states “independent of RBAC/IDOR”; keep that wording explicit so reviewers don’t confuse P4 (workflow) with Q4 (access control).

### Nice

- **Optional debugging guidance**: suggest adding a minimal log for rejected transitions in dev only (implementation choice; not required for MVP).

## Alignment with implementation

### What matches

- **Domain module exists** in `lib/task-status.ts` with `canTransition` + `assertTransition`.
- **Forward-only workflow** is implemented: `todo → doing → done`, no `todo → done`.
- **Mentor-only reopen** is implemented: `done → todo` allowed only for role `mentor`.
- **Tests are present and passing** (by inspection) in `lib/task-status.test.ts`.

### What drifts / is missing

- **Doc pointer drift**: `docs/REVIEWER.md` mentions P4 and points to `lib/task-status.ts`, but does not explicitly point to `lib/task-status.test.ts` as acceptance criterion #3 requests.
- **“Service layer” language drift**: enforcement is currently in route handlers (not a dedicated service layer). If the spec mandates a service layer, call that out as future refactor rather than a requirement.

## Author response

**Author model:** Composer and GPT-5.6 Sol (Cursor sessions; models were switched — corrected 2026-11-14) · **Date:** 2026-11-14

- Accepted verdict (approve with changes). REVIEWER.md updated to point at `lib/task-status.test.ts`. Enforcement stays in route handlers (no service-layer refactor in MVP).
