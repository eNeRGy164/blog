---
id: 2136
title: "arc42 chapter 11: Risks and technical debt"
date: 2026-02-23T20:00:00+01:00
author: Michaël Hompus
excerpt: >
  Chapter 11 keeps uncomfortable truths visible.
  It records the risks and technical debt that can still bite you later,
  so they do not stay hidden in someone's head or scattered across chat logs.

  In this article I explain what belongs in chapter 11, what to keep out,
  a minimal structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/23/arc42-chapter-11-risks-and-technical-debt/
image: /wp-content/uploads/2026/02/post-2026-02-23-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Risks
  - Technical debt
  - Risk management
series: Arc42 Practical Series
---

This post is about **chapter 11: Risks and technical debt**,
the first chapter in the "Reality and shared language" group.

Up to chapter [10][CH10] we focused on building the architecture story:
goals, constraints, structure, runtime, deployment, concepts, decisions, and quality scenarios.

Chapter 11 is where we stop pretending everything is solved.
It is where I write down what can still go wrong, what we knowingly postponed, and what we have not figured out yet.

<!--more-->

> [!NOTE]
> A risk list is not a confession.
> It is a coordination tool.  
> Teams that write risks down early tend to be calmer in production.

## What belongs in chapter 11 (and what does not)

Chapter 11 of an [arc42][ARC42] document answers:

> What can still hurt us later, and what are we doing about it?

What belongs here:

- **Architecturally relevant risks**, including:
  - product and adoption risks (does the workflow fit reality?)
  - integration risks (vendor stability, contract changes, rate limits)
  - operational risks (backup, monitoring gaps, single points of failure)
  - security and compliance risks (data exposure, audit gaps, retention)
  - performance and scalability risks (hot paths, growth limits)
- **Technical debt** that affects maintainability, reliability, or delivery speed:
  the things you deliberately postponed and now need a visible trail for.
- For each risk or debt item:
  - a clear statement
  - why it matters (impact)
  - how likely it is (roughly)
  - mitigation or next step
  - owner (a person, role, or team)
- Cross-links to the rest of the document:
  constraints in chapter [2][CH2], strategy in chapter [4][CH4],
  runtime scenarios in chapter [6][CH6], deployment assumptions in chapter [7][CH7],
  reusable concepts in chapter [8][CH8], decisions in chapter [9][CH9],
  and quality scenarios in chapter [10][CH10].

What does not belong here:

- A full project management backlog.
  Keep chapter 11 focused on items that can materially impact the architecture.
- Sensitive vulnerability details in public documentation.
  It is fine to record security risks at a high level, but do not publish exploit steps, internal endpoints, or secret material.
  Link to a private ticket or security register if needed.
- A duplicate of chapter [9][CH9].
  Decisions belong in chapter 9, risks and debt belong here.
  When a risk is addressed by a decision, link to the ADR.

> [!TIP]
> If something feels uncomfortable to say out loud, it probably belongs in chapter 11.

### Risks vs technical debt

A simple distinction that works well:

- A **risk** is something that might happen.
  You manage it with mitigation, monitoring, and contingency plans.
- **Technical debt** is something that already happened.
  You chose a shortcut or postponement, and it has an interest rate.

Both are normal.
Hiding them is what hurts.

### Open questions, postponed decisions, and "decision debt"

Postponing architectural choices is often a very good practice.
You wait for more certainty, more feedback, and more time to show progress to stakeholders.

But not making a decision is also a risk.
At best, you forget it still needs to be made.
At worst, someone assumes it is already decided and starts building based on that assumption.

I use chapter 11 to make those "not-yet-decided" topics visible.
It is not only a risk list, it is also a lightweight backlog of decisions that still need daylight.

> [!TIP]
> Chapter 11 is a good place to list open risks and unknowns that still need a decision.
> A visible list of unknowns is more useful than pretending everything is decided.

## The minimum viable version

If you are short on time, aim for this:

- 5–10 risks that could realistically derail delivery, operations, or stakeholder trust
- 5–10 technical debt items that you know will slow you down later
- each item has an owner and a next step

That is already enough to stop surprise work.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point.

```md title="11-risks-and-technical-debt.md"
## 11. Risks and technical debt

Risks are phrased as: _what could hurt us_ + _why it matters_ + _what we’ll do about it_.

| Risk / debt item | Why it matters | Mitigation / decision |
| :--------------- | :------------- | :-------------------- |
| ...              | ...            | ...                   |

### Known technical debt (optional)

- <intentional shortcut> → <why acceptable now> ; <when to revisit>
- ...
```

> [!NOTE]
> Tables are not mandatory.
> If you prefer a list format, keep it scan-friendly and keep the same fields per item.

If you are more serious on risk management, you can add likelihood and impact columns, maybe even assign an owner.

```md title="11-risks-and-technical-debt.md"
## 11. Risks and technical debt

<Short intro: why this exists and how it is maintained.>

### 11.1 Risks

| ID   | Risk | Likelihood   | Impact       | Mitigation / next step | Owner |
| :--- | :--- | :----------- | :----------- | :--------------------- | :---- |
| R-01 | ...  | Low/Med/High | Low/Med/High | ...                    | ...   |

### 11.2 Technical debt

| ID   | Debt item | Why it exists | Cost/interest | Next step | Owner |
| :--- | :-------- | :------------ | :------------ | :-------- | :---- |
| D-01 | ...       | ...           | ...           | ...       | ...   |

### 11.3 Review cadence (optional)

- Review risks every <sprint/release/month>.
- Close items explicitly, do not silently delete them, history is valuable.
- When a risk becomes reality, record what happened and what you changed.
```

> [!TIP]
> Where you put open questions depends on how you work.
> If your process is _strategy-driven_ (pick direction first, then refine), keeping open questions in chapter 4 works well, and you can link to chapter 11 when they become concrete risks.
> If your process is more _risk-driven_ (track uncertainties and mitigation first), keep them in chapter 11 and link back to chapter 4 when they influence strategy.

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

Below is a small example list.
It is not meant to be complete, it is meant to show the style and the level of detail.

> ## 11. Risks and technical debt
>
> Risks are phrased as "what could hurt us" + "what we’ll do about it".
>
> | Risk / debt item                              | Why it matters                                                                                               | Mitigation / decision                                                                                        |
> | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
> | **Integration ambiguity per Planning Vendor** | Each vendor has different semantics (cancellations, reschedules, no-shows), causing inconsistent work orders | Define a vendor mapping spec + contract tests; keep vendor-specific logic in adapters                        |
> | **Offline sync conflicts**                    | Workshop can update while foreman/admin also edits → conflict resolution can become messy                    | Keep conflict rules simple (append notes; validate status transitions); provide "needs foreman review" path  |
> | **Backlog growth in sync queue**              | Vendor outage or slow API can pile up updates, delaying customer comms                                       | Monitor `sync_queue_depth`; circuit breaker; dead-letter queue + ops playbook                                |
> | **WebSocket instability in harsh networks**   | Real-time UX can degrade unpredictably in garages                                                            | Configurable fallback to polling (`Realtime:FallbackToPollingSeconds`); reconnect UX; track disconnect rates |
> | **Audit log volume / reporting load**         | Auditability creates data; dashboards can overload OLTP queries                                              | Use read models; partition audit table; retention policies; optional replica for reporting                   |
>
> **Known technical debt (intentional for v1)**
>
> - Single backend instance per garage (no HA) → acceptable for v1; revisit for chains.
> - Minimal conflict resolution UI → acceptable initially; prioritize based on observed conflicts.

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **Treating this as a shame list**  
   Chapter 11 is not for blame.
   It is for visibility and prioritization.

2. **No owners**  
   A risk without an owner is a wish.
   Put a person, role, or team on it.

3. **No next step**  
   A risk without a mitigation is just anxiety in table form.
   Even "decide in ADR-007" is better than nothing.

4. **Only technical risks**  
   Adoption, workflow fit, vendor behavior, and operations are often where the real pain starts.

5. **Deleting history**
   Close items explicitly.
   If something was a risk and it is no longer a risk, document why.

6. **No links back to the architecture story**  
   Risks should connect back to the drivers and trade-offs.
   Otherwise the list becomes isolated and nobody acts on it.

## Done-when checklist

🔲 The chapter lists the risks that could realistically hurt delivery or operations.  
🔲 Technical debt items are visible, not hidden in chat and backlog noise.  
🔲 Each item has an owner and a next step.  
🔲 Items link to the relevant chapters, concepts, decisions, or scenarios.  
🔲 The list is reviewed on a cadence (even if it is just "every release").

## Next improvements backlog

- Add a simple severity sorting (impact × likelihood) to focus discussions.
- Add a "trigger" column for risks (how you know it is happening).
- Add a short note per top risk on detection (logs, metrics, dashboards).
- Link security risks to a private register when details should not be published.

## Wrap-up

Chapter 11 is where the architecture document becomes a living safety net.
You make risks and debt visible early, then refine them as you learn.

Next up: arc42 chapter 12, "Glossary", where we build shared language so readers do not have to guess what terms mean.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
[CH2]: /2026/02/03/arc42-chapter-2-architecture-constraints/
[CH4]: /2026/02/09/arc42-chapter-4-solution-strategy/
[CH6]: /2026/02/11/arc42-chapter-6-runtime-view/
[CH7]: /2026/02/16/arc42-chapter-7-deployment-view/
[CH8]: /2026/02/17/arc42-chapter-8-cross-cutting-concepts/
[CH9]: /2026/02/18/arc42-chapter-9-architectural-decisions/
[CH10]: /2026/02/19/arc42-chapter-10-quality-requirements/
