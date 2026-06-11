# ADAX Phase 5 Scope Control Matrix

Date: 2026-06-11

Status: scope-control baseline. Phase 5 remains closed.

This matrix compares the current candidate participant startup cards so future work can choose one expansion path deliberately. It is not implementation approval.

## Decision

Do not implement any Phase 5 participant yet.

Current candidate cards exist for renewable, independent storage, and thermal, but all remain pending user confirmation. Implementation can begin only after the user explicitly resumes feature expansion, confirms one target card, and the current quality gate passes.

## Candidate Scope Matrix

| Candidate | Current card | Candidate order | Training market | Main operation focus | Trade chain | Current readiness |
| --- | --- | --- | --- | --- | --- | --- |
| 新能源 | `docs/ADAX_RENEWABLE_STARTUP_CARD.md` | 1 | 中长期 + 现货偏差 | 年度双边、月度集中竞价、月内挂牌、曲线错配 | 8 nodes | Draft only; pending user confirmation |
| 独立储能 | `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md` | 2 | 现货 only | 充电申报、放电申报、SOC 约束、价差收益 | 8 nodes | Draft only; pending user confirmation |
| 火电 | `docs/ADAX_THERMAL_STARTUP_CARD.md` | 3 | 现货 only | 十段报价、可用容量、训练级边际出清反馈 | 8 nodes | Draft only; pending user confirmation and ten-segment rule confirmation |

## Shared Constraints

All Phase 5 candidates must preserve these constraints:

- Use the same unified virtual provincial market.
- Keep execution mode and review mode on the same scenario, participant, and node chain.
- Keep operation pages action-focused; execution hints and review materials stay collapsed or button-adjacent.
- Store records and review materials only in browser localStorage.
- Use virtual market data only.
- Do not introduce backend storage, login, permissions, external APIs, or real market data.
- Keep participant business logic out of React components.
- Add domain tests before UI for new validation, calculation, or template behavior.
- Do not expose a candidate as selectable in the main flow until its full path is coherent enough to complete.

## Candidate Boundaries

| Candidate | Must include | Must not include |
| --- | --- | --- |
| 新能源 | annual bilateral, monthly auction, intramonth listing, output curve mismatch, settlement/review | real plant data, production forecasting, green certificate/capacity/ancillary-service rules, renewable-storage co-optimization, thermal ten-segment offers |
| 独立储能 | spot participation, charge/discharge declarations, SOC bounds, efficiency loss, training-grade spread revenue | medium/long-term trades, ancillary services, capacity leasing, battery degradation economics, IRR, rolling optimization, renewable-storage co-optimization |
| 火电 | spot ten-segment offer training, available capacity, offer curve validation, training-grade marginal-clearing feedback | medium/long-term trades, production-grade spot clearing, unit commitment, startup/shutdown cost, ramping, minimum uptime/downtime, security-constrained dispatch |

## Required Confirmation Before Code

| Candidate | Required user confirmation |
| --- | --- |
| 新能源 | participant type, intramonth listing granularity, three-month auction assumption, simulated counterparty condition, whether failed listing is needed, whether it is the first Phase 5 implementation |
| 独立储能 | training period, charge/discharge declaration granularity, same-hour charge/discharge rule, execution-result model, efficiency-loss visibility, whether it is the second Phase 5 candidate |
| 火电 | spot-only ten-segment scope, capacity segmentation rule, price monotonicity rule, clearing-feedback model, cost-range visibility, whether it is the third Phase 5 candidate |

Candidate entry dry runs:

- 新能源: `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md`.
- 独立储能: `docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md`.
- 火电: `docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md`.

If the user confirms only one card, implement only that card. Do not opportunistically prepare shared runtime code for the other candidates.

Use `docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md` as the consolidated gate before selecting a candidate for implementation.

## Selection Rules

1. Keep the retail baseline as the active product until a Phase 5 card is confirmed.
2. Select exactly one participant for the next implementation wave.
3. Treat candidate order as guidance, not automatic approval.
4. Re-run `npm run quality` immediately before code implementation begins.
5. Create or update a Phase 5 entry note for the selected candidate before code starts.
6. Start with domain contracts and tests; UI comes after domain behavior is proven.
7. Switch to Project Rescue if implementation pressure pushes shared contracts or React components into unclear ownership.

## Current Next Action

Keep Engineering Hardening Hold active.

If feature expansion resumes, use this matrix with `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md` to choose one target participant and confirm its startup card before writing code.
