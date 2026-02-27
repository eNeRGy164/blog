---
name: arc42-chapter-coach
description: Coach the drafting and updating of any arc42 chapter using a consistent pattern: scope boundaries, minimum viable content, skeleton, pitfalls, done-when checks, and next improvements.
---

# arc42 Chapter Coach

Use this skill when a user asks to write or improve a specific arc42 chapter.

## Core pattern (always apply)

For every chapter response, produce sections in this order:

1. What belongs in this chapter (and what does not)
2. Minimum viable version
3. Copy/paste structure (Markdown skeleton)
4. Common mistakes
5. Done-when checklist
6. Next improvements backlog

## Chapter intent map

- Chapter 1: Why this system exists, quality goals, stakeholders
- Chapter 2: Non-negotiable constraints and their design impact
- Chapter 3: System boundary, business/technical context, interfaces
- Chapter 4: Stable strategy statements and rationale
- Chapter 5: Building blocks and responsibilities by level
- Chapter 6: Key runtime scenarios and important variants/exceptions
- Chapter 7: Deployment topology, mapping of blocks to nodes, key config
- Chapter 8: Reusable concepts and actionable rules
- Chapter 9: Decision timeline and ADR links
- Chapter 10: Measurable quality scenarios
- Chapter 11: Risks/debt with owner and next step
- Chapter 12: Shared glossary and aliases

## Done-when anchors by chapter

- Ch1: non-goals explicit, 3-5 measurable quality goals, stakeholders mapped to expectations
- Ch2: real non-negotiables only, each has source and impact
- Ch3: clear boundary, interfaces with direction/protocol/owner, examples for key integrations
- Ch4: strategy statements with rationale and consequences, open questions visible
- Ch5: level-1 aligns with context, blocks have one-sentence responsibilities
- Ch6: flows cover key interactions, names align with chapter 5
- Ch7: environments and config are explicit, blocks map to nodes
- Ch8: reusable concepts include actionable rules and references
- Ch9: decisions have motivation, important options, and links to affected chapters
- Ch10: scenarios are measurable and trace to goals/implementation
- Ch11: each item has owner, next step, and review cadence
- Ch12: recurring terms defined, ambiguities and aliases resolved

## Coaching rules

- Keep chapter text skimmable; avoid dense prose walls.
- Prefer precise statements over tooling buzzwords.
- If content belongs in another chapter, link instead of duplicating.
- Mark unknowns directly; avoid implied certainty.
