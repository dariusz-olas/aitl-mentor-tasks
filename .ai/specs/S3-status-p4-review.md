# Review S3 — second model

**Verdict:** approve

## Findings

1. **Good:** Domain module already exists — wire it in service layer, don’t duplicate logic in UI.
2. **Should:** Log rejected transitions in server logs (debug) — optional.
3. **Must not:** Treat “mentee can’t edit others” as P4 — that is Q4.

## Author response

- Confirmed separation P4 vs Q4 in AC4.
- Wiring in F3 service layer.
