---
id: 2126
title: "arc42 chapter 1: Introduction and goals"
date: 2026-02-02T22:30:00+02:00
updated: 2026-02-03T22:00:00+02:00
author: Michaël Hompus
excerpt: >
  Chapter 1 sets the direction for the entire architecture document.
  If you do not know why you are building this and who it is for, you cannot design it properly.

  In this article I show what belongs in chapter 1, what to keep out,
  and a minimal structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/02/arc42-chapter-1-introduction-and-goals/
image: /wp-content/uploads/2026/02/post-2026-02-02-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Goals
  - Stakeholders
  - Quality
series: Arc42 Practical Series
---

Chapter 1 is part of the "Why and where" group. The audience for this chapter is everyone involved in the project.
Even nontechnical stakeholders should read and understand it.

It is the chapter that can prevent a lot of confusion later. You lay the foundation for everything that follows.
Not by adding too much detail (there are other chapters for that), but by making the intent explicit.

If you do not know why you are building this application and who it is for, you and your team cannot design it properly.

<!--more-->

## What belongs in chapter 1 (and what does not)

Chapter 1 of an [arc42][ARC42] document answers the "why" and "for whom" questions, without going into design.

What belongs here:

- A short problem statement and what you are building.
- The most important requirements (and explicit non-goals).
- The top quality goals that will drive trade-offs later.
- The key stakeholders and what they care about.

What does not belong here:

- Component diagrams, deployments, protocols, and technical choices (save those for later chapters).
- A complete requirements catalog (link to it if it exists).
- Long background stories and project history.

> [!NOTE]
> If you can only get one chapter right, get chapter 1 right.
> Maybe quite obvious, but it is the chapter everyone will read first.

## The minimum viable version

If you are short on time, aim for this:

1. One paragraph: what is the system and why does it exist?
2. 5–10 bullets: the most important requirements.
3. 3–5 quality goals: short and measurable.
4. A small stakeholder table.

That is enough to align a team and reduce surprises.

> [!TIP]
> Chapter 1 is also a great place to add something recognizable, like a small logo or cover image.
> It helps people quickly confirm they are reading the right document.
> If you do not have a logo, an LLM image generator can help you create one quickly.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point and keep it small.

```md title="01-introduction-and-goals.md"
## 1. Introduction and goals

<1–3 short paragraphs: what are we building, why now, what pain does it solve?>

### 1.1 Requirements overview

The most important requirements:

- ...
- ...

Explicit non-goals:

- ...
- ...

### 1.2 Quality goals

Top quality goals (measurable):

| Priority | Quality | Scenario (short) | Acceptance criteria (example) |
| -------: | :------ | :--------------- | :---------------------------- |
|        1 | ...     | ...              | ...                           |

### 1.3 Stakeholders

| Stakeholder | Expectations |
| :---------- | :----------- |
| ...         | ...          |
```

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

This is what chapter 1 looks like when filled in.

> ## 1. Introduction and goals
>
> Garages struggle to keep planning and workshop execution in sync.
> Most garages use a planning tool for appointments and a separate admin/workshop system for execution.
> When jobs change (delay, extra work, parts missing), updates are handled manually.
>
> Pitstop solves this by providing a single operational source of truth for work orders and status,
> and synchronizing planning and workshop execution.
>
> ### 1.1 Requirements overview
>
> - Import appointments from one or more planning services.
> - Convert appointments into work orders (jobs/tasks, estimates, required skills, bay assignment).
> - Provide an admin overview (today’s workload, lateness, bay utilization, priorities).
> - Provide a workshop view (per bay/technician task list with fast status updates and notes).
> - Push status changes back to planning (delays, ready-for-pickup, reschedule proposals).
>
> Explicit non-goals:
>
> - Pitstop is not the planning product.
> - Pitstop is not inventory management.
> - Pitstop is not billing/accounting.
>
> ### 1.2 Quality goals
>
> | Priority | Quality       | Scenario (short)                              | Acceptance criteria (example)                                                            |
> | -------: | :------------ | :-------------------------------------------- | :--------------------------------------------------------------------------------------- |
> |        1 | Consistency   | Admin + Workshop must show the same job state | Status updates visible in all UIs within <= 2 seconds under normal connectivity          |
> |        2 | Resilience    | Workshop continues during flaky internet      | Degraded mode works; updates sync when online                                            |
> |        3 | Modifiability | Add a new planning integration                | New integration in <= 2 days for a typical planning REST API without changing core logic |
>
> ### 1.3 Stakeholders
>
> | Stakeholder                  | Expectations                                                 |
> | :--------------------------- | :----------------------------------------------------------- |
> | Garage Owner / Manager       | Throughput, predictable planning, fewer no-shows, visibility |
> | Service Advisor (front desk) | Reliable customer promises, quick rescheduling               |
> | Workshop Foreman             | Clear priorities, balanced bays, fewer interruptions         |
> | Mechanics                    | Simple task list, fast updates, less admin burden            |

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **Only the name of the application**  
   If chapter 1 starts with just <q>System X</q> and a few bullets, it does not help anyone.
   Add 2–3 sentences that set the scene: what problem exists today, who feels the pain, and why building this is worth it.

2. **Listing features instead of goals**  
   Features are implementation ideas. Goals are outcomes.
   If you can explain the outcome, the team can still choose the best solution later.

3. **No explicit non-goals**  
   Non-goals prevent scope creep and wrong expectations.
   If something is out of scope, say so early, and say why.

4. **No quality goals (or only vague ones)**  
   If you do not write down quality goals, every trade-off later becomes a debate with no shared reference.
   The hard part is that stakeholders often do not have a list.

   A practical approach that works well:

   - Ask <q>what would make this a success</q> and <q>what would make people complain</q>.
   - Turn the answers into 3–5 short scenarios with one measurable criterion each.
   - Start with rough numbers. You can refine them later once you have usage data.

5. **Stakeholders = the team or product owner**  
   The development team is not the _only_ stakeholder.
   Everyone interacting with the system (directly or indirectly) is a stakeholder.
   If you require something from them, or they expect a service from your system, include them.

   A good way to expand the list:

   - End users (different roles, not one bucket)
   - Neighboring systems and their owners
   - Operations and support
   - Security, compliance, and governance
   - Business owners and managers

## Done-when checklist

🔲 Chapter 1 fits on a few screens.  
🔲 A new team member can explain the system after reading it.  
🔲 Non-goals are explicit.  
🔲 There are 3–5 quality goals with at least one measurable criterion each.  
🔲 Stakeholders are mapped to expectations, not just listed.

## Next improvements backlog

- Add links to any existing requirement sources (backlog items, product brief, etc.).
- Refine acceptance criteria based on observed production behavior.
- Split stakeholders into "users" and "neighbors" if the list grows.
- Add a short glossary entry in chapter 12 for any domain terms used in chapter 1.

## Wrap-up

Chapter 1 is the compass. 🧭  
It does not describe the architecture, it explains what the architecture must achieve.

Next up: chapter 2, "Architecture constraints", where we write down the rules that limit our freedom,
before they surprise us later.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
