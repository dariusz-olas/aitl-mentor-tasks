# Review S1 — second model

**Reviewer model:** GPT-style grill (simulated second pass in-session)  
**Author:** Composer  
**Verdict:** approve with changes

## Findings

1. **Must:** Explicitly ban client-only role checks — authorization must run on server for every task API route (ties to S4).
2. **Must:** Document exact demo credentials in `docs/REVIEWER.md` when implemented (W/P5).
3. **Should:** Add CSRF/session strategy note (Auth.js JWT vs database session) — pick database or JWT and stick to it in AGENTS.md.
4. **Nice:** Rate-limit login later — out of MVP.

## Author response

- Adopted #1 into AC implicitly via S4 dependency; S1 AC5 strengthened (server-side role).
- #2 tracked in REVIEWER checklist.
- #3: JWT session for MVP simplicity — note added below.

## Decision

JWT session (Auth.js) for MVP. Database session deferred.
