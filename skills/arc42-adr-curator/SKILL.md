---
name: arc42-adr-curator
description: Curate architectural decisions in arc42 chapter 9 with a scan-friendly timeline and ADR records including options, trade-offs, consequences, and supersession links.
---

# arc42 ADR Curator

Use this skill when a user asks to add, refine, or reconcile architectural decisions.

## Workflow

1. Determine whether the item is a true architectural decision.

- If reverting it has little impact, it is usually too small for chapter 9.

2. Capture decision essentials.

- Decision statement
- Status (`proposed`, `accepted`, `superseded`)
- Date and owner
- Motivation
- Considered options (short "why not")
- Consequences and trade-offs

3. Link the decision to arc42 context.

- Upstream drivers: chapters 1, 2, 3, 4
- Implementation touchpoints: chapters 5, 6, 7, 8
- Quality impact: chapter 10
- Risk/debt impact: chapter 11

4. Maintain successor trail.

- Never delete old decisions.
- Mark superseded decisions and link both directions.

## Recommended output structure

- Decision timeline table (scan-friendly)
- ADR entries for high-impact decisions

Use this ADR skeleton:

```md
### ADR-XXX <Decision statement>

- Status:
- Date:
- Owners:
- Context:
- Decision:
- Considered options:
  - Option A:
  - Option B:
- Consequences:
  - Positive:
  - Negative:
- Links:
  - Related chapters:
  - Supersedes / Superseded by:
```

## Guardrails

- Do not log every minor implementation tweak.
- Do not record a decision without consequences.
- Do not keep decisions detached from quality scenarios and constraints.
