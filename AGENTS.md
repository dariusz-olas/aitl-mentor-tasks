# AGENTS.md — router (aitl-mentor-tasks)

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Auth: custom HS256 JWT (`jose`) + cookie `aitl_session` — **`AUTH_SECRET` required**
- DB: JSON file store (`lib/db.ts` → `data/db.json`), seed 3 demo users
- Testy: Vitest (`npm test`) + Playwright (`npm run test:e2e`)
- CI: GitHub Actions (`.github/workflows/ci.yml`)

## Konwencje

- Branch: `feat/…`, `fix/…`
- PR: jeśli agent — podaj model + skill + link do specki; CI zielone przed merge
- Nie commitować sekretów (`.env*`); hook `.cursor/hooks/block-env-commit.js`

## Gdzie szukać

| Potrzeba | Ścieżka |
|----------|--------|
| Brief | `.ai/product-brief.md` |
| Specki + review 2. modelu | `.ai/specs/` |
| Skill (Cursor) | `.cursor/skills/implement-from-spec/` |
| Skill (mirror) | `.ai/skills/implement-from-spec/` |
| Skill secure-env | `.cursor/skills/secure-env-check/` |
| P4 status domain | `lib/task-status.ts` |
| Security | `security-notes.md` |
| Reviewer | `docs/REVIEWER.md` |
| Hook demo | `docs/hook-demo.md` |
| Backlog | `docs/backlog.md` |

## Skille — kiedy ładować

- `implement-from-spec` — implementacja z `.ai/specs/` → PR bez merge
- `secure-env-check` — weryfikacja hooka / próba injection przed oddaniem

## Zakazy

- Deploy prod bez człowieka
- Commit `.env*`
- Merge własnego PR agenta bez review człowieka
