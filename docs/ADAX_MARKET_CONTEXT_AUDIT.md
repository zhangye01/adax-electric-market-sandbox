# ADAX Market Context Audit

Date: 2026-06-10

Phase: 4 - Professional Market Immersion

## Purpose

This audit records the first Phase 4 change: market situation presentation is now backed by a small domain contract before any larger visual redesign.

The goal is to make ADAX feel like electricity market transaction training through structured market context, not through more explanatory cards or component-local copy.

## Findings Before Change

- `ScenarioPage` calculated typical-month peak price, valley price, spread, and peak/valley hours directly inside the page.
- `RetailMarketBriefNode`, `RetailAnnualBilateralNode`, and `RetailMonthlyAuctionNode` read raw market data and each selected the fields they needed.
- The underlying data package already contained the right v0.1 levels: annual supply-demand and price boundary, three typical months, and three 24-hour typical-day curves.
- The maintainability risk was not missing data. The risk was duplicated interpretation logic across pages and nodes.

## Implemented Boundary

Added `src/domain/retailMarketContext.ts`.

The module accepts `RetailMarketData` and returns a stable context for:

- annual supply-demand and price boundary
- monthly trading windows in the confirmed order: March, July, December
- typical-day price summaries with 24 hourly prices, peak price, valley price, spread, and peak/valley hour
- summary references for highest typical-day price, highest/lowest monthly average price, and widest typical-day spread
- operation sequence from annual market situation to customer and transaction actions

The module is pure and does not import React, services, browser APIs, or the default data package.

## Updated Consumers

- `src/components/retail/RetailMarketSituationBoard.tsx`
- `src/pages/ScenarioPage.tsx`
- `src/components/retail/RetailMarketBriefNode.tsx`
- `src/components/retail/RetailReviewWorkspace.tsx`
- `src/components/retail/RetailAnnualBilateralNode.tsx`
- `src/components/retail/RetailMonthlyAuctionNode.tsx`

These consumers now render market context instead of independently deriving market facts. `RetailMarketSituationBoard.tsx` is the shared visual surface for annual load boundary, 24-hour typical-day price curves, and monthly trading windows.

## Tests Added

Added a domain test for the market context contract:

- annual reference service volume, price bounds, long-term range, and counterparty floor
- monthly window order and reference bid ranges
- three typical-day curves with 24 hourly prices
- July high-price day peak, March low-price day valley, and context summaries
- operation sequence used by Phase 4 market immersion work

## Product Boundary

The change does not add new participant scope, real province data, real customer data, external APIs, backend storage, or formula-heavy operation guidance.

Execution mode and review mode continue to share the same retail scenario, participant, and eight-node chain.

## Remaining Phase 4 Work

- Improve visual hierarchy around exposure and settlement result surfaces.
- Keep the main operation surfaces action-focused; expanded reasoning belongs in review materials or contextual assistance.
- Run the focused visual QA checklist on desktop and mobile before declaring Phase 4 complete.
