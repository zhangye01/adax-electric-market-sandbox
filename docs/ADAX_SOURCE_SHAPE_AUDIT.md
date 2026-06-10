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
| Active source files | 99 |
| Code files | 85 |
| Style files | 14 |
| Total active source lines | 14996 |
| Watch line threshold | 220 code / 400 CSS |
| High line threshold | 300 code / 800 CSS |

## Layer Size

| Layer | Files | Lines |
| --- | --- | --- |
| `src/styles` | 13 | 6826 |
| `src/components` | 34 | 2634 |
| `src/domain` | 23 | 2625 |
| `src/pages` | 7 | 1293 |
| `src/app` | 4 | 570 |
| `src/data` | 6 | 399 |
| `src/services` | 3 | 318 |
| `src/utils` | 4 | 173 |
| `src/root` | 4 | 102 |
| `src/routes` | 1 | 56 |

## Largest Files

| File | Lines | Layer |
| --- | --- | --- |
| `src/styles/012-retail.css` | 2023 | `src/styles` |
| `src/styles/009-flow.css` | 1314 | `src/styles` |
| `src/styles/006-cockpit.css` | 777 | `src/styles` |
| `src/styles/013-responsive.css` | 631 | `src/styles` |
| `src/domain/retailCalculations.ts` | 455 | `src/domain` |
| `src/styles/003-home.css` | 400 | `src/styles` |
| `src/styles/002-app-layout.css` | 398 | `src/styles` |
| `src/styles/010-cockpit-components.css` | 337 | `src/styles` |
| `src/pages/RecordsPage.tsx` | 284 | `src/pages` |
| `src/domain/retailTypes.ts` | 257 | `src/domain` |
| `src/components/Layout.tsx` | 237 | `src/components` |
| `src/app/createAdaxTrainingActions.ts` | 231 | `src/app` |
| `src/components/retail/RetailExecutionWorkspace.tsx` | 223 | `src/components` |

## Import Hotspots

Fan-out pressure:

| File | Import count |
| --- | --- |
| `src/components/retail/RetailReviewWorkspace.tsx` | 15 |
| `src/components/retail/RetailExecutionWorkspace.tsx` | 14 |
| `src/styles.css` | 13 |
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

1. `src/styles/**` is the main maintainability pressure. It has fewer files than components and domain, but carries the largest line count.
2. `src/styles/012-retail.css` and `src/styles/009-flow.css` are high-pressure files. Future UI changes should split these by responsibility instead of adding more selectors.
3. `src/domain/retailCalculations.ts` is the only high-pressure TypeScript domain file. It is still covered by tests, but future calculation changes should consider extracting annual, monthly, exposure, and margin helpers.
4. `src/domain/retailTypes.ts` and `src/types.ts` have high fan-in. They are central contracts; changes here should remain conservative and test-backed.
5. `RetailReviewWorkspace.tsx` and `RetailExecutionWorkspace.tsx` have the highest component fan-out. They should stay composition surfaces and not regain business rules.

## Recommended Refactor Queue

1. Split `src/styles/012-retail.css` into narrower retail style partitions when retail work surfaces are next touched.
2. Split `src/styles/009-flow.css` by flow shell, step indicator, and mode/scenario/role page responsibilities.
3. Extract calculation helper modules from `src/domain/retailCalculations.ts` only when the next calculation change requires it.
4. Keep `src/domain/retailTypes.ts` stable unless a new confirmed participant startup card requires new shared contracts.
5. Keep workspace components as page-level composition surfaces; move any new derived status, validation, or display contract into `src/domain/**`.

## How To Use This Audit

- Run `npm run audit:source` before broad refactors or after substantial UI/domain changes.
- Do not use line count alone as a reason to refactor. Refactor when a large file is also being changed or when the file starts mixing responsibilities.
- Treat new files crossing the watch threshold as a signal to consider extraction before adding more behavior.
