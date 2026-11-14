# Spec S2 — Task CRUD

**Author model:** Composer (Cursor)  
**Epic:** EPIC-1  
**Depends on:** S1

## Goal

Full CRUD on `Task` for authenticated users within their permissions.

## Data model (MVP)

`Task`: `id`, `title`, `description`, `status` (`todo|doing|done`), `assigneeUserId`, `createdByUserId`, `updatedAt`

## Acceptance criteria

1. **Create:** authenticated user can create a task with title (required) and optional description; default status `todo`; assignee defaults to self unless mentor sets mentee.
2. **Read:** user sees list/detail of tasks they are allowed to see (rules finalized in S4).
3. **Update:** owner or mentor can edit title/description; status changes follow S3 rules.
4. **Delete:** mentee deletes own tasks; mentor may delete any task.
5. All four operations available via UI (`/tasks`) and covered by at least unit tests for service layer; E2E path in F4.

## Out of scope

- Attachments, comments, tags, search

## Technical notes

- Server actions or route handlers — no direct client DB
- Validate with zod (or equivalent)
