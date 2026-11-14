# AGENTS.md — router (aitl-mentor-tasks)

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Testy: Vitest (`npm test`)
- Auth/DB: planowane Auth.js credentials + SQLite (F3)
- CI: GitHub Actions (`.github/workflows/ci.yml`) — po publicznym remote

## Konwencje

- Branch: `feat/…`, `fix/…`
- PR: jeśli agent — podaj model + skill; CI zielone przed merge
- Nie commitować sekretów (`.env*`); hook `.cursor/hooks/block-env-commit.js`

## Gdzie szukać

| Potrzeba | Ścieżka |
|----------|--------|
| Brief | `.ai/product-brief.md` |
| Specki | `.ai/specs/` |
| Skill | `.ai/skills/implement-from-spec/` |
| P4 status domain | `lib/task-status.ts` |
| Security | `security-notes.md` |
| Reviewer | `docs/REVIEWER.md` |
| Hook demo | `docs/hook-demo.md` |
| Backlog | `docs/backlog.md` |

## Skille

- `implement-from-spec` — implementacja z `.ai/specs/` → PR bez merge

## Zakazy

- Deploy prod bez człowieka
- Commit `.env*`
- Merge własnego PR agenta bez review człowieka
