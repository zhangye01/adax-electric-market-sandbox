# ADAX Settlement Visual Audit

Date: 2026-06-10

Phase: 4 - Professional Market Immersion

## Purpose

This audit records the first Phase 4 pass on spot exposure and settlement result visual hierarchy.

The goal is to make result feedback read like electricity market transaction training feedback: revenue, procurement cost, gross margin, risk level, spot exposure, and cost stack should have clear hierarchy and stable semantics.

## Findings Before Change

- `RetailOutcomeNodes.tsx` rendered spot exposure and settlement as equal metric cards.
- `RetailSettlementPage.tsx` duplicated result metrics, cost rows, and exposure facts directly in the component.
- The calculation layer already produced the required settlement data, but the display contract for visual hierarchy was missing.
- The maintainability risk was that future result-page changes would mix display interpretation, chart proportions, and React markup.

## Implemented Boundary

Added `src/domain/retailSettlementDisplay.ts`.

The module accepts `RetailSettlementResult` and returns a stable display contract for:

- headline result state
- revenue, procurement cost, gross margin, and risk-level signals
- spot exposure signals: positive exposure, negative exposure, high-price positive exposure, and low-price negative exposure
- cost-stack items: annual bilateral procurement, monthly auction procurement, base spot procurement, and curve-mismatch risk adjustment
- share values used for visual bars

The display contract keeps business interpretation outside React components and avoids formula-heavy or internal field-name copy.

## Updated Consumers

- `src/components/retail/RetailSettlementSignalBoard.tsx`
- `src/components/retail/RetailOutcomeNodes.tsx`
- `src/components/retail/RetailSettlementPage.tsx`

`RetailSettlementSignalBoard.tsx` is the shared visual surface for workspace spot-exposure, workspace settlement, and the formal settlement page.

## Tests Added

Added a domain test for the settlement display contract:

- headline signal order
- exposure signal order
- cost-stack item order
- values tied to `RetailSettlementResult`
- share values constrained to 0-1
- no internal formula or implementation-field language in display text

## Product Boundary

The change does not alter settlement calculations, add real market data, add non-retailer workflows, or introduce trading advice.

Execution mode remains an operation and result-visibility workflow. Review mode remains a node-bound knowledge organization workflow.

## Remaining Phase 4 Work

- Continue browser visual QA on settlement/result-review routes after more result-page changes.
- Improve mobile flow positioning separately; current mobile QA shows readable stacked panels but market/result boards may appear below the sidebar and flow header.
- Keep formula details out of the main operation path.
