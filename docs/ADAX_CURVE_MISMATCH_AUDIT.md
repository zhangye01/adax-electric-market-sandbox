# ADAX Curve Mismatch Audit

This audit records the Phase 2 review for the retail-company curve mismatch and spot exposure behavior.

## Scope

The reviewed behavior is limited to the active v0.1 retail-company execution path:

- annual contract volume coverage
- monthly auction volume coverage
- hourly customer-load curve
- hourly contract curves
- positive and negative spot exposure
- curve-mismatch risk adjustment

No production-grade spot clearing, real market data, real declaration logic, or non-retailer workflow was introduced.

## Expected Contract

The retail execution model must follow these rules:

1. Total annual volume coverage and hourly curve matching are separate concepts.
2. A strategy with 100% total volume coverage can still have hourly positive exposure.
3. A strategy with 100% total volume coverage can still have hourly negative exposure.
4. When hourly curve mismatch exists, the model can produce a curve-mismatch risk adjustment that participates in gross margin.
5. The execution-mode result should expose the risk through result fields, not through formula-heavy explanation.

## Implementation Evidence

- Customer load curves, annual contract curves, monthly contract curves, and typical-day spot price curves live in `src/data/retailCurves.ts`.
- Total annual service volume comes from `calculateAnnualServiceMwh` in `src/domain/retailCalculations.ts`.
- Annual and monthly contract volumes come from `calculateAnnualContract` and `calculateMonthlyAuctionResults`.
- Total net exposure is calculated separately from hourly exposure in `calculateRetailSettlement`.
- Hourly positive/negative exposure is calculated in `calculateHourlyExposureByTypicalDay`.
- Curve mismatch aggregation is calculated in `calculateCurveMismatchRisk`.
- Settlement output exposes:
  - `exposure.totalNetExposureMwh`
  - `exposure.positiveExposureMwh`
  - `exposure.negativeExposureMwh`
  - `exposure.curveMatchScore`
  - `costs.curveMismatchRiskAdjustment`

## Test Evidence

`tests/domain/retail-domain.test.mjs` now includes `full volume coverage still produces curve mismatch and spot exposure`.

The test creates a clean retail execution run where:

- annual bilateral coverage is exactly 100%
- annual contract curve is flat
- all monthly auctions are explicitly skipped
- annual contract volume equals annual service volume
- monthly auction volume is zero
- total net exposure is zero
- base spot procurement cost is zero

The same result still proves:

- positive hourly exposure is greater than zero
- negative hourly exposure is greater than zero
- curve mismatch risk adjustment is greater than zero
- curve match score is below 100
- result diagnostics mention curve mismatch
- the July high-price typical day contains both positive and negative hourly exposure points

## Decision

The current domain model correctly preserves the training principle that "100% volume coverage does not mean zero spot exposure."

The next Phase 2 target should review whether execution-mode result display is understandable without exposing formulas as the main experience.
