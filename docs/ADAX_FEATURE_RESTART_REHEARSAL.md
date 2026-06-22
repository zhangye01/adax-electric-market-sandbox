# ADAX Feature Restart Rehearsal

Date: 2026-06-22

Status: rehearsal complete. It does not lift Engineering Hardening Hold.

This rehearsal tests whether the current feature-resumption gates and implementation runbook are strong enough to prevent uncontrolled Phase 5 development. It uses a hypothetical renewable first slice as the exercise target, but it does not approve renewable implementation.

## Rehearsal Inputs

Use these documents as the current gate stack:

- `docs/ADAX_HARDENING_DECISION_PACKET.md`
- `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md`
- `docs/ADAX_FEATURE_IMPLEMENTATION_RUNBOOK.md`
- `docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md`
- `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`
- `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md`
- `docs/ADAX_CHANGE_GATE_CHECKLIST.md`

## Hypothetical Slice

Exercise target:

- participant: 新能源
- first slice: domain and data contract skeleton for the eight-node renewable chain
- intended scope: no selectable UI, no runtime route exposure, no template import/export yet
- explicit non-scope: independent storage, thermal, real province data, backend storage, login, and external APIs

This slice is hypothetical only. Do not implement renewable code from this rehearsal.

## Gate Result

| Gate | Required evidence | Rehearsal result |
| --- | --- | --- |
| User lifted Engineering Hardening Hold | Explicit user confirmation | Not satisfied |
| Single participant selected | Exactly one of 新能源, 独立储能, 火电 | Not satisfied for implementation; only hypothetical here |
| Startup card confirmed | Selected card confirmed or revised by user | Not satisfied |
| Fresh baseline quality | `npm run quality` immediately before implementation | Must be rerun at real entry time |
| Change classification | `docs/ADAX_CHANGE_GATE_CHECKLIST.md` classifies a controlled feature slice | Not performed for real implementation |
| Runbook order | Domain/data first, tests before UI, narrow app wiring, then components | Satisfied as rehearsal plan only |
| Rollback boundary | Named files can be reverted as one slice | Partly satisfied as rehearsal plan only |
| Rescue check | No detached review, real data, or explanation-heavy operation drift | Satisfied as rehearsal plan only |

Conclusion: feature implementation remains blocked. Continue Engineering Hardening Hold until the user explicitly resumes feature expansion and confirms one participant startup card.

## What The Runbook Catches

The current gates should stop these common failure modes:

- starting renewable code because it is first in the candidate order
- exposing a new subject in the UI before domain behavior is tested
- building pages before the transaction chain, validation, and data contracts exist
- using retail domain or retail components as a shortcut for renewable logic
- adding storage/templates before wrong-participant rejection is specified
- treating review mode as a detached material cabinet instead of the same transaction chain
- hiding Project Rescue triggers behind a generic "continue" request

## If The User Later Confirms Renewable

The first implementation plan must name these files before code starts:

| Layer | Expected first-slice files |
| --- | --- |
| Domain | `src/domain/renewableTypes.ts`, `src/domain/renewableState.ts`, `src/domain/renewableExecutionChain.ts` |
| Data | `src/data/renewableMarketData.ts`, `src/data/renewableTrainingNodes.ts` |
| Tests | renewable domain chain tests, route-closed tests before exposure, storage/template rejection tests before IO |
| App and routes | none in the first slice unless domain tests pass and route exposure remains hidden |
| Components and pages | none in the first slice |
| Rollback | all renewable files from the slice plus guardrail/test updates |

Minimum first-slice proof:

1. Renewable chain is eight nodes.
2. Execution and review use the same node ids.
3. Node definitions do not import retail modules.
4. Virtual data is training-grade and not province-specific.
5. The participant remains unselectable until app and UI gates are intentionally opened.

## Stop Conditions

Switch to Project Rescue before code if:

- the user asks to implement more than one participant at once
- a proposed renewable slice requires independent-storage or thermal runtime code
- the slice needs real market data, production trading advice, backend storage, login, or external APIs
- UI work begins before the renewable chain and domain tests exist
- React components begin owning validation, settlement math, route guards, or file parsing

## Handoff Rule

Do not implement renewable, independent-storage, or thermal runtime code from this rehearsal.

Use this rehearsal only to validate the restart gates. A real implementation still requires an explicit user decision, confirmed startup card, fresh `npm run quality`, and the selected candidate's entry dry run.
