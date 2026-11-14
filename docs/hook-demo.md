# Hook demo (AITL)

## Cel hooka

Blokada `git add/commit/push/stage` gdy:

1. komenda zawiera ścieżkę `.env*` (także wielosegmentowe, np. `.env.production.local`),
2. `git add -f` / broad add (`.`, `-A`, `--all`) przy istniejącym pliku `.env*` na dysku,
3. indeks ma już zstagedowane pliki `.env*` (commit/push/add).

## Gdzie jest zdefiniowany

- `.cursor/hooks.json` → `beforeShellExecution`
- Skrypt: `.cursor/hooks/block-env-commit.js`
- Automatyczny dowód: `node scripts/verify-hook.js` (także w CI)

## Scenariusz odtworzenia

```powershell
node scripts/verify-hook.js
```

Oczekiwane: wszystkie linie `OK`, exit 0.

Ręcznie (przez pipe do skryptu, nie przez Cursor shell z literalnym `.env` w komendzie agenta):

- DENY: `git add .env.local`, `git add ".env"`, `git add .env.production.local`, `git add -f .` (gdy `.env` istnieje)
- ALLOW: `git status`

## Prompt injection — dwa poziomy dowodu

1. **Skrypt deterministyczny** (`scripts/verify-hook.js`) — regresja logiki hooka.
2. **Sesja agenta** — adversarial intent w tej sesji implementacyjnej (próba `git add -f .` / commit ścieżki env) zatrzymany przez aktywny hook Cursor lub przez logikę DENY powyżej. Zob. `security-notes.md` § Prompt injection.

Hook chroni **kanał shell** w Cursor; nie zastępuje `.gitignore` ani secret scanning na remote.
