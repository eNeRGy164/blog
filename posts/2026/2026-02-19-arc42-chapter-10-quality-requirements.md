---
id: 2135
title: "arc42 chapter 10: Quality requirements"
date: 2026-02-19T20:00:00+01:00
author: Michaël Hompus
excerpt: >
  Chapter 10 turns quality goals into testable quality scenarios.
  It helps you move beyond vague words like "fast" or "secure" by describing concrete situations,
  expected responses, and measurable targets.
  ISO/IEC 25010 and Q42 can help as a structure and inspiration, but the real value is iteration:
  refine goals, learn from reality, and tighten scenarios over time.

  In this article I explain what belongs in chapter 10, what to keep out,
  a minimal structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/19/arc42-chapter-10-quality-requirements/
image: /wp-content/uploads/2026/02/post-2026-02-19-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Quality
  - ISO25010:2023
  - Q42
  - Scenarios
series: Arc42 Practical Series
---

This post is about **chapter 10: Quality requirements**,
the third chapter in the "Reusables, decisions, and qualities" group.

Chapter [1][CH1] introduced quality goals at a high level.
Chapters [8][CH8] and [9][CH9] captured patterns and decisions that often exist _because_ of those goals.
Chapter 10 is where I make qualities concrete: not as slogans, but as scenarios you can test, monitor, and verify.

One recurring problem: stakeholders and teams find it hard to write SMART quality requirements.
They will say <q>fast</q>, <q>robust</q>, <q>secure</q>, and everyone nods.
Then production teaches you that nodding is not a measurement.

<!--more-->

## What belongs in chapter 10 (and what does not)

Chapter 10 of an [arc42][ARC42] document answers:

> Which quality requirements matter, and how do we know we meet them?

What belongs here:

- A **quality requirements overview**:  
  the relevant quality characteristics for your system, grouped in a structure that is easy to scan.
  ISO/IEC 25010 is a common choice for this grouping, and [Q42][Q42] is a useful catalogue for examples.
- A set of **quality scenarios**:  
  situation-based, testable requirements with a stimulus, an expected response, and a metric or target.
  "Testable" means different things per type: validate a latency scenario with a load test or SLO alert;
  an auditability scenario with a timed export; a modifiability scenario by verifying the adapter boundary in a code review.
- A clear link back to **quality goals** from chapter [1][CH1].  
  If chapter 1 says "auditability" is a top goal, chapter 10 should make that measurable.
- Cross-links to where quality is implemented:  
  concepts (chapter [8][CH8]), decisions (chapter [9][CH9]), and sometimes deployment constraints (chapter [7][CH7]).

What does not belong here:

- A technology shopping list.  
  "Kafka" is not a quality requirement, it is a potential solution.
- Purely functional requirements and business workflows.  
  Those belong in use cases, building blocks (chapter [5][CH5]), and runtime scenarios (chapter [6][CH6]).
- Only vague adjectives.  
  "fast" and "secure" are direction, not requirements.
  Chapter 10 is where you turn them into something you can validate.

> [!TIP]
> If you cannot imagine a test, a metric, or an operational check for a statement,
> it probably belongs in chapter 1 as a goal, not in chapter 10 as a requirement.

### Why is quality so late in arc42?

It can feel strange that quality scenarios show up this far back in the arc42 structure.
It can look like quality is an afterthought. It is not.

This is how I explain it:

- Quality goals are up front because they drive direction.
- Quality scenarios are later because they need context to be meaningful.
- The document is iterative: you refine goals, you make choices, you learn, you tighten scenarios.

In other words, chapter 10 benefits from having chapters [5][CH5]–[7][CH7] in place.
A scenario like "p95 status update latency is ≤ 2s" only makes sense when you know what "status update" is,
which building blocks collaborate, and where the system actually runs.

> [!NOTE]
> Verification often happens late because reality arrives late.
> The trick is to still let quality drive your work early, then use chapter 10 to sharpen the targets as you learn.

### A structure that helps when people struggle with SMART qualities

If your stakeholders struggle with SMART wording, do not fight them with a blank page.
Give them a ladder:

- Start with a quality tree to agree on vocabulary.
- Add a short overview per quality area: what matters and what does not.
- Convert the important items into scenarios with measurable targets.

Two helpful sources for vocabulary and inspiration:

- **ISO/IEC 25010:2023** gives you a familiar top-level structure.
- **Q42** is a companion project by the arc42 team.
  It gives you a large catalogue of quality characteristics with descriptions and example requirements you can adapt.

Use them as scaffolding, not as a checklist.

### Quality tree diagram

A quality tree is a visual overview of which quality characteristics apply to your system.
It works like a map: it shows the landscape at a glance, so you can decide where to focus.

It is useful because it makes trade-offs visible.
When you can see all quality areas together, it becomes easier to say "this matters more than that",
and to explain that choice to others.
It also prevents the "everything is important" trap:
when everything is marked as a top priority, that is the same as having no priorities at all.

![Quality tree diagram](/wp-content/uploads/2026/02/quality-tree.png)

> [!NOTE]  
> Most systems use a subset of the tree, **not all branches**. The goal is clarity, not purity.  
> It is fine to add system-specific categories such as auditability or data minimization.

## The minimum viable version

If you are short on time, aim for this:

1. A small quality overview, grouped by ISO/IEC 25010:2023 headings.  
  <small>(or your own headings if that reads better).</small>
2. Pick 3–6 top items and write quality scenarios for them.
3. For each scenario, add a metric target you can validate later.

That is enough to stop quality from being a vibe.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point.

```md title="10-quality-requirements.md"
## 10. Quality requirements

<Short intro: why quality matters for this system and how we verify it.>

### 10.1 Quality requirements overview

<Group requirements using ISO/IEC 25010:2023 headings or another clear structure.>
<Mark "nice-to-have" items explicitly.>

### 10.2 Quality scenarios

<Scenario-based, testable requirements. Keep them short and measurable.>

| Scenario | Stimulus | Response | Metric/Target |
| :------- | :------- | :------- | :------------ |
| ...      | ...      | ...      | ...           |

<Add more tables per quality theme if that improves readability.>
```

> [!NOTE]
> If you already use BDD or [Gherkin][GHERKIN_REFERENCE], the mapping is straightforward:  
> **Given** (context and preconditions),  
> **When** (stimulus),  
> **Then** (expected response and metric/target).  
> You can write scenarios in Gherkin and reference them here, or keep them in the table format above.
> Either way, the key property is the same: concrete, testable, and measurable.

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

Below is a shortened version of the Pitstop chapter 10.
It shows the structure without drowning you in every possible scenario.
Notice how overview headings and scenario groups mark which chapter [1][CH1] top goals they address.
Consistency is a Pitstop-specific quality area that does not map to a single ISO/IEC 25010:2023 category.

> ## 10. Quality requirements
>
> ### 10.1 Quality requirements overview
>
> ![Quality tree diagram](/wp-content/uploads/2026/02/pitstop-quality-tree.png)
>
> #### Reliability _(top goal: Resilience)_
>
> - Degraded-mode operation for workshop during flaky internet.
> - Sync backlog does not block workshop core operations.
>
> #### Consistency _(top goal: Consistency)_
>
> - Status updates visible across all UIs within seconds.
> - Idempotent handling of duplicate planning updates.
>
> #### Maintainability _(top goal: Modifiability)_
>
> - Add a new planning vendor adapter without changing core work order rules.
> - _Nice-to-have:_ automated contract tests with recorded fixtures.
>
> #### Security
>
> - Role-based access control with site scoping via `garageId`.
> - Secure audit trail, prevent tampering with history.
>
> #### Auditability / traceability
>
> - Every significant change records who, when, and why.
> - Timeline export supports disputes and compliance.
>
> ### 10.2 Quality scenarios
>
> #### Reliability _(top goal: Resilience)_
>
> | Scenario     | Stimulus          | Response                                   | Metric/Target                        |
> | :----------- | :---------------- | :----------------------------------------- | :----------------------------------- |
> | Wi-Fi outage | 15 min disconnect | Workshop continues, actions queued locally | ≥ 99% of actions queued without loss |
> | Reconnect    | Network returns   | Queue replays and sync completes           | drained within ≤ 60s                 |
>
> _See also: degraded mode concept and ADR-001._
>
> #### Consistency _(top goal: Consistency)_
>
> | Scenario                  | Stimulus                              | Response                    | Metric/Target           |
> | :------------------------ | :------------------------------------ | :-------------------------- | :---------------------- |
> | Status visible everywhere | Mechanic sets `WaitingForParts`       | Admin and Workshop converge | ≤ 2s end-to-end (p95)   |
> | Duplicate vendor update   | Planning sends same appointment twice | Processed once, idempotent  | 0 duplicate work orders |
>
> #### Maintainability _(top goal: Modifiability)_
>
> | Scenario            | Stimulus            | Response                      | Metric/Target            |
> | :------------------ | :------------------ | :---------------------------- | :----------------------- |
> | Add planning vendor | New API and mapping | Add adapter, domain unchanged | ≤ 2 days, core untouched |
>
> #### Security
>
> | Scenario             | Stimulus                    | Response           | Metric/Target         |
> | :------------------- | :-------------------------- | :----------------- | :-------------------- |
> | Cross-garage access  | User tries other `garageId` | Denied             | 100% blocked          |
> | Audit tamper attempt | Try to edit history         | Prevented + logged | 100% blocked + logged |
>
> #### Auditability
>
> | Scenario         | Stimulus             | Response             | Metric/Target |
> | :--------------- | :------------------- | :------------------- | :------------ |
> | Customer dispute | "You promised 16:00" | Export full timeline | ≤ 60s export  |

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **Writing only adjectives**  
   "fast" is not a requirement. A scenario with a measurable target is.
   Make sure to talk with stakeholders what the target should be and how to verify it.

2. **Mixing requirements and solutions**  
   "use Redis" is a decision, not a requirement.
   The requirement is something like "fast access to work order state".
   If you have a decision that implements a quality requirement,
   write the requirement here, and link to the decision in chapter [9][CH9].

3. **No link back to goals**  
   If chapter [1][CH1] lists top goals, chapter 10 should make them concrete.
   It would be strange if chapter 1 says "consistency" is a top goal,
   but chapter 10 does not have any scenarios to measure it.

4. **Treating this as one-and-done**  
   Quality scenarios improve with iteration.
   Early drafts are allowed to be rough, as long as you refine them.
   Every time you add a scenario, building block, deployment, or decision,
   ask yourself if it has quality implications that should be captured here.

5. **Too many scenarios without navigation**  
   A large system can have many scenarios.
   Group them, keep titles clear, and keep tables consistent.
   Link to documents if you have detailed test plans or runbooks.

## Done-when checklist

🔲 Quality requirements are grouped in a structure people recognize (ISO/IEC 25010 or equivalent).  
🔲 Top quality goals from chapter [1][CH1] are turned into measurable scenarios.  
🔲 Scenarios include a stimulus, response, and a metric or target.  
🔲 At least one quality area traces back to the concept or decision that implements it.  
🔲 The chapter is treated as iterative, it will be refined as the system and insights evolve.

## Next improvements backlog

- Add monitoring or test hooks for the most important scenario metrics.
- Add scenario coverage for important external neighbors and operational jobs.
- Tighten targets over time based on observed production baselines.
- Add a short note per top goal on how it is validated (test, metric, runbook).

## Wrap-up

Chapter 10 is where quality stops being a wish and becomes a check.
When a quality trade-off is accepted, document it here:
note which quality was deprioritized, which won, and link to the decision in chapter [9][CH9] that captures the reasoning.
You can start with rough scenarios, then refine them as you learn.

Next up: arc42 chapter 11, "Risks and technical debt", where we capture the things that can still bite us later,
and how we keep them visible.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
[Q42]: https://quality.arc42.org/q42-for-iso-users/
[GHERKIN_REFERENCE]: https://cucumber.io/docs/gherkin/reference/
[CH1]: /2026/02/02/arc42-chapter-1-introduction-and-goals/
[CH5]: /2026/02/10/arc42-chapter-5-building-block-view/
[CH6]: /2026/02/11/arc42-chapter-6-runtime-view/
[CH7]: /2026/02/16/arc42-chapter-7-deployment-view/
[CH8]: /2026/02/17/arc42-chapter-8-cross-cutting-concepts/
[CH9]: /2026/02/18/arc42-chapter-9-architectural-decisions/
