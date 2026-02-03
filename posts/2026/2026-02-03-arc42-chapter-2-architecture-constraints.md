---
id: 2127
title: "arc42 chapter 2: Architecture constraints"
date: 2026-02-03T20:00:00+01:00
author: Michaël Hompus
excerpt: >
  Chapter 2 lists the non-negotiables that shape your design space.
  If you do not write these down early, they will still exist, but they will surprise you later.

  In this article I show what belongs in chapter 2, what to keep out,
  and a minimal structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/03/arc42-chapter-2-architecture-constraints/
image: /wp-content/uploads/2026/02/post-2026-02-03-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Constraints
  - ADR
  - Governance
series: Arc42 Practical Series
---

Chapter 2 is part of the "Why and where" group.
It is the chapter where you write down the rules you cannot break.

This is not about what you prefer.
It is about what your organization, environment, or stakeholders already decided for you.

If you do not document constraints early, they still shape the architecture.
You just discover them at the worst possible time.

Constraints also have a positive side: there are thousands of ways to build the same functionality.
A short list of non-negotiables helps you narrow down options early, before you invest in the wrong direction.

I have seen teams pick a public cloud technology because it fit the solution, while the product had to run air-gapped on-premises.
Or because it was "hot" (call it: *conference-driven design*), while operations would only support a single platform.
Money got wasted before someone finally said: <q>this was never negotiable</q>.

<!--more-->

## What belongs in chapter 2 (and what does not)

Chapter 2 of an [arc42][ARC42] document answers one question:

> What limits our freedom, no matter what solution we pick?

What belongs here:

- Organizational constraints (budget/time, team skills, governance, contracting).
- Technical constraints (platforms/stack, operations model, security/compliance rules).
- Integration constraints (what you must connect to, formats you must accept).
- Conventions (coding standards, CI/CD rules, naming/versioning, documentation rules).
- References to standards you must follow.

What does not belong here:

- Architecture choices you still get to make (save those for chapter 4 and chapter 9).
- Personal preferences (<q>I like microservices</q>, <q>we always use Kafka</q>).
- Detailed design, diagrams, protocols, or deployment layouts.

> [!NOTE]  
> A constraint is a rule you must follow.  
> A decision is a choice you make.  
> If you mix them, chapter 2 becomes a debate instead of a boundary.

## Constraints exist on multiple levels

Organizations often have architecture and constraints at multiple levels (enterprise, domain, platform, product, application).
You can use arc42 at all those levels, but in practice most teams start at the bottom: an application or service.

That is also where chapter 2 becomes very practical:
many constraints already exist as company policies and standards.

> [!TIP]  
> Link to existing policies instead of rewriting them.  
> They tend to be stable, owned, and updated in one place.  
> Your chapter 2 should explain the impact, not duplicate the policy text.

Many policies ultimately follow from a company mission and vision.
So even if a constraint looks "technical", it often exists for a business reason.
Writing down the rationale helps prevent <q>this is stupid</q> discussions later.

## The minimum viable version

If you are short on time, aim for this:

- 8–15 constraints in a table
- each constraint includes:
  - a clear statement
  - a type (organizational, technical, convention, integration, compliance)
  - a short rationale
  - the impact on design
  - a reference or owner (where it came from)

That is enough to prevent surprise constraints late and to make later decisions faster.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point.

```md title="02-architecture-constraints.md"
## 2. Architecture constraints

Non-negotiables that shape the design space.

| Constraint | Type           | Rationale | Impact on design | Reference |
| :--------- | :------------- | :-------- | :--------------- | :-------- |
| ...        | Organizational | ...       | ...              | ...       |
| ...        | Technical      | ...       | ...              | ...       |
| ...        | Convention     | ...       | ...              | ...       |

Notes:

- If a constraint has exceptions, describe the exception path.
- Link to standards, policies, or owners as references.
```

> [!NOTE]  
> A table is not mandatory.  
> If your constraints list grows, grouping them by type (e.g., organizational, technical, conventions, compliance) can be more readable.  
> The key is still the same: statement, rationale, impact, and source.

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

This is what chapter 2 looks like when filled in.

> ## 2. Architecture constraints
>
> Non-negotiables that shape the design space:
>
> | Constraint                              | Type           | Rationale                         | Impact on design                                   |
> | :-------------------------------------- | :------------- | :-------------------------------- | :------------------------------------------------- |
> | Must integrate with Planning Service(s) | Integration    | Existing ecosystem reality        | API contracts, sync strategy, mapping rules        |
> | Near real-time UI updates               | UX/Operational | Workshop coordination             | Push updates (WebSocket/SSE) or efficient polling  |
> | Degraded-mode operation                 | Operational    | Garage networks can be unreliable | Local cache/queue, retry, conflict handling        |
> | Containerized deployment                | Platform       | Standard ops model                | Registry, base images, runtime policy              |
> | Automated CI + tests                    | Process        | Fast feedback and reliability     | Pipeline ownership + test environments             |
> | GDPR / minimal personal data            | Compliance     | Customer data                     | Data minimization, retention rules, audit controls |
> | Deviations recorded as ADRs             | Governance     | Prevent silent divergence         | ADR workflow and traceability (chapter 9)          |

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **Writing constraints too late**  
   If chapter 2 is empty, people will assume freedom that does not exist.
   Then the first real constraint shows up during implementation, procurement, or security review.

2. **Using vague words**  
   <q>Secure</q>, <q>fast</q>, <q>cloud-ready</q> are not constraints.  
   Write constraints as rules you can test against: <q>must run on-prem</q>, <q>must be air-gapped</q>, <q>must use SSO</q>.

3. **Mixing constraints and decisions**  
   <q>We will use PostgreSQL</q> is usually a decision.  
   <q>We must use the company-managed PostgreSQL platform</q> is a constraint.  
   If it is not truly non-negotiable, move it to chapter 4 or chapter 9.

4. **No impact column**  
   A constraint without impact does not help the team.
   The value is in translating a rule into a design consequence.

5. **Forgetting conventions and governance**  
   Conventions feel boring until they break delivery: CI/CD rules, versioning, naming, documentation rules, ADR requirements.
   Put them here so they are explicit.

## Exceptions and experiments

Non-negotiable does not mean "never".
Sometimes you run an experiment to learn, or you need an exception for a specific case.

> [!TIP]  
> When you make an exception, document it as an ADR and link it here.  
> The goal is not bureaucracy.  
> The goal is that the next team does not rediscover the same debate.

## Done-when checklist

🔲 Chapter 2 contains the real non-negotiables, not preferences.  
🔲 Each constraint has a clear impact on design and delivery.  
🔲 Each constraint has a source (owner, standard, policy, or link).  
🔲 The list is short enough to scan, but complete enough to prevent surprises.  

## Next improvements backlog

- Review the list with ops, security, and the product owner (fast reality check).
- Add links to central standards (security baseline, platform rules, CI/CD guidance).
- Mark constraints that are assumptions and confirm them (or remove them).
- Add ADR links for any local deviations from central architecture/platform rules.
- Split the table into sub-sections if it grows (organizational, technical, conventions).

## Wrap-up

Chapter 2 is where you protect your future self.
Constraints narrow the solution space, so later decisions become faster and more consistent.

Next up: arc42 chapter 3, "Context and scope", where we draw the boundary and make integrations and expectations explicit.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
