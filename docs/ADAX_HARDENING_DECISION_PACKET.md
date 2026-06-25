# ADAX Hardening Decision Packet

Date: 2026-06-25

Status: decision packet active. It does not lift Engineering Hardening Hold.

This packet is the user-facing decision surface after the engineering-hardening phase. It summarizes what can happen next without turning the decision into implicit permission to write feature code.

If the user only says "继续", keep Engineering Hardening Hold active.

## Current State

ADAX is currently in Engineering Hardening Hold.

Confirmed active runtime scope:

- 售电公司 execution mode
- 售电公司 review mode
- one unified virtual provincial market
- one shared eight-node retail transaction chain
- local browser storage for training records and review materials
- retail template import/export

Still closed:

- 新能源 active workflow
- 独立储能 active workflow
- 火电 active workflow
- 市场运营机构 workflow
- 批发用户 workflow
- real province data
- backend, accounts, login, or external APIs

## Current Evidence

The latest hardening evidence is recorded in:

- `docs/ADAX_ENGINEERING_READINESS_AUDIT.md`
- `docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md`
- `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md`
- `docs/ADAX_FEATURE_IMPLEMENTATION_RUNBOOK.md`
- `docs/ADAX_FEATURE_RESTART_REHEARSAL.md`

Current quality evidence:

- `npm run quality` passed on 2026-06-25 after moving route tests to the route boundary.
- Engineering guardrails, boundaries, domain contracts, source-shape budgets, typecheck, tests, and build passed as one gate.
- The test suite currently records 95 passing tests after this packet, the feature implementation runbook, the feature restart rehearsal, Pages dry-run diagnostics, and unwired-test-file detection are wired into the engineering guardrail.

Freshness rule: rerun `npm run quality` after any later source, guardrail, or release-process change before using this packet to lift the hold.

## Decision Options

| Option | User decision | Meaning | Next action |
| --- | --- | --- | --- |
| A | Keep Engineering Hardening Hold | Continue maintainability work only. | Use `docs/ADAX_CHANGE_GATE_CHECKLIST.md`; no new participant work. |
| B | Lift Engineering Hardening Hold for one participant | Prepare exactly one Phase 5 participant implementation plan. | Use `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md`, then confirm exactly one startup card. |
| C | Enter Project Rescue | Treat product direction, flow clarity, or UI coherence as off-track. | Stop feature work and diagnose drift before coding. |

## Required User Confirmation

Phase 5 work cannot start from this packet alone.

Before any new participant code starts, all of these must be true:

1. The user explicitly says to resume feature expansion.
2. The user selects exactly one participant: 新能源, 独立储能, or 火电.
3. The matching startup card is confirmed or revised by the user.
4. `npm run quality` passes on the current baseline after any later hardening changes.
5. The first slice follows `docs/ADAX_FEATURE_IMPLEMENTATION_RUNBOOK.md`.
6. `docs/ADAX_FEATURE_RESTART_REHEARSAL.md` still blocks unapproved runtime code.
7. No Project Rescue trigger is active.

## Participant Startup Cards

Only read and use the selected participant startup card after the user selects that participant:

- 新能源: `docs/ADAX_RENEWABLE_STARTUP_CARD.md`
- 独立储能: `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md`
- 火电: `docs/ADAX_THERMAL_STARTUP_CARD.md`

The other participant cards remain closed for implementation in that wave.

## Handoff Rule

Present this packet before asking the user to lift Engineering Hardening Hold.

Do not interpret a generic "继续" as permission to lift the hold, select a participant, or write Phase 5 code.
