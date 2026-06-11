# ADAX Phase 5 Thermal Entry Dry Run

Date: 2026-06-11

Status: dry run complete. Thermal implementation is not approved.

This document rehearses what would happen if the user selects 火电 as a Phase 5 implementation target. It is a gate exercise only and does not authorize code changes.

## Decision

Do not implement the thermal workflow yet.

Current blockers:

- The user has not explicitly resumed Phase 5 feature expansion.
- `docs/ADAX_THERMAL_STARTUP_CARD.md` remains pending user confirmation.
- Thermal-specific open questions are not answered.
- Ten-segment offer rules require separate confirmation.
- `npm run quality` must be rerun immediately before implementation starts.

## Dry-Run Inputs

Authoritative inputs:

- `docs/ADAX_MVP_STARTER.md`
- `docs/ADAX_LONG_TERM_PLAN.md`
- `docs/ADAX_CHANGE_GATE_CHECKLIST.md`
- `docs/ADAX_ENGINEERING_READINESS_AUDIT.md`
- `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md`
- `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`
- `docs/ADAX_THERMAL_STARTUP_CARD.md`
- `docs/ACTIVE_ARCHITECTURE_MAP.md`

## Change Gate Classification

| Gate item | Dry-run result |
| --- | --- |
| Change type | New participant workflow |
| Allowed during Engineering Hardening Hold | No, unless the user explicitly re-enters feature expansion |
| Current action allowed | Documentation dry run only |
| Active code changes allowed now | No |
| Project Rescue trigger active | No, because this dry run does not change runtime behavior |

## Thermal Confirmation Packet

Before code starts, get explicit answers for these questions:

| Question | Recommended default from startup card | Current status |
| --- | --- | --- |
| 火电 MVP 是否只做现货十段报价 | Yes, spot ten-segment offer only | Unconfirmed |
| 十段报价容量是否按可用容量分段 | Yes | Unconfirmed |
| 十段价格是否要求单调不降 | Yes | Unconfirmed |
| 训练级出清反馈模型 | Virtual marginal price + cleared / uncleared segments | Unconfirmed |
| 是否展示训练级成本区间 | Yes, but execution mode shows results without formulas | Unconfirmed |
| 是否确认火电作为 Phase 5 第三个候选主体 | Yes/No required | Unconfirmed |

If any answer remains unconfirmed, continue planning or update the startup card; do not implement runtime code.

## Implementation Route If Confirmed Later

This route is valid only after the user confirms the startup card, separately confirms ten-segment offer rules, and explicitly resumes Phase 5.

1. Entry proof
   - Re-run `npm run quality`.
   - Record the selected target in this dry-run document or a Phase 5 entry note.
   - Confirm no Project Rescue trigger is active.
2. Domain first
   - Add `src/domain/thermalTypes.ts`.
   - Add `src/domain/thermalState.ts`.
   - Add `src/domain/thermalExecutionChain.ts`.
   - Add `src/domain/thermalValidation.ts`.
   - Add `src/domain/thermalCalculations.ts`.
   - Add domain tests before UI.
3. Data second
   - Add `src/data/thermalMarketData.ts`.
   - Add `src/data/thermalTrainingNodes.ts`.
   - Keep virtual annual overview, three-month context, and 24-hour typical-day load/price data separate from retail, renewable, and storage data.
4. Storage and templates
   - Add thermal-specific record/material/template tests before exposing import/export.
   - Reject retail, renewable, storage, or unknown templates in thermal flow.
   - Keep localStorage parsing resilient to malformed thermal records.
5. App and route wiring
   - Add route/session support only after domain behavior is tested.
   - Do not expose thermal as selectable until the full thermal active path is coherent enough to complete.
6. UI implementation
   - Keep execution and review structurally aligned when hints/materials are collapsed.
   - Keep execution focused on ten-segment offer entry, offer-curve validation, and result feedback.
   - Keep review focused on offer reasoning, clearing interpretation, cost-range context, and materials.
7. Verification and exit
   - Run `npm run quality`.
   - Perform browser visual QA for desktop and mobile operation surfaces.
   - Add a Phase 5 thermal exit audit before handoff.

## Required Test Plan Before Code

Minimum tests to define before implementation:

- Thermal chain contains exactly eight nodes and stays aligned across execution and review modes.
- Ten-segment offer count must be exactly ten.
- Segment capacity totals cannot exceed available capacity.
- Segment prices must follow the confirmed monotonicity rule.
- Segment prices must stay inside virtual market price bounds.
- Available capacity and minimum stable output are validated as training-grade inputs.
- Training-grade clearing feedback supports the confirmed marginal-price / cleared-segment model.
- High-price segments can remain uncleared without being treated as input errors.
- Thermal template import rejects retail, renewable, storage, and unknown templates.
- Thermal localStorage parsing ignores malformed records and keeps valid records.
- Result copy preserves virtual, training-grade, non-production boundaries and does not imply real bidding advice.

## Boundary Watch List

Potential pressure points if this implementation begins:

| Area | Risk | Control |
| --- | --- | --- |
| Ten-segment contract shape | Segment arrays can pressure shared types | Keep thermal-specific types local unless a shared abstraction is explicitly justified |
| Clearing language | UI could imply real spot-market clearing | Use training-grade marginal-clearing copy and model-boundary notices |
| Production constraints | Users may ask for unit commitment, ramping, startup/shutdown costs, or security constraints | Keep MVP limited to spot ten-segment offer training |
| Existing participant modules | Fast reuse could mix thermal logic into retail, renewable, or storage components | Keep thermal domain/components/tests separate |
| Records/templates | Import/export could corrupt other participant state | Use participant-specific templates and invalid-template tests |

## Stop Conditions

Switch to Project Rescue before code if:

- The user asks for real plant, real province, real cost, real bid, real dispatch, or real settlement data.
- Thermal implementation starts requiring backend storage, account systems, or external APIs.
- Review mode becomes a detached file library instead of node-bound knowledge material.
- Thermal logic is placed inside retail, renewable, or storage domain/components to move faster.
- The implementation tries to include unit commitment, startup/shutdown cost, ramping, minimum uptime/downtime, security-constrained dispatch, or multi-unit optimization in the MVP.

## Current Next Action

Keep Engineering Hardening Hold active.

If the user chooses thermal, first confirm the six-item Thermal Confirmation Packet and separately confirm ten-segment offer rules, then rerun the Phase 5 entry gate before writing code.
