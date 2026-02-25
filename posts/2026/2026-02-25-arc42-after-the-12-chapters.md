---
id: 2138
title: "After the 12 chapters: keep your arc42 docs alive"
date: 2026-02-25T20:30:00+01:00
author: Michaël Hompus
excerpt: >
  The arc42 template is a great structure, but structure alone does not keep documentation alive.
  In my talk I end with the practical part: where to store the docs, how to review them,
  how to avoid drift, and how to use agents as guardrails.
  This post captures those "after the template" slides in a form you can actually use.
permalink: /2026/02/25/arc42-after-the-12-chapters/
image: /wp-content/uploads/2026/02/post-2026-02-25-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Workflow
  - Markdown
  - Agents
  - ADR
series: Arc42 Practical Series
---

The [previous 12 chapter posts][SERIES] in this series walked through the arc42 template, chapter by chapter.

But this is my practical series, so I want to end with the practical part: where to store the docs, how to review them, how to avoid drift, and how to use agents as guardrails.

<!--more-->

## The awkward truth

Documentation does not die because people do not care.
It dies because there is no workflow that keeps it connected to change.

arc42 gives you a solid structure for _what_ to write. Now we need a structure for _how_ it stays current.

## A minimal workflow that works

This is the workflow I recommend when you want arc42 to stay alive:

- Start early, use arc42 as a blank canvas, even on an existing system, not as a final report.
- Keep it "minimal but honest".  
  Be concise, but do not document sections in isolation.
  The chapters in arc42 are connected: a constraint in chapter [2][CH2] might shape a decision in chapter [9][CH9], which in turn affects a building block in chapter [5][CH5].
  If you only look at one section at a time, you will miss those connections.
- Have a team rule: every change that impacts architecture should have:
  - a **documentation update** that reflects the current state of the design (e.g. when adding or modifying a feature).
  - an **ADR** that records _why_ a decision was made (e.g. when choosing a technology, pattern, or trade-off).

  These serve different purposes: the docs describe _what is_, the ADR explains _why_. Both should happen on significant changes.

- Publish the docs in a readable form, and link them from the repo README.
- Make the team the owner of the docs.
  The people who build the product maintain the documentation.
  If the product moves to an operations team, ownership of the docs transfers with it.
  Without clear ownership, nobody feels responsible, and the docs drift.

That last step matters more than it sounds.
If nobody can find the docs, the docs do not exist.

## Pick a home for your docs

You have three common options. None is perfect, so pick the one you will actually maintain.

### Option 1: Word or requirements tooling

Examples: [Microsoft Word][WORD], [IBM DOORS][DOORS], [Siemens Polarion][POLARION], [Jama Connect][JAMA].

This can work well for formal sign-off and audit trails, and in regulated industries these tools are often a contractual requirement.

The trade-off is iteration speed: when changes are frequent and reviews are slow, docs tend to describe the _intended_ design rather than the _current_ implementation.
In my experience this can create a disconnect between what the docs say and what the code actually does.

Even in these tools, arc42 can still be used to structure the content, so you do not forget to write down all the important aspects.

### Option 2: Wikis

Examples: [Confluence][CONFLUENCE], [Azure DevOps Wiki][AZDO_WIKI].

Wikis are easy to edit and easy to collaborate on.

The trade-off is drift:

- It is harder to review changes properly
- It is easy for the wiki to diverge from the code
- It is hard to enforce a "definition of done"

I find wikis useful when collaborating on designs, but in my experience, old designs are left and never cleaned up.
That makes it hard to find the current docs, and easy for them to become outdated.

### Option 3: In-repo docs (my default)

Examples: [AsciiDoc][ASCIIDOC], [Markdown][MARKDOWN].

Plain text files in the same repo as the code.

You get:

- PR-based review
- Versioning together with the implementation
- Enforceable checks (definition of done, linting, link checks, diagram builds)

A major advantage here is **Diagrams as Code**. Traditional drawing tools are a frequent reason documentation dies, because binary files are hard to update and hard to diff, or because the source can no longer be accessed or found.
By using tools like [Mermaid.js][MERMAID], [PlantUML][PLANTUML], or [Structurizr][STRUCTURIZR], your diagrams become plain text that renders automatically.

This is my default choice, however, it is not a silver bullet.
Accessibility and readability can be an issue, especially for non-technical stakeholders.
I prefer to have the CI pipeline publish the docs in a readable form (e.g. HTML or PDF) and link them from the README,
to make sure they are easy to read and distribute.

For this, [Asciidoctor][ASCIIDOCTOR] can render AsciiDoc to HTML or PDF.
[Doxygen][DOXYGEN], originally an API documentation tool, can also build full websites from Markdown with interlinking and embedding, which makes it useful for architecture docs too.
If you are looking for something built specifically for arc42, [docToolchain][DOCTOOLCHAIN] generates HTML and PDF from AsciiDoc-based arc42 documents and integrates with CI pipelines.

> [!TIP]
> If your team already works in pull requests, in-repo docs use the workflow you already have.

## Minimum viable documentation: first week starter pack

If you want something you can start with on Monday, this is the smallest set that already prevents expensive misunderstandings:

- Write the context and the most important goals (chapter [1][CH1]).  
  This is what stakeholders ask about first.
- Write some constraints down (chapter [2][CH2]).  
  Constraints narrow the solution space before design begins.
- Draw your service with its neighboring systems (chapter [3][CH3]).  
  A single diagram prevents <q>I did not know we depend on that</q> conversations.
- Write only the top-level building blocks (chapter [5][CH5]).  
  Enough to show the major parts and their responsibilities.
- Write the most important runtime flow (chapter [6][CH6]).  
  The one flow everyone needs to understand to work on the system.
- Start an empty decision log (chapter [9][CH9]).  
  Even if it is empty, having the placeholder signals that decisions should be recorded.
- Write a few quality scenarios (chapter [10][CH10]).  
  Explicit scenarios make "fast enough" and "secure enough" testable.

Notice that chapters [4 (Solution Strategy)][CH4], [7 (Deployment View)][CH7], [8 (Cross-cutting Concepts)][CH8], [11 (Risks)][CH11], and [12 (Glossary)][CH12] are not on this list.
They are valuable, but you can add them once the core is in place.
Chapter [4][CH4] often emerges naturally from the decisions you record in chapter [9][CH9].

Then iterate.
You will discover missing pieces because the structure nudges you into the gaps.

### Greenfield vs. brownfield

This starter pack works for both new and existing systems, but the starting point is different.

On a greenfield project, you are filling in a blank canvas: start with goals and constraints, then design from there.

On a brownfield project, the system already exists, and the knowledge is often in people's heads, not in a document.
Start by interviewing the team: ask what the system does (chapter [1][CH1]), draw the context together (chapter [3][CH3]), and document the existing building blocks (chapter [5][CH5]).
You will find that writing things down surfaces assumptions and disagreements that were invisible before.

> [!TIP]
> On brownfield projects, consider starting the glossary (chapter [12][CH12]) early.
> Teams with years of accumulated jargon often have the most misunderstandings around what words mean.
> Writing the glossary first can surface those differences before they cause design mistakes.

## Agents as guardrails

LLMs are good at reading natural language, and they tend to follow explicit rules consistently when those rules are part of the prompt context.

If you use agents ([Copilot][COPILOT], [Claude][CLAUDE], [Codex CLI][CODEX], etc.), add a small instruction file in your repo that makes your arc42 document a source of truth.

Example `AGENTS.md`:

```md title="AGENTS.md"
# Architecture guardrails

Before you propose or implement changes:

- Read the arc42 documentation in `docs/arc42/`.
- Treat it as the source of truth for constraints, decisions, and concepts.
- If a request conflicts with the docs, do not "pick a side".
  Explain the conflict and propose a change to the docs (ADR), the code, or both.
```

This is not about replacing humans.
It is about forcing inconsistencies to surface early.

That said, agents do not always verify what they claim.
An LLM might report that it checked the docs without actually reading them, or follow some rules and quietly ignore others.
Always verify that the output matches the documented constraints, especially for critical decisions.

> [!NOTE]
> As a demo, I added an exotic constraint to the solution strategy: "all method names must contain an emoji".
> An agent instructed to treat the arc42 docs as a source of truth will push back.
> C# identifiers cannot contain emoji characters, so the agent is stuck between two architectural rules:
> the naming constraint and the requirement that code must compile and pass tests.
> Instead of silently picking one, the agent flags the conflict and asks what to do.
> That is exactly the behavior you want: _surface the inconsistency, do not hide it_.
> ![Codex cannot comply with conflicting rules](/wp-content/uploads/2026/02/codex-arc42-conflicting-rules.png)

## Keeping it alive: reviews and drift

A workflow is only as good as the review habit behind it.
Without a review cadence, docs drift silently until someone finds a lie in chapter [5][CH5] during an incident.

A lightweight approach that works:

- **On every PR that touches architecture:** update the relevant arc42 sections as part of the definition of done.
  A concrete DoD entry could be: "arc42 docs reviewed and updated for any architectural impact".
- **After every significant decision:** add or update an ADR in the decision log (chapter [9][CH9]).
- **Quarterly (or after a major release):** do a full read-through of chapters [1][CH1]–[4][CH4] with the team.
  Are the goals still correct? Have constraints changed? Is the context diagram still accurate?
- **Annually:** review the full document. Update the glossary, and check that the deployment view matches reality.

The goal is not perfection. It is making drift _visible_ before it becomes expensive.

## Wrap-up

The template is only half the game.
The other half is having a workflow that makes updates cheap, reviewable, and hard to forget.

If you arrived here directly, the [full series][SERIES] walks through every chapter with copy/paste structures, examples, and checklists.
The Pitstop example that runs through the series is available as a [GitHub Gist][PITSTOP_ARC42].

The [arc42][ARC42] website and its [documentation][ARC42_DOCS] are the best starting points when you want to dive deeper.
The [FAQ][ARC42_FAQ] covers common questions, the [Quality Model (Q42)][Q42] helps with quality scenarios,
and the [Software architecture canvas][ARC42_CANVAS] is a great tool for workshops.

Make some lovely documentation!

[ARC42]: https://arc42.org/
[ARC42_DOCS]: https://docs.arc42.org/home/
[ARC42_FAQ]: https://faq.arc42.org/home/
[Q42]: https://quality.arc42.org/
[ARC42_CANVAS]: https://canvas.arc42.org/
[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[SERIES]: /2026/02/01/arc42-practical-series/
[WORD]: https://www.microsoft.com/microsoft-365/word
[DOORS]: https://www.ibm.com/products/requirements-management
[POLARION]: https://polarion.plm.automation.siemens.com/
[JAMA]: https://www.jamasoftware.com/
[CONFLUENCE]: https://www.atlassian.com/software/confluence
[AZDO_WIKI]: https://learn.microsoft.com/azure/devops/project/wiki/
[ASCIIDOC]: https://asciidoc.org/
[ASCIIDOCTOR]: https://asciidoctor.org/
[MARKDOWN]: https://daringfireball.net/projects/markdown/
[DOCTOOLCHAIN]: https://doctoolchain.org/
[DOXYGEN]: https://www.doxygen.nl/
[MERMAID]: https://mermaid.js.org/
[PLANTUML]: https://plantuml.com/
[STRUCTURIZR]: https://structurizr.com/
[COPILOT]: https://github.com/features/copilot
[CLAUDE]: https://www.anthropic.com/claude
[CODEX]: https://github.com/openai/codex
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
[CH11]: /2026/02/23/arc42-chapter-11-risks-and-technical-debt/
[CH12]: /2026/02/24/arc42-chapter-12-glossary/
