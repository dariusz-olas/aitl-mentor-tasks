# Review S2 — second model

**Reviewer model:** second-pass grill  
**Verdict:** approve with changes

## Findings

1. **Must:** Separate “who can see” from CRUD verbs — point to S4; don’t invent ad-hoc rules in S2 UI.
2. **Must:** Mentor assigning to mentee needs validation that target user exists and has role `mentee`.
3. **Should:** Soft-delete out of scope — hard delete OK for MVP; confirm in security-notes later.
4. **Won’t fix now:** Pagination — N/A for demo seed size.

## Author response

- #1: Read AC references S4.
- #2: Added as implementation constraint in F3.
- #3: Hard delete confirmed.
