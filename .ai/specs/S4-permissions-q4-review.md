# Review S4 — second model

**Verdict:** approve with changes

## Findings

1. **Must:** Prefer 404 over 403 for IDOR on GET by id (don’t leak existence) — OR consistently 403; pick one and test it.
2. **Must:** Mentor reopen test is domain+role — keep assertion in permissions suite but call `canTransition`.
3. **Should:** Seed two mentees + one mentor in test setup.

## Author response

- #1: Use **404** for unauthorized mentee access to foreign task ids.
- #2/#3: Accepted for F3/F4 implementation.
