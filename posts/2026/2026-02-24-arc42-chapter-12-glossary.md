---
id: 2137
title: "arc42 chapter 12: Glossary"
date: 2026-02-24T19:00:00+01:00
author: Michaël Hompus
excerpt: >
  Chapter 12 builds shared language.
  It explains the terms, abbreviations, and domain concepts used throughout the architecture document,
  so readers do not have to guess what words mean or how the team uses them.

  In this article I explain what belongs in chapter 12, what to keep out,
  a minimal structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/24/arc42-chapter-12-glossary/
image: /wp-content/uploads/2026/02/post-2026-02-24-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Glossary
  - Domain
  - Terminology
series: Arc42 Practical Series
---

This post is about **chapter 12: Glossary**,
the last chapter in the "Reality and shared language" group, and the final chapter of the arc42 template.

A glossary can be a simple list of abbreviations. That is useful, but it is not the main point.
The real value is shared meaning: domain terms, recurring concepts, and words that teams use differently.
If you practice Domain-Driven Design (DDD), this is where you document your Ubiquitous Language.
If you do not use DDD, think of it as the vocabulary the whole team agrees on.

If readers have to ask "what do you mean by that?" while reading the document, the answer should probably live here.

The stakeholders you identified in chapter [1][CH1] are your target audience.
Their vocabulary and assumptions should drive which terms you define.

<!--more-->

> [!NOTE]
> A glossary is not a dictionary.
> It is a list of the terms that matter for _this_ system and _this_ document.

## What belongs in chapter 12 (and what does not)

Chapter 12 of an [arc42][ARC42] document answers:

> Which terms do readers need to understand this document without guessing?

What belongs here:

- Domain terms that show up throughout the document:  
  the core nouns and verbs of the system (work order, appointment, bay, reschedule, etc.).
- Abbreviations and acronyms:  
  internal shorthand like ADR, RBAC, SSO, WS, SSE, OLTP.
- Architecture-specific terms and concepts you use repeatedly:  
  for example "source of truth", "degraded mode", "idempotency key", "read model".
- Homonyms: words that look the same but mean different things in different contexts  
  (for example "order", "status", "sync").
- Synonyms: different words your team uses for the same concept.  
  Pick one canonical term and document the alternatives as aliases.
- Ownership of meaning:  
  when a term is a contract with an external neighbor, link to where it is specified (chapter [3][CH3] or an API spec).
- Translations and language mapping when the domain and the document use different languages:  
  a consistent mapping from "local language term" ↔ "document term" so the whole team speaks the same language.

> [!TIP]  
> If your organization already has a central glossary (enterprise/domain/platform), link to it.
> Do not copy it into this document.  
> Chapter 12 should only define the terms that are used _in this architecture_ or that have a local meaning.

What does not belong here:

- Long tutorials or deep technical explanations.  
  Keep definitions short and link to a concept section (chapter [8][CH8]) when more detail is needed.
- A duplicate of the full domain model.  
  If you need the full model, link to it, and keep chapter 12 as the shared vocabulary summary.
- Terms that are obvious to your audience and only used once.  
  If it is not used, it does not belong.
- API field definitions and payload-level vocabulary.  
  API reference docs have their own glossaries. Chapter 12 covers architecture-level terms, not message schemas.

> [!TIP]
> If a term appears in multiple chapters and could be interpreted in different ways,
> add it to the glossary early. Future you will thank you.

### Abbreviations are not enough

It is common to treat the glossary as an acronym list.
That helps, but it does not solve the harder problem: shared understanding.

A better checklist for adding items:

- Does this term show up in multiple chapters?
- Could two stakeholders interpret it differently?
- Is this term used as a contract with a neighbor system?
- Would a new team member stumble on it?

If the answer is yes, it belongs here.

### Translations and mixed-language domains

Some domains are bilingual by nature:
the business uses Dutch terms, the code uses English, and the document ends up mixing both.

If your team runs into this, document the mapping explicitly.

A practical approach:

- Pick one primary term for the document (usually the one used in code).
- Add the alternative term as an alias.
- If needed, add a short note on where the term is used (UI label, code name, external system name).

This reduces friction in discussions and prevents subtle misunderstandings.

## The minimum viable version

If you are short on time, aim for this:

- 5–10 terms:
  only the ones that are used repeatedly or can be misunderstood.
- 1–2 lines per term.
- Include acronyms that appear in headings, diagrams, or tables.

That is enough to make the document readable for newcomers.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point.

```md title="12-glossary.md"
## 12. Glossary

<Short intro: what kinds of terms are defined here?>

### Terms and Abbreviations

<!-- Alphabetical order is not required, but most readers like it. -->

- **<Term or abbreviation>**  
  <Meaning or description. Notes or aliases go here.>
- **<ABBREVIATION>**  
  _<Full form>_  
  <Meaning or description.>

### Translations (optional)

<Only if your domain and document use different languages.>

| Term (document) | Term (domain / UI) | Notes |
| :-------------- | :----------------- | :---- |
| ...             | ...                | ...   |
```

> [!NOTE]
> Alphabetical order is common and readers tend to expect it, but it is not a requirement.
> What matters most is that the list is consistent and easy to scan.

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

Below is a short example excerpt.

> ## 12. Glossary
>
> ### Terms and Abbreviations
>
> - **ADR**  
>   _Architecture Decision Record_  
>   A document that captures an important architectural decision, its context, and its consequences.
>   Stored in chapter 9 of this document.
> - **Appointment**  
>   A scheduled time slot owned by the Planning Service. Pitstop imports this and maps it to a work order.  
>   _External term; owned by the Planning Service (see chapter 3). Also referred to as "slot" in the Planning API._
> - **Degraded mode**  
>   A mode where the workshop UI can continue during connectivity loss. Uses a local queue and replay.
> - **Idempotency key**  
>   A key that makes repeated messages safe to process multiple times. Prevents duplicate state changes on retries.
> - **RBAC**  
>   _Role-based access control_  
>   A model that restricts system access based on the roles assigned to users.
> - **Source of truth**  
>   The system that owns the authoritative state for a concept. Planning owns appointments, Pitstop owns work order status.
> - **Status**  
>   In Pitstop, "status" always means _work order status_ (the lifecycle from `created` → `in-progress` → `done`).  
>   The Planning Service uses "status" for appointment state (`confirmed`, `cancelled`, `no-show`),
>   and the sync layer tracks its own sync status (`pending`, `synced`, `failed`).  
>   _When reading this document, assume work order status unless the text says otherwise._
> - **SSE**  
>   _Server-sent events_  
>   A server push technology that lets a server stream events to a browser over a single HTTP connection.
> - **Work order**  
>   The unit of work in the workshop. Contains tasks, status, notes, and audit trail. Central aggregate (see chapter 8).
> - **WS**  
>   _WebSocket_  
>   A protocol that provides full-duplex communication over a single TCP connection.
>
> ### Translations
>
> | Term 🇺🇸 (document) | Term 🇳🇱 (domain / UI) | Notes                                      |
> | :----------------- | :-------------------- | :----------------------------------------- |
> | Work order         | Werkorder             | UI label used by garages.                  |
> | Workshop           | Werkplaats            | Used in training materials and onboarding. |

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **Only listing acronyms**  
   Acronyms help, but they do not solve shared meaning for domain terms.

2. **Defining terms that are never used**  
   A glossary is part of the architecture document, not a trivia list.

3. **Definitions that are too long**  
   If a definition needs a page, you probably need a concept section (chapter [8][CH8]) and a short summary here.

4. **No alias handling**  
   If the same concept has two names, document both.
   Otherwise your team will keep arguing about words instead of system behavior.

5. **Not maintaining it**  
   Every time you introduce a new recurring term, update the glossary.
   It is cheap work with high return.
   A practical trigger: review the glossary whenever you write an ADR, add an integration, or onboard a new team member.

## Done-when checklist

🔲 Key domain terms used across the document are defined.  
🔲 Acronyms and abbreviations are explained.  
🔲 Ambiguous terms have explicit meaning for this system.  
🔲 Mixed-language terms have a clear mapping (if relevant).  
🔲 A new team member can read the document without asking "what does this mean?" repeatedly.

## Next improvements backlog

- Add links from glossary terms to the first chapter where they are introduced.
- Add aliases for terms used in UI labels, code, and external systems.
- Review the glossary with a stakeholder who did not write the document.

## Wrap-up

Chapter 12 is short, but the return is real.
When the glossary is good, every other chapter becomes easier to read and easier to discuss.

This concludes the arc42 template itself.  
The series is not done though.

I will add a follow-up post with practical notes on using a workflow to keep the document alive,
not a one-off deliverable.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
[CH1]: /2026/02/02/arc42-chapter-1-introduction-and-goals/
[CH3]: /2026/02/04/arc42-chapter-3-context-and-scope/
[CH8]: /2026/02/17/arc42-chapter-8-cross-cutting-concepts/
