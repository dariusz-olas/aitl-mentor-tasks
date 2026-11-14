## Code review - S5 login error feedback

**Reviewer model:** Gemini 4 Hydrogen (`gemini-4-hydrogen-high`)
**Date:** 2026-11-14
**Commit reviewed:** 53c6cec
**Verdict:** approve with changes

### AC coverage

| AC | Satisfied? | Evidence (`file:line`) | Test that would catch a regression |
|----|------------|------------------------|------------------------------------|
| AC1 | Yes | `app/api/auth/login/route.ts:22-24`, `app/login/page.tsx:41-45,115-119` | `e2e/login-errors.spec.ts:26-35` (case `a`: real 401, asserts `role="alert"` text `"Invalid credentials"`, `/\/login$/`, and `page.context().cookies()` has 0 `aitl_session` cookies) |
| AC2 | Yes | `lib/auth.ts:85-86`, `app/api/auth/login/route.ts:22-24`, `app/login/page.tsx:41-45` | `e2e/login-errors.spec.ts:37-46` (case `b`: submits `nobody@example.com`, asserts `"Invalid credentials"`, `/\/login$/`, 0 cookies) |
| AC3 | Yes | `app/login/page.tsx:41-45`, `lib/login-error.ts:9-23` | `e2e/login-errors.spec.ts:26-61,121-129` (real 400 `Invalid body` in `g`, real 401 in `a`/`b`, mocked 403 `AUTH_SECRET is required…` in `c`); `lib/login-error.test.ts:5-35` (unit coverage including `"Demo credentials disabled in production"`). Note: the second `AUTH_SECRET` placeholder message and production demo guard are not exercised against a real server in E2E (single dev server in `playwright.config.ts`). |
| AC4 | Yes | `app/login/page.tsx:42,49-50`, `lib/login-error.ts:1,9-23` | `e2e/login-errors.spec.ts:63-93` (cases `d` non-JSON 500 `text/plain` and `e` aborted `fetch`, both asserting `"Login failed"` and `pageErrors` length 0); `lib/login-error.test.ts:22-50` (201 chars, missing, number, object, empty, whitespace-only, inherited, `null`, `undefined`, array, string body). |
| AC5 | Yes (code only) | `app/login/page.tsx:115-119` (`{error}` rendered as a React text node, no `dangerouslySetInnerHTML`) | **Nominal / none.** AC7 did not require an HTML-markup test, and none of the unit or E2E payloads contain `<` / `>`, so switching `{error}` to `dangerouslySetInnerHTML` would not fail any existing test. |
| AC6 | Yes | `app/login/page.tsx:34-35,47-53,120` | `e2e/login-errors.spec.ts:95-119` (case `f`: holds back the second login response with a Promise gate and asserts `button` is disabled and `loginAlert(page)` count is `0` while pending, then releases and asserts `/tasks` and signed-in user text). Note: `f` does not re-assert alert absence after `/tasks` loads, though `setError(null)` already cleared it before navigation. |
| AC7 | Yes | `lib/login-error.test.ts:1-55`, `e2e/login-errors.spec.ts:1-130` | All 13 unit cases listed in AC7 (plus `undefined`, object-valued `error`, and fallback constant check) and all 7 E2E cases (`a`–`g`) are present with meaningful assertions. |
| AC8 | Yes | `docs/REVIEWER.md:12` | Documentation check (`docs/REVIEWER.md:12` matches the exact `AUTH_SECRET is required (min 16 chars). Copy .env.example → .env and set a real secret.` string for `AUTH_SECRET=CHANGE_ME`). |

### Findings

#### Must fix before merge

None.

- **`lib/login-error.ts`:** Implements the "Message selection" rule accurately: checks `typeof body !== "object" || body === null || Array.isArray(body)` (`lib/login-error.ts:10-12`), uses `Object.prototype.hasOwnProperty.call(body, "error")` (`lib/login-error.ts:13-15`, safe on null-prototype objects and rejects inherited properties), verifies `typeof value === "string"` (`lib/login-error.ts:17`), trims before checking `1 <= length <= 200` in UTF-16 code units (`lib/login-error.ts:18-21`), and exports `LOGIN_ERROR_FALLBACK = "Login failed"`.
- **`app/login/page.tsx`:** Clears `error` and sets `pending` before `fetch`, catches both `fetch` rejection (`catch`) and non-JSON/empty response bodies (`await res.json().catch(() => null)`), prevents unhandled rejections, and always clears `pending` in `finally` (`app/login/page.tsx:32-55`). On `res.ok`, `router.push("/tasks"); router.refresh();` runs and `finally` resets `pending` rather than leaving the button disabled if navigation ever failed.
- **Security:** API routes (`app/api/auth/login/route.ts`) and `lib/auth.ts` are untouched; unknown emails and wrong passwords still converge on `"Invalid credentials"` outside production; error strings are bounded to 200 chars and rendered as plain text. The local-MVP trade-off of displaying `AuthConfigError` messages to unauthenticated visitors is documented in the spec.

#### Should fix

1. **Add an automated test for AC5 (HTML-like error payloads rendered as text)** (`e2e/login-errors.spec.ts`): AC5 ("rendered as a React text node, never as HTML") is currently verified only by reading `app/login/page.tsx:117`. Adding a mocked error case (e.g. `{ error: "<b>Invalid</b>" }` and asserting `toHaveText("<b>Invalid</b>")` / `toContainText("<b>Invalid</b>")`) would ensure a regression to `dangerouslySetInnerHTML` cannot pass silently.
2. **Guarantee `release()` runs in `finally` in E2E test `(f)`** (`e2e/login-errors.spec.ts:102-116`): if `expect(button).toBeDisabled()` or `expect(loginAlert(page)).toHaveCount(0)` fails, `release()` is never invoked, leaving the `page.route` callback awaiting an unresolved Promise during Playwright context teardown. Wrapping the pending assertions in `try { ... } finally { release(); }` keeps failure teardown clean.

#### Nits

- **Scope (`docs/backlog.md:11`):** One line in `docs/backlog.md` updates S5's status to implemented/awaiting review. This is outside the files listed in the spec's `Scope` section, though it matches the repository's convention from S2/S4 and is harmless.
- **Disabled button visual feedback (`app/globals.css:79-82`):** `.mt-btn-ink` has no `disabled:` utility classes (unlike `.mt-btn-primary` at `app/globals.css:75`, which has `disabled:opacity-50`), so while `<button disabled={pending}>` works functionally, the button does not visually dim while pending.
- **Same-tick double-submit guard (`app/login/page.tsx:32-36`):** `onSubmit` relies on `disabled={pending}` taking effect on re-render and has no `if (pending) return;` (or ref) guard against two synchronous/programmatic `submit` dispatches before React commits.
- **Unit edge case (`lib/login-error.test.ts`):** Trimming is tested separately from the 200/201 boundary; adding `"  " + "a".repeat(200) + "  "` (returned, 200 after trim) would directly pin the trim-before-length-check order.
- **Post-navigation alert check (`e2e/login-errors.spec.ts:116-118`):** Test `(f)` verifies `loginAlert(page)` has count `0` while pending (matching AC7(f)) but does not explicitly re-check `page.getByRole("alert")` after `/tasks` renders.

### What I verified myself

All read-only checks were run in `C:\Users\NowyDariusz\AppData\Local\Temp\aitl-wt` on commit `53c6cec` (`git status` clean before and after):

- `git diff docs/s5-spec..feat/s5-login-error-feedback` and `git show --stat 53c6cec` — confirmed exact 6-file diff (`app/login/page.tsx`, `lib/login-error.ts`, `lib/login-error.test.ts`, `e2e/login-errors.spec.ts`, `docs/REVIEWER.md`, `docs/backlog.md`).
- `npm test` (`vitest run`) — **5 test files passed, 30 tests passed** (including all 16 tests in `lib/login-error.test.ts`).
- `npx tsc --noEmit` — **passed** (exit code 0).
- `npm run lint` (`next lint`) — **passed** ("No ESLint warnings or errors").
- **Not run:** `npm run test:e2e` (Playwright was intentionally skipped per review instructions due to local port conflicts; `e2e/login-errors.spec.ts` was verified by static inspection and should pass CI).
