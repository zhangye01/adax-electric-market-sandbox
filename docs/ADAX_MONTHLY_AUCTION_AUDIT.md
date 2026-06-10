# ADAX Monthly Auction Audit

This audit records the Phase 2 review for the retail-company monthly centralized auction node.

## Scope

The reviewed behavior is limited to the active v0.1 retail-company execution path:

- three typical monthly windows
- participate / not participate decision
- monthly coverage ratio, bid price, and curve selection
- no hidden defaults or stale skipped-month fields
- template import validation for monthly auction fields

No real monthly trading calendar, matching engine, active non-retailer workflow, or real market data was introduced.

## Expected Contract

The monthly centralized auction node must follow these rules:

1. The active monthly windows are March, July, and December.
2. Each month starts undecided with no hidden default values.
3. Each month must explicitly choose participate or not participate before settlement.
4. If a month participates, monthly coverage ratio, bid price, and monthly curve are required.
5. Participating monthly coverage ratio must be within 0%-50%.
6. Monthly curve must be selected from:
   - flat curve
   - typical-month curve
7. If a month does not participate, coverage ratio, bid price, and curve must stay empty.
8. Skipped months must calculate zero monthly volume and zero monthly cost.
9. Imported execution templates must reject invalid monthly values and hidden skipped-month details before applying data.

## Implementation Evidence

- Monthly state starts as `null` decisions and `null` optional fields in `src/domain/retailState.ts`.
- Monthly validation lives in `src/domain/retailValidation.ts`.
- Monthly calculation lives in `src/domain/retailCalculations.ts`.
- Monthly UI in `src/components/retail/RetailMonthlyAuctionNode.tsx` renders three month cards, uses explicit participate / not participate buttons, and clears optional fields when skipping.
- Template parsing in `src/services/retailExecutionTemplates.ts` validates monthly participation shape, coverage range, bid price range, curve enum, and rejects hidden details when the month is not participating.

## Test Evidence

`tests/domain/retail-domain.test.mjs` now covers:

- the active monthly windows are March, July, and December
- new retail training state has no default monthly participation, coverage, bid, or curve
- all three monthly windows must explicitly choose participate or not participate
- opted-out months accept empty optional fields
- opted-out months reject hidden coverage, bid, or curve details
- participating months enforce 0%-50% coverage bounds
- participating months require a monthly curve
- out-of-range monthly bids are rejected
- clean skipped months calculate zero volume, zero cost, null bid price, and null curve
- imported templates reject hidden skipped-month details and unsupported monthly curve values

## Decision

Monthly centralized auction behavior is acceptable for the current Phase 2 retail execution baseline.

The next Phase 2 target should verify that 100% total volume coverage can still produce spot exposure and curve-mismatch risk because contract curves and customer load curves do not necessarily align by hour.
