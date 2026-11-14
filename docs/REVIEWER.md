# Reviewer guide — AITL wyróżnienie

## Demo (≤2 min)

- URL: lokalnie `npm run dev` → http://localhost:3000 (public URL po deploy)
- Role: `mentor`, `mentee`
- Konta demo:
  - `mentor@demo.local` / `demo-mentor`
  - `mentee.a@demo.local` / `demo-mentee-a`
  - `mentee.b@demo.local` / `demo-mentee-b`
- Seed: tworzony w `data/db.json` przy pierwszym starcie (`lib/db.ts`)

## Produkt

| ID | Co sprawdzić | Gdzie |
|----|--------------|-------|
| P1 | Logowanie | `/login` → `/tasks` |
| P2 | 2 role | mentor vs mentee w nagłówku `/tasks` |
| P3 | CRUD C/R/U/D | Create (title+description; mentor assignee); Edit title/desc; status; Delete |
| P4 | Status tylko todo→doing→done; mentor reopen | spróbuj `todo→done` (400); `lib/task-status.ts` + `lib/task-status.test.ts` |
| Q4 | IDOR | zaloguj mentee.a, `GET /api/tasks/t-seed-b` → 404; testy `lib/tasks-api.idor.test.ts` |

## Agenci / proces

| ID | Artefakt | Link |
|----|----------|------|
| A1–A2 | Brief + backlog | `.ai/product-brief.md`, `docs/backlog.md` |
| A3–A4 | Spec + review 2. modelu | `.ai/specs/S1…S4*.md` |
| A5–A6 | AGENTS + skille | `AGENTS.md`, `.cursor/skills/implement-from-spec/`, `.cursor/skills/secure-env-check/` |
| A7 | Hook + demo | `.cursor/hooks/`, `docs/hook-demo.md` |
| A8–A9 | PR agenta ze specki | PR z `feat/s2-ui-and-evidence` (S2+S4) — review człowieka przed merge |

## CI / security

- Workflow: `.github/workflows/ci.yml`
- `npm test` — P4 + Q4 unit
- `security-notes.md`
