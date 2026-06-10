# ADAX Record Revisit Audit

This audit records the Phase 2 review for local training-record save and revisit behavior.

## Scope

The reviewed behavior is limited to the active v0.1 local record system:

- retail-company execution records
- review-mode material records
- browser localStorage persistence
- record detail display
- saved execution result revisit target

No backend storage, account system, cloud sync, record import, or real-market record model was introduced.

## Expected Contract

Training records must follow these rules:

1. Records are stored only in browser localStorage.
2. Execution records must preserve enough context for later review:
   - retail decisions
   - settlement result
   - scenario identity
   - participant identity
   - revisit target
3. Review records must remain material records, not fake transaction result records.
4. Old or incomplete records must remain readable, but should not expose a broken revisit action.
5. Corrupted localStorage data must not crash the records page.
6. The records list remains capped to avoid unbounded localStorage growth.

## Implementation Evidence

- `src/types.ts` now allows records to carry `schemaVersion`, `savedAtIso`, `execution`, and `revisit`.
- `src/domain/retailRecords.ts` snapshots retail decisions and settlement result when building an execution record.
- `src/domain/adaxRecords.ts` defines pure record mode/type/revisit helpers.
- `src/services/adaxTrainingRecords.ts` writes execution records with full retail execution payload and revisit target.
- `src/utils/adaxStorage.ts` filters invalid localStorage entries and caps records at 20.
- `src/pages/RecordsPage.tsx` shows a revisit action only when a record has a valid revisit target.
- `src/app/createAdaxTrainingActions.ts` can restore a saved execution record back into the local session and route to the saved result page.

## Test Evidence

`tests/domain/retail-domain.test.mjs` now covers:

- retail execution records snapshot decisions and settlement result
- saved execution records include schema version, ISO timestamp, execution payload, and revisit target
- execution revisit target resolves to settlement page
- legacy/basic records without payload do not expose a revisit target
- corrupted JSON in localStorage returns an empty record list
- non-array localStorage data returns an empty record list
- invalid record entries are filtered
- record persistence keeps the latest 20 records

## Decision

Record save and revisit behavior is acceptable for the current Phase 2 retail execution baseline.

The next Phase 2 target should be a phase exit audit: verify that the retail execution path can be completed, saved, and revisited end to end before moving to retail review closure.
