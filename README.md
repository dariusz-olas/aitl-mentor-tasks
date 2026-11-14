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

Szczegóły checklisty: [`docs/REVIEWER.md`](docs/REVIEWER.md).

## AITL — gdzie szukać

- `AGENTS.md` · `.ai/` · `.cursor/skills/` · `docs/REVIEWER.md` · `docs/hook-demo.md` · `security-notes.md`
- Specki + niezależne review (GPT-5.2, 2026-11-14): `.ai/specs/`
- P4: `lib/task-status.ts` · Q4: `lib/permissions.ts` + `lib/tasks-api.idor.test.ts`

## CI

Workflow: `.github/workflows/ci.yml` — build + unit + Playwright E2E.
