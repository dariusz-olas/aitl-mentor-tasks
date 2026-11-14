# Spec S4 — Permissions test Q4 (IDOR)

**Author model:** Composer (Cursor)  
**Epic:** EPIC-1  
**Depends on:** S1, S2

## Goal

Prove user A cannot read/update/delete user B’s tasks when B is another mentee; role escalation blocked.

## Rules

- Mentee: CRUD only on tasks where `assigneeUserId === self` (or createdBy — pick one; **MVP: assigneeUserId === self** for mentee visibility/ops).
- Mentor: can read/update/delete all tasks; can reopen status (S3).
- Direct ID access (`/api/tasks/:id`) must enforce same checks (no IDOR).

## Acceptance criteria

1. Automated test: mentee A cannot `GET/PATCH/DELETE` task owned by mentee B → 403/404.
2. Automated test: mentee cannot perform mentor-only status reopen.
3. Test runs in `npm test` and/or CI job (must fail on regression).
4. Documented in `security-notes.md` + REVIEWER.

## Out of scope

- Fine-grained sharing between mentees
