# aitl-mentor-tasks

Projekt wyróżnienia **AI Tech Leaders** — lokalny tracker zadań mentoringowych (mentor / mentee, CRUD, reguła statusów P4, izolacja Q4).

**Dla oceniającego zacznij tutaj:** [`docs/REVIEWER.md`](docs/REVIEWER.md) (wymaganie → dowód).

## Start lokalny

1. `cp .env.example .env` (Windows: `Copy-Item .env.example .env`) i ustaw **własny** `AUTH_SECRET` (≥16 znaków; `CHANGE_ME` jest celowo odrzucany)
2. `npm ci`
3. `npm test`
4. `npm run build`
5. `npm run dev` → http://localhost:3000

### Konta demo

| Email | Hasło | Rola |
|-------|-------|------|
| `mentor@demo.local` | `demo-mentor` | mentor |
| `mentee.a@demo.local` | `demo-mentee-a` | mentee |
| `mentee.b@demo.local` | `demo-mentee-b` | mentee |

Konta demo działają tylko w `npm run dev`. W `npm start` (produkcja) logowanie demo zwraca 403 — celowo. Aplikacja nie ma publicznego wdrożenia.

## AITL — mapa

| Temat | Ścieżka |
|-------|--------|
| Przewodnik oceniającego | [`docs/REVIEWER.md`](docs/REVIEWER.md) |
| Brief / backlog | `.ai/product-brief.md` · `docs/backlog.md` |
| Specki + review | `.ai/specs/` (S1–S4: GPT-5.2; S5–S6: GPT-5.6 Sol) |
| Agenci | `AGENTS.md` · `.cursor/skills/` · `.cursor/hooks/` |
| Security / injection | `security-notes.md` · `docs/hook-demo.md` |
| Dowód A8–A9 | [PR #8](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/8) |
| P4 / Q4 | `lib/task-status.ts` · `lib/permissions.ts` · `lib/tasks-api.idor.test.ts` |

## CI

[`.github/workflows/ci.yml`](https://github.com/dariusz-olas/aitl-mentor-tasks/actions/workflows/ci.yml) — na każdym PR: build, testy jednostkowe, test hooka, `npm audit`, Playwright E2E. Gałąź `main` wymaga PR + zielonego `build-test`.
