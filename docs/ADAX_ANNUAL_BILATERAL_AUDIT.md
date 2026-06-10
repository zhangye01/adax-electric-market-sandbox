# ADAX Annual Bilateral Audit

This audit records the Phase 2 review for the retail-company annual bilateral transaction node.

## Scope

The reviewed behavior is limited to the active v0.1 retail-company execution path:

- annual coverage ratio
- simulated counterparty floor-price acceptance
- annual contract curve selection
- template import validation for annual bilateral fields

No new participant workflow, matching engine, real counterparty model, or real market data was introduced.

## Expected Contract

The annual bilateral node must follow these rules:

1. Coverage ratio is required for execution settlement and must be within 80%-120%.
2. Bid price is required for execution settlement and must stay inside the configured annual price bounds.
3. A bid below the simulated counterparty floor price is rejected.
4. A bid equal to or above the simulated counterparty floor price is accepted.
5. Annual contract curve must be selected from:
   - flat curve
   - industrial-user curve
6. Imported execution templates may contain incomplete draft values, but any non-null annual values must respect the configured ranges and enums.

## Implementation Evidence

- State starts with no user-facing annual defaults in `src/domain/retailState.ts`.
- Validation lives in `src/domain/retailValidation.ts`.
- Deal acceptance and annual contract volume/cost calculation live in `src/domain/retailCalculations.ts`.
- The annual UI in `src/components/retail/RetailAnnualBilateralNode.tsx` renders inputs and deal feedback without owning business rules.
- Template parsing in `src/services/retailExecutionTemplates.ts` validates annual coverage, bid price, curve enum, counterparty floor price, and deal status shape before applying imported data.

## Test Evidence

`tests/domain/retail-domain.test.mjs` now covers:

- bids below the simulated counterparty floor are rejected
- 79% and 121% annual coverage are rejected
- 80% and 120% annual coverage are accepted
- missing annual contract curve blocks annual validation
- a bid exactly at the simulated counterparty floor is accepted
- the selected annual contract curve is preserved in calculation output
- rejected annual deals produce zero annual contract volume and zero annual contract cost
- imported templates reject invalid annual coverage and unsupported annual curve values

## Decision

Annual bilateral behavior is acceptable for the current Phase 2 retail execution baseline.

The next Phase 2 target should be monthly centralized auction behavior:

- three typical months
- participate / not participate decision
- no unnecessary defaults
- validation and template behavior for partial participation
