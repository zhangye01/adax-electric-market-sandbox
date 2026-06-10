# ADAX Review Materials Audit

Date: 2026-06-10

Phase: Phase 3 - Retail Review Closure

## Question

Does review mode persist node-bound knowledge materials in a maintainable way, and can saved review records return users to the same review workspace context?

## Scope

This audit covers only the active v0.1 retail-company review flow:

- review materials for the unified virtual provincial market
- 售电公司 as the active participant
- the shared eight-node retail trade chain
- three text material slots:
  - 我的理解
  - 教材摘录
  - 业务案例
- browser localStorage persistence
- review-mode training records and revisit target

No file library, link library, tag system, search, backend storage, upload service, or non-retailer review workflow was introduced.

## Expected Contract

Review mode must follow these rules:

1. Review materials are attached to a specific scenario, participant, trade node, and material type.
2. Empty material slots do not count as saved materials.
3. Clearing a material removes the stale slot instead of keeping an empty persisted record.
4. Corrupted or invalid localStorage material data must not crash the review workspace.
5. Saving an empty review workspace must not create a fake training record.
6. Review records summarize material count and node coverage, not transaction profit.
7. New review records preserve a snapshot of saved materials for local revisit.
8. Review revisit returns to the review workspace, not to execution result review.

## Implementation Evidence

- `src/domain/retailReviewMaterials.ts` defines the pure review-material scope, progress, save eligibility, record summary, snapshot, and snapshot-merge rules.
- `src/services/adaxUserMaterials.ts` removes a persisted material slot when the user clears its content.
- `src/utils/adaxStorage.ts` now guards review-material localStorage parsing and filters invalid entries.
- `src/services/adaxTrainingRecords.ts` refuses to create empty review records and writes review records with material snapshots.
- `src/app/createAdaxTrainingActions.ts` restores review snapshot materials when revisiting a saved review record.
- `src/pages/WorkspacePage.tsx` and `src/components/retail/RetailReviewWorkspace.tsx` consume the shared domain stats instead of duplicating material filtering logic.
- `src/domain/adaxRecords.ts` keeps review record revisit on the strategy workspace with `mode=review`.

## Test Evidence

`tests/domain/retail-domain.test.mjs` now covers:

- review materials are scoped by scenario, participant, node, and material type
- blank materials are ignored
- invalid nodes, roles, scenarios, and material types are ignored by the retail review scope
- empty review material sets cannot be saved as review records
- saved review records use gross margin `0` and report material count/node coverage
- saved review records preserve material snapshots
- saved review records expose a review-mode strategy revisit target
- corrupted material localStorage returns an empty list
- non-array material localStorage returns an empty list
- invalid material entries are filtered
- clearing a material through upsert removes the stale slot

## Decision

Review material persistence and review-record revisit behavior are acceptable for the current Phase 3 baseline.

The next Phase 3 target should audit the product boundary between:

- review mode as node-bound knowledge organization
- execution-mode result review as a statistical result page

That audit should confirm the two workflows stay distinct while sharing the same scenario, participant, and eight-node chain.
