# ADAX Phase 5 Entry Gate Rehearsal

Date: 2026-06-11

Status: rehearsal complete. Phase 5 remains closed.

This document rehearses how ADAX should decide whether a new participant workflow may enter implementation. It is not a feature approval and does not replace a participant startup card.

## Decision

Do not start Phase 5 implementation yet.

Reason: the engineering baseline is green, but the user has not explicitly resumed participant expansion or confirmed a target participant startup card.

## Gate Inputs

Authoritative inputs for this rehearsal:

- `docs/ADAX_MVP_STARTER.md`
- `docs/ADAX_LONG_TERM_PLAN.md`
- `docs/ADAX_CHANGE_GATE_CHECKLIST.md`
- `docs/ADAX_ENGINEERING_READINESS_AUDIT.md`
- `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`
- `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md`
- `docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md`
- `docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md`
- `docs/ADAX_RENEWABLE_STARTUP_CARD.md`
- `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md`
- `docs/ADAX_THERMAL_STARTUP_CARD.md`
- `docs/ACTIVE_ARCHITECTURE_MAP.md`

## Universal Entry Gate

| Gate | Required evidence | Current status |
| --- | --- | --- |
| User explicitly resumes feature expansion | Clear user instruction to leave Engineering Hardening Hold and implement a target participant | Not satisfied |
| Target participant startup card is confirmed | Confirmed card for the exact participant being implemented | Not satisfied |
| Scope has explicit non-goals | Startup card lists what is excluded | Partly satisfied for renewable, independent storage, and thermal only |
| Transaction chain is defined | Node list, mode alignment, operation/result boundaries | Partly satisfied for renewable, independent storage, and thermal only |
| Data boundary is defined | Virtual data levels, no real province/customer/bid records | Satisfied as a global rule |
| Rule boundary is defined | Validation and calculation responsibilities identified before UI | Partly satisfied for renewable, independent storage, and thermal only |
| Storage and template boundary is defined | localStorage, import/export shape, invalid-data behavior | Partly satisfied for renewable, independent storage, and thermal only |
| Test plan is defined | Normal, boundary, and abnormal cases before code | Partly satisfied for renewable, independent storage, and thermal only |
| Current baseline is green | `npm run quality` passes before implementation starts | Must be rerun at entry time |
| No Project Rescue trigger is active | No drift into real trading, detached review mode, or explanation-heavy operation pages | Satisfied for rehearsal only |

## Candidate Participant Readiness

Use `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md` to compare candidates before selecting one target card.

| Candidate | Current artifact | Entry result | Why |
| --- | --- | --- | --- |
| 新能源 | `docs/ADAX_RENEWABLE_STARTUP_CARD.md` and `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md` exist, status pending user confirmation | Not ready | The card is a draft; the dry run confirms open questions and no implementation approval. |
| 独立储能 | `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md` and `docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md` exist, status pending user confirmation | Not ready | The card is a draft; the dry run confirms open questions and no implementation approval. |
| 火电 | `docs/ADAX_THERMAL_STARTUP_CARD.md` and `docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md` exist, status pending user confirmation | Not ready | The card is a draft; the dry run confirms open questions, separate ten-segment offer-rule confirmation, and no implementation approval. |

## Startup Card Acceptance Checklist

A participant startup card is implementation-ready only when it answers all of these:

1. Participant role and target user.
2. Exact transaction chain and node count.
3. Whether execution mode and review mode share the same chain.
4. Operation inputs for every node.
5. Operation outputs and result-review outputs.
6. Virtual market data levels used by the participant.
7. Validation rules and calculation boundaries.
8. localStorage record/material behavior.
9. Template import/export behavior, if applicable.
10. Normal, boundary, and abnormal test cases.
11. Explicit non-goals and production-safety language.
12. UI pattern reuse from the retail baseline.
13. Phase entry command evidence, including `npm run quality`.

If any item is missing, the correct next action is to update or confirm the startup card, not to write code.

## Implementation Lane After Gate Passes

When Phase 5 is explicitly opened, implement in this order:

1. Domain contracts and tests first.
2. Virtual participant data and node definitions.
3. Validation and calculation facades.
4. Template, storage, and record boundaries.
5. Components that render domain display contracts.
6. Page and route wiring.
7. Desktop/mobile visual QA for operation surfaces.
8. Phase exit audit.

Do not expose a participant as selectable in the main user flow until its full active path is coherent enough to complete.

## Stop Conditions

Switch to Project Rescue instead of coding if:

- implementation would require real market data or a production decision claim
- review mode would detach from the transaction-node chain
- the new participant needs backend storage, login, permissions, or APIs
- the fastest implementation path would put calculations or validation in React components
- the UI would add persistent explanatory panels to operation pages instead of operation controls
- the new participant would reuse retail state in a way that blurs business ownership

## Current Next Action

Keep Engineering Hardening Hold active.

If the user says to resume feature expansion, first use `docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md` to select exactly one participant candidate, then ask them to confirm that target participant startup card. For the current candidate order, the likely first confirmation target is `docs/ADAX_RENEWABLE_STARTUP_CARD.md`; the independent-storage confirmation target is `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md`; the thermal confirmation target is `docs/ADAX_THERMAL_STARTUP_CARD.md`.
