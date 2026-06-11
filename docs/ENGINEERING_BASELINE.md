# ADAX Engineering Baseline

## Goal

This baseline keeps ADAX maintainable before new business scope is added.

The current priority is engineering stability, not feature expansion.

Use `docs/ADAX_LONG_TERM_PLAN.md` as the autonomous execution roadmap. This file defines the engineering baseline; the long-term plan defines phase order and next actions. Use `docs/ACTIVE_ARCHITECTURE_MAP.md` for the active source boundary and import map.

Use `docs/ADAX_RELEASE_PROCESS.md` for GitHub Pages publishing. The current production preview is served from the `gh-pages` branch, while the source code stays on `main`.

Use `docs/ADAX_CHANGE_GATE_CHECKLIST.md` as the pre-change gate before starting non-trivial work. It defines how to classify requests, when to switch to Project Rescue, where responsibilities belong, and which checks prove completion.

## Source Boundaries

Active retail flow:

- `src/domain/retailTypes.ts`
- `src/domain/retailState.ts`
- `src/domain/retailExecutionChain.ts`
- `src/domain/retailExecutionWorkbench.ts`
- `src/domain/retailCustomerLoadDisplay.ts`
- `src/domain/retailPackageDisplay.ts`
- `src/domain/retailAnnualBilateralDisplay.ts`
- `src/domain/retailMonthlyAuctionDisplay.ts`
- `src/domain/retailValidation.ts`
- `src/domain/retailCalculations.ts`
- `src/domain/retailCalculationUtils.ts`
- `src/domain/retailCustomerCalculations.ts`
- `src/domain/retailRevenueCalculations.ts`
- `src/domain/retailContractCalculations.ts`
- `src/domain/retailExposureCalculations.ts`
- `src/domain/retailRiskDiagnostics.ts`
- `src/domain/retailMarketContext.ts`
- `src/domain/retailNodeValidation.ts`
- `src/domain/retailRecords.ts`
- `src/domain/retailResultDisplay.ts`
- `src/domain/retailSettlementDisplay.ts`
- `src/domain/retailReviewMaterials.ts`
- `src/domain/adaxModeBoundary.ts`
- `src/domain/adaxModelBoundary.ts`
- `src/domain/adaxRecords.ts`
- `src/domain/adaxNavigation.ts`
- `src/data/adaxScenarioMeta.ts`
- `src/data/retailMarketData.ts`
- `src/data/retailCurves.ts`
- `src/data/retailTrainingNodes.ts`
- `src/services/retailExecutionTemplates.ts`
- `src/components/retail/RetailMarketSituationBoard.tsx`
- `src/components/retail/RetailSettlementSignalBoard.tsx`
- `src/components/retail/**`
- `src/pages/ScenarioPage.tsx`
- `src/pages/RolePage.tsx`
- `src/pages/WorkspacePage.tsx`
- `src/components/Layout.tsx`
- `src/components/layout/**`
- `src/components/adax/ModelBoundaryNotice.tsx`
- `src/components/adax/ModeBoundaryNotice.tsx`
- `src/routes/adaxRoutes.ts`
- `src/styles/006-cockpit.css`
- `src/styles/006-cockpit-summary.css`
- `src/styles/006-cockpit-layout.css`
- `src/styles/006-cockpit-controls.css`
- `src/styles/006-cockpit-actions.css`
- `src/styles/006-cockpit-template-actions.css`
- `src/styles/006-cockpit-template-fields.css`
- `src/styles/006-cockpit-panels.css`
- `src/styles/009-flow.css`
- `src/styles/009-flow-mode.css`
- `src/styles/009-flow-mode-decision.css`
- `src/styles/009-flow-mode-confirmation.css`
- `src/styles/009-flow-mode-path.css`
- `src/styles/009-flow-mode-records.css`
- `src/styles/009-flow-scenario.css`
- `src/styles/009-flow-scenario-market.css`
- `src/styles/009-flow-scenario-activity.css`
- `src/styles/009-flow-scenario-confirmation.css`
- `src/styles/009-flow-role.css`
- `src/styles/009-flow-role-details.css`
- `src/styles/009-flow-role-ecosystem.css`
- `src/styles/009-flow-role-info-pack.css`
- `src/styles/009-flow-role-seat.css`
- `src/styles/009-flow-data-list.css`
- `src/styles/009-flow-step-list.css`
- `src/styles/009-flow-side-helpers.css`
- `src/styles/010-cockpit-components.css`
- `src/styles/010-cockpit-comparison.css`
- `src/styles/010-cockpit-feedback.css`
- `src/styles/010-cockpit-notices.css`
- `src/styles/010-cockpit-messages.css`
- `src/styles/012-retail.css`
- `src/styles/012-retail-node-rail.css`
- `src/styles/012-retail-operation.css`
- `src/styles/012-retail-context.css`
- `src/styles/012-retail-assist.css`
- `src/styles/012-retail-grids.css`
- `src/styles/012-retail-market.css`
- `src/styles/012-retail-market-load.css`
- `src/styles/012-retail-market-price.css`
- `src/styles/012-retail-market-months.css`
- `src/styles/012-retail-market-briefs.css`
- `src/styles/012-retail-trade.css`
- `src/styles/012-retail-trade-reference.css`
- `src/styles/012-retail-trade-form-grids.css`
- `src/styles/012-retail-trade-cards.css`
- `src/styles/012-retail-trade-choice-cards.css`
- `src/styles/012-retail-trade-field-status.css`
- `src/styles/012-retail-trade-inputs.css`
- `src/styles/012-retail-trade-controls.css`
- `src/styles/012-retail-trade-feedback.css`
- `src/styles/012-retail-results.css`
- `src/styles/012-retail-results-review-status.css`
- `src/styles/012-retail-results-boundary.css`
- `src/styles/012-retail-results-states.css`
- `src/styles/012-retail-results-hints.css`
- `src/styles/012-retail-results-snapshot.css`
- `src/styles/012-retail-results-settlement.css`
- `src/styles/012-retail-results-breakdown.css`
- `src/styles/012-retail-results-maps.css`
- `src/styles/012-retail-results-bars.css`
- `src/styles/012-retail-results-rows.css`
- `src/styles/012-retail-results-empty.css`
- `src/styles/012-retail-results-verdict.css`
- `src/styles/012-retail-results-insights.css`
- `src/styles/012-retail-results-diagnostics.css`
- `src/styles/012-retail-review-prompts.css`
- `src/styles/012-retail-review-materials.css`
- `src/styles/012-retail-side-actions.css`
- `src/styles/012-retail-review-progress.css`

Shared shell and persistence:

- `src/App.tsx`
- `src/app/AdaxPageRenderer.tsx`
- `src/app/createAdaxNavigationActions.ts`
- `src/app/createAdaxTrainingActions.ts`
- `src/app/useAdaxBrowserRouteSync.ts`
- `src/app/useAdaxTrainingSession.ts`
- `src/pages/AboutPage.tsx`
- `src/pages/HomePage.tsx`
- `src/components/layout/**`
- `src/components/records/**`
- `src/services/adaxTrainingRecordExports.ts`
- `src/services/adaxTrainingRecords.ts`
- `src/services/adaxUserMaterials.ts`
- `src/utils/adaxStorage.ts`
- `src/utils/download.ts`
- `src/utils/formatters.ts`
- `src/utils/retailDisplay.ts`
- `src/types.ts`
- `src/styles.css`
- `src/styles/001-base.css`
- `src/styles/002-app-layout.css`
- `src/styles/002-app-sidebar-collapse.css`
- `src/styles/002-app-sidebar-brand.css`
- `src/styles/002-app-sidebar-mode.css`
- `src/styles/002-app-sidebar-collapsed.css`
- `src/styles/002-app-sidebar-nav.css`
- `src/styles/002-app-sidebar-nav-items.css`
- `src/styles/002-app-sidebar-status.css`
- `src/styles/002-app-sidebar-footer.css`
- `src/styles/002-app-sidebar-nav-collapsed.css`
- `src/styles/002-app-topbar.css`
- `src/styles/003-home.css`
- `src/styles/003-home-hero.css`
- `src/styles/003-home-actions.css`
- `src/styles/003-home-flow-card.css`
- `src/styles/003-home-shared-rows.css`
- `src/styles/003-home-sections.css`
- `src/styles/003-home-mode-cards.css`
- `src/styles/003-home-market.css`
- `src/styles/003-home-records.css`
- `src/styles/003-home-boundary.css`
- `src/styles/004-about.css`
- `src/styles/004-about-hero.css`
- `src/styles/004-about-panels.css`
- `src/styles/004-about-sections.css`
- `src/styles/004-about-meaning.css`
- `src/styles/004-about-list.css`
- `src/styles/005-step-indicator.css`
- `src/styles/008-records.css`
- `src/styles/008-records-empty.css`
- `src/styles/008-records-cards.css`
- `src/styles/008-records-field-rows.css`
- `src/styles/008-records-detail.css`
- `src/styles/008-records-boundary.css`
- `src/styles/013-responsive.css`
- `src/styles/013-responsive-tablet.css`
- `src/styles/013-responsive-mobile.css`
- `src/styles/013-responsive-mobile-sidebar.css`
- `src/styles/013-responsive-mobile-topbar.css`
- `src/styles/013-responsive-mobile-results.css`
- `src/styles/013-responsive-mobile-pages.css`
- `src/styles/013-responsive-mobile-grids.css`
- `src/styles/013-responsive-mobile-workspace.css`
- `src/styles/013-responsive-mobile-flow.css`
- `src/styles/013-responsive-mobile-market.css`
- `src/styles/013-responsive-narrow.css`

Tooling and release automation:

- `scripts/audit-source-shape.mjs`
- `scripts/check-domain-contracts.mjs`
- `scripts/check-source-shape.mjs`
- `scripts/check-boundaries.mjs`
- `scripts/publish-pages.mjs`

Legacy or inactive prototype areas:

- `src/legacy/photovoltaic/**`
- `src/legacy/adax-v0-prototype/**`
- `single-html-prototype.html`

Legacy areas must not be imported into the active retail flow. If a future feature needs them, first create a startup card and migrate the needed logic into a domain module with tests.

`src/legacy/**` is excluded from the active TypeScript app baseline in `tsconfig.app.json`. It remains in the workspace only as reference material until it is deleted or migrated.

The active app uses `src/data/adaxScenarioMeta.ts` for scenario identity, market-year metadata, event summaries, and price bounds. It must not import the old full annual package in `src/legacy/adax-v0-prototype/data/adaxData.ts`.

## Architecture Direction

Keep these layers separate:

1. Domain: types, state creation, validation, calculations, record builders.
2. Data: virtual market data and training-node definitions.
3. Services: localStorage, file template parsing/export, record persistence.
4. Utils: narrow UI-neutral helpers such as formatting and browser file download.
5. Routes: URL parsing and path generation.
6. Pages: high-level flow composition.
7. Components: UI controls and display only.
8. Styles: split by page or responsibility under `src/styles/**`; keep `src/styles.css` as the import entry.

React components should not contain settlement math, import parsing rules, or route-guard rules.

## Current Refactor Queue

The current queue is maintained in `docs/ADAX_LONG_TERM_PLAN.md`.

Near-term maintenance priorities:

1. Apply `docs/ADAX_CHANGE_GATE_CHECKLIST.md` before non-trivial changes.
2. Use `docs/ADAX_SOURCE_SHAPE_AUDIT.md` to prioritize refactors by measured source pressure.
3. Keep `src/app/AdaxPageRenderer.tsx` as the page composition boundary; do not move flow state back into `App.tsx`.
4. Keep `src/app/useAdaxBrowserRouteSync.ts` as the browser route synchronization boundary.
5. Keep `src/app/createAdaxTrainingActions.ts` as the training action boundary.
6. Keep `docs/ACTIVE_ARCHITECTURE_MAP.md` current when source boundaries change.
7. Keep `docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md` current when central retail/app contracts change.
8. Continue reducing large style partitions only when a page is touched.
9. Keep `docs/ADAX_RELEASE_PROCESS.md` current when publishing, changing Pages configuration, or changing Vite build paths.
10. Only add new participant workflows after the relevant startup card is confirmed.

## Quality Commands

Every handoff should run:

- `npm run check:boundaries`
- `npm run check:domain-contracts`
- `npm run check:source-shape`
- `npm run typecheck`
- `npm run test`
- `npm run build`

`npm run quality` runs the boundary check, central contract check, and source-shape budget check before typecheck, tests, and build.

Do not treat visual inspection as a replacement for domain tests.

## Risk Register

| Risk | Current Level | Control |
| --- | --- | --- |
| Scope drift into non-retailer workflows | High | Keep `docs/ADAX_MVP_STARTER.md` as source of truth |
| Open-ended change requests bypassing architecture judgment | Reduced | Use `docs/ADAX_CHANGE_GATE_CHECKLIST.md` to classify scope, target layer, rescue triggers, and required evidence before editing |
| Architecture boundary drift going unnoticed | Reduced | `npm run check:boundaries` fails on active legacy imports, forbidden domain dependencies, misplaced localStorage/history writes, network/backend APIs, real-province runtime data, and unreviewed component-level calculation, validation, and calculation-helper imports; `tests/scripts/check-boundaries.test.mjs` now proves representative negative fixtures fail |
| Large files growing without review | Reduced | `npm run audit:source` identifies line pressure and import hotspots; `npm run check:source-shape` fails when new or already-budgeted large active files grow without an audit update |
| Central contract drift becoming invisible | Reduced | `npm run check:domain-contracts` now checks reviewed export groups and order; contract governance lives in `docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md` |
| New participant implementation starting before scope confirmation | High | Require a confirmed participant startup card before code; current renewable card is `docs/ADAX_RENEWABLE_STARTUP_CARD.md` and remains pending confirmation |
| Preview publishing path drifting from source history | Medium | Keep source on `main`, static build on `gh-pages`, and follow `docs/ADAX_RELEASE_PROCESS.md` |
| Manual Pages publishing missing a step | Reduced | Use `npm run publish:pages:dry` before `npm run publish:pages -- --yes`; publishing logic is centralized in `scripts/publish-pages.mjs` |
| GitHub workflow files blocked by token scope | Medium | Current GitHub CLI token lacks `workflow`; do not push `.github/workflows/**` unless authorization and Pages strategy are intentionally changed |
| `App.tsx` becoming a god component | Reduced | Session state and page rendering are extracted; keep future flow logic out of the entry component |
| `Layout.tsx` becoming an app-shell god component | Reduced | Sidebar, topbar, and market-clearing brand mark now live under `src/components/layout/**`; keep shell state in `Layout.tsx` |
| Training action orchestration becoming a mixed route/action god module | Reduced | Navigation actions now live in `src/app/createAdaxNavigationActions.ts`; keep record/material/template coordination in `createAdaxTrainingActions.ts` |
| Retail execution workspace regrowing mixed validation and UI chrome | Reduced | Node validation routing now lives in `src/domain/retailNodeValidation.ts`, and execution context/footer chrome lives in dedicated retail components |
| Legacy prototype mixing into ADAX flow | Reduced | Legacy photovoltaic and old ADAX scenario prototypes are isolated under `src/legacy/**` and excluded from active build |
| Global CSS coupling | Reduced | Styles are split by responsibility; sidebar, home, about, records, cockpit controls, shared flow lists, step indicator, retail review surfaces, and retail result-review surfaces now have separate shell/collapse/brand/mode/market/hero/panel/section/list/input/action/template/data/step/helper/prompt/material/progress/status/boundary/snapshot/empty/verdict/insight/diagnostic partitions, and obsolete review-cockpit/workspace-context/output CSS has been removed; continue avoiding cross-page selectors |
| Template import corrupting state | Medium | Runtime parser validation and import tests |
| Financial-looking results being misunderstood | Reduced | Shared model-boundary contract and result-surface notice |
| Review mode becoming a generic material cabinet | Reduced | Review material scope and record snapshots are node-bound in `src/domain/retailReviewMaterials.ts` |
| Review mode being confused with execution result review | Reduced | Shared mode-boundary contract in `src/domain/adaxModeBoundary.ts` |
| Market context becoming duplicated page copy | Reduced | Annual, monthly, and typical-day context is centralized in `src/domain/retailMarketContext.ts` and covered by domain tests |
| Settlement visual hierarchy duplicating interpretation logic | Reduced | Exposure, cost-stack, and result signals are centralized in `src/domain/retailSettlementDisplay.ts` and rendered through `RetailSettlementSignalBoard.tsx`, including execution result-review |
| Mobile shell pushing operation/result surfaces too low | Reduced | Small screens default to collapsed sidebar, compact topbar, compact flow steps, operation-first workspace order, and horizontal summary strips; audit recorded in `docs/ADAX_MOBILE_FLOW_POSITIONING_AUDIT.md` |
| Workspace node status becoming fragmented page copy | Reduced | Execution workspace node context is centralized in `src/domain/retailExecutionWorkbench.ts` and covered by domain tests |
| Trading nodes reading like equal card piles | Reduced | Customer load, package selection, annual bilateral, and monthly auction now use primary-action plus reference-feedback layouts backed by dedicated display contracts |
| Broad utility modules regrowing hidden business logic | Reduced | Active `src/utils/**` only contains storage, download, formatters, and retail display helpers |
