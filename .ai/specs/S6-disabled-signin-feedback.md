# Spec S6 — Disabled Sign-in button feedback

**Author model:** Claude Fable 5.2 (Cursor)
**Epic:** EPIC-1
**Depends on:** S5
**Status:** revision 2 — changed after review by GPT-5.6 Sol (`S6-disabled-signin-feedback-review.md`)

## Goal

While a login request is in flight, the Sign in button looks disabled, not only behaves as disabled, so the user sees that the click was accepted and a second click is not needed.

## Background

S5 already sets `disabled={pending}` on the Sign in button (`app/login/page.tsx`) and clears `pending` in `finally`. The E2E case `f` in `e2e/login-errors.spec.ts` asserts that the button is disabled while the second request is held.

The class `.mt-btn-ink` in `app/globals.css` has no `disabled:` styles. `.mt-btn-primary` already uses `disabled:opacity-50`. With the ink button, a pending submit looks identical to an idle button except that clicks do nothing.

`.mt-btn-ink` is also used on the home-page `Link`. A `:disabled` rule does not apply to that anchor, so the change stays on the Sign in button.

## Scope

- `app/globals.css` — `.mt-btn-ink` only
- E2E assertions in `e2e/login-errors.spec.ts` (extend case `f`, and assert the enabled state)
- One row for S6 in `docs/backlog.md`
- No change to login logic, API, or other button classes beyond matching the existing disabled pattern

## Acceptance criteria

1. When the Sign in button has the HTML `disabled` attribute, its computed opacity is exactly `0.5` (Tailwind `disabled:opacity-50`, same as `.mt-btn-primary`).
2. When the button is not disabled, its computed opacity is exactly `1`. Verified in E2E after a failed login (button enabled again) and before the retry, and/or on first paint of `/login`.
3. Pending login still disables the button (S5 unchanged): after a failed login, a corrected submit with the response held back → button is `disabled` **and** `opacity` is `0.5` while pending.
4. After the held response is released, a successful login still reaches `/tasks` (no regression of S5 AC6 / E2E `f`).
5. Changed files are only: `app/globals.css`, `e2e/login-errors.spec.ts`, `docs/backlog.md`, plus this spec and its review. No new dependency.

## Backlog row

Add to `docs/backlog.md`:

| ID | Story | AC (skrót) | Spec | Review specki | Status |
| S6 | Wizualny stan disabled na Sign in | `.mt-btn-ink` → `disabled:opacity-50`; E2E opacity 0.5 / 1 | `.ai/specs/S6-disabled-signin-feedback.md` | GPT-5.6 Sol `S6-disabled-signin-feedback-review.md` | zaimplementowane (PR agenta, czeka na review człowieka) |

(Status text may be adjusted to the actual PR number once opened.)

## Out of scope

- Spinner / “Signing in…” label
- Disabling the email and password fields while pending
- Same-tick double-submit guard beyond the existing `disabled={pending}`
- `disabled:cursor-not-allowed` or other visual extras
- Changing `.mt-btn-ghost` or other components

## Technical notes

- Add `disabled:opacity-50` to the `@apply` line on `.mt-btn-ink`, matching `.mt-btn-primary`.
- E2E: reuse the Promise-gate pattern from case `f`. Assert with `toHaveCSS("opacity", "0.5")` while disabled and `toHaveCSS("opacity", "1")` while enabled. `transition-colors` does not animate opacity.

## Resolved questions

- Exact opacity `0.5` (not “any value &lt; 1”) — aligned with Tailwind and with the test.
- AC2 is covered by E2E, not by inspection alone.
