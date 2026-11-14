# Review S6 — independent model pass

**Reviewer model:** GPT-5.6 Sol (launched as gpt-5.6-sol-medium)
**Review date:** 2026-11-14
**Author (spec):** Claude Fable 5.2 (Cursor)
**Spec revision reviewed:** `88c1558 docs(S6): draft spec for disabled Sign-in visual feedback`
**Verdict:** approve with changes

## Findings

### Must

1. Reconcile AC2 with the promised E2E scope. The Scope says “One assertion added” and the technical note places it only in the pending state, but AC2 separately requires computed opacity `1` when the button is enabled. Either require an enabled-state opacity assertion as well (for example after the first failed request and before retry), or state explicitly why AC2 is guaranteed by inspection rather than tested. As written, an implementation can follow the stated test scope while leaving AC2 unverified.

### Should

1. Choose one opacity contract and make the test follow it. AC1 permits any finite opacity below `1`, while the suggested `toHaveCSS("opacity", "0.5")` requires exactly Tailwind’s `opacity-50`. With Tailwind 3.4, `disabled:opacity-50` compiles to `opacity: 0.5`, and current browser computed-style serialization normally yields `"0.5"`, so the exact assertion is technically reliable here. It is nevertheless more coupled than the AC. Either make `0.5` the AC, or prescribe a numeric computed-style check for `0 <= opacity < 1` (and separately `opacity === 1` when enabled).
2. Resolve the changed-files contradiction. Scope requires a row in `docs/backlog.md`, while AC5 says the change is “CSS only plus the test assertion(s).” The backlog row is reasonable project bookkeeping rather than product scope creep, but AC5 should explicitly include it.
3. Define the backlog row’s expected state. The existing table requires ID, story, AC summary, spec, review, and status. The spec should say whether S6 is added as planned/in progress and which review filename to reference, so implementation does not invent workflow metadata.

### Nice

1. Note that `.mt-btn-ink` is also used by the home-page `Link`. The `:disabled` rule will not affect that anchor, so the proposed CSS remains safely scoped; recording this would make the impact analysis complete.
2. If visual feedback beyond opacity is desired later, `disabled:cursor-not-allowed` could be considered, but it is not necessary for this story and should remain out of scope.

## Alignment with implementation

### What matches

- `app/login/page.tsx` already binds `disabled={pending}` to the Sign in button and resets `pending` in `finally`; no login-logic change is needed.
- E2E case `f` already gates the corrected request, verifies the button is disabled while pending, releases the request in `finally`, and verifies successful navigation to `/tasks`.
- `.mt-btn-primary` establishes the local `disabled:opacity-50` pattern, while `.mt-btn-ink` currently has no disabled visual style.
- In Tailwind 3.4, applying `disabled:opacity-50` inside `.mt-btn-ink` produces a `:disabled` rule with opacity `0.5`. `transition-colors` does not animate opacity, so the pending assertion should not race an opacity transition.
- The native `disabled` attribute already supplies interaction blocking and disabled semantics; `pointer-events-none` is unnecessary.

### What drifts / is missing

- The described one-assertion E2E change covers disabled opacity but not AC2’s enabled opacity.
- The exact `"0.5"` technical suggestion is stricter than AC1’s “less than `1`.”
- AC5 omits the backlog edit required by Scope.
- No backlog-row content/status is specified.
- `hover:brightness-105` can still match a hovered disabled button, but it does not alter computed opacity and does not invalidate the requested dimming check.

## Author response

_Pending author._
