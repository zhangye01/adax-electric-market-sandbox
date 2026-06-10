# ADAX Source Shape Audit

日期：2026-06-10
状态：当前工程化保持期基线。

本审计用于量化源码体积、导入热点和后续重构优先级。它不是功能验收报告，也不是业务范围扩展依据。

运行命令：

```bash
npm run audit:source
```

## Summary

| Metric | Value |
| --- | --- |
| Active source files | 166 |
| Code files | 85 |
| Style files | 81 |
| Total active source lines | 14850 |
| Watch line threshold | 220 code / 400 CSS |
| High line threshold | 300 code / 800 CSS |

## Layer Size

| Layer | Files | Lines |
| --- | --- | --- |
| `src/styles` | 80 | 6613 |
| `src/components` | 34 | 2634 |
| `src/domain` | 23 | 2625 |
| `src/pages` | 7 | 1293 |
| `src/app` | 4 | 570 |
| `src/data` | 6 | 399 |
| `src/services` | 3 | 318 |
| `src/utils` | 4 | 173 |
| `src/root` | 4 | 169 |
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
| `src/styles/009-flow-lists.css` | 208 | `src/styles` |
| `src/styles/012-retail-review.css` | 204 | `src/styles` |
| `src/pages/RolePage.tsx` | 199 | `src/pages` |
| `src/services/retailExecutionTemplates.ts` | 184 | `src/services` |
| `src/styles/012-retail-results-review.css` | 183 | `src/styles` |
| `src/styles/005-workspace-context.css` | 181 | `src/styles` |
| `src/components/retail/RetailMonthlyAuctionNode.tsx` | 178 | `src/components` |

## Import Hotspots

Fan-out pressure:

| File | Import count |
| --- | --- |
| `src/styles.css` | 80 |
| `src/components/retail/RetailReviewWorkspace.tsx` | 15 |
| `src/components/retail/RetailExecutionWorkspace.tsx` | 14 |
| `src/app/createAdaxTrainingActions.ts` | 12 |
| `src/app/AdaxPageRenderer.tsx` | 11 |
| `src/components/retail/RetailSettlementPage.tsx` | 11 |

Fan-in pressure:

| Imported file | Importer count |
| --- | --- |
| `src/domain/retailTypes.ts` | 38 |
| `src/types.ts` | 29 |
| `src/components/Badge.tsx` | 14 |
| `src/data/retailMarketData.ts` | 14 |
| `src/utils/formatters.ts` | 10 |
| `src/data/retailTrainingNodes.ts` | 8 |

## Findings

1. `src/styles/**` remains the main maintainability pressure, but former large CSS files are now being reduced by responsibility instead of page-level accumulation.
2. `src/styles/006-cockpit.css` has been split into cockpit base, summary, layout, controls, actions, template actions, template fields, and panels partitions.
3. `src/styles/012-retail-results.css` has been split into result base, settlement, breakdown, and result-review partitions.
4. `src/styles/012-retail-trade.css` has been split into trade base, reference, cards, controls, and feedback partitions.
5. `src/styles/012-retail.css` has been split into retail shell, node rail, operation, execution context, assist entry, grid primitives, market, trade, results, and review partitions.
6. `src/styles/009-flow.css` has been split into flow shell, mode, scenario, role, and shared list partitions.
7. `src/styles/009-flow-mode.css` has been split into mode card base, decision cards, commitment/confirm panel, training path stack, and record summary partitions.
8. `src/styles/009-flow-role.css` has been split into active role cards, collapsible role details, ecosystem seats, role information packages, and seat summary partitions.
9. `src/styles/009-flow-scenario.css` has been split into scenario shell, market situation cards, market activity/event cards, and confirmation-side-panel partitions.
10. `src/styles/003-home.css` has been split into home shell, hero/training path, mode/market sections, chain/records, and boundary-notice partitions.
11. `src/styles/002-app-layout.css` has been split into app grid/sidebar shell, sidebar panel, sidebar navigation, and topbar partitions.
12. `src/styles/012-retail-market.css` has been split into market board shell, annual load indicators, 24-hour price curves, monthly windows, and market brief/workbench strips.
13. `src/styles/013-responsive.css` has been split by breakpoint and mobile sub-surface partitions; responsive rules no longer dominate the largest style-file list.
14. `src/styles/010-cockpit-components.css` has been split into mode choice cards, comparison/event rows, feedback cards, status notices, and template/error messages.
15. `src/styles/008-records.css` has been split into records page shell, empty state, archive cards, shared field rows, detail panel, and local boundary notice partitions.
16. `src/styles/006-cockpit-controls.css` has been reduced to form/input controls; shared action buttons, template import actions, and template field guides now have dedicated partitions.
17. Obsolete `src/styles/006-cockpit-review.css` review-cockpit selectors were removed after verification showed the active review workspace uses `retail-review-*` selectors instead.
18. `src/domain/retailCalculations.ts` is the only high-pressure TypeScript domain file. It is still covered by tests, but future calculation changes should consider extracting annual, monthly, exposure, and margin helpers.
19. `src/domain/retailTypes.ts` and `src/types.ts` have high fan-in. They are central contracts; changes here should remain conservative and test-backed.
20. `RetailReviewWorkspace.tsx` and `RetailExecutionWorkspace.tsx` have the highest component fan-out. They should stay composition surfaces and not regain business rules.

## Recommended Refactor Queue

1. Review `src/styles/009-flow-lists.css` when flow list styles are next touched; split flow output rows, data rows, step/boundary rows, notes, and side-panel helper rows only if the file still mixes responsibilities.
2. Extract calculation helper modules from `src/domain/retailCalculations.ts` only when the next calculation change requires it.
3. Keep `src/domain/retailTypes.ts` stable unless a new confirmed participant startup card requires new shared contracts.
4. Keep workspace components as page-level composition surfaces; move any new derived status, validation, or display contract into `src/domain/**`.

## How To Use This Audit

- Run `npm run audit:source` before broad refactors or after substantial UI/domain changes.
- Do not use line count alone as a reason to refactor. Refactor when a large file is also being changed or when the file starts mixing responsibilities.
- Treat new files crossing the watch threshold as a signal to consider extraction before adding more behavior.
