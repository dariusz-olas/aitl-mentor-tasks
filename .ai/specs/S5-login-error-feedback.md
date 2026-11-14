# Spec S5 — Login error feedback

**Author model:** Claude Fable 5.2 (Cursor)
**Epic:** EPIC-1
**Depends on:** S1
**Status:** revision 3 — changed after two review passes by GPT-5.6 Sol (`S5-login-error-feedback-review.md`)

## Goal

When sign-in fails, the login screen tells the user why, using the reason the API already returns, so a mentor, a mentee, or a reviewer running the app locally can fix the problem without reading server logs.

## Background

`POST /api/auth/login` (`app/api/auth/login/route.ts`) already returns distinct JSON errors:

| Status | `error` | When |
|--------|---------|------|
| 400 | `Invalid JSON` | request body is not JSON |
| 400 | `Invalid body` | email is not an email, or password is empty (reachable from the form: the inputs have no client-side validation) |
| 401 | `Invalid credentials` | unknown email or wrong password |
| 403 | `AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.` | credentials are correct, but the secret is missing or shorter than 16 characters (this is the branch `AUTH_SECRET=CHANGE_ME` hits) |
| 403 | `AUTH_SECRET is a documented placeholder — set a unique local secret in .env.` | credentials are correct, but the secret is one of the blocked placeholders of 16+ characters |
| 403 | `Demo credentials disabled in production` | `NODE_ENV=production` and the email ends with `@demo.local` or the password is a demo password |

`app/login/page.tsx` discards all of them and always shows `Login failed`. A blind copy of `.env.example` therefore looks like a broken app instead of a configuration step that was skipped.

The secret is checked only when a session token is created, so outside production wrong credentials return 401 even when the secret is a placeholder. In production the demo guard (last row) answers before credentials are checked.

## Scope

- `app/login/page.tsx` (client) plus one pure helper, `lib/login-error.ts`
- New tests: `lib/login-error.test.ts`, `e2e/login-errors.spec.ts`
- One line in `docs/REVIEWER.md`
- No change to API status codes or messages; no change to auth logic

## Message selection (single rule for every non-OK response)

`loginErrorMessage(body: unknown): string`

1. If `body` is a non-null, non-array object (`typeof body === "object"`, not `null`, not `Array.isArray`) with an **own** property `error` whose value is a string, let `m` be that string with leading and trailing whitespace removed. The prototype of the object is not inspected: the body always comes from `JSON.parse`, and the own-property check is what matters.
2. If `m.length` is between 1 and 200 inclusive (`String.prototype.length`, UTF-16 code units), return `m` unchanged.
3. In every other case return the fallback `Login failed`.

There is no truncation: a message longer than 200 is replaced by the fallback, so "shown as returned" and the length cap cannot conflict.

The page calls the helper for any response with `ok === false`, whatever the status. If `fetch` rejects, or the response body cannot be parsed as JSON, the page shows the fallback and must not leave an unhandled promise rejection.

## Acceptance criteria

AC1 and AC2 apply to the non-production environment (`npm run dev`, Playwright E2E). In production the demo guard answers first; that case is covered by AC3.

1. Wrong password for an existing demo account, in a fresh browser context → an alert (`role="alert"`) shows `Invalid credentials`; the URL stays `/login`; the browser context holds no `aitl_session` cookie.
2. Unknown email `nobody@example.com` with any non-empty password → exactly the same alert text as AC1 (no account enumeration through the UI).
3. Any non-OK response whose body satisfies rules 1–2 above → the alert shows that message. This covers the 400, 401 and 403 rows of the table, including both `AUTH_SECRET` messages and the production demo guard.
4. The alert shows `Login failed` when: `fetch` rejects; the body is not JSON; the body is `null`, an array or a primitive; `error` is missing, inherited, not a string, empty or whitespace-only; or the trimmed message is longer than 200.
5. The message is rendered as a React text node, never as HTML.
6. Submitting clears the previous alert before the request and disables the submit button until the request settles. After a failed attempt, a corrected submission navigates to `/tasks` and no alert remains.
7. Automated coverage:
   - Unit (`lib/login-error.test.ts`): valid message; surrounding whitespace trimmed; length exactly 200 returned; length 201 → fallback; `error` missing; non-string; empty; whitespace-only; inherited property; `null`; array; string body; a class instance with an own string `error` (accepted, per rule 1).
   - E2E (`e2e/login-errors.spec.ts`), through the real page:
     a. wrong password against the real API → AC1, with the cookie checked via `page.context().cookies()`;
     b. unknown email → AC2;
     c. mocked 403 carrying the `AUTH_SECRET is required…` message (`page.route`) → the alert shows it exactly;
     d. mocked 500 with a `text/plain` body → `Login failed`;
     e. aborted request → `Login failed`;
     f. wrong password, then correct password with the second login response held back by the test → while that request is pending the previous alert is absent and the submit button is disabled; once the response is released the URL is `/tasks`;
     g. an email that is not an email (`not-an-email`) against the real API → the alert shows `Invalid body` (real 400 through the page);
     h. a mocked message containing HTML markup → the alert shows the markup as text and contains no element created from it (AC5; added after the code review of the implementation PR).
8. `docs/REVIEWER.md` states that with `AUTH_SECRET=CHANGE_ME` (a blind copy of `.env.example`) a correct demo login shows `AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.` on the login screen.

## Security

- The page shows only what our own login API returns. Those strings are already on the wire for any unauthenticated caller, so the page discloses nothing new; it only makes it visible.
- Today every `AuthConfigError` message names a configuration key and contains no secret value (`lib/auth.ts`). Nothing enforces that. Accepted for this local MVP. Before any public deploy the 403 text must be replaced by a stable public message (follow-up, not part of S5).
- The 200 limit and plain-text rendering keep an unexpected response from breaking the layout or injecting markup.
- A failed login neither creates nor clears a session cookie. A browser that is already signed in stays signed in; AC1 is therefore stated for a fresh context.

## Out of scope

- Rate limiting, lockout, password reset
- Changing API error messages or making `Invalid body` friendlier; client-side field validation; i18n
- A stable public message for configuration errors (see Security)

## Technical notes

- `lib/login-error.ts` exports `loginErrorMessage` and the fallback constant; the page imports both, so the fallback text exists in one place.
- In the page: `try { fetch → if !ok: body = await res.json().catch(() => null); setError(loginErrorMessage(body)) } catch { setError(fallback) } finally { pending = false }`.
- The E2E file uses relative URLs only, so it does not depend on the port.

## Resolved questions

- Showing the 403 configuration message to unauthenticated visitors: accepted for the local MVP, with the follow-up recorded under Security.
