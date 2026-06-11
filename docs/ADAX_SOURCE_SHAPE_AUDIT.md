# ADAX Source Shape Audit

日期：2026-06-11
状态：当前工程化保持期基线。

本审计用于量化源码体积、导入热点和后续重构优先级。它不是功能验收报告，也不是业务范围扩展依据。

运行命令：

```bash
npm run audit:source
```

## Summary

| Metric | Value |
| --- | --- |
| Active source files | 203 |
| Code files | 84 |
| Style files | 119 |
| Total active source lines | 14479 |
| Watch line threshold | 220 code / 400 CSS |
| High line threshold | 300 code / 800 CSS |

## Layer Size

| Layer | Files | Lines |
| --- | --- | --- |
| `src/styles` | 118 | 6263 |
| `src/domain` | 23 | 2625 |
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
| `src/domain/retailCalculations.ts` | 455 | `src/domain` |
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

## Import Hotspots

Fan-out pressure:

| File | Import count |
| --- | --- |
| `src/styles.css` | 118 |
| `src/components/retail/RetailReviewWorkspace.tsx` | 15 |
| `src/components/retail/RetailExecutionWorkspace.tsx` | 14 |
| `src/app/createAdaxTrainingActions.ts` | 12 |
| `src/app/AdaxPageRenderer.tsx` | 11 |
| `src/components/retail/RetailSettlementPage.tsx` | 11 |

Fan-in pressure:

| Imported file | Importer count |
| --- | --- |
| `src/domain/retailTypes.ts` | 38 |
| `src/types.ts` | 28 |
| `src/components/Badge.tsx` | 14 |
| `src/data/retailMarketData.ts` | 14 |
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
32. `src/domain/retailCalculations.ts` is the only high-pressure TypeScript domain file. It is still covered by tests, but future calculation changes should consider extracting annual, monthly, exposure, and margin helpers.
33. `src/domain/retailTypes.ts` and `src/types.ts` have high fan-in. They are central contracts; changes here should remain conservative and test-backed.
34. `RetailReviewWorkspace.tsx` and `RetailExecutionWorkspace.tsx` have the highest component fan-out. They should stay composition surfaces and not regain business rules.

## Recommended Refactor Queue

1. Review `src/styles/009-flow-scenario-market.css` when scenario market styles are next touched; split annual fact cards, monthly window cards, and typical-day price bars only if that surface needs visual work.
2. Extract calculation helper modules from `src/domain/retailCalculations.ts` only when the next calculation change requires it.
3. Keep `src/domain/retailTypes.ts` stable unless a new confirmed participant startup card requires new shared contracts.
4. Keep workspace components as page-level composition surfaces; move any new derived status, validation, or display contract into `src/domain/**`.

## How To Use This Audit

- Run `npm run audit:source` before broad refactors or after substantial UI/domain changes.
- Do not use line count alone as a reason to refactor. Refactor when a large file is also being changed or when the file starts mixing responsibilities.
- Treat new files crossing the watch threshold as a signal to consider extraction before adding more behavior.
