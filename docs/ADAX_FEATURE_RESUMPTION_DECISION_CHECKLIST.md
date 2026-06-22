# ADAX Feature Resumption Decision Checklist

Date: 2026-06-11

Status: decision checklist active. It does not lift Engineering Hardening Hold.

Phase 5 remains closed until this checklist is completed and the user confirms the selected participant startup card.

Do not write feature code from this checklist alone.

## When To Use This Checklist

Use this checklist when the user asks to resume feature development, enter the next phase, add a participant, or continue beyond engineering hardening.

If the user only says "继续" without explicitly resuming feature expansion, continue Engineering Hardening Hold.

If the user says the product is off, confusing, not professional enough, or drifting, switch to Project Rescue before coding.

## Required Decision Sequence

Complete these steps in order:

1. Confirm the user wants to lift Engineering Hardening Hold.
2. Present or reread `docs/ADAX_HARDENING_DECISION_PACKET.md`.
3. Reread `docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md`.
4. Run or confirm a fresh `npm run quality` result on the current baseline.
5. Confirm exactly one target participant.
6. Reread the matching startup card only after the target participant is selected.
7. Ask the user to confirm or revise that startup card.
8. Classify the change with `docs/ADAX_CHANGE_GATE_CHECKLIST.md`.
9. Reread `docs/ADAX_FEATURE_IMPLEMENTATION_RUNBOOK.md`.
10. Prepare a small implementation plan with target files, domain contracts, tests, and rollback.
11. Start coding only after the startup card is confirmed, the runbook order is reflected in the plan, and no Project Rescue trigger is active.

## Participant Selection Rule

Exactly one participant may enter implementation in the next wave.

Allowed candidates:

- 新能源
- 独立储能
- 火电

Still excluded unless the user explicitly reopens scope:

- 市场运营机构
- 批发用户
- real province data
- backend, accounts, login, or external APIs

## Required Confirmation Packet

Before feature code starts, present a short confirmation packet to the user:

| Field | Required content |
| --- | --- |
| Current active scope | 售电公司 remains the only active runtime flow until the new work starts. |
| Selected participant | Exactly one of 新能源, 独立储能, or 火电. |
| Not selected | The other candidates remain closed. |
| Startup card | The exact startup card path and any revisions needed. |
| First implementation slice | The smallest useful slice that can be tested and reviewed. |
| Domain files | Expected `src/domain/**` or `src/data/**` contracts before UI work. |
| UI files | Expected pages/components only after domain contracts are defined. |
| Tests | Domain, route, storage, app, and script checks that must be added or updated. |
| Rollback | Which files can be reverted if the implementation drifts. |

## Stop Conditions

Do not start feature implementation if any of these are true:

- The user has not explicitly lifted Engineering Hardening Hold.
- More than one participant is being selected.
- The target startup card is unconfirmed.
- `npm run quality` fails on the baseline.
- The change requires real market data, backend storage, login, or external APIs.
- The work would split execution and review into different transaction chains.
- The request sounds like product correction rather than controlled expansion.

## Handoff Rule

This checklist is a gate, not permission.

Passing this checklist means the project may prepare a feature implementation plan. It does not mean code can start without the user's participant confirmation.

Confirmed feature implementation must then follow `docs/ADAX_FEATURE_IMPLEMENTATION_RUNBOOK.md`.
