---
id: 2133
title: "arc42 chapter 8: Cross-cutting concepts"
date: 2026-02-17T20:00:00+01:00
updated: 2026-02-18T21:00:00+01:00
author: Michaël Hompus
excerpt: >
  Chapter 8 is the patterns and practices chapter.
  It captures the reusable concepts that keep your domain code lean and your runtime scenarios readable:
  security, resilience, observability, integration rules, and other "plumbing" that should be consistent.

  In this article I explain what belongs in chapter 8, what to keep out,
  a minimal structure you can copy, plus a small example from Pitstop.
permalink: /2026/02/17/arc42-chapter-8-cross-cutting-concepts/
image: /wp-content/uploads/2026/02/post-2026-02-17-thumbnail.jpg
categories:
  - Architecture
tags:
  - arc42
  - Documentation
  - Cross-cutting concepts
  - Patterns
  - Practices
series: Arc42 Practical Series
---

This post is about **chapter 8: Cross-cutting concepts**,
the first chapter in the "Reusables, decisions, and qualities" group.

Chapters [5][CH5], [6][CH6], and [7][CH7] described structure, runtime, and deployment.
Chapter 8 is where I document the reusable ideas that make those chapters readable and maintainable.

I think of chapter 8 as the patterns and practices chapter.
It is often the "non-functional" code. Not the business logic, but everything needed to make that core behave correctly.

<!--more-->

> [!NOTE]
> arc42 calls this chapter "Cross-cutting concepts".
> In practice, I often just call it "Concepts" as I treat it as "concepts relevant to the whole system at this level of detail".
> For a product landscape that can mean platform-wide conventions.
> For a single microservice it can mean service-wide patterns and internal rules.

## What belongs in chapter 8 (and what does not)

The main job of chapter 8 of an [arc42][ARC42] document is to answer:

> Which patterns and practices should be applied consistently across the system, and how do we do that?

What belongs here:

- Patterns and rules that apply across multiple building blocks or scenarios, not just one module.
- Reusable conventions you want implemented consistently over time, even if they currently apply only once.
- "Plumbing" that supports the domain but is not domain logic itself: the infrastructure behavior that makes core code work correctly.
- Concept-level configuration behavior:
  what a mode or flag _means_ and which behavior changes when it toggles.
  The _where_ and _how_ to configure it usually lives in chapter [7][CH7].
- Shared domain definitions (aggregates, state machines, vocabulary) that every module depends on.

A simple test that works well:

- If you want developers to implement something the same way in multiple places over time, document it here.
- Link to it from the scenarios in chapter [6][CH6] and from relevant building blocks in chapter [5][CH5].

What does not belong here:

- Feature-specific domain rules and workflows.  
  Those belong in the building blocks (chapter [5][CH5]) and scenarios (chapter [6][CH6]).
- A repeat of the runtime scenarios.  
  Chapter 8 should let chapter 6 stay lean.
- A raw list of configuration settings.  
  Chapter 8 should explain what a setting _means_ and why it exists, not list every key in the system.
  The full reference is better placed in chapter [7][CH7] or a dedicated config reference.
- Highly local implementation details that are unlikely to be reused.  
  Those belong close to the code, or in an ADR when it is a decision with consequences (chapter [9][CH9]).
- Hard architectural constraints or enterprise policies.  
  Mandates like "Cloud First" or compliance rules belong in chapter [2][CH2].
  Chapter 8 documents the reusable patterns you designed, not the constraints you were forced to follow.

> [!TIP]
> Chapter 8 is where you replace repeated paragraphs in chapter 6 with one link.
> That is a good trade.

### Common concept categories

Not every system needs all of these, but this list helps as a starting point.
Pick what applies:

- _Security_: identity, RBAC/ABAC, tenant scoping, service-to-service auth, secret handling rules
- _Resilience_: retries/backoff, circuit breakers, offline/degraded mode, idempotency rules
- _Observability_: correlation IDs, structured logging, key metrics, tracing, alerting conventions
- _Data and consistency_: source-of-truth rules, eventing/outbox patterns, read models, audit trail
- _Integration conventions_: contract versioning, error mapping, rate limits, vendor protection
- _Configuration model_: precedence rules, environment overrides, feature flags, safe defaults
- _Domain model_: aggregate boundaries, state machines, shared vocabulary, key invariants
- _Test Strategy_: test data management, standard tools, integration test patterns, performance constraints
- _UI/UX Patterns_: standard layouts, error notifications, accessibility rules, design system integration

### Who this chapter is for

Most of the time, chapter 8 is primarily useful for the dev team and maintainers.
It prevents five different implementations of the same thing.

External stakeholders usually do not care about your retry policy or correlation ID format.
They might care when it explains system guarantees (auditability, safety, recovery time), or when they want inspiration as your team is the shining example sharing their awesome implementation in their arc42 document. 💎😉

### Chapter 8 vs. Chapter 9: Concepts vs. decisions

A common question: when does something belong in chapter 8 versus chapter [9][CH9] (ADRs)?

The boundary is clearer than it first appears:

- **Chapter 8** documents _how we do X consistently_: the pattern, the practice, the implementation standard.
- **Chapter 9** documents _why we chose X over Y_: the decision, the alternatives considered, the trade-offs, and the context that made the choice make sense.

They work together:

- The ADR explains the choice and constraints.
- The concept explains how to implement it correctly and where it shows up.

**Linking them:**  
Always cross-reference. The concept should link to the ADR. The ADR should link to the concept.

> [!TIP]  
> If you document a concept without a decision, that is fine, many concepts emerge gradually.  
> If you document a decision without a concept to implement it, that might be a signal the decision is planned but not yet implemented.

### Aggregates, entities, and the shared domain vocabulary

In many systems, there are a few domain concepts that show up everywhere:
work orders, customers, assets, cases, incidents, whatever your core "things" are.

When those concepts apply across the whole application, I document their **aggregate boundaries** and **entity responsibilities** in chapter 8.
Not because chapter 8 is a domain chapter, but because these definitions act like a shared rulebook.

This helps in three places:

- It keeps chapter [5][CH5] focused on structure, not repeating the same domain definitions per building block.
- It keeps chapter [6][CH6] readable, because scenarios can reference "WorkOrder" and everyone knows what that means.
- It reduces accidental coupling, because aggregate boundaries become explicit.

What I put here is deliberately lightweight:

- Aggregate name and purpose
- What it owns (entities, value objects)
- Key invariants (rules that must always hold)
- State transitions and lifecycle notes
- Identity and scoping rules (IDs, tenant/site boundaries)
- Events published or important integration touch points (high level)

If you need a full data dictionary or complete schema documentation, do not force it into this chapter.
Link to a domain model reference, or split it into a separate document and keep chapter 8 as the "shared rules" summary.

> [!TIP]
> While documenting these core terms, check if they are already in the glossary (chapter 12).
> If a term is strictly structural, keep it here. If it is business language used by stakeholders, ensure it lands in chapter 12 too.

### How to keep chapter 8 from becoming a junk drawer

This chapter is vulnerable to entropy.
Everything is a "concept" if you stare at it long enough.

A few guardrails that help:

- Prefer "rules + rationale" over "technology lists".
- Keep each concept small:
  - what it is
  - why it exists
  - how to implement it
  - how to test or verify it
  - where it shows up (links to scenarios, building blocks, ADRs)
- If a section becomes a wall of text, split it:
  move low-level specifics into a code-linked doc and keep chapter 8 as the overview.
- When a concept evolves, document both the current standard and the migration path.
  Mark old approaches explicitly as "legacy" or "deprecated" with a timeline, and link to the ADR (chapter [9][CH9]) that explains why it changed.
  This prevents new code from following outdated patterns while giving teams visibility into what they need to update.

## The minimum viable version

If you are short on time, aim for:

- 3–6 concepts that either:
  - already affect multiple parts of the system, or
  - are patterns you want future work to follow (even if they currently apply once)
- For each concept, include:
  - a short description
  - the key rule(s)
  - where it shows up (links)
  - one or two implementation notes that prevent mistakes

That is enough to keep future work consistent.

## Copy/paste structure (Markdown skeleton)

Use this as a starting point. Keep it flexible.

```md title="08-concepts.md"
## 8. Concepts

<Short intro: what concepts matter for this system and why?>

### 8.n <Concept name>

<1–3 short paragraphs: what it is and why it exists.>

#### Rules (optional)

- <rule 1>
- <rule 2>

#### Implementation (example-level, not every detail)

- <how it is implemented in this system>
- <where it lives in the code, if useful>

#### Configuration (optional)

- <which settings affect this concept and what they mean>
- <link to chapter 7 for where it is configured>

#### Verification (optional)

- <how do we know it works: tests, logs, dashboards, runbooks>

#### Where it shows up

- Scenario: chapter 6.x (link)
- Building block: chapter 5.x (link)
- ADR: chapter 9.x (link)
```

> [!NOTE]
> Do not force a rigid template on every concept.
> Some concepts need a rules section, some need a diagram, some need one paragraph and a link.
> Consistency helps, but clarity helps more.

## Example (Pitstop)

Pitstop is my small demo system for this series.
It is intentionally simple, so the documentation stays shareable.

Below are four concept examples that make chapter [6][CH6] easier to read,
and make chapter [7][CH7] configuration feel meaningful instead of arbitrary.

> ### 8.1 Identity and access (RBAC)
>
> Pitstop uses role-based access control (RBAC) to keep workshop actions safe and auditable.
> The UI can hide buttons, but the server enforces authorization. The UI is not a security boundary.
>
> **Rules**
>
> - Every endpoint that reads or changes work orders requires an explicit policy.
> - Authorization is validated server-side for both HTTP and real-time actions.
> - Claims include a `garageId` to scope access per site.
>
> **Implementation**
>
> - Auth: JWT bearer tokens.
> - Authorization: policy-based checks, mapped from roles and claims.
>
> **Claims (example)**
>
> - `role`: `Mechanic`, `Foreman`, `ServiceAdvisor`
> - `garageId`: used for tenant or site scoping
> - `permissions`: optional fine-grained list for exceptions (for example discount approval)
>
> **Where it shows up**
>
> - Scenarios: status updates and overrides in chapter 6.
> - Deployment: token validation settings and identity provider wiring in chapter 7.
>
> ### 8.2 Work order (aggregate / domain model)
>
> The _work order_ is the central aggregate in Pitstop.
> Every module, scenario, and UI revolves around it.
> Documenting it here gives the whole team a shared definition to build against.
>
> **Aggregate boundary**
>
> A work order owns its tasks, status, notes, and parts dependencies.
> It does _not_ own the appointment (that belongs to the planning service) or the customer record.
>
> **Lifecycle (state machine)**
>
> ![Work order lifecycle diagram](/wp-content/uploads/2026/02/pitstop-concept-lifecycle.png)
>
> - Only forward transitions are allowed by default.
> - `WaitingForParts` ↔ `InProgress` can toggle when parts arrive or a new dependency is found.
> - A `Foreman` can force-transition to any state (override).
>
> **Key invariants**
>
> - A work order always has exactly one active status.
> - Status changes are audited (who/when/why, see concept 8.4).
> - Identity: `WO-{sequence}`, scoped by `garageId`.
>
> **Where it shows up**
>
> - Building blocks: Work Order Module in chapter 5.
> - Scenarios: every chapter 6 scenario references work order state.
> - Audit: status changes feed the audit log (concept 8.4).
>
> ### 8.3 Degraded-mode workshop operation (local queue + idempotency)
>
> Workshop connectivity is not always reliable.
> Pitstop supports a degraded mode where the workshop UI can keep working and sync later.
>
> **Rules**
>
> - Workshop updates are queued locally when offline.
> - Every queued item has an idempotency key so replays do not double-apply.
> - Replay happens in order. Hard conflicts stop the replay and require user resolution.
>
> **Implementation**
>
> - Workshop UI stores updates in a local outbox queue (for example IndexedDB).
> - Each item includes an idempotency key derived from work order, version, and actor context.
>
> **Queue item (example)**
>
> ```json
> {
>   "idempotencyKey": "WO-7781:v42:mechanic-17:2026-01-12T10:41:00Z",
>   "workOrderId": "WO-7781",
>   "command": "ChangeStatus",
>   "payload": {
>     "status": "WaitingForParts",
>     "note": "Brake pads not in stock"
>   },
>   "queuedAt": "2026-01-12T10:41:00+01:00"
> }
> ```
>
> **Configuration behavior**
>
> - If `Pitstop:ConnectivityMode = OfflineFirst`, the UI queues first and sends async.
> - If `OnlineFirst`, the UI sends immediately and queues only on failure.
>
> The meaning of `ConnectivityMode` is documented here.
> Where it is configured (env vars, config files) is documented in chapter 7.
>
> **Where it shows up**
>
> - Scenarios: status update flows in chapter 6.
> - Deployment: the `ConnectivityMode` setting in chapter 7.
>
> ### 8.4 Observability
>
> Every request and event carries a `correlationId` so ops can trace a flow end-to-end.
> Logs are structured (JSON), and a small set of metrics drives the alerting that lets ops sleep.
>
> **Rules**
>
> - Every log entry includes `correlationId`, `workOrderId` (when applicable), and `garageId`.
> - Metrics are kept small and actionable:
>   - `sync_queue_depth`: are outbound updates piling up?
>   - `status_update_latency_ms` (p95): is the workshop experience degrading?
>   - `ws_connected_clients`: are workshops connected?
> - Alert example: `sync_queue_depth > 100 for 10 minutes` → vendor down or credentials broken.
>
> **Where it shows up**
>
> - Scenarios: every chapter 6 flow carries `correlationId`.
> - Deployment: log sink and dashboard configuration in chapter 7.

To browse the full Pitstop arc42 sample, see my [GitHub Gist][PITSTOP_ARC42].

## Common mistakes I see (and made myself)

1. **Treating "cross-cutting" as a hard gate**  
   Even if you are documenting something small like a microservice, service-wide concepts are still useful.
   The chapter title does not need to police you.  
   Rename the chapter to "Concepts" if that helps, but do not skip it just because you think "cross-cutting" means "multi-service".

2. **Waiting until a pattern appears everywhere**  
   If you already know a rule should become standard, document it early.
   That is how you steer future work. Arc42 can start at the drawing table, even without any line of code written yet.

3. **Turning chapter 8 into a dump**  
   A list of random libraries is not a concept chapter.
   Prefer rules, rationale, and where it shows up. Future team members or maintainers should be able to read this chapter and understand the key patterns without needing to read every line of it.

4. **Repeating concept explanations in every scenario**  
   If you notice that chapter [6][CH6] starts to contain the same text multiple times, move it here and link to it.

5. **No link back to reality**  
   If a concept never shows up in code, runtime scenarios, or configuration, it is probably planned but not yet implemented.
   That is fine, but mark it clearly and revisit it. Maybe new insights have emerged and it is no longer the right pattern.

## Done-when checklist

🔲 The chapter contains concepts that are reused or intended to be reused over time.  
🔲 Each concept includes at least one actionable rule, not only a description.  
🔲 Concepts link to where they show up (chapters [5][CH5], [6][CH6], [7][CH7], and later ADRs in chapter [9][CH9]).  
🔲 The chapter helps keep runtime scenarios lean by avoiding repeated explanations.  
🔲 A maintainer can implement a new feature without reinventing logging, retries, idempotency, or authorization.

## Next improvements backlog

- Add links to code locations when concepts map cleanly to modules or packages.
- Add verification notes for concepts that can fail in production (dashboards, alerts, runbooks).
- Add concept-level configuration tables only for settings that change behavior significantly.
- Split large concepts into "overview here, details in a linked doc" when they grow.

## Wrap-up

Chapter 8 is where I capture the reusable solutions that make the rest of the document cheaper to maintain.
It keeps the domain code focused, and it keeps chapter [6][CH6] readable.

Next up: [arc42 chapter 9, "Architectural decisions"][CH9], where we record all the decisions that we made along the way.

[PITSTOP_ARC42]: https://gist.github.com/eNeRGy164/90f63e78d3e528f7b8490538a6781b5f
[ARC42]: https://arc42.org/
[CH2]: /2026/02/03/arc42-chapter-2-architecture-constraints/
[CH5]: /2026/02/10/arc42-chapter-5-building-block-view/
[CH6]: /2026/02/11/arc42-chapter-6-runtime-view/
[CH7]: /2026/02/16/arc42-chapter-7-deployment-view/
[CH9]: /2026/02/18/arc42-chapter-9-architectural-decisions/
