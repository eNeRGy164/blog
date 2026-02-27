---
name: arc42-consistency-auditor
description: Audit arc42 documentation for cross-chapter consistency, drift, and contradictions. Use when reviewing architecture docs before or during implementation.
---

# arc42 Consistency Auditor

Use this skill when a user asks to review whether arc42 documentation is coherent and still matches reality.

## Inputs

- Arc42 document location (for example `docs/arc42/`)
- Optional changed files, PR scope, or release scope

## Audit workflow

1. Build a traceability map from chapter 1 through 12.
2. Check cross-chapter links and implied dependencies.
3. Flag contradictions, gaps, stale statements, and missing ownership.
4. Return concrete remediation actions with target chapter(s).

## Required checks

- Ch1 -> Ch10: top quality goals become measurable scenarios.
- Ch2 -> Ch4/Ch9: constraints influence strategy and decisions.
- Ch3 -> Ch5/Ch6/Ch7: neighbors/interfaces align with structure, runtime, deployment.
- Ch5 -> Ch6/Ch7: runtime and deployment use the same building block names/boundaries.
- Ch8 -> Ch6/Ch7/Ch9: concepts appear in operation and/or decisions.
- Ch9 -> Ch10/Ch11: trade-offs connect to quality and known risks/debt.
- Ch11 -> owners/actions/cadence: each item is actionable and reviewed.
- Ch12 -> overall docs: recurring terms are defined consistently.

## Output format

Return findings first, ordered by severity:

1. `Critical`: contradictions likely to cause wrong implementation or operational failure
2. `High`: missing traceability or missing decision rationale
3. `Medium`: clarity and maintainability gaps
4. `Low`: wording/navigation cleanups

For each finding include:

- Chapters involved
- Evidence snippet or reference
- Why this matters
- Minimal fix proposal

Then provide:

- Quick wins (can be fixed in current PR)
- Follow-ups (needs decision or workshop)

## Guardrails

- Do not rewrite whole chapters when a small cross-reference fix is enough.
- Do not silently resolve contradictions; surface them explicitly.
- Treat unknowns as valid only when clearly marked.
