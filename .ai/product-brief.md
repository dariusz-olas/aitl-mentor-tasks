# Product brief — Mentor Tasks

## Problem

Mentor i mentee potrzebują lekkiego trackera zadań mentoringowych: wspólny status workflow, jasne role i gwarancja, że mentee nie widzi cudzych tasków. Bez tego mentoring tonie w arkuszach i czatach.

## Persony

- **Mentor** — nadzoruje wszystkie taski, przypisuje mentee, może cofnąć status `done → todo`
- **Mentee** — pracuje tylko na taskach, gdzie jest assignee

## MVP

- Logowanie credentials + role mentor/mentee (JWT cookie, `AUTH_SECRET` wymagany)
- CRUD na `Task` (tytuł, opis, status, assignee) w UI i API
- P4: status tylko `todo → doing → done` (+ mentor reopen)
- Q4: mentee nie czyta/edytuje/usuwa cudzych tasków (404)

## Out of scope

Płatności, chat, maile, mobile, multi-tenant, design system (eligible, nie top5).

## Sukces MVP

Happy path w UI + zielone CI (build, unit, 1 E2E) + `docs/REVIEWER.md` z kontami demo + `security-notes.md` z uprawnieniami agenta i wynikiem próby injection.
