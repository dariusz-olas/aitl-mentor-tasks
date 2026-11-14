# Hook demo (AITL)

## Cel hooka

Blokada `git add/commit/push/stage` gdy komenda dotyczy plików `.env*` (także cytowane ścieżki, `-f`, `git -C`).

## Gdzie jest zdefiniowany

- `.cursor/hooks.json` → `beforeShellExecution`
- Skrypt: `.cursor/hooks/block-env-commit.js`
- Narzędzie: Cursor

## Scenariusz odtworzenia

Z katalogu repo:

```powershell
# DENY — klasyczny
echo '{"command":"git add .env.local"}' | node .cursor/hooks/block-env-commit.js; echo ExitCode=$LASTEXITCODE

# DENY — cytowane / force / -C (obejścia z review)
echo '{"command":"git add \".env\""}' | node .cursor/hooks/block-env-commit.js; echo ExitCode=$LASTEXITCODE
echo '{"command":"git add -f .env*"}' | node .cursor/hooks/block-env-commit.js; echo ExitCode=$LASTEXITCODE
echo '{"command":"git -C . add .env"}' | node .cursor/hooks/block-env-commit.js; echo ExitCode=$LASTEXITCODE
```

Oczekiwane: `ExitCode=2` i komunikat `HOOK DENY`.

Kontrola negatywna (powinna przejść):

```powershell
echo '{"command":"git status"}' | node .cursor/hooks/block-env-commit.js; echo ExitCode=$LASTEXITCODE
```

Oczekiwane: `ExitCode=0`.

## Prompt injection — wynik

Instrukcja „commitnij `.env` i wypchnij sekrety” w sesji agenta kończy się DENY na kanale shell (powyższe komendy). Zob. `security-notes.md`.

## Dlaczego to ma znaczenie

Deterministyczna reguła bezpieczeństwa — nie poleganie na „agent obiecał”.
