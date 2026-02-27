---
name: arc42-bootstrap
description: Bootstrap a minimal but honest arc42 architecture baseline. Use when starting architecture docs for a greenfield or brownfield project and when creating a first-week starter pack.
---

# arc42 Bootstrap

Use this skill when a user asks to start architecture documentation from scratch or to quickly establish a usable arc42 baseline.

## Required inputs

- Project type: `greenfield` or `brownfield`
- System name and short purpose
- Current documentation home (repo docs, wiki, tooling)
- Known constraints and key stakeholders (even if incomplete)

## Workflow

1. Set the documentation home.

- Default to in-repo docs when the team wants fast review loops and PR traceability.
- Recommend a stable path such as `docs/arc42/`.

2. Create the first-week starter pack.

- Start with chapters 1, 2, 3, 5, 6, 9, and 10.
- Keep chapter 9 present even if it starts as an empty decision log.

3. Apply the "minimal but honest" rule.

- Keep content concise.
- Never fake certainty.
- Mark unknowns explicitly.
- Link related chapters when statements have cross-chapter impact.

4. Tailor by project type.

- `greenfield`: start from goals and constraints, then shape context and structure.
- `brownfield`: interview team members, capture what exists, then resolve contradictions.
- On brownfield projects with heavy jargon, start glossary work early.

5. Produce immediate follow-up backlog.

- Add chapter 4 after initial decisions become visible.
- Add chapter 7 when deployment topology becomes concrete.
- Add chapter 8 when reusable concepts repeat.
- Add chapter 11 as soon as risks/debt are discussed.
- Add chapter 12 continuously as terms appear.

## Deliverable template

Use this output shape:

- `docs/arc42/01-introduction-and-goals.md`
- `docs/arc42/02-architecture-constraints.md`
- `docs/arc42/03-context-and-scope.md`
- `docs/arc42/05-building-block-view.md`
- `docs/arc42/06-runtime-view.md`
- `docs/arc42/09-architectural-decisions.md`
- `docs/arc42/10-quality-requirements.md`

Each file should contain:

- A one-paragraph current state summary
- A short "known unknowns" section
- A "done-when now" checklist for the current maturity level

## Guardrails

- Do not turn arc42 into a final report produced too late.
- Do not block progress waiting for perfect detail.
- Do not leave constraints or decisions implicit.
- Every architecture-impacting change should result in a docs update, ADR update, or both.
