---
id: 2134
title: "arc42 chapter 9: Architectural decisions"
date: 2026-02-18T21:00:00+01:00
updated: 2026-02-19T20:00:00+01:00
author: Michaël Hompus
excerpt: >
  Chapter 9 is your decision timeline.
  It records the important architectural choices you made along the way,
  so you can see what was decided, why, and which options were not picked.
  This chapter often starts small, but it grows as the system grows.

  In this article I explain what belongs in chapter 9, what to keep out,
  a minimal structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/18/arc42-chapter-9-architectural-decisions/
image: /wp-content/uploads/2026/02/post-2026-02-18-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - ADR
  - Decisions
series: Arc42 Practical Series
---

This post is about **chapter 9: Architectural decisions**,
the second chapter in the "Reusables, decisions, and qualities" group.

Chapter [8][CH8] captured reusable patterns and practices.
Chapter 9 captures the choices that shape the system, including the strategy choices from chapter [4][CH4].

I treat this chapter as a timeline.
It often starts small, because you have not made many decisions _yet_.
But it is still the start of the decision trail, and every meaningful choice you make later can land here.

<!--more-->

> [!NOTE]
> Chapter 9 is the beginning of the timeline.
> If your system lives for years, this chapter will grow with it.
> That is a feature, not a smell.

## What belongs in chapter 9 (and what does not)

Chapter 9 of an [arc42][ARC42] document answers:

> Which important architectural decisions were made, and what was the rationale?

What belongs here:

- A **decision timeline** that is easy to scan.
  A table works well, because it stays compact even when the list grows.
- Decisions that affect future work:
  structure, integration approach, deployment strategy, quality trade-offs, team boundaries, and platform choices.
  Strategy decisions from chapter [4][CH4] are a perfect match here.
- For each decision, at least:
  - the decision itself
  - a short motivation
  - a link to details (optional, but recommended)
- **Considered options** for decisions that can trigger future discussions.
  This is the part that prevents <q>why did you not choose X?</q> debates years later.
- Links to where the decision shows up:
  chapters [4][CH4]–[8][CH8] and the relevant code or infrastructure artifacts.

What does not belong here:

- Changes that are easy to undo.
  A practical test: if reverting the change does not hurt, it is probably too small to record as a decision.
- Meeting notes or chat transcripts.
  Keep the record curated.
- A concept guide.
  If the content is <q>how we always do retries</q>, put it in chapter [8][CH8] and link to it from here.

> [!TIP]
> Decisions are made more often than teams realize.
> Writing them down is how you turn "tribal knowledge" into shared knowledge.

### Decision timeline formats: list or ADRs

There is no required format here.
The simplest valid version is a decision timeline with a short motivation per entry.

ADRs are an optional extension of that idea.
They are not required by arc42, but they are a great format when a decision has real trade-offs and future consequences.
This post is not an exhaustive guide on ADRs (there are entire books on that),
but I will show you how to fit them into the concise style of arc42.

A simple rule of thumb for when to write an ADR:
if the decision constrains future work _and_ is hard to reverse, it deserves one.
If reverting or changing it later is cheap, a one-liner in the timeline is enough.

A good workflow is:

- Keep the timeline in chapter 9.
- When an entry needs more detail, link to an ADR file.
- The timeline stays readable, and the details stay available.

> [!TIP]
> **Use AI to draft ADRs and keep the timeline in sync**
>
> Writing ADRs can feel like a chore, but AI tools are good at turning messy context into a consistent record.
> Use them to draft the ADR in the agreed template, and to update the chapter 9 timeline entry at the same time
> (so the table stays the single index).
>
> See [How I use Claude Code to keep my architecture decisions on track][WILLEM_ADR_CLAUDE_BLOG]
> by [Willem Meints][WILLEM_LINKEDIN] for a practical workflow.

### ADR format

When I use ADRs, I put the decision before considered options.
That gives a management overview without forcing readers through all the details.

A good ADR structure:

- Metadata (date, status, decision makers)
- Context (what problem or constraint triggered this decision)
- Decision (one short paragraph: what did we decide)
- Consequences (what changes and risks did we accept)
- Considered options (with a short "why not" for each)

> [!TIP]
> Put the decision in the ADR title.
> Future you will scan titles, not full pages of content.

Statuses are kept simple:

- **Pending** <small>(draft, not yet accepted)</small>
- **Accepted**
- **Superseded by ADR-XXX** <small>(the replacement decision)</small>

I do not use a "deprecated" status.
Deprecating something is itself a decision, and that decision supersedes the old one.
Also here you have to write down the consequences of deprecation, will you clean up, do you accept dead-code, etc.

> [!WARNING]
> **Treat accepted ADRs as immutable.**
>
> Do not rewrite an old ADR when the decision changes.
> Instead, mark it as "Superseded" and write a new ADR.
> This preserves the history of _why_ you thought the original decision was a good idea at the time.

## The minimum viable version

If you are short on time:

- Start with a timeline table.
- For each entry, write 1–3 lines of motivation.

That is already enough to preserve the reasoning.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point.

```md title="09-architectural-decisions.md"
## 9. Architectural decisions

<Short intro: how do we capture decisions and keep them current?>

| Date | Decision | Status |
| :--- | :------- | :----- |
| ...  | ...      | ...    |

<If you have decisions without ADRs, keep them here too.
The decision can just be plain text plus 1–3 lines of motivation.>
```

And an ADR template that matches the timeline:

```md
### ADR-XXX <Decision statement>

- **Date:** YYYY-MM-DD
- **Status:** Pending | Accepted | Superseded by ADR-YYY
- **Decision makers:** <names or roles of the people who made the decision>

#### Context

<What problem or constraint triggered this decision?>

#### Decision

<One short paragraph: what did we decide?>

#### Consequences

- <what gets better>
- <what gets harder>
- <follow-up work / migration notes>

#### Considered options

1. <option A: short statement>
   - **Pros**:
     - <reason>
   - **Cons**:
     - <reason>
2. <option B: short statement>
   - **Pros**:
     - <reason>
   - **Cons**:
     - <reason>

#### References

- Affects: chapter 4/5/6/7/8 links (optional)
- Related concept: chapter 8.n (optional)
- Related code: <path or repo link> (optional)
```

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

Below is a small timeline table plus one ADR example.

> ## 9. Architectural decisions
>
> | Date       | Decision                                                                                          | Status   |
> | :--------- | :------------------------------------------------------------------------------------------------ | :------- |
> | 2026-01-18 | [ADR-001 Add degraded mode for workshop updates](#adr-001-add-degraded-mode-for-workshop-updates) | Accepted |
>
> ### ADR-001 Add degraded mode for workshop updates
>
> - **Date:** 2026-01-18
> - **Status:** Accepted
> - **Decision makers:** Michaël (architect), workshop team (developers and testers)
>
> #### Context
>
> Workshop connectivity is not reliable in every garage.
> Status updates must remain possible during outages, and the system must recover safely.
>
> #### Decision
>
> Pitstop supports **a degraded mode where the workshop UI can keep working while offline**.
> Updates are queued locally and replayed later with idempotency keys to prevent double-apply.
>
> #### Consequences
>
> - Workshop UI becomes stateful and needs conflict handling.
> - Backend needs idempotency storage and replay rules.
>
> #### Considered options
>
> 1. Reject updates when offline
>    - **Cons**:
>      - blocks the workshop and causes lost work
> 2. Allow offline updates without idempotency
>    - **Cons**:
>      - unsafe replays and duplicate state changes on reconnect
> 3. Local queue with idempotency keys
>    - **Pros**:
>      - safe replay, workshop keeps moving
>
> #### References
>
> - Concept: degraded mode and idempotency
> - Scenario: appointment import and status updates

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **Not realizing you made a decision**  
   Many decisions show up as "small choices" in a sprint.
   If it shapes future work, record it.

2. **Skipping considered options**  
   This is how you get time-travel debates later.
   A short "why not" list is often enough.

3. **Decisions without consequences**  
   If there is no trade-off, it is probably not a decision.
   Write down what gets harder, not only what gets easier.

4. **No successor trail**  
   Decisions can be overturned with new insights.
   Do not delete the old one, supersede it and link forward.

5. **Logging everything**  
   If reverting the change does not hurt, it is probably too small for chapter 9.
   Keep this chapter high signal.

## Done-when checklist

🔲 Chapter 9 contains a scan-friendly timeline of decisions.  
🔲 Each entry has at least the decision and a short motivation.  
🔲 Important decisions have considered options recorded.  
🔲 Decisions link to where they show up (chapters [4][CH4]–[8][CH8]).  
🔲 Quality trade-offs connect to quality scenarios in chapter [10][CH10].

## Next improvements backlog

- Add lightweight review: ADRs are accepted before major implementation work starts.
- Add cross-links from chapter 8 concepts back to the decisions that introduced them.
- Supersede decisions when they are changed, and link to the new one.

## Wrap-up

Chapter 9 is the memory of your architecture.
It keeps the reasoning visible, even when the team changes and the code evolves.

Decisions and quality requirements reinforce each other.
A decision often accepts a trade-off, and chapter [10][CH10] is where you make those trade-offs measurable.

Next up: [arc42 chapter 10, "Quality requirements"][CH10], where we turn quality goals into concrete scenarios and checks.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
[WILLEM_LINKEDIN]: https://www.linkedin.com/in/wmeints/
[WILLEM_ADR_CLAUDE_BLOG]: https://www.beyondautocomplete.nl/how-i-use-claude-code-to-keep-my-architecture-decisions-on-track/
[CH4]: /2026/02/09/arc42-chapter-4-solution-strategy/
[CH8]: /2026/02/17/arc42-chapter-8-cross-cutting-concepts/
[CH10]: /2026/02/19/arc42-chapter-10-quality-requirements/
