# ADAX Phase 5 Independent Storage Entry Dry Run

Date: 2026-06-11

Status: dry run complete. Independent-storage implementation is not approved.

This document rehearses what would happen if the user selects 独立储能 as a Phase 5 implementation target. It is a gate exercise only and does not authorize code changes.

## Decision

Do not implement the independent-storage workflow yet.

Current blockers:

- The user has not explicitly resumed Phase 5 feature expansion.
- `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md` remains pending user confirmation.
- Storage-specific open questions are not answered.
- `npm run quality` must be rerun immediately before implementation starts.

## Dry-Run Inputs

Authoritative inputs:

- `docs/ADAX_MVP_STARTER.md`
- `docs/ADAX_LONG_TERM_PLAN.md`
- `docs/ADAX_CHANGE_GATE_CHECKLIST.md`
- `docs/ADAX_ENGINEERING_READINESS_AUDIT.md`
- `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md`
- `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`
- `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md`
- `docs/ACTIVE_ARCHITECTURE_MAP.md`

## Change Gate Classification

| Gate item | Dry-run result |
| --- | --- |
| Change type | New participant workflow |
| Allowed during Engineering Hardening Hold | No, unless the user explicitly re-enters feature expansion |
| Current action allowed | Documentation dry run only |
| Active code changes allowed now | No |
| Project Rescue trigger active | No, because this dry run does not change runtime behavior |

## Storage Confirmation Packet

Before code starts, get explicit answers for these questions:

| Question | Recommended default from startup card | Current status |
| --- | --- | --- |
| 独立储能训练周期 | 一个典型日 24 小时 | Unconfirmed |
| 充放电申报粒度 | 24 小时逐小时申报 | Unconfirmed |
| 是否允许同一小时同时充电和放电 | No | Unconfirmed |
| 现货执行结果模型 | 训练级成交 / 未成交 / 部分成交状态 | Unconfirmed |
| 是否展示效率损耗 | Yes, but execution mode shows results without formulas | Unconfirmed |
| 是否确认独立储能作为 Phase 5 第二个候选主体 | Yes/No required | Unconfirmed |

If any answer remains unconfirmed, continue planning or update the startup card; do not implement runtime code.

## Implementation Route If Confirmed Later

This route is valid only after the user confirms the startup card and explicitly resumes Phase 5.

1. Entry proof
   - Re-run `npm run quality`.
   - Record the selected target in this dry-run document or a Phase 5 entry note.
   - Confirm no Project Rescue trigger is active.
2. Domain first
   - Add `src/domain/storageTypes.ts`.
   - Add `src/domain/storageState.ts`.
   - Add `src/domain/storageExecutionChain.ts`.
   - Add `src/domain/storageValidation.ts`.
   - Add `src/domain/storageCalculations.ts`.
   - Add domain tests before UI.
3. Data second
   - Add `src/data/storageMarketData.ts`.
   - Add `src/data/storageTrainingNodes.ts`.
   - Keep virtual annual overview, three-month context, and 24-hour typical-day price/load data separate from retail and renewable data.
4. Storage and templates
   - Add independent-storage-specific record/material/template tests before exposing import/export.
   - Reject retail, renewable, thermal, or unknown templates in independent-storage flow.
   - Keep localStorage parsing resilient to malformed storage records.
5. App and route wiring
   - Add route/session support only after domain behavior is tested.
   - Do not expose independent storage as selectable until the full storage active path is coherent enough to complete.
6. UI implementation
   - Keep execution and review structurally aligned when hints/materials are collapsed.
   - Keep execution focused on charge/discharge operation, SOC visibility, and result feedback.
   - Keep review focused on decision reasoning, constraints, and materials.
7. Verification and exit
   - Run `npm run quality`.
   - Perform browser visual QA for desktop and mobile operation surfaces.
   - Add a Phase 5 independent-storage exit audit before handoff.

## Required Test Plan Before Code

Minimum tests to define before implementation:

- Independent-storage chain contains exactly eight nodes and stays aligned across execution and review modes.
- Charge and discharge declarations validate time, power, energy, and price boundaries.
- Same-hour charge/discharge follows the confirmed rule and is rejected by default.
- SOC cannot exceed upper bound or drop below lower bound.
- Rated power and available capacity limits are enforced.
- Efficiency loss affects the training-grade result summary without formula-heavy execution copy.
- Execution-result model supports the confirmed成交 / 未成交 / 部分成交 behavior.
- Empty or skipped hours are allowed and produce no spot revenue.
- Independent-storage template import rejects retail, renewable, thermal, and unknown templates.
- Independent-storage localStorage parsing ignores malformed records and keeps valid records.
- Result copy preserves virtual, training-grade, non-production boundaries and does not imply investment value.

## Boundary Watch List

Potential pressure points if this implementation begins:

| Area | Risk | Control |
| --- | --- | --- |
| SOC and efficiency logic | Storage calculations may become complex quickly | Keep first pass training-grade and domain-tested; do not add degradation or IRR |
| Existing retail modules | Fast reuse could mix storage logic into retail components | Keep storage domain/components/tests separate unless a shared abstraction is explicitly justified |
| Renewable adjacency | Storage work may drift into renewable-storage co-optimization | Keep storage standalone; do not prepare renewable runtime code in the storage implementation |
| Records/templates | Import/export could corrupt retail or renewable state | Use participant-specific templates and invalid-template tests |
| Investment framing | Revenue outputs could look like project economics | Use virtual data only and explicit non-production boundary copy |

## Stop Conditions

Switch to Project Rescue before code if:

- The user asks for real storage project, real province, real price, real dispatch, or real revenue data.
- Storage implementation starts requiring backend storage, account systems, or external APIs.
- Review mode becomes a detached file library instead of node-bound knowledge material.
- Storage logic is placed inside retail or renewable domain/components to move faster.
- The implementation tries to include ancillary services, capacity leasing, battery degradation, IRR, or renewable-storage co-optimization in the MVP.

## Current Next Action

Keep Engineering Hardening Hold active.

If the user chooses independent storage, first confirm the six-item Storage Confirmation Packet, then rerun the Phase 5 entry gate before writing code.
