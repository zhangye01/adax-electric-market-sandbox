# ADAX Source Shape Audit

日期：2026-06-11
状态：当前工程化保持期基线。

本审计用于量化源码体积、导入热点和后续重构优先级。它不是功能验收报告，也不是业务范围扩展依据。

运行命令：

```bash
npm run audit:source
npm run check:source-shape
```

## Summary

| Metric | Value |
| --- | --- |
| Active source files | 209 |
| Code files | 90 |
| Style files | 119 |
| Total active source lines | 14549 |
| Watch line threshold | 220 code / 400 CSS |
| High line threshold | 300 code / 800 CSS |

## Layer Size

| Layer | Files | Lines |
| --- | --- | --- |
| `src/styles` | 118 | 6263 |
| `src/domain` | 29 | 2695 |
| `src/components` | 33 | 2575 |
| `src/pages` | 7 | 1293 |
| `src/app` | 4 | 570 |
| `src/data` | 6 | 399 |
| `src/services` | 3 | 318 |
| `src/root` | 4 | 207 |
| `src/utils` | 4 | 173 |
| `src/routes` | 1 | 56 |

## Largest Files

| File | Lines | Layer |
| --- | --- | --- |
| `src/pages/RecordsPage.tsx` | 284 | `src/pages` |
| `src/domain/retailTypes.ts` | 257 | `src/domain` |
| `src/components/Layout.tsx` | 237 | `src/components` |
| `src/app/createAdaxTrainingActions.ts` | 231 | `src/app` |
| `src/components/retail/RetailExecutionWorkspace.tsx` | 223 | `src/components` |
| `src/pages/HomePage.tsx` | 219 | `src/pages` |
| `src/domain/retailSettlementDisplay.ts` | 214 | `src/domain` |
| `src/pages/RolePage.tsx` | 199 | `src/pages` |
| `src/services/retailExecutionTemplates.ts` | 184 | `src/services` |
| `src/components/retail/RetailMonthlyAuctionNode.tsx` | 178 | `src/components` |
| `src/components/retail/RetailReviewWorkspace.tsx` | 177 | `src/components` |
| `src/domain/retailValidation.ts` | 168 | `src/domain` |
| `src/domain/retailMarketContext.ts` | 165 | `src/domain` |
| `src/domain/adaxNavigation.ts` | 163 | `src/domain` |
| `src/pages/WorkspacePage.tsx` | 157 | `src/pages` |

## Import Hotspots

Fan-out pressure:

| File | Import count |
| --- | --- |
| `src/styles.css` | 118 |
| `src/components/retail/RetailReviewWorkspace.tsx` | 15 |
| `src/components/retail/RetailExecutionWorkspace.tsx` | 14 |
| `src/domain/retailCalculations.ts` | 13 |
| `src/app/createAdaxTrainingActions.ts` | 12 |
| `src/app/AdaxPageRenderer.tsx` | 11 |
| `src/components/retail/RetailSettlementPage.tsx` | 11 |

Fan-in pressure:

| Imported file | Importer count |
| --- | --- |
| `src/domain/retailTypes.ts` | 44 |
| `src/types.ts` | 28 |
| `src/data/retailMarketData.ts` | 17 |
| `src/components/Badge.tsx` | 14 |
| `src/utils/formatters.ts` | 10 |
| `src/data/retailTrainingNodes.ts` | 8 |

## Findings

1. `src/styles/**` remains the main maintainability pressure, but former large CSS files are now being reduced by responsibility instead of page-level accumulation.
2. `src/styles/006-cockpit.css` has been split into cockpit base, summary, layout, controls, actions, template actions, template fields, and panels partitions.
3. `src/styles/012-retail-results.css` has been split into result base, result-review status, output-boundary spacing, empty/missing states, compact hints, snapshots, settlement, board layout, exposure/cost maps, bar tones, row layouts, empty-state, verdict, insight-list, and diagnostics partitions.
4. `src/styles/012-retail-trade.css` has been split into trade base, reference, form-grid, card, choice-card, field-status, input, control, and feedback partitions.
5. `src/styles/012-retail.css` has been split into retail shell, node rail, operation, execution context, assist entry, grid primitives, market, trade, results, and review partitions.
6. `src/styles/009-flow.css` has been split into flow shell, mode, scenario, role, data-list, step-list, and side-helper partitions.
7. `src/styles/009-flow-mode.css` has been split into mode card base, decision cards, commitment/confirm panel, training path stack, and record summary partitions.
8. `src/styles/009-flow-role.css` has been split into active role cards, collapsible role details, ecosystem seats, role information packages, and seat summary partitions.
9. `src/styles/009-flow-scenario.css` has been split into scenario shell, market situation cards, market activity/event cards, and confirmation-side-panel partitions.
10. `src/styles/003-home.css` has been split into home shell, hero copy/layout, actions, flow-card, shared row primitives, section headings, mode cards, virtual-market rows, chain/records, and boundary-notice partitions.
11. `src/styles/002-app-layout.css` has been split into app grid/sidebar shell, sidebar collapse control, brand/market mark, current-mode card, collapsed-state overrides, sidebar navigation, and topbar partitions.
12. `src/styles/012-retail-market.css` has been split into market board shell, annual load indicators, 24-hour price curves, monthly windows, and market brief/workbench strips.
13. `src/styles/013-responsive.css` has been split by breakpoint and mobile sub-surface partitions; responsive rules no longer dominate the largest style-file list.
14. `src/styles/010-cockpit-components.css` has been split into mode choice cards, comparison/event rows, feedback cards, status notices, and template/error messages.
15. `src/styles/008-records.css` has been split into records page shell, empty state, archive cards, shared field rows, detail panel, and local boundary notice partitions.
16. `src/styles/006-cockpit-controls.css` has been reduced to form/input controls; shared action buttons, template import actions, and template field guides now have dedicated partitions.
17. Obsolete `src/styles/006-cockpit-review.css` review-cockpit selectors were removed after verification showed the active review workspace uses `retail-review-*` selectors instead.
18. `src/styles/009-flow-lists.css` has been replaced by data-list, step-list, and side-helper partitions; unused flow output, boundary, and note selectors were removed.
19. `src/styles/012-retail-review.css` has been split into review prompt drawer, review material editor, shared side-action drawer, and review progress partitions.
20. `src/styles/012-retail-results-review.css` has been split into output empty state, compact verdict, insight rows, and diagnostics partitions; unused `retail-verdict-band` and `retail-result-card` selectors were removed.
21. `src/styles/005-workspace-context.css` has been replaced by `src/styles/005-step-indicator.css`; inactive `workspace-chain-*`, `workspace-context-*`, and `workspace-boundary-*` selectors plus their mobile grid references were removed.
22. `src/styles/007-output.css`, `src/styles/013-responsive-mobile-output.css`, and unused `OutputFlowRows.tsx` were removed after verification showed their output/report selectors were no longer active in the retail result surfaces.
23. `src/styles/013-responsive-mobile.css` has been reduced to mobile shell layout and page padding; mobile sidebar, topbar/context, and result-review status rules now have dedicated partitions.
24. `src/styles/012-retail-trade-cards.css` has been reduced to shared trade-card containers and base card typography; form grids, choice-card labels, field/month status capsules, and trade inputs now have dedicated partitions, while result/table cards stay in result styles and side facts stay with summary/control styles.
25. `src/styles/012-retail-results-breakdown.css` has been reduced to settlement board layout and spacing; exposure/cost maps, progress-bar tone styles, and table/month result rows now have dedicated partitions.
26. `src/styles/003-home-hero.css` has been reduced to home hero layout and copy; home actions, flow-card structure, and shared flow/chain/market row primitives now have dedicated partitions.
27. `src/styles/004-about.css` has been split into about page shell, hero, panel grid/cards, sections, meaning cards, and list-row partitions.
28. `src/styles/002-app-sidebar-panel.css` has been replaced by dedicated sidebar collapse-control, brand/market-mark, current-mode-card, and collapsed-state partitions.
29. `src/styles/003-home-sections.css` has been reduced to home section shell and headings; mode cards, virtual-market rows, recent-record empty state, and model-boundary heading now have dedicated partitions.
30. `src/styles/012-retail-results.css` has been reduced to result panel base containers; result-review status chips, output-boundary spacing, empty/missing states, compact hints, result snapshots, and row text styles now have dedicated partitions.
31. `src/styles/002-app-sidebar-nav.css` has been reduced to navigation container and section structure; navigation item states, status dots, footer notice, and collapsed-navigation layout now have dedicated partitions.
32. `src/domain/retailCalculations.ts` has been reduced from the only high-pressure TypeScript domain file into a settlement facade; customer, revenue, contract, exposure, and risk-diagnostic calculation helpers now live in dedicated domain modules.
33. `scripts/check-boundaries.mjs` now treats those calculation helper modules as reviewed domain-rule targets, so components and pages cannot bypass the calculation facade without an explicit architecture exception.
34. `src/domain/retailTypes.ts` and `src/types.ts` have high fan-in. They are central contracts; changes here should remain conservative and test-backed.
35. `RetailReviewWorkspace.tsx` and `RetailExecutionWorkspace.tsx` have the highest component fan-out. They should stay composition surfaces and not regain business rules.

## Recommended Refactor Queue

1. Review `src/pages/RecordsPage.tsx` only when records UI changes; split archive list, detail panel coordination, and empty/local boundary sections if the page keeps growing.
2. Review `src/styles/009-flow-scenario-market.css` when scenario market styles are next touched; split annual fact cards, monthly window cards, and typical-day price bars only if that surface needs visual work.
3. Keep `src/domain/retailTypes.ts` stable unless a new confirmed participant startup card requires new shared contracts.
4. Keep workspace components as page-level composition surfaces; move any new derived status, validation, or display contract into `src/domain/**`.

## Source Shape Budgets

`npm run check:source-shape` is part of `npm run quality`. It allows the current watch/high-pressure files to exist, but it fails if a pressure file grows beyond the recorded budget or if a new active file crosses the watch threshold without being reviewed here.

| File | Budgeted Lines | Reason |
| --- | --- | --- |
| `src/pages/RecordsPage.tsx` | 284 | Existing records composition surface; split only when records UI changes. |
| `src/domain/retailTypes.ts` | 257 | Central shared contract; keep stable unless confirmed participant scope requires contract changes. |
| `src/components/Layout.tsx` | 237 | App shell composition; avoid adding business rules. |
| `src/app/createAdaxTrainingActions.ts` | 231 | Action orchestration boundary; avoid adding domain rules. |
| `src/components/retail/RetailExecutionWorkspace.tsx` | 223 | Workspace composition surface; move derived logic into `src/domain/**`. |

## How To Use This Audit

- Run `npm run audit:source` before broad refactors or after substantial UI/domain changes.
- Run `npm run check:source-shape` before handoff when a change touches large files or source budgets.
- Do not use line count alone as a reason to refactor. Refactor when a large file is also being changed or when the file starts mixing responsibilities.
- Treat new files crossing the watch threshold as a signal to consider extraction before adding more behavior.
