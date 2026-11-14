# Hook demo (AITL)

## Cel hooka

Utrzymać pliki `.env*` poza gitem, gdy komendy wykonuje agent. Hook odmawia (exit 2), gdy:

1. `git add` / `git stage` ma flagę force w dowolnej formie (`-f`, `-fA`, `-Af`, `--force`, skróty `--f…`, także w cudzysłowie),
2. użyto `git update-index --add` / `--cacheinfo`,
3. `git add/commit/push/stage` wymienia literalnie ścieżkę `.env*` (poza `.env.example` i `.env.sample`),
4. `git add/commit/push/stage` jest uruchamiany, gdy jakiś `.env*` jest śledzony, zstagowany albo nieignorowany,
5. wywołanie nie zawiera komendy do sprawdzenia (pusty lub nieznany payload) — fail closed.

Zignorowany `.env` na dysku to stan normalny: zwykłe `git add -A`, commit i push przechodzą.

## Gdzie jest zdefiniowany

- `.cursor/hooks.json` → `beforeShellExecution`
- Skrypt: `.cursor/hooks/block-env-commit.js`
- Test regresyjny: `scripts/verify-hook.js` (krok `verify env hook` w CI)

Hook działa tylko w sesji Cursora, której katalogiem roboczym jest to repo.

## Odtworzenie

```powershell
node scripts/verify-hook.js
```

Oczekiwane: 58 linii `OK`, na końcu `All hook cases passed`, exit 0. Skrypt podaje hookowi komendy przez stdin, tak jak Cursor; żadnej z testowanych komend nie wykonuje. Przypadki stanu repo (sekcja 6) budują jednorazowe repozytoria w katalogu tymczasowym.

Pojedynczy przypadek ręcznie:

```powershell
'{"command":"git add -f ."}' | node .cursor/hooks/block-env-commit.js
# HOOK DENY: refusing git add/stage with a force flag (it can add ignored .env* files)
```

## Czego hook nie zatrzyma

Lista w `security-notes.md` → „Granice hooka”. W skrócie: odczytu `.env`, wyniesienia treści inną drogą niż git, gita poza Cursorem. Hook nie zastępuje `.gitignore` ani secret scanning po stronie GitHuba.

## Hook a prompt injection

To dwie różne rzeczy i dwa różne dowody:

- test hooka (`scripts/verify-hook.js`) pokazuje, co mechanizm zrobi z komendą, jeśli agent ją wyda,
- próba prompt injection (`security-notes.md` → „Próba z 2026-11-14”, `scripts/injection-lab.js`) pokazuje, czy agent w ogóle ją wyda po przeczytaniu wrogiej treści.
