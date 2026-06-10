# ADAX Review Boundary Audit

Date: 2026-06-10

Phase: Phase 3 - Retail Review Closure

## Question

Does ADAX keep review mode distinct from execution-mode result review while preserving the same scenario, participant, and eight-node trade chain?

## Boundary

ADAX has two review-like surfaces that must not be confused:

1. Execution-mode result review
   - mode: execution
   - route: `/report?mode=execution`
   - purpose: summarize the current simulated transaction result
   - output: local execution training record
   - must not become a knowledge-material workspace

2. Review-mode workspace
   - mode: review
   - route: `/workspace?mode=review`
   - purpose: organize node-bound rules, cases, and personal understanding
   - output: local review material record
   - must not calculate transaction revenue or act as an execution result report

Both surfaces remain attached to the same virtual market, retailer participant, and eight-node retail chain.

## Implementation Evidence

- `src/domain/adaxModeBoundary.ts` defines the pure boundary contract for:
  - `executionResultReview`
  - `reviewWorkspace`
- `src/components/adax/ModeBoundaryNotice.tsx` renders the boundary in the right-side output area.
- `src/domain/adaxFlowGuards.ts` allows the `review` page only in execution mode after settlement has been generated and viewed.
- `src/routes/adaxRoutes.ts` maps `/report` to execution result review and `/workspace?mode=review` to review workspace.
- `src/components/retail/RetailResultReviewPage.tsx` displays settlement statistics, diagnostics, result record saving, and model boundary notice.
- `src/components/retail/RetailReviewWorkspace.tsx` displays node-bound material slots, prompts, material import/export, and review record saving.
- `src/domain/retailReviewMaterials.ts` keeps review materials scoped by scenario, participant, node, and material type.

## Test Evidence

`tests/domain/retail-domain.test.mjs` now covers:

- execution result review is an execution-mode surface
- execution result review can use settlement output
- execution result review cannot use review materials
- review workspace is a review-mode surface
- review workspace can use review materials
- review workspace cannot use settlement output
- review workspace explicitly must not calculate transaction收益 or act as an execution result report
- navigation rules keep review-mode flow on `strategy` and execution result review on the execution output flow

## Decision

The two review-like surfaces now have a maintainable boundary:

- execution result review = statistical review of one simulated run
- review mode = node-bound knowledge organization

Phase 3 can proceed to exit audit.
