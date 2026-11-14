# Backlog — EPIC-1 Pionowy przekrój AITL

**Cel:** auth + 2 role + CRUD + P4 + dowód Q4.

| ID | Story | AC (skrót) | Spec | Review specki | Status |
|----|-------|------------|------|---------------|--------|
| S1 | Auth + role | Login JWT, 3 seed users, AUTH_SECRET required | `.ai/specs/S1-auth-roles.md` | GPT-5.2 `S1-auth-roles-review.md` | zrobione |
| S2 | CRUD Task | C/R/U/D UI+API, description, mentor assign | `.ai/specs/S2-task-crud.md` | GPT-5.2 `S2-task-crud-review.md` | zrobione ([PR #3](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/3)) |
| S3 | P4 statusy | todo→doing→done; mentor reopen | `.ai/specs/S3-status-p4.md` | GPT-5.2 `S3-status-p4-review.md` | zrobione |
| S4 | Q4 IDOR | mentee A ≠ task B → **404** (route tests) | `.ai/specs/S4-permissions-q4.md` | GPT-5.2 `S4-permissions-q4-review.md` | zrobione ([PR #3](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/3)) |
| S5 | Komunikat błędu logowania | Ekran logowania pokazuje powód z API; fallback `Login failed`; E2E + unit | `.ai/specs/S5-login-error-feedback.md` | GPT-5.6 Sol `S5-login-error-feedback-review.md` (3 przebiegi) | zrobione (PR agenta ze specki, review przed merge) |

Pełne kryteria akceptacji są w speckach. Backlog żyje w tym pliku; issues na GitHubie nie są używane.
