# Spec S5 — Login error feedback

**Author model:** Claude Fable 5.2 (Cursor)
**Epic:** EPIC-1
**Depends on:** S1
**Status:** draft — awaiting second-model review

## Goal

When sign-in fails, the login screen tells the user why, using the reason the API already returns, so a mentor, a mentee, or a reviewer running the app locally can fix the problem without reading server logs.

## Background

`POST /api/auth/login` (`app/api/auth/login/route.ts`) already returns distinct JSON errors:

- 400 `Invalid JSON` / `Invalid body`
- 401 `Invalid credentials`
- 403 with an `AuthConfigError` message (missing or placeholder `AUTH_SECRET`, or demo credentials in production)

`app/login/page.tsx` discards them and always shows `Login failed`. A blind copy of `.env.example` therefore looks like a broken app instead of a configuration step that was skipped.

## Scope

- `app/login/page.tsx` (client) plus one small pure helper
- No change to API status codes or messages; no change to auth logic

## Acceptance criteria

1. Wrong password for an existing demo account → an alert (`role="alert"`) shows `Invalid credentials`; the user stays on `/login`; no session cookie is set.
2. Unknown email → the same `Invalid credentials` text as AC1 (no account enumeration).
3. Server responds 403 with an `error` string (auth configuration) → the alert shows that string verbatim.
4. Response is not OK and has no usable `error` string (non-JSON body, network failure, empty or non-string `error`) → the alert shows the fallback `Login failed`.
5. Error text is rendered as plain text (React text node), never as HTML.
6. A new submit clears the previous alert before the request; a successful login still navigates to `/tasks`.
7. Automated coverage: E2E (Playwright) covers AC1 (alert text, still on `/login`, `GET /api/auth/me` → 401). A unit test covers the message-selection logic for AC3 and AC4 through the pure helper.
8. `docs/REVIEWER.md` says in one line what a reviewer sees when `AUTH_SECRET` is still the placeholder.

## Out of scope

- Rate limiting, lockout, password reset
- Changing API error messages; i18n
- Field-level validation UI

## Technical notes

- Extract a pure helper, e.g. `lib/login-error.ts` → `loginErrorMessage(body: unknown): string`, so AC3 and AC4 are unit-testable without a browser.
- Truncate the displayed message to 200 characters to keep the layout stable.
- Messages come only from our own API and contain no secrets (`lib/auth.ts`).

## Open questions

- Should the 403 configuration message be shown to unauthenticated visitors in production? For this local MVP: yes. Revisit before any public deploy.
