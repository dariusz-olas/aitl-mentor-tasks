# Reviewer guide — AITL wyróżnienie

Wejście dla oceniającego: ten plik mapuje wymaganie → dowód. Repo: https://github.com/dariusz-olas/aitl-mentor-tasks

## Demo (≤2 min)

1. `Copy-Item .env.example .env` i ustaw własny `AUTH_SECRET` (≥16 znaków).
2. `npm ci` → `npm run dev` → http://localhost:3000
3. Zaloguj się kontem demo, utwórz / edytuj zadanie, zmień status todo→doing→done.

| | |
|--|--|
| Role | `mentor`, `mentee` |
| Konta | `mentor@demo.local` / `demo-mentor` · `mentee.a@demo.local` / `demo-mentee-a` · `mentee.b@demo.local` / `demo-mentee-b` |
| Seed | `data/db.json` przy pierwszym starcie (`lib/db.ts`) |
| Brak publicznego URL | aplikacja tylko lokalnie (pole „link do aplikacji” w formularzu zostaw puste) |
| `AUTH_SECRET=CHANGE_ME` | poprawne logowanie demo pokazuje na ekranie: `AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.` |
| `npm start` (produkcja) | logowanie demo → 403 `Demo credentials disabled in production` (zamierzone) |

## Produkt

| ID | Co sprawdzić | Gdzie |
|----|--------------|-------|
| P1 | Logowanie + komunikat błędu | `/login` → `/tasks`; złe hasło → `Invalid credentials` (S5) |
| P2 | 2 role | mentor vs mentee w nagłówku `/tasks` |
| P3 | CRUD | Create (tytuł+opis; mentor: assignee); Edit; status; Delete |
| P4 | Status tylko todo→doing→done; mentor reopen | `todo→done` → 400; `lib/task-status.ts` + testy |
| Q4 | IDOR | mentee.a, `GET /api/tasks/t-seed-b` → 404; `lib/tasks-api.idor.test.ts` + E2E |

## Agenci / proces

| ID | Artefakt | Gdzie |
|----|----------|-------|
| A1–A2 | Brief + backlog | `.ai/product-brief.md`, `docs/backlog.md` |
| A3–A4 | Specki + review innym modelem | `.ai/specs/S1…S6*.md` i `*-review.md` (tabela niżej) |
| A5–A6 | AGENTS + skille | `AGENTS.md`, `.cursor/skills/implement-from-spec/`, `.cursor/skills/secure-env-check/` |
| A7 | Hook | `.cursor/hooks/`, `docs/hook-demo.md`, `scripts/verify-hook.js` (58 case’ów w CI) |
| A8–A9 | PR agenta ze specki + review przed merge | **[PR #8](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/8)** — patrz niżej |

### Modele

| Story | Spec napisał | Spec przejrzał | Kod napisał | Kod / PR przejrzał |
|-------|--------------|----------------|-------------|---------------------|
| S1–S4 | Composer i GPT-5.6 Sol (przełączane w Cursorze) | GPT-5.2, 2026-11-14 | Composer i GPT-5.6 Sol | — (uwaga o PR #3) |
| S5 | Claude Fable 5.2 | GPT-5.6 Sol (3 przebiegi) | Claude Fable 5.2 | Gemini 4 Hydrogen (plik `-code-review.md`) |
| S6 | Claude Fable 5.2 | GPT-5.6 Sol | Claude Fable 5.2 | **człowiek na GitHubie przed merge** ([PR #8](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/8), komentarz „Jest OK.”) |

Review S1–S4 było po powstaniu kodu (specki dopasowano do implementacji). Od S5 kolejność jest: szkic → review → poprawki → akceptacja → kod (widać w historii commitów).

### Dowód A8–A9 — [PR #8](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/8)

- Agent: skill `implement-from-spec`, specka `.ai/specs/S6-disabled-signin-feedback.md` (wcześniej przejrzał ją inny model).
- Przed merge: komentarz człowieka na PR („Jest OK.”, 2026-11-14T21:55:55Z), merge 21:56:07Z.
- S5 ([PR #4](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/4) / [#5](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/5) / [#7](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/7)) pokazuje ten sam proces specek i implementacji; **kanoniczny dowód review człowieka przed merge to PR #8**.

### Uwaga o PR #3

[PR #3](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/3) (S2+S4, zbiorczy) był przeglądany w Cursorze, nie na GitHubie — **nie** jest dowodem A9. [PR #1](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/1) / [#2](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/2) zamknięte bez merge (kosmetyka ≠ A8).

## CI / security

- Workflow: [`.github/workflows/ci.yml`](https://github.com/dariusz-olas/aitl-mentor-tasks/actions/workflows/ci.yml) — build, unit, verify-hook, `npm audit`, Playwright
- Ochrona `main`: wymagany PR + zielone `build-test`
- `security-notes.md` — uprawnienia agenta, sekrety, granice hooka, wynik próby prompt injection (2026-11-14)
- Fonty: `next/font/local` z `app/fonts/` (build CI bez wywołania Google)
