# Po pojawieniu się remote — PR agenta (A8/A9/A6)

1. `git checkout -b feat/agent-readme-skill`
2. Użyj skill `.ai/skills/implement-from-spec` — np. drobna poprawka z REVIEWER / README „Lekcje AITL”.
3. Commit + `git push -u origin HEAD`
4. `gh pr create` z body: model + skill `implement-from-spec` + link do specki
5. **Człowiek** review → approve → merge (nie merge sam)
6. Opcjonalnie 2. PR: np. dopięcie `npm audit` fail policy / drobny test
