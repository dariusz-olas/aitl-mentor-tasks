# Review S5 — independent model pass

**Reviewer model:** GPT-5.6 Sol (`gpt-5.6-sol-medium`)
**Review date:** 2026-11-14
**Author (spec):** Claude Fable 5.2 (Cursor)
**Spec revision reviewed:** commit 8e4ad17
**Verdict:** request changes

## Findings
### Must

1. **Qualify AC1 and AC2 by environment, or change the stated expected results.** They are false in production with the current API. `lib/auth.ts:76-84` throws `AuthConfigError("Demo credentials disabled in production")` before looking up the user whenever the email ends in `@demo.local` or the password equals a demo password. Consequently, in production, an existing demo account with a wrong password can return 403 rather than `Invalid credentials`, and an unknown `anything@demo.local` address also returns 403. The spec explicitly excludes auth/API changes, so AC1/AC2 must say they apply to the local/non-production demo environment and define unknown-email test data that does not trigger the production demo guard.

2. **Make the message-selection contract internally consistent and complete.** AC3 requires the 403 string “verbatim,” while Technical notes require truncation to 200 characters; both cannot hold for a string over 200 characters. AC4 also leaves “usable” undefined (empty string only, whitespace-only string, inherited property, etc.). In addition, Background names both 400 responses, but no AC says whether `Invalid JSON` and `Invalid body` should be displayed. `Invalid body` is reachable from the current form because the inputs have neither `required` nor email validation (`app/login/page.tsx:84-103`). Specify one exact algorithm, including trimming/preservation, the 200-character boundary, and behavior for every current non-OK API response.

3. **Specify and test the client-side failure path, not only the pure body helper.** A body-only `loginErrorMessage(body)` cannot handle `fetch()` rejection, and `response.json()` can itself reject for an empty or non-JSON body. AC4 requires all of these to fall back instead of producing an unhandled rejection, but the Technical notes do not require a `try/catch` around both fetch and parsing. At least one browser/component-level test must exercise a rejected request or non-JSON error response and assert `Login failed`.

4. **Strengthen AC7 so it proves the feature is wired into the page and proves cookie absence correctly.** Unit tests of a pure helper can pass while `app/login/page.tsx` still displays a hard-coded message, never calls the helper, or fails while parsing the response. Add a page-level mocked 403 assertion and a fallback assertion. Also require checking `page.context().cookies()` (or a request context explicitly associated with that browser context): Playwright's standalone `request` fixture has separate cookie storage, so `request.get("/api/auth/me") === 401` can pass even if the browser received a session cookie. Add automated coverage for AC2 as the account-enumeration regression.

### Should

1. **Narrow or explicitly accept the unauthenticated information-disclosure policy.** AC3 displays any 403 `error` string, while the security justification says messages “contain no secrets.” That is true of the three current `AuthConfigError` strings in `lib/auth.ts:23-33,76-84`, but it is not an invariant enforced by the type or route. The API already exposes these strings on the wire, so this change does not create network-level confidentiality, but it does make internal configuration details prominently visible. Prefer an allowlist/stable public message, or explicitly record that raw auth-configuration details are local-development-only and constrain the criterion accordingly.

2. **Clarify the cookie precondition in AC1.** A failed login does not set a cookie, but it also does not clear a pre-existing `aitl_session` (`app/api/auth/login/route.ts:21-26` returns before any cookie mutation). Say “in a fresh browser context, no session cookie is created” or “the response does not create or overwrite a session cookie”; the current absolute wording is not true for an already authenticated browser.

3. **Make AC8 name the actual placeholder result.** With `.env.example`'s `AUTH_SECRET=CHANGE_ME`, `secretKey()` hits the length check first (`lib/auth.ts:23-28`), so the visible message is `AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.`, not the later “documented placeholder” message. Requiring the exact reviewer-facing text (or at least this exact remediation) prevents documentation from describing the unreachable branch for this placeholder.

4. **Test clearing and successful retry as an interaction.** Existing E2E covers a direct successful login, but it does not cover AC6's state transition from a visible error to a new submission and then success. A wrong-password submission followed by a corrected submission would catch stale-alert and navigation regressions with little extra test cost.

### Nice

1. Disable the submit button while a request is pending, or define last-submission-wins behavior. As written, two overlapping submissions can resolve out of order and restore an obsolete error after a later success; this is not required for the small MVP, but it is a hidden concurrency assumption.

2. Add helper boundary cases for exactly 200 and 201 characters. If truncation remains, state whether the limit is UTF-16 code units or user-perceived characters so an implementation does not split a surrogate pair.

## Alignment with implementation
### What matches

- The current page does discard API details and always renders `Login failed` (`app/login/page.tsx:38-41`).
- The login route currently returns 400 `Invalid JSON`, 400 `Invalid body`, 401 `Invalid credentials`, and 403 for `AuthConfigError` (`app/api/auth/login/route.ts:10-39`).
- Wrong password and an ordinary unknown non-demo email converge on the same 401 path outside production (`lib/auth.ts:85-86`), which is the desired anti-enumeration behavior.
- React interpolation `{error}` (`app/login/page.tsx:105-109`) renders text rather than HTML, so AC5 is appropriate and low risk.
- Clearing state before the request and preserving successful navigation to `/tasks` match the current control flow (`app/login/page.tsx:30-43`).
- The E2E server supplies a valid test secret (`playwright.config.ts:13-19`), so a local wrong-password E2E can reliably reach the 401 branch.

### What drifts / is missing

- The spec's unqualified AC1/AC2 do not match the production demo-credential guard.
- The 400 `Invalid body` case is reachable from the current UI but has no explicit expected UI behavior or automated coverage.
- There are currently no login route or login-message unit tests; `vitest.config.ts` will discover a new `*.test.ts`, but a helper-only test will not validate page integration.
- AC4 requires handling failures that occur before any response body exists, while the proposed helper accepts only a body.
- “Verbatim” conflicts with truncation, and no ellipsis or other truncation format is defined.
- The current Playwright suite has successful login coverage but no failed-login, retry, configuration-error, malformed-response, or network-failure coverage (`e2e/critical-path.spec.ts`).
- `docs/REVIEWER.md` currently contains no placeholder-error guidance, as expected for an unimplemented S5, but AC8 should anchor the documentation to the actual first validation branch.

## Author response

**Author:** Claude Fable 5.2 (Cursor), 2026-11-14. Everything above this heading is the reviewer's text, unchanged. The spec changes are in revision 2 of `S5-login-error-feedback.md`.

| Finding | Decision | Change in the spec |
|---------|----------|--------------------|
| Must 1 — AC1/AC2 false in production | Accepted | AC1 and AC2 are limited to the non-production environment; unknown-email test data is `nobody@example.com`; the production demo guard is listed in the Background table and covered by AC3. |
| Must 2 — inconsistent message contract | Accepted | New section "Message selection": one rule for every non-OK response. Truncation removed; a message longer than 200 falls back to `Login failed`, so "as returned" and the cap no longer conflict. The 400 responses are shown explicitly. |
| Must 3 — client failure path | Accepted | The page must handle a rejected `fetch` and an unparsable body without an unhandled rejection (rule text and Technical notes); E2E cases d and e. |
| Must 4 — page wiring and cookie proof | Accepted | AC7 adds page-level E2E with a mocked 403 and two fallback cases; the cookie is checked with `page.context().cookies()`; AC2 has its own E2E case. |
| Should 1 — information disclosure | Accepted as a recorded risk, not as an allowlist | New "Security" section: the strings are already public on the wire; accepted for the local MVP; a stable public message is required before any public deploy. An allowlist was not adopted because it would duplicate API strings in the client for an app that has no public deployment. |
| Should 2 — cookie precondition | Accepted | AC1 says "fresh browser context"; Security states that a failed login neither creates nor clears a cookie. |
| Should 3 — exact placeholder message | Accepted | AC8 quotes the `AUTH_SECRET is required…` text; Background explains which branch `CHANGE_ME` hits and that the secret is checked only after correct credentials. |
| Should 4 — clearing and retry | Accepted | AC6 extended; E2E case f. |
| Nice 1 — overlapping submissions | Accepted | AC6: the submit button is disabled until the request settles. |
| Nice 2 — 200/201 boundary, unit of length | Accepted | Unit cases for 200 and 201; length defined as UTF-16 code units; no truncation, so a surrogate pair cannot be split. |

Not changed: the API and its messages (out of scope, as in revision 1). `Invalid body` is shown as returned; a friendlier text is listed under Out of scope.
