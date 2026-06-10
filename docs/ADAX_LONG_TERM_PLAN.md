# ADAX Long-Term Execution Plan

This plan is the operating roadmap for autonomous ADAX work. When the user says "继续" without a new priority, continue from the current phase and next action here.

## North Star

Build ADAX as a maintainable local training sandbox for electricity market transaction practice.

The product should help users experience transaction organization, transaction methods, operation results, and review around one unified virtual provincial market. It must stay training-grade, offline-first, and explainable.

## Operating Principles

1. Engineering quality comes before feature expansion.
2. Active v0.1 remains 售电公司 only until the retail path is stable.
3. Execution mode and review mode share the same scenario, participant, and trade-node chain.
4. Main operation pages should be action-focused; explanations stay hidden, contextual, or in review/material areas.
5. Business rules live in domain modules and tests, not React components.
6. Legacy prototype code must not be imported into active flow.
7. Any new participant workflow requires a startup card before implementation.
8. If the product direction drifts, switch to Project Rescue before writing more code.

## Autonomous Execution Protocol

Use this protocol for future "继续" turns:

1. Read `AGENTS.md`, `docs/ADAX_MVP_STARTER.md`, `docs/ENGINEERING_BASELINE.md`, and this file.
2. Identify the current phase and the first unfinished task.
3. Make a small, reversible change that strengthens the current phase.
4. Update tests or documentation when the change affects contracts or behavior.
5. Run `npm run typecheck`, `npm run test`, and `npm run build` for code changes.
6. Report what changed, what passed, what remains, and the next recommended task.

Do not jump to a later phase just because it is more visible. Finish the current phase's guardrails first.

## Current Public Preview

The current public preview is:

```text
https://zhangye01.github.io/adax-electric-market-sandbox/
```

Publishing is documented in `docs/ADAX_RELEASE_PROCESS.md`.

The source code branch is `main`; the GitHub Pages branch is `gh-pages`.

## Phase 0: Engineering Baseline

Status: complete.

Goal: make the current codebase safe to extend.

Completed:

- Created starter, guardrail, test, and engineering baseline docs.
- Isolated legacy photovoltaic and old ADAX prototype areas under `src/legacy/**`.
- Excluded `src/legacy/**` from the active TypeScript app baseline.
- Extracted session state from `App.tsx`.
- Extracted active page rendering into `src/app/AdaxPageRenderer.tsx`.
- Extracted navigation shell rules into `src/domain/adaxNavigation.ts`.
- Split browser route synchronization into `src/app/useAdaxBrowserRouteSync.ts`.
- Split training/user actions into `src/app/createAdaxTrainingActions.ts`.
- Split global CSS into responsibility-based style files.
- Added no-dependency domain tests for retail validation, settlement, template import, routes, route-sync decisions, flow guards, and navigation shell rules.
- Replaced active full annual scenario-package dependency with lightweight `src/data/adaxScenarioMeta.ts`.
- Created `docs/ACTIVE_ARCHITECTURE_MAP.md` for active source boundaries, data flow, import rules, and test coverage.
- Audited large retail UI components and split `RetailTradeActionNodes.tsx` into per-node files.
- Split review material configuration, material grid, and review output panel out of `RetailReviewWorkspace.tsx`.

Remaining:

- No Phase 0 blocking tasks remain. Keep the baseline current as source boundaries change.

Exit Criteria:

- `App.tsx` is only an app shell.
- Session, routing, persistence, and domain calculations have clear boundaries.
- Tests cover the critical retail business rules and flow access rules.
- A new developer can find the right module without reading the whole app.

## Phase 1: Core Flow Clarity

Status: complete.

Goal: make the current user flow coherent, calm, and operation-focused.

Completed:

- Reviewed page-to-page transition labels and side navigation states. Topbar now exposes mode, market, participant/node, and next action through tested navigation context rules; role-page context and mode launch paths align with the selected execution/review flow.
- Kept 首页 as product entry, not feature/version explanation. ADAX meaning, model boundary, and local data rules now live on a separate 关于 page instead of the home page.
- Kept 关于/统一说明 separated based on product need, not implementation history. 关于 is now a distinct product-entry page, while 首页 stays focused on starting training and checking records.
- Confirmed start mode selection is solemn enough for a training run. Mode cards select first, and entering the scenario requires a separate tested confirmation state.
- Reduced persistent explanatory cards in scenario, participant, and workspace pages. Scenario support details, participant observer seats, and retailer information pack are collapsed by default.
- Moved execution-mode hints into hover/popover/button-adjacent affordances. Execution node hints now use the shared retail workbench assist entry, and execution template import/export lives in the right output panel instead of the node rail.
- Kept review-mode materials in the same physical node locations as execution hints. Review material import uses the same workbench assist entry as execution hints, while bulk material import/export uses the same right-side action drawer pattern as execution templates.
- Kept retail workspace main panels focused on node work. Review-node material/save status is carried by the node rail, footer validation, and right output panel instead of a persistent main-panel explanation card.
- Created `docs/ADAX_PHASE_1_EXIT_AUDIT.md` as the exit audit for the Core Flow Clarity phase.

Exit Criteria:

- The user always knows: current mode, current scenario, current participant, current node, next action.
- Execution and review pages look structurally consistent when materials/hints are collapsed.
- Main pages feel like a professional transaction training workspace, not documentation pages.

## Phase 2: Retail Execution Closure

Status: complete.

Goal: make 售电公司 execution mode complete enough for a credible v0.1 training run.

Tasks:

- Verify the eight retail nodes form one linked scenario rather than fragmented tasks. Complete: `src/domain/retailExecutionChain.ts` now defines a tested node input/output contract, and `docs/ADAX_RETAIL_EXECUTION_CHAIN_AUDIT.md` records the audit.
- Recheck annual bilateral transaction behavior: 80%-120% coverage, counterparty floor rejection, curve selection. Complete: `docs/ADAX_ANNUAL_BILATERAL_AUDIT.md` records the audit, and domain tests cover annual coverage bounds, floor-price acceptance, curve preservation, and template rejection for invalid annual fields.
- Recheck monthly centralized auction behavior: three typical months, participate / not participate, no unnecessary defaults. Complete: `docs/ADAX_MONTHLY_AUCTION_AUDIT.md` records the audit, and domain tests cover monthly windows, explicit decisions, coverage bounds, curve selection, skipped-month zero calculation, and invalid monthly template rejection.
- Ensure 100% volume coverage can still produce curve mismatch and spot exposure. Complete: `docs/ADAX_CURVE_MISMATCH_AUDIT.md` records the audit, and domain tests prove 100% total volume coverage can still produce positive exposure, negative exposure, and curve-mismatch risk adjustment.
- Make result display understandable without formulas in execution mode. Complete: `src/domain/retailResultDisplay.ts` defines a tested result interpretation contract, `docs/ADAX_RESULT_DISPLAY_AUDIT.md` records the audit, and the workspace result panel plus settlement page use the shared interpretation.
- Improve record save and revisit behavior. Complete: execution records now preserve decisions, settlement result, and revisit targets; localStorage record parsing is guarded; `docs/ADAX_RECORD_REVISIT_AUDIT.md` records the audit.
- Add tests for any calculation or validation behavior not already covered. Complete for Phase 2 critical path: domain tests now cover the linked node chain, annual bilateral, monthly auction, curve mismatch, result display, storage filtering, and execution record revisit contract.
- Perform the Phase 2 exit audit before starting Phase 3. Complete: `docs/ADAX_PHASE_2_EXIT_AUDIT.md` records the exit evidence, and result surfaces now use a shared model-boundary notice.

Exit Criteria:

- A user can complete a retail execution run without hidden required knowledge.
- The system produces a result that is understandable as training output.
- Result records are stable in localStorage.

## Phase 3: Retail Review Closure

Status: complete.

Goal: make 复盘模式 the main place for decision reasoning, materials, and knowledge consolidation.

Tasks:

- Keep review mode on the same eight-node chain as execution mode. Complete: review mode uses the same `retailTrainingNodes` chain and shared workspace route as execution mode.
- Replace execution hints with material import/open actions in the same node locations. Complete from Phase 1: review material import uses the same workbench assist position as execution hints.
- Support review materials by scenario, participant, node, material type, and content. Complete: `src/domain/retailReviewMaterials.ts` defines the tested scope contract, and `docs/ADAX_REVIEW_MATERIALS_AUDIT.md` records the audit.
- Improve save/revisit workflow for review records. Complete for material persistence baseline: review records now preserve material snapshots and restore them on revisit; `docs/ADAX_REVIEW_MATERIALS_AUDIT.md` records the audit.
- Keep review mode distinct from execution result review. Complete: `src/domain/adaxModeBoundary.ts` defines the tested boundary contract, and `docs/ADAX_REVIEW_BOUNDARY_AUDIT.md` records the audit.
- Perform the Phase 3 exit audit before starting Phase 4. Complete: `docs/ADAX_PHASE_3_EXIT_AUDIT.md` records the exit evidence.

Exit Criteria:

- Review mode is clearly a knowledge organization workflow, not a report viewer.
- Users can attach or write materials at each trading node.
- Saved review records summarize coverage and material count.

## Phase 4: Professional Market Immersion

Status: complete.

Goal: make ADAX feel like electricity market transaction training, not a generic form app.

Tasks:

- Strengthen virtual market supply-demand presentation before operation. Complete for the first engineering pass: `src/domain/retailMarketContext.ts` now centralizes annual, monthly, and typical-day context before visual changes.
- Make annual, monthly, and typical-day market context visible enough for decisions. Complete for the market-context first pass: `RetailMarketSituationBoard` now presents annual load boundary, 24-hour typical-day prices, and March/July/December windows from the shared context.
- Improve visual hierarchy around prices, load, curves, exposure, and settlement. Complete for the v0.1 retail baseline: market-context hierarchy is improved; `src/domain/retailSettlementDisplay.ts` and `RetailSettlementSignalBoard` provide the shared exposure/settlement hierarchy for workspace, settlement, and execution result-review surfaces. Evidence is recorded in `docs/ADAX_RESULT_REVIEW_VISUAL_AUDIT.md`, `docs/ADAX_SETTLEMENT_VISUAL_AUDIT.md`, and `docs/ADAX_PHASE_4_EXIT_AUDIT.md`.
- Improve mobile flow positioning. Complete for the first engineering pass: mobile shell density, step indicator height, flow headers, workspace command bar, and workspace panel order were adjusted; evidence is recorded in `docs/ADAX_MOBILE_FLOW_POSITIONING_AUDIT.md`.
- Improve desktop/workspace professional density. Complete for the v0.1 retail baseline: execution workspace uses `src/domain/retailExecutionWorkbench.ts` and a compact node context bar to centralize node position, stage, input/output artifacts, status, and next action; desktop/mobile visual QA passed and is recorded in `docs/ADAX_WORKSPACE_DENSITY_AUDIT.md`.
- Reduce equal-card feeling inside trading nodes. Complete for the active retail operation nodes: customer load, package selection, annual bilateral, and monthly auction now use dedicated display contracts plus a primary-action/reference-feedback layout; desktop/mobile visual QA passed and is recorded in `docs/ADAX_NODE_ACTION_HIERARCHY_AUDIT.md`.
- Keep UI restrained: no game-like visuals, no decorative noise, no marketing-style cards in work surfaces.
- Create a focused visual QA checklist for desktop and mobile. Complete: `docs/ADAX_VISUAL_QA_CHECKLIST.md`; current run recorded in `docs/ADAX_VISUAL_QA_LOG_2026-06-10.md`.

Exit Criteria:

- The interface carries electricity market context through data, labels, and workflow.
- Users can understand why annual, monthly, and typical-day data matter before operating.
- Professional density improves without returning to explanation-heavy screens.

Exit Audit:

- Complete: `docs/ADAX_PHASE_4_EXIT_AUDIT.md`.

## Phase 5: Controlled Scope Expansion

Status: pending entry decision.

Goal: add future participant workflows only after retail is stable.

Candidate order:

1. 新能源: 年度双边、月度集中竞价、月内挂牌.
2. 独立储能: only spot-market participation.
3. 火电: only after a separate startup card confirms scope and ten-segment offer rules.

Explicitly excluded unless the user reopens scope:

- 市场运营机构 workflow.
- 批发用户 workflow.
- Real province data.
- Backend, accounts, or external APIs.

Entry Criteria:

- Retail execution and review modes pass their exit criteria.
- Engineering baseline remains green.
- A new startup card exists for the participant being added.

Planning Artifacts:

- 新能源 startup card created: `docs/ADAX_RENEWABLE_STARTUP_CARD.md`.
- Status: pending user confirmation. Do not implement renewable code until the startup card is confirmed.

## Current Next Action

Confirm Phase 5 entry scope.

Next recommended task: review and confirm `docs/ADAX_RENEWABLE_STARTUP_CARD.md`. If confirmed, implement only the first renewable engineering slice: domain types, state, validation, calculations, chain contract, and tests. Do not expose a clickable renewable operating flow before the renewable workspace is complete enough to pass its own checks.

## Project Rescue Triggers

Switch to Project Rescue before further coding if:

- Pages become explanation-heavy again.
- Execution and review modes diverge into different chains.
- New participant logic starts entering active flow without a startup card.
- Real market data or production decision language appears.
- React components start owning settlement or validation logic.
- Legacy prototype modules are imported into active source.
