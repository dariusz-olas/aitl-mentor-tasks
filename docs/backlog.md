# Backlog — EPIC-1 Pionowy przekrój AITL

**Cel:** auth + 2 role + CRUD + P4 + dowód Q4.

| ID | Story | AC (skrót) | Spec | Review | Status |
|----|-------|------------|------|--------|--------|
| S1 | Auth + role | Login JWT, 3 seed users, AUTH_SECRET required | `.ai/specs/S1-auth-roles.md` | GPT-5.2 `*-review.md` | ✅ |
| S2 | CRUD Task | C/R/U/D UI+API, description, mentor assign | `.ai/specs/S2-task-crud.md` | GPT-5.2 | ✅ (ten PR) |
| S3 | P4 statusy | todo→doing→done; mentor reopen | `.ai/specs/S3-status-p4.md` | GPT-5.2 | ✅ |
| S4 | Q4 IDOR | mentee A ≠ task B → **404** (route tests) | `.ai/specs/S4-permissions-q4.md` | GPT-5.2 | ✅ (ten PR) |
| S5 | Komunikat błędu logowania | Ekran logowania pokazuje powód z API; fallback `Login failed`; E2E + unit | `.ai/specs/S5-login-error-feedback.md` | GPT-5.6 Sol `S5-login-error-feedback-review.md` | spec po review; implementacja w osobnym PR |

Issues na GitHubie: opcjonalne — backlog żyje w tym pliku.
