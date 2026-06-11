# ADAX Phase 5 Candidate Readiness Audit

Date: 2026-06-11

Status: audit complete. Phase 5 remains closed.

This audit consolidates the candidate startup cards, entry rehearsal, scope matrix, and dry runs into one implementation-readiness view. It is a gate artifact only and does not authorize code changes.

## Decision

Keep Engineering Hardening Hold active.

Do not implement renewable, independent storage, or thermal workflows yet.

Current blockers:

- The user has not explicitly resumed participant feature expansion.
- No Phase 5 candidate startup card has been confirmed by the user.
- All candidate confirmation packets still contain unconfirmed answers.
- `npm run quality` must be rerun immediately before any approved implementation starts.
- Only one participant may enter implementation in the next wave.

## Audit Inputs

Authoritative inputs:

- `docs/ADAX_MVP_STARTER.md`
- `docs/ADAX_LONG_TERM_PLAN.md`
- `docs/ADAX_CHANGE_GATE_CHECKLIST.md`
- `docs/ADAX_ENGINEERING_READINESS_AUDIT.md`
- `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md`
- `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`
- `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md`
- `docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md`
- `docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md`
- `docs/ADAX_RENEWABLE_STARTUP_CARD.md`
- `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md`
- `docs/ADAX_THERMAL_STARTUP_CARD.md`
- `docs/ACTIVE_ARCHITECTURE_MAP.md`
- `docs/ENGINEERING_BASELINE.md`

## Release From Engineering Hold

Phase 5 can open only when all rows are satisfied:

| Gate | Required evidence | Current status |
| --- | --- | --- |
| User intent | User explicitly says to resume participant feature expansion | Not satisfied |
| Single target | User selects exactly one of 新能源, 独立储能, 火电 | Not satisfied |
| Startup card | Selected participant startup card is confirmed | Not satisfied |
| Confirmation packet | Selected participant dry-run packet has no unconfirmed answers | Not satisfied |
| Scope matrix | Selected participant scope and non-goals match `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md` | Satisfied as planning baseline only |
| Architecture ownership | New domain, data, storage, route, and UI ownership are named before code | Partly satisfied by dry runs only |
| Test plan | Domain, storage/template, route/session, and UI QA checks are listed before code | Partly satisfied by dry runs only |
| Baseline quality | `npm run quality` passes immediately before implementation starts | Must be rerun at entry time |
| Rescue check | No drift into real trading, explanation-heavy operation pages, or detached review mode | Satisfied for audit only |

If any row remains unsatisfied, continue engineering hardening or update the selected startup card. Do not write participant runtime code.

## Candidate Readiness Snapshot

| Candidate | Order | Current artifacts | Readiness | Blocking confirmations |
| --- | --- | --- | --- | --- |
| 新能源 | 1 | Startup card + renewable dry run | Not ready | Subject type, intramonth granularity, three-month assumption, counterparty condition, failed listing result, first-implementation confirmation |
| 独立储能 | 2 | Startup card + storage dry run | Not ready | Training period, charge/discharge granularity, same-hour rule, execution-result model, efficiency-loss visibility, second-candidate confirmation |
| 火电 | 3 | Startup card + thermal dry run | Not ready | Spot-only ten-segment scope, capacity segmentation, price monotonicity, clearing-feedback model, cost-range visibility, third-candidate confirmation |

Candidate order guides discussion only. It does not authorize implementation.

## One-Wave Rule

When Phase 5 opens, implement exactly one participant in the next wave.

Allowed:

- Confirm one startup card.
- Run the selected participant entry dry run.
- Add only the selected participant domain, data, storage/template, route/session, component, and test files.
- Keep unselected participant cards and dry runs as planning documents.

Not allowed:

- Preparing shared runtime code for unselected participants.
- Exposing multiple new participants in the subject selector at once.
- Adding common abstractions before the selected participant proves repeated behavior.
- Moving selected participant validation or calculation into React components.
- Expanding the selected workflow beyond its confirmed MVP to make another candidate easier later.

## Recommended Selection Path

If the user wants the next feature wave, use this sequence:

1. Ask the user to pick one candidate: 新能源, 独立储能, or 火电.
2. Show only that candidate's confirmation packet.
3. Update the selected startup card if the user changes any default.
4. Re-run the selected candidate entry dry run.
5. Re-run `npm run quality`.
6. Open a short implementation note naming files to create before code starts.
7. Implement domain and tests first.
8. Wire data, storage/templates, route/session, then UI.
9. Run `npm run quality` and browser QA.
10. Add a Phase 5 exit audit before handoff.

## Cross-Candidate Guardrails

These constraints apply regardless of which candidate is selected:

- Use only the unified virtual provincial market.
- Preserve execution and review as the same node chain with different assist surfaces.
- Keep operation pages clean and action-focused.
- Keep execution hints collapsed or button-adjacent.
- Keep review materials node-bound, not detached as a file library.
- Keep records and materials in browser localStorage.
- Reject wrong-participant templates.
- Use virtual data only.
- Avoid production claims, real trading advice, or real settlement implications.
- Keep participant domain logic out of React components.
- Add tests before exposing a participant as selectable.

## Required Exit Audit After Implementation

The selected participant implementation is not finished until an exit audit records:

- The selected startup card and dry run used.
- Files created or modified.
- Domain ownership and React boundary status.
- Storage/template compatibility and invalid-data behavior.
- Route/session guard behavior.
- Execution/review chain alignment.
- Desktop and mobile browser QA notes.
- `npm run quality` result.
- Remaining mock or training-grade simplifications.
- Project Rescue triggers checked and not active.

## Stop Conditions

Switch to Project Rescue before coding if:

- The user asks for real market data, real province data, real plant/project data, or production settlement/bidding advice.
- More than one participant is being implemented in the same wave.
- The implementation path requires backend storage, login, permissions, or external APIs.
- Review mode starts becoming a detached knowledge base instead of the same transaction chain.
- Operation pages become explanation-heavy again.
- Shared abstractions are introduced before a concrete repeated need exists.
- Domain validation, calculation, or template parsing begins moving into React components.

## Current Next Action

Keep Engineering Hardening Hold active.

If the user explicitly resumes feature expansion, use this audit first, then open only the selected candidate's startup card and entry dry run. Until then, continue improving engineering guardrails, tests, and architecture clarity without participant runtime code.
