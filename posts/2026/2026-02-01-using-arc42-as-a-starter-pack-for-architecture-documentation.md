---
id: 2125
title: "The Art of Simple Software Architecture Documentation (with arc42) - a practical series"
date: 2026-02-01T21:50:00+01:00
updated: 2026-02-19T20:00:00+01:00
author: Michaël Hompus
excerpt: >
  After my "The Art of Simple Software Architecture Documentation" talk,
  a surprising number of people asked for the slides because they saw the deck as a reference guide.

  This post is the starting point: why arc42 works so well, how I approach it in practice,
  and how this series will grow over time, without pretending it is finished on day one.
permalink: /2026/02/01/arc42-practical-series/
image: /wp-content/uploads/2026/02/post-2026-02-01-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Templates
series: Arc42 Practical Series
---

After my talk "**Arc42: The Art of Simple Software Architecture Documentation**" at [Bitbash][BITBASH] 2026,
a surprising number of people reached out.

Not just with <q>nice talk</q>, but with <q>can you share the slides?</q>.
People told me they saw the deck as a _reference guide_.

That was the trigger to write it down properly.

When the same question comes back again and again, it usually means the same thing:
arc42 is widely known, but it is hard to find practical guidance and shareable examples.

<!--more-->

> [!TIP]
> I will be giving this talk March 11 at [Future Tech 2026][FUTURE_TECH] in Utrecht 🇳🇱.  
> If you like this topic and want the full story live, come say hi.
>
> [![Future Tech 2026 banner featuring Michaël Hompus and the session title "arc42: The Art of Simple Software Architecture Documentation"](/wp-content/uploads/2026/02/future-tech-2026-banner.jpg)][FUTURE_TECH]

## What this series is (and what it is not)

This is a series of short, practical posts about **using arc42 to document software architecture**.

Not "architecture theory".  
Not "how to draw 17 diagrams per sprint".  
And definitely not "write a document once and forget it".

The goal is simple:

> **Help you start small, document what matters, and keep improving over time.**

[arc42][ARC42] is great because it gives structure without forcing you into a heavyweight process.
But that flexibility also creates a common problem:

- everyone agrees _the template looks nice_,
- fewer people agree on **what good content looks like**,
- and almost nobody can share real examples because most architecture docs live behind company firewalls.

So I am going to do two things:

1. **Explain how I fill each arc42 chapter in practice** (with guidance, pitfalls, and "done-when" checks).
2. Use a small demo system (**Pitstop**) as a shareable example, so it does not stay abstract.

## Why arc42?

arc42 works well because it pushes you to answer the questions that _always_ come back later:

- What are we building and why?
- What must be true about quality (performance, security, maintainability, etc.)?
- What are the constraints that narrow our solution space?
- How is it structured?
- How does it run?
- How is it deployed?
- What decisions did we make, and why?

It is not perfect. But it is a really good default.

And defaults matter, because **no documentation approach survives contact with <q>we have sprint goals</q>**.

## The "minimal but honest" rule

This is the rule I try to follow:

> **Write the smallest amount of documentation that prevents expensive misunderstandings.**

That means:

- do not write marketing material
- do not write a novel or fill a bookcase
- do not invent details you do not know yet
- and do not pretend you will get it right on the first try

Architecture docs are not a deliverable. They are a **feedback loop**.

Every time you revisit a document with fresh eyes, you will spot improvements.
That is not failure, that is the whole point.

## The arc42 chapters

One thing I like about arc42 is that the 12 chapters are not a random list.
They can be grouped into a few themes, which makes it easier to navigate and to explain to your team.

This is the same grouping I used in my slides.

### Why and where

These chapters set the direction and boundaries.

1. **Introduction and goals**
2. **Architecture constraints**
3. **Context and scope**

### How is it built and how does it run

These chapters describe the actual solution.

<!-- markdownlint-disable MD029 -->

4. **Solution strategy**
5. **Building block view**
6. **Runtime view**
7. **Deployment view**

### Reusables, decisions, and qualities

These chapters keep the system consistent and explain trade-offs.

8. **Cross-cutting concepts**
9. **Architecture decisions**
10. **Quality**

### Reality and shared language

These chapters make the documentation useful in real life, long after the first design.

11. **Risks and technical debt**
12. **Glossary**

If you have only ever used arc42 as a template, try this grouping with your team.
It tends to make the "why does this chapter exist" discussion much easier.

## How the posts will be structured

Each chapter post will follow the same pattern:

- **What belongs in this chapter (and what does not)**
- **The minimum viable version** (the smallest useful content)
- **A copy/paste structure** (Markdown skeleton)
- **Example from Pitstop** (small excerpt, no hand-wavy lorem ipsum)
- **Common mistakes I see**
- **Done-when checklist**
- **Next improvements backlog** (because iteration is real)

That way you can skim when you are busy, or go deeper when you are implementing it.

## Where to start

This post is the hub for the series.

### If you only write 3 things, write these

1. **Chapter 1: [Introduction and goals][CH1]**  
   If you do not know the goals and stakeholders, you cannot make good design trade-offs.

2. **Chapter 2: [Architecture constraints][CH2]**  
   Hidden constraints are the source of late-stage surprise and pain, but can also help narrow down options early.

3. **Chapter 3: [Context and scope][CH3]**  
   If the boundaries are unclear, integrations and expectations will break first.

Once those are clear, you can add:

- a rough building block view,
- one or two runtime scenarios,
- and you have already prevented a lot of chaos.

## Series status

### Posts

**Why & where:**

- ✅ 1. [Introduction and goals][CH1]
- ✅ 2. [Architecture constraints][CH2]
- ✅ 3. [Context and scope][CH3]

**How is it built & how does it run:**

- ✅ 4. [Solution strategy][CH4]
- ✅ 5. [Building block view][CH5]
- ✅ 6. [Runtime view][CH6]
- ✅ 7. [Deployment view][CH7]

**Reusables, decisions, & qualities:**

- ✅ 8. [Cross-cutting concepts][CH8]
- ✅ 9. [Architecture decisions][CH9]
- ✅ 10. [Quality requirements][CH10]

**Reality & shared language:**

- ⏳ 11. Risks and technical debt
- ⏳ 12. Glossary

You will also find all posts in the series navigation in the sidebar.

## The promise (so you do not get disappointed)

I am not going to claim this will be "the definitive arc42 guide".

It will be:

- a practical reference,
- based on real usage,
- improved as I use it more (and as people send feedback).

So if you are also using arc42 (or want to), consider this an open invitation to compare notes.  
Because the real magic of architecture documentation is not in the template.
It is in the conversations it forces you to have.

Next up: [Chapter 1, "Introduction and goals"](/2026/02/02/arc42-chapter-1-introduction-and-goals/),
where we turn vague intentions into a small set of concrete quality goals.

[ARC42]: https://arc42.org/
[BITBASH]: https://bitbash.nl/
[FUTURE_TECH]: https://futuretech.nl/
[CH1]: /2026/02/02/arc42-chapter-1-introduction-and-goals/
[CH2]: /2026/02/03/arc42-chapter-2-architecture-constraints/
[CH3]: /2026/02/04/arc42-chapter-3-context-and-scope/
[CH4]: /2026/02/09/arc42-chapter-4-solution-strategy/
[CH5]: /2026/02/10/arc42-chapter-5-building-block-view/
[CH6]: /2026/02/11/arc42-chapter-6-runtime-view/
[CH7]: /2026/02/16/arc42-chapter-7-deployment-view/
[CH8]: /2026/02/17/arc42-chapter-8-cross-cutting-concepts/
[CH9]: /2026/02/18/arc42-chapter-9-architectural-decisions/
[CH10]: /2026/02/19/arc42-chapter-10-quality-requirements/
