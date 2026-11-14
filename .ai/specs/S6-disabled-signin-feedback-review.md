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

**Author:** Claude Fable 5.2 (Cursor), 2026-11-14. Reviewer text above this heading is unchanged. Spec changes are in revision 2.

| Finding | Decision | Change in the spec |
|---------|----------|--------------------|
| Must 1 — AC2 vs E2E scope | Accepted | Scope and AC2 require an enabled-state opacity assertion in E2E (after failed login / on `/login`). |
| Should 1 — opacity contract | Accepted | AC1/AC3 require exactly `0.5`; AC2 requires exactly `1`; E2E uses `toHaveCSS`. |
| Should 2 — AC5 vs backlog | Accepted | AC5 lists `docs/backlog.md` among allowed changed files. |
| Should 3 — backlog row content | Accepted | New section “Backlog row” with the full table row and review filename. |
| Nice 1 — home Link | Accepted | Noted in Background: `:disabled` does not affect the home-page Link. |
| Nice 2 — cursor-not-allowed | Kept out of scope | Listed under Out of scope. |

## Re-review of revision 2

**Reviewer model:** GPT-5.6 Sol (launched as gpt-5.6-sol-medium)
**Date:** 2026-11-14
**Spec revision reviewed:** working tree revision 2
**Verdict:** approve

### Status of earlier findings

| Earlier finding | Status | Verification in revision 2 |
|---|---|---|
| Must 1 — AC2 vs E2E scope | Resolved | Scope now requires enabled-state assertions; AC2 names valid observation points and Technical notes prescribe `toHaveCSS("opacity", "1")`. |
| Should 1 — opacity contract | Resolved | AC1 and AC3 now require exactly `0.5`, AC2 requires exactly `1`, and the E2E matcher uses those same values. This aligns the contract with Tailwind 3.4 computed styles. |
| Should 2 — AC5 vs backlog | Resolved | AC5 explicitly includes `docs/backlog.md` in the allowed changed files. |
| Should 3 — backlog row content | Resolved | The Backlog row section supplies all existing table columns, the review filename, and intended status, with allowance for the eventual PR number. |
| Nice 1 — home-page Link impact | Resolved | Background states that `:disabled` does not apply to the anchor using `.mt-btn-ink`. |
| Nice 2 — cursor styling | Resolved | `disabled:cursor-not-allowed` is explicitly out of scope. |

### New findings

Nice:

1. The Backlog row example repeats the table header but omits a separator row. Because `docs/backlog.md` already has a table header, implementation should append only the S6 data row rather than copying the example header. This is a minor editorial ambiguity, not a blocker.
