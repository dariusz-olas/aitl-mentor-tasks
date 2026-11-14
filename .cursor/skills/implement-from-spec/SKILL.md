---
name: implement-from-spec
description: Implement a user story from an approved spec in .ai/specs. Use when coding a backlog story for the AITL project.
---

# implement-from-spec

## When to use

User points at a spec under `.ai/specs/` (or an Issue with AC) and wants an implementation PR.

## Inputs

- Path to spec (must already have second-model review notes addressed or explicitly deferred)
- Target branch name

## Steps

1. Read `AGENTS.md` router, then the spec + AC.
2. Implement the smallest change that satisfies AC (no scope creep).
3. Add/adjust unit tests for domain rules; keep permissions tests separate when touching access.
4. Run project checks locally if available.
5. Open a PR with: model name, this skill name, link to spec, test plan.
6. Do **not** merge — wait for human review.

## Outputs

- Code + tests on a feature branch
- PR description filled from `.github/PULL_REQUEST_TEMPLATE.md`
