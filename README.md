# aitl-mentor-tasks

Projekt wyróżnienia **AI Tech Leaders** — mini tracker zadań mentoringowych (mentor/mentee, CRUD, P4 statusy, Q4 izolacja).

## Start lokalny

1. `cp .env.example .env` (Windows: `Copy-Item .env.example .env`) i ustaw **własny** `AUTH_SECRET` (≥16 znaków; `CHANGE_ME` z przykładu jest celowo odrzucany)
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

Konta demo działają tylko w `npm run dev`. W trybie produkcyjnym (`npm run build` + `npm start`) logowanie demo zwraca 403 — celowo.

Szczegóły checklisty: [`docs/REVIEWER.md`](docs/REVIEWER.md).

## AITL — gdzie szukać

- Przewodnik dla oceniającego (wymaganie → dowód): [`docs/REVIEWER.md`](docs/REVIEWER.md)
- `AGENTS.md` · `.ai/product-brief.md` · `docs/backlog.md` · `.cursor/skills/` · `docs/hook-demo.md` · `security-notes.md`
- Specki i review innym modelem: `.ai/specs/` (S1–S4: review GPT-5.2; S5: review specki GPT-5.6 Sol, review kodu Gemini 4 Hydrogen)
- P4: `lib/task-status.ts` · Q4: `lib/permissions.ts` + `lib/tasks-api.idor.test.ts`

## CI

Workflow: `.github/workflows/ci.yml` — na każdym PR: build, testy jednostkowe, test hooka, `npm audit`, Playwright E2E.
