# Spec S6 — Disabled Sign-in button feedback

**Author model:** Claude Fable 5.2 (Cursor)
**Epic:** EPIC-1
**Depends on:** S5
**Status:** draft — awaiting second-model review

## Goal

While a login request is in flight, the Sign in button looks disabled, not only behaves as disabled, so the user sees that the click was accepted and a second click is not needed.

## Background

S5 already sets `disabled={pending}` on the Sign in button (`app/login/page.tsx`) and clears `pending` in `finally`. The E2E case `f` in `e2e/login-errors.spec.ts` asserts that the button is disabled while the second request is held.

The class `.mt-btn-ink` in `app/globals.css` has no `disabled:` styles. `.mt-btn-primary` already uses `disabled:opacity-50`. With the ink button, a pending submit looks identical to an idle button except that clicks do nothing.

## Scope

- `app/globals.css` — `.mt-btn-ink` only
- One assertion added to the existing E2E case that already waits on a pending login (case `f` in `e2e/login-errors.spec.ts`), or a dedicated sibling case if that is clearer
- One row in `docs/backlog.md`
- No change to login logic, API, or other button classes beyond matching the existing disabled pattern

## Acceptance criteria

1. When the Sign in button has the HTML `disabled` attribute, its computed opacity is less than `1` (same idea as `.mt-btn-primary`: `disabled:opacity-50`).
2. When the button is not disabled, its computed opacity is `1`.
3. Pending login still disables the button (behaviour from S5 unchanged): after a failed login, a corrected submit with the response held back by the test → button is `disabled` **and** looks dimmed (opacity &lt; 1) while pending.
4. After the held response is released, a successful login still reaches `/tasks` (no regression of S5 AC6 / E2E `f`).
5. No new dependency. Change is CSS only plus the test assertion(s).

## Out of scope

- Spinner / “Signing in…” label
- Disabling the email and password fields while pending
- Same-tick double-submit guard beyond the existing `disabled={pending}`
- Changing `.mt-btn-ghost` or other components

## Technical notes

- Prefer adding `disabled:opacity-50` (and, if needed for a clear idle look, `disabled:pointer-events-none` is unnecessary when the attribute is already `disabled`) to the existing `@apply` line on `.mt-btn-ink`, matching `.mt-btn-primary`.
- E2E: reuse the Promise-gate pattern from case `f`; assert with Playwright `toHaveCSS("opacity", "0.5")` (or a numeric check that opacity is below 1) while the button is disabled.

## Open questions

None — this closes a Should/nit from the S5 code review that was deferred as out of scope for S5.
