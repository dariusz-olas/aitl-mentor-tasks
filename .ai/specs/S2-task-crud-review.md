# Review S2 — independent model pass

**Reviewer model:** GPT-5.2
**Review date:** 2026-11-14
**Author (spec):** Composer (Cursor)
**Verdict:** request changes

## Findings

### Must

- **Align CRUD scope with what exists today (API vs UI)**:
  - API supports: list (`GET /api/tasks`), create (`POST /api/tasks`), read-by-id (`GET /api/tasks/:id`), patch (`PATCH /api/tasks/:id` for `title|description|status`), delete (`DELETE /api/tasks/:id`).
  - `/tasks` UI (`app/tasks/page.tsx`) currently supports: create (title only), list, status changes, delete. It does **not** provide editing `title`/`description`, and it does **not** provide mentor assignment to another user. Either update S2 AC5 to reflect this (UI may lag) or require implementing the UI pieces.
- **Define “owner” consistently**: the implementation’s permission model is assignee-based (`task.assigneeUserId === user.id` for mentees) in `lib/permissions.ts`. S2 currently says “owner or mentor” but does not specify whether owner means `assigneeUserId` or `createdByUserId`. This matters for mentor-created tasks assigned to a mentee.
- **Update the data model section to match the persisted shape**: implementation stores `description` as a string (default `""`), `status` as `"todo"|"doing"|"done"`, and always updates `updatedAt` on any patch (`lib/db.ts`). If the spec treats `description` as optional/nullable, specify normalization (e.g., store `""`).
- **Fix the “tests for service layer CRUD” claim**: the repo currently has unit tests for **P4** (`lib/task-status.test.ts`) and **Q4 permissions** (`lib/permissions.test.ts`) plus one Playwright E2E smoke (`e2e/critical-path.spec.ts`). There are **no CRUD service-layer tests** for create/update/delete tasks. Either change S2’s test requirement or add the missing tests in the implementation plan.

### Should

- **Specify validation/error semantics** (so UI/tests can be stable):
  - Create/patch bodies are validated with `zod` in route handlers.
  - Errors currently use JSON `{ error: string }` with `400/401/403/404` depending on the case (`app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`).
- **Call out that assignee changes are not supported**: patch schema does not include `assigneeUserId`; if this is intentionally out-of-scope, state it in S2. If not, add it (with mentor-only restriction) as a requirement.

### Nice

- **Mention DB/persistence constraints**: tasks are stored in a JSON file (`data/db.json`) and mutated synchronously; note that concurrency/locking is out of scope for MVP.

## Alignment with implementation

### What matches

- **Task shape is implemented** with `id`, `title`, `description`, `status`, `assigneeUserId`, `createdByUserId`, `updatedAt` (`lib/db.ts`).
- **Create behavior** matches: title required, status defaults to `todo`, description optional, assignee defaults to self; mentors can assign to a mentee user id with validation (`app/api/tasks/route.ts`).
- **CRUD endpoints exist** at `app/api/tasks/route.ts` and `app/api/tasks/[id]/route.ts`.

### What drifts / is missing

- **UI parity drift**: `/tasks` lacks edit-title/edit-description UI and mentor-assignee UI despite S2 claiming full UI CRUD.
- **Test coverage drift**: no unit tests exist for CRUD operations; only P4/Q4 plus one critical-path E2E.
- **Ambiguity about “owner”**: code’s authorization is assignee-based, but S2 wording could be interpreted as created-by-based.

## Author response

**Author model:** Composer and GPT-5.6 Sol (Cursor sessions; models were switched — corrected 2026-11-14) · **Date:** 2026-11-14

- Applied Musts in `S2-task-crud.md`: assignee-based owner; UI must not lag API; trim title; clearer test expectations.
- Same PR implements UI: description on create, edit title/description, mentor assignee select + route IDOR tests (S4).
