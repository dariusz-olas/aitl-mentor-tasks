# Spec S4 — Permissions test Q4 (IDOR)

**Author model:** Composer (Cursor)
**Epic:** EPIC-1
**Depends on:** S1, S2
**Status:** ready (Must from GPT-5.2 review 2026-11-14 applied)

## Goal

Prove user A cannot read/update/delete user B’s tasks when B is another mentee; role escalation blocked.

## Rules

- Mentee: CRUD only on tasks where `assigneeUserId === self`.
- Mentor: can read/update/delete all tasks; can reopen status (S3).
- Direct ID access (`/api/tasks/:id`) must enforce same checks (no IDOR).
- **Error semantics:** foreign or invisible task ID → **404** (not 403) for GET/PATCH/DELETE.

## Acceptance criteria

1. Automated **route-level** test: mentee A cannot `GET/PATCH/DELETE` task owned by mentee B → **404**.
2. Automated unit test: mentee cannot perform mentor-only status reopen (`lib/task-status` / permissions suite).
3. Pure permission helpers still unit-tested in `lib/permissions.test.ts`.
4. Tests run in `npm test` and CI (must fail on regression).
5. Documented in `security-notes.md` + `docs/REVIEWER.md`.

## Out of scope

- Fine-grained sharing between mentees
