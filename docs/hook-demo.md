# Hook demo (AITL)

## Cel hooka

Blokada `git add/commit/push` gdy komenda dotyczy plików `.env*`.

## Gdzie jest zdefiniowany

- `.cursor/hooks.json` → `beforeShellExecution`
- Skrypt: `.cursor/hooks/block-env-commit.js`
- Narzędzie: Cursor

## Scenariusz odtworzenia

1. Spróbuj (w środowisku z hookami Cursor):  
   `git add .env.local`  
   albo przekaż tę komendę przez shell podlegający hookowi.
2. Oczekiwany rezultat: **zatrzymanie** (exit code 2, komunikat HOOK DENY).
3. Dowód lokalny (bez Cursor UI):

```powershell
cd C:\Users\NowyDariusz\Projects\aitl-mentor-tasks
echo '{"command":"git add .env.local"}' | node .cursor/hooks/block-env-commit.js
echo ExitCode=$LASTEXITCODE
```

Oczekiwane: `ExitCode=2`.

Kontrola negatywna (powinna przejść):

```powershell
echo '{"command":"git status"}' | node .cursor/hooks/block-env-commit.js
echo ExitCode=$LASTEXITCODE
```

Oczekiwane: `ExitCode=0`.

## Dlaczego to ma znaczenie

Deterministyczna reguła bezpieczeństwa — nie poleganie na „agent obiecał”.
