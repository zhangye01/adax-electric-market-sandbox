# ADAX Phase 5 Renewable Entry Dry Run

Date: 2026-06-11

Status: dry run complete. Renewable implementation is not approved.

This document rehearses what would happen if the user selects 新能源 as the first Phase 5 implementation target. It is a gate exercise only and does not authorize code changes.

## Decision

Do not implement the renewable workflow yet.

Current blockers:

- The user has not explicitly resumed Phase 5 feature expansion.
- `docs/ADAX_RENEWABLE_STARTUP_CARD.md` remains pending user confirmation.
- Renewable-specific open questions are not answered.
- `npm run quality` must be rerun immediately before implementation starts.

## Dry-Run Inputs

Authoritative inputs:

- `docs/ADAX_MVP_STARTER.md`
- `docs/ADAX_LONG_TERM_PLAN.md`
- `docs/ADAX_CHANGE_GATE_CHECKLIST.md`
- `docs/ADAX_ENGINEERING_READINESS_AUDIT.md`
- `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md`
- `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`
- `docs/ADAX_RENEWABLE_STARTUP_CARD.md`
- `docs/ACTIVE_ARCHITECTURE_MAP.md`

## Change Gate Classification

| Gate item | Dry-run result |
| --- | --- |
| Change type | New participant workflow |
| Allowed during Engineering Hardening Hold | No, unless the user explicitly re-enters feature expansion |
| Current action allowed | Documentation dry run only |
| Active code changes allowed now | No |
| Project Rescue trigger active | No, because this dry run does not change runtime behavior |

## Renewable Confirmation Packet

Before code starts, get explicit answers for these questions:

| Question | Recommended default from startup card | Current status |
| --- | --- | --- |
| 新能源主体类型 | 风光组合 | Unconfirmed |
| 月内挂牌操作粒度 | 24 小时曲线展示 + 峰 / 平 / 谷时段包操作 | Unconfirmed |
| 月度集中竞价是否沿用 3 个典型月 | Yes, use the same three typical months as retail | Unconfirmed |
| 年度双边是否设置模拟对手方接受条件 | Yes, use a simplified minimum acceptable price or deal range | Unconfirmed |
| 月内挂牌是否需要未成交结果 | Yes, otherwise挂牌缺少交易动作感 | Unconfirmed |
| 是否确认新能源作为 Phase 5 第一个实现主体 | Yes/No required | Unconfirmed |

If any answer remains unconfirmed, continue planning or update the startup card; do not implement runtime code.

## Implementation Route If Confirmed Later

This route is valid only after the user confirms the startup card and explicitly resumes Phase 5.

1. Entry proof
   - Re-run `npm run quality`.
   - Record the selected target in this dry-run document or a Phase 5 entry note.
   - Confirm no Project Rescue trigger is active.
2. Domain first
   - Add `src/domain/renewableTypes.ts`.
   - Add `src/domain/renewableState.ts`.
   - Add `src/domain/renewableExecutionChain.ts`.
   - Add `src/domain/renewableValidation.ts`.
   - Add `src/domain/renewableCalculations.ts`.
   - Add domain tests before UI.
3. Data second
   - Add `src/data/renewableMarketData.ts`.
   - Add `src/data/renewableTrainingNodes.ts`.
   - Keep virtual annual, three-month, and 24-hour typical-day data separate from retail data.
4. Storage and templates
   - Add renewable-specific record/material/template tests before exposing import/export.
   - Reject retail, storage, thermal, or unknown templates in renewable flow.
   - Keep localStorage parsing resilient to malformed renewable records.
5. App and route wiring
   - Add route/session support only after domain behavior is tested.
   - Do not expose renewable as selectable until the full renewable active path is coherent enough to complete.
6. UI implementation
   - Keep execution and review structurally aligned when hints/materials are collapsed.
   - Keep execution focused on actions and results.
   - Keep review focused on decision reasoning and materials.
7. Verification and exit
   - Run `npm run quality`.
   - Perform browser visual QA for desktop and mobile operation surfaces.
   - Add a Phase 5 renewable exit audit before handoff.

## Required Test Plan Before Code

Minimum tests to define before implementation:

- Renewable chain contains exactly eight nodes and stays aligned across execution and review modes.
- Annual bilateral validates volume, price, curve, and simulated counterparty acceptance.
- Monthly auction requires participate / not participate decisions for all three typical months.
- Monthly auction opt-out allows empty optional fields but rejects hidden stale details.
- Intramonth listing supports the confirmed granularity and failed-listing result if confirmed.
- Total contract volume matching forecast output can still produce hourly curve mismatch and spot exposure.
- Price and volume outside virtual market bounds are blocked.
- Renewable template import rejects retail, storage, thermal, and unknown templates.
- Renewable localStorage parsing ignores malformed records and keeps valid records.
- Result copy preserves virtual, training-grade, non-production boundaries.

## Boundary Watch List

Potential pressure points if this implementation begins:

| Area | Risk | Control |
| --- | --- | --- |
| Central participant types | New participant may pressure `src/types.ts` or shared route types | Follow `docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md` and run `npm run check:domain-contracts` |
| Existing retail modules | Fast reuse could mix renewable logic into retail components | Keep renewable domain/components/tests separate unless a shared abstraction is explicitly justified |
| UI flow | New workflow could reintroduce explanation-heavy operation pages | Use the existing operation-first retail pattern and browser QA |
| Records/templates | Import/export could corrupt retail state | Use participant-specific templates and invalid-template tests |
| Market data | Renewable examples could drift toward real market data | Use virtual data only and keep model-boundary copy visible in financial-looking outputs |

## Stop Conditions

Switch to Project Rescue before code if:

- The user asks for real plant, real province, real price, or real settlement data.
- Renewable implementation starts requiring backend storage, account systems, or external APIs.
- Review mode becomes a detached file library instead of node-bound knowledge material.
- Renewable logic is placed inside retail domain/components to move faster.
- The implementation tries to prepare storage or thermal runtime code while implementing renewable.

## Current Next Action

Keep Engineering Hardening Hold active.

If the user chooses renewable, first confirm the six-item Renewable Confirmation Packet, then rerun the Phase 5 entry gate before writing code.
