# Reviewer guide — AITL wyróżnienie

## Demo (≤2 min)

- Aplikacja działa lokalnie: `npm run dev` → http://localhost:3000 (bez publicznego wdrożenia)
- Role: `mentor`, `mentee`
- Konta demo:
  - `mentor@demo.local` / `demo-mentor`
  - `mentee.a@demo.local` / `demo-mentee-a`
  - `mentee.b@demo.local` / `demo-mentee-b`
- Seed: tworzony w `data/db.json` przy pierwszym starcie (`lib/db.ts`)
- Ślepa kopia `.env.example` (`AUTH_SECRET=CHANGE_ME`): poprawne logowanie demo pokaże na ekranie logowania `AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.` — ustaw własny sekret (min. 16 znaków) w `.env` i zrestartuj serwer (S5)
- Konta demo działają tylko w `npm run dev`. W trybie produkcyjnym (`npm run build` + `npm start`) logowanie demo zwraca 403 `Demo credentials disabled in production` — to zamierzone

## Produkt

| ID | Co sprawdzić | Gdzie |
|----|--------------|-------|
| P1 | Logowanie | `/login` → `/tasks`; błędny login pokazuje powód z API (S5) |
| P2 | 2 role | mentor vs mentee w nagłówku `/tasks` |
| P3 | CRUD C/R/U/D | Create (title+description; mentor assignee); Edit title/desc; status; Delete |
| P4 | Status tylko todo→doing→done; mentor reopen | spróbuj `todo→done` (400); `lib/task-status.ts` + `lib/task-status.test.ts` |
| Q4 | IDOR | zaloguj mentee.a, `GET /api/tasks/t-seed-b` → 404; testy `lib/tasks-api.idor.test.ts` |

## Agenci / proces

| ID | Artefakt | Gdzie |
|----|----------|-------|
| A1–A2 | Brief + backlog | `.ai/product-brief.md`, `docs/backlog.md` |
| A3–A4 | Specki + review innym modelem | `.ai/specs/S1…S5*.md` i `*-review.md` (tabela modeli niżej) |
| A5–A6 | AGENTS + skille | `AGENTS.md`, `.cursor/skills/implement-from-spec/`, `.cursor/skills/secure-env-check/` |
| A7 | Hook + demo | `.cursor/hooks/`, `docs/hook-demo.md`, `scripts/verify-hook.js` |
| A8–A9 | PR agenta ze specki + review przed merge | S5 — patrz „Ścieżka S5” niżej |

### Modele

| Story | Spec napisał | Spec przejrzał | Kod napisał | Kod przejrzał |
|-------|--------------|----------------|-------------|---------------|
| S1–S4 | sesje Cursora: Composer i GPT-5.6 Sol (przełączane) | GPT-5.2, 2026-11-14 | sesje Cursora: Composer i GPT-5.6 Sol | — (patrz uwaga o PR #3) |
| S5 | Claude Fable 5.2 (Cursor) | GPT-5.6 Sol, 2026-11-14, trzy przebiegi | Claude Fable 5.2 (Cursor) | Gemini 4 Hydrogen (`.ai/specs/S5-login-error-feedback-code-review.md`) + człowiek w PR |

Autorstwo S1–S4 według oświadczenia autora projektu: Cursor nie zapisuje modelu przy każdej wiadomości, a w sesjach przełączano oba modele. Nagłówki plików review S1–S4 podają autora tak, jak widział go recenzent („Composer”).

Review S1–S4 odbył się po powstaniu kodu i poprawił specki tak, żeby zgadzały się z implementacją. W S5 kolejność jest właściwa: szkic specki → review → poprawki → akceptacja → dopiero kod. Widać to w historii commitów gałęzi `docs/s5-spec`.

### Ścieżka S5 (dowód A3–A4 i A8–A9)

1. Specka i review: [PR #4](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/4) — commity po kolei: szkic → review „request changes” (4 Must) → rewizja 2 → re-review „request changes” (1 Must) → rewizja 3 → „approve”.
2. Implementacja: [PR #5](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/5) — agent pracował według skilla `implement-from-spec`. Code review innego modelu i odpowiedź autora są w pliku `.ai/specs/S5-login-error-feedback-code-review.md`; review człowieka jest w samym PR, przed merge.

### Uwaga o PR #3

[PR #3](https://github.com/dariusz-olas/aitl-mentor-tasks/pull/3) (S2 + S4 i poprawki zbiorcze) został przejrzany w rozmowie w Cursorze, a nie na GitHubie, więc w samym PR nie ma śladu review. Nie jest dowodem A9. Dowodem jest S5.

## CI / security

- Workflow: `.github/workflows/ci.yml` — [przebiegi](https://github.com/dariusz-olas/aitl-mentor-tasks/actions/workflows/ci.yml); na każdym PR: build, testy jednostkowe, test hooka, `npm audit`, Playwright E2E
- `npm test` — P4, Q4 (permissions, IDOR na poziomie tras, assign), komunikat logowania
- `npm run test:e2e` — ścieżka krytyczna, IDOR, błędy logowania
- `security-notes.md` — uprawnienia agenta, sekrety, granice hooka, wynik próby prompt injection
