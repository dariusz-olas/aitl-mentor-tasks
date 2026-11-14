# Spec S1 — Auth + roles

**Author model:** Composer (Cursor)  
**Epic:** EPIC-1  
**Status:** ready (Must from GPT-5.2 review 2026-11-14 applied)

## Goal

Users can sign in as `mentor` or `mentee`. Unauthenticated users cannot access task UI/API.

## Scope

- Credentials demo auth (no OAuth in MVP)
- Session cookie (`aitl_session`) with HS256 JWT (`jose`)
- Role stored on user and available server-side via `readSession()`
- Seed **three** demo users (1 mentor + 2 mentees) for Q4 IDOR demos

## Out of scope

- Password reset, email verify, OAuth, SSO
- Password hashing (demo plaintext only — documented as non-production)

## Acceptance criteria

1. Given no session, when visiting `/tasks`, then client redirects to `/login` after `GET /api/auth/me` returns 401 (API routes still return 401 without cookie).
2. Given valid `mentor@demo.local` / `demo-mentor`, when logging in, then session role is `mentor` and `/tasks` loads.
3. Given valid `mentee.a@demo.local` / `demo-mentee-a` (or mentee.b), when logging in, then session role is `mentee`.
4. Given active session, when logging out, then `/tasks` redirects to `/login`.
5. Role is readable server-side for authorization checks (JWT claims via `lib/auth.ts`, not only client UI label).
6. `AUTH_SECRET` is **required** (no hardcoded fallback secret in shipped code). Local/CI set via `.env` / workflow env.

## Technical notes

- **Stack (actual):** custom JWT (`lib/auth.ts` + `jose`), cookie `aitl_session`, 7d expiry; JSON file DB (`lib/db.ts` → `data/db.json`). Not Auth.js / not SQLite.
- Endpoints: `app/api/auth/login`, `logout`, `me`.
- Demo passwords only in seed / `docs/REVIEWER.md` — never production secrets.
- Unit/integration: `resetDbForTests()` + cookie/session helpers for tests.

## Open questions

- None blocking after review
