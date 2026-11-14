# Spec S2 — Task CRUD

**Author model:** Composer and GPT-5.6 Sol (Cursor sessions; models were switched — corrected 2026-11-14)
**Epic:** EPIC-1
**Depends on:** S1
**Status:** ready (Must from GPT-5.2 review 2026-11-14 applied)

## Goal

Full CRUD on `Task` for authenticated users within their permissions.

## Data model (MVP)

`Task`: `id`, `title`, `description`, `status` (`todo|doing|done`), `assigneeUserId`, `createdByUserId`, `updatedAt`

**Owner (MVP):** for mentee ops, “own task” means `assigneeUserId === session.user.id` (not `createdByUserId`).

## Acceptance criteria

1. **Create:** authenticated user can create a task with title (required, trimmed non-empty) and optional description; default status `todo`; assignee defaults to self; **mentor** may set `assigneeUserId` to a mentee (UI + API).
2. **Read:** user sees list/detail of tasks they are allowed to see (rules in S4).
3. **Update:** assignee (mentee owner) or mentor can edit **title** and **description** via UI and API; status changes follow S3 rules.
4. **Delete:** mentee deletes own tasks; mentor may delete any task.
5. All four operations available via UI (`/tasks`) and API (`/api/tasks`, `/api/tasks/:id`).
6. Automated coverage: unit tests for permissions/P4 remain; **route-level IDOR** covered in S4; E2E critical path covers create + status; UI edit path covered by E2E or unit of PATCH body.

## Out of scope

- Attachments, comments, tags, search

## Technical notes

- Route handlers only — no direct client DB
- Validate with zod (trim title)
- UI must not lag API for title/description edit and mentor assignee on create
