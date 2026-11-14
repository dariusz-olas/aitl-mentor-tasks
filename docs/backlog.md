# Backlog — EPIC-1 Pionowy przekrój AITL

**Cel:** auth + 2 role + CRUD + P4 + dowód Q4 (+ S5/S6: UX logowania i proces agent→PR).

| ID | Story | AC (skrót) | Spec | Review specki | Status |
|----|-------|------------|------|---------------|--------|
| S1 | Auth + role | Login JWT, 3 seed users, AUTH_SECRET required | `.ai/specs/S1-auth-roles.md` | GPT-5.2 | zrobione |
| S2 | CRUD Task | C/R/U/D UI+API, description, mentor assign | `.ai/specs/S2-task-crud.md` | GPT-5.2 | zrobione ([PR #3](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/3)) |
| S3 | P4 statusy | todo→doing→done; mentor reopen | `.ai/specs/S3-status-p4.md` | GPT-5.2 | zrobione |
| S4 | Q4 IDOR | mentee A ≠ task B → **404** | `.ai/specs/S4-permissions-q4.md` | GPT-5.2 | zrobione ([PR #3](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/3)) |
| S5 | Komunikat błędu logowania | Powód z API; fallback; E2E + unit | `.ai/specs/S5-login-error-feedback.md` | GPT-5.6 Sol (3 przebiegi) | zrobione ([PR #7](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/7)) |
| S6 | Disabled Sign in (wizualnie) | `disabled:opacity-50`; E2E opacity | `.ai/specs/S6-disabled-signin-feedback.md` | GPT-5.6 Sol | zrobione ([PR #8](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/8) — A9) |

Pełne AC w speckach. Backlog żyje w tym pliku.
