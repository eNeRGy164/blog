---
id: 2129
title: "arc42 chapter 4: Solution strategy"
date: 2026-02-09T19:00:00+01:00
updated: 2026-02-11T23:00:00+01:00
author: Michaël Hompus
excerpt: >
  Chapter 4 opens the "How is it built and how does it work" group.
  It is where goals, constraints, and context from the first three chapters
  start to shape the design through a small set of guiding decisions.

  In this article I show what belongs in chapter 4, what to keep out,
  how to handle open strategy questions,
  and a flexible structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/09/arc42-chapter-4-solution-strategy/
image: /wp-content/uploads/2026/02/post-2026-02-09-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Strategy
  - Trade-offs
  - ADR
series: Arc42 Practical Series
---

This post opens the "How is it built and how does it work" group.

The first three chapters can feel like silos: each one introduces its own set of information.
Here, those inputs start to shape the design. This is where you set direction for the solution.

Your solution strategy should fit the goals from chapter [1][CH1],
operate within the non-negotiables from chapter [2][CH2],
and respect the boundaries and partners from chapter [3][CH3].

Early in a project this chapter can be short. That is normal.
The strategy grows as you learn, as constraints become concrete, and as decisions are made.

<!--more-->

## What belongs in chapter 4 (and what does not)

Chapter 4 of an [arc42][ARC42] document answers one question:

> What is our approach, and which major decisions guide the design?

What belongs here:

- A short list of guiding choices that shape the whole design.
  For each choice a short rationale: why this direction fits the goals, constraints, and context.
- The "heavy" decisions that should not change every sprint:  
  Major platform choices, integration strategy, monolith vs distributed, data approach, deployment style.
- Trade-offs and rationale, linked back to earlier chapters where possible.
- Consequences (direction and impact), so people understand what follows from the strategy.
- Links to ADRs when they exist (chapter 9).

If your list grows over time, group the strategy items into a few buckets that fit your scope
(pick what matches your system), for example:

- Structure (e.g., monolith/modular/distributed, boundaries, layering)
- Integrations (e.g., ports/adapters, sync model, contract strategy)
- Data (e.g., ownership, consistency model, auditability approach)
- Operations (e.g., deployment style, runtime isolation, observability)

What does not belong here:

- Detailed breakdowns of internal parts and their dependencies.
- Step-by-step interaction flows or scenario descriptions.
- Environment-specific operational details.
- Small, sprint-level technical choices that are likely to change often.
- Copy/pasting earlier chapters: link to the drivers instead and focus on what you decided and what it implies.

> [!NOTE]  
> Strategy is not the same as "technology list".  
> A good strategy explains _why_ a direction makes sense and _what it implies_.

### This chapter often starts almost empty

Early in the design process, chapter 4 can be short.
That is normal.

As the design and build progresses, this chapter becomes the place where everything starts to connect:
quality goals, constraints, concepts, deployment choices, and runtime behavior.

If a strategy item is negotiable, keep it lightweight.
If it is truly a "heavy" direction setter, make sure it is backed by a constraint, a discussion, or an ADR.

> [!TIP]
> Chapter 4 is also a good place to list **open strategy questions** that still need a decision.
> A visible list of unknowns is more useful than pretending everything is decided.

## The minimum viable version

If you are short on time, aim for a small set of strategy statements as concise bullets with just enough context to steer design.

A good "minimum viable" strategy statement usually contains:

- **Approach / decision** (one line)
- **Rationale** (one or two short lines: why this direction)
- **Consequence / impact** (one short line: what this enables or constrains)
- **Traceability** to one or more inputs:
  - driver(s) from chapter [1][CH1]
  - constraint(s) from chapter [2][CH2]
  - context/partner boundary from chapter [3][CH3]

You do not need to hit an exact number of lines, you can combine them in a readable way.
The key is that the rationale and impact are clear and concise,
and that it is easy to see how the choice connects back to the drivers.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point and keep it small.

```md title="04-solution-strategy.md"
## 4. Solution strategy

<1–3 short paragraphs: what is the overall approach and why?>

<Use whatever format keeps it readable: prose, sub-bullets, or a table.
Each item should make the rationale, impact, and link to a driver clear.>

- **<Strategy / decision name>**
  <Why this direction, what it enables or constrains,
  and which goal/constraint/context item it traces back to.>

- **<Strategy / decision name>**
  ...

### Open strategy questions (optional)

- **Question:** ...
  Why it matters: ...
  Next step / owner: ...
```

> [!NOTE]  
> Strategy statements should be short.  
> If you need a full page to explain one item, you probably want to split details into another chapter and link to it.

> [!TIP]  
> Where you put open questions depends on how you work.  
> If your process is **strategy-driven** (pick direction first, then refine), keeping them in chapter 4 works well.  
> If your process is more **risk-driven** (track uncertainties and mitigation first),
> you might prefer **chapter 11** and link to them from here.

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

This is what chapter 4 looks like when filled in.

> ## 4. Solution strategy
>
> Pitstop is designed as an operational <q>source of truth</q> for work orders and status,
> with near real-time synchronization between planning and workshop execution.
>
> - **Modular monolith backend (initially)**  
>   Keep deployment simple and change-friendly while the domain stabilizes.
>   Modules are strict (no "grab-bag services") and communicate via explicit interfaces.
> - **Adapter-based integrations (Planning, Notifications, Parts status)**  
>   Each external system sits behind a port/adapter boundary to protect domain logic
>   and keep new integrations fast.
>   Traces to: Modifiability goal (≤ 2 days), Planning integration constraint.
> - **Near real-time updates via push**  
>   Workshop and admin need shared truth quickly (≤ 2 seconds).
>   Use WebSocket/SSE where possible; fall back to efficient polling.
>   Traces to: Consistency goal, near real-time constraint.
> - **Degraded-mode workshop operation**  
>   Workshop UI supports local queueing and later sync when connectivity returns.
>   Traces to: Resilience goal, degraded-mode constraint.
> - **Audit-first changes for work order state**  
>   Every status change and important edits record who/when/why (immutable history),
>   enabling dispute resolution and throughput analysis.
>
> ### Open strategy questions
>
> - **Question:** WebSocket vs SSE as the default push channel?  
>   Affects real-time UX and infra constraints. Validate with UI needs + ops constraints.
> - **Question:** What conflict resolution approach do we use after offline edits?  
>   Affects user trust and operational continuity. Define business rules with workshop stakeholders.

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **No strategy statements**  
   If chapter 4 is empty or just a placeholder, the architecture lacks direction.
   Without strategy, designs drift and teams lose alignment.

2. **Repeating the earlier chapters instead of linking**  
   Chapter 4 should build on chapters [1][CH1], [2][CH2], and [3][CH3], not copy them.
   Use links and focus on the consequences.

3. **Only listing technologies**  
   <q>We use Kubernetes</q> is not a strategy.  
   <q>We deploy as containers because ops standardizes on it</q> is.

4. **No rationale**  
   Without rationale, strategy statements look like preferences.  
   Tie each item back to a goal, constraint, or context boundary.

5. **Treating consequences as a negative**  
   Consequences are direction.  
   If a choice does not enable anything valuable for stakeholders, it is a smell.

6. **Making it too detailed**  
   Chapter 4 should be readable in a few minutes.  
   Details belong in other chapters and ADRs.

7. **Hiding unknowns**  
   If open questions only live in someone's head, the team cannot contribute.  
   Making assumptions explicit invites feedback and prevents silent divergence.

## Done-when checklist

🔲 Contains a small set of strategy statements (not a tech wishlist).  
🔲 Each statement has a short rationale and a clear impact.  
🔲 Statements link back to goals/constraints/context (chapters [1][CH1], [2][CH2], [3][CH3]).  
🔲 The choices feel stable enough to not change every sprint.  
🔲 Open strategy questions are visible (here or in chapter 11), not hidden in someone's head.

## Next improvements backlog

- Review strategy statements with ops and key external stakeholders for realism.
- Add links to ADRs as decisions become concrete (chapter 9).
- Add a short mapping from strategy to top quality goals.
- Move unstable or controversial topics into "Open strategy questions" until decided.
- Remove strategies that no longer serve stakeholder value (and document the change as an ADR).

## Wrap-up

Chapter 4 is where the design starts to take shape.
It should be short, directional, and connected to the drivers you already captured in the first 3 chapters.

Next up: [arc42 chapter 5, "Building block view"][CH5],
where we describe the solution structure without diving into runtime sequencing yet.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
[CH1]: /2026/02/02/arc42-chapter-1-introduction-and-goals/
[CH2]: /2026/02/03/arc42-chapter-2-architecture-constraints/
[CH3]: /2026/02/04/arc42-chapter-3-context-and-scope/
[CH5]: /2026/02/10/arc42-chapter-5-building-block-view/
