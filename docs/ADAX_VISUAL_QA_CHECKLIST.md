# ADAX Visual QA Checklist

Date: 2026-06-10

Phase: 4 - Professional Market Immersion

## Scope

Use this checklist for visual QA whenever Phase 4 changes market situation, workspace, exposure, settlement, or result-review surfaces.

Current required routes:

- `/scenarios?mode=execution`
- `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- `/workspace?mode=review&scenario=SCN-A-STD-001&participant=retailer`

Execution and review workspaces should remain structurally aligned when hints/materials are collapsed.

## Desktop Checks

Target viewport: around `1512 x 745`.

- Sidebar does not cover or compress the main content into unreadable columns.
- Scenario page has one clear market situation board, not a wall of equal metric cards.
- Annual load boundary, 24-hour typical-day price curves, and March/July/December windows are visible without opening auxiliary documentation.
- Price bars are legible, with high-price and low-price semantics visually distinct.
- Main operation panels remain action-focused; long explanations stay collapsed, contextual, or in review material areas.
- Primary action remains visible and visually dominant enough to continue the flow.
- No text overlaps, clipped labels, or unreadable badges in the first viewport.

## Mobile Checks

Target viewport: around `390 x 844`.

- Sidebar and page content stack without horizontal scrolling.
- Market situation board stacks into readable panels.
- 24-hour price bars remain visible as a curve band; labels move above or below instead of squeezing into unreadable columns.
- Primary action remains reachable without fixed-position overlap.
- Text inside buttons, badges, and compact panels wraps cleanly.

## Product Boundary Checks

- No real province name appears as the modeled target.
- No wording implies real transaction, pricing, bidding, settlement, or investment advice.
- Execution result review remains a transaction-result surface, not a review material workspace.
- Review mode remains a node-bound knowledge workspace, not a settlement calculator.

## Current Phase 4 Evidence To Collect

For each visual QA pass, record:

- route checked
- viewport size
- whether market context is visible before operation
- whether any overlap or unreadable text was found
- whether browser console shows new errors
- any screenshot or DOM evidence if a regression is found
