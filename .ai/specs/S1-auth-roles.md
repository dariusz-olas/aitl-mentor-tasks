# Spec S1 — Auth + roles

**Author model:** Composer (Cursor)  
**Epic:** EPIC-1  
**Status:** draft → ready after review

## Goal

Users can sign in as `mentor` or `mentee`. Unauthenticated users cannot access task UI/API.

## Scope

- Credentials demo auth (no OAuth in MVP)
- Session cookie
- Role stored on user and available to server components / API
- Seed two demo users

## Out of scope

- Password reset, email verify, OAuth, SSO

## Acceptance criteria

1. Given no session, when visiting `/tasks`, then redirect to `/login`.
2. Given valid `mentor@demo.local` / demo password, when logging in, then session role is `mentor` and `/tasks` loads.
3. Given valid `mentee@demo.local` / demo password, when logging in, then session role is `mentee`.
4. Given active session, when logging out, then `/tasks` redirects to `/login`.
5. Role is readable server-side for authorization checks (not only client UI label).

## Technical notes

- Prefer Auth.js (NextAuth) credentials provider + SQLite (or file DB) for MVP
- Demo passwords only in seed / REVIEWER — never production secrets
- Unit/integration: helper to create session for tests

## Open questions

- None blocking after review
