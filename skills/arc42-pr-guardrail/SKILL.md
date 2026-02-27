---
name: arc42-pr-guardrail
description: Enforce architecture documentation and ADR updates in pull requests when changes affect architecture. Use to prevent drift between code and arc42 docs.
---

# arc42 PR Guardrail

Use this skill when reviewing or preparing PRs that may impact architecture.

## Trigger conditions

Activate guardrails when a PR changes one or more of:

- System boundaries, external integrations, protocols, or contracts
- Core building blocks, responsibilities, or runtime flows
- Deployment topology or runtime configuration behavior
- Cross-cutting patterns (auth, logging, retries, idempotency, etc.)
- Quality targets or behavior affecting quality attributes

## Workflow

1. Detect architectural impact from changed files and PR description.
2. Require documentation updates in the relevant arc42 chapters.
3. Require ADR update for significant design/trade-off decisions.
4. Verify cross-links between docs and decision records.
5. Block silent conflicts between requested changes and documented guardrails.

## Required PR checklist

- `arc42 docs reviewed and updated for architectural impact`
- `ADR added/updated for significant decision changes`
- `conflicts with documented constraints/decisions resolved or explicitly escalated`

## Conflict policy

If implementation request conflicts with arc42 docs:

1. Do not pick a side silently.
2. Explain conflict with concrete chapter/ADR references.
3. Propose one of:

- Update docs and keep implementation
- Adjust implementation to comply
- Update both with explicit rationale

## Review output format

- `Architecture impact`: yes/no with rationale
- `Docs required`: exact chapters/files to update
- `ADR required`: yes/no with reason
- `Blocking conflicts`: list with resolution options
- `Merge recommendation`: approve/request changes

## Guardrails

- Do not demand doc edits for cosmetic refactors with no architecture impact.
- Do not approve architecture-changing PRs when docs and decision trail are missing.
