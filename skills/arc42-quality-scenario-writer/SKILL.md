---
name: arc42-quality-scenario-writer
description: Turn architecture quality goals into measurable arc42 chapter 10 scenarios and connect them to concepts, decisions, and implementation evidence.
---

# arc42 Quality Scenario Writer

Use this skill when quality requirements are vague and need measurable scenarios.

## Inputs

- Top quality goals from chapter 1
- Relevant constraints from chapter 2
- Existing strategy/concepts/decisions (chapters 4, 8, 9)

## Workflow

1. Group quality concerns by a recognizable structure.

- Prefer ISO/IEC 25010 categories or a team-approved equivalent.

2. Convert each priority into concrete scenarios.

- Include: stimulus, environment, expected response, and metric/target.
- Avoid adjectives without measurable criteria.

3. Connect scenarios to implementation intent.

- Link to concepts in chapter 8 and decisions in chapter 9.
- Note where evidence will come from (tests, SLOs, runbooks, telemetry).

4. Iterate deliberately.

- Mark scenarios as draft when numbers are provisional.
- Refine targets with real usage and operational feedback.

## Scenario template

```md
| ID     | Quality area | Stimulus | Environment | Response | Metric/Target | Related concept/decision |
| ------ | ------------ | -------- | ----------- | -------- | ------------- | ------------------------ |
| QS-001 | Performance  | ...      | ...         | ...      | p95 < 300ms   | CH8-CONC-02, ADR-004     |
```

## Completion criteria

- Scenarios cover the most important goals from chapter 1.
- Each scenario is testable or observable.
- At least one scenario traces to concrete architecture choices.

## Guardrails

- Do not write solution-only statements here (for example "use Redis").
- Do not produce long scenario lists without grouping and navigation.
