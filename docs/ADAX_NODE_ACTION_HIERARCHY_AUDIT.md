# ADAX Node Action Hierarchy Audit

Date: 2026-06-10

Phase: 4 - Professional Market Immersion

## Purpose

This audit records the first node-level action hierarchy pass.

The goal is to move active trading nodes away from a wall of equally weighted cards and toward a clearer training-desk structure:

- primary operation first
- market reference second
- feedback and next action visible but not competing with inputs

## First Target Node

Customer load contract selection was included because it is the first real operation in the retail chain and sets the demand side that later transactions must serve:

- customer segment contract quantities
- customer segment capacity limits
- annual service volume
- customer mix and segment risk

Retail package selection was included because it determines the revenue model before procurement decisions begin:

- package option selection
- package price model
- selected package feedback
- transition into annual bilateral procurement

Annual bilateral transaction was selected as the first node because it combines the core v0.1 training behaviors:

- coverage ratio input
- bilateral bid price input
- annual contract curve selection
- simulated counterparty floor acceptance
- market reference range
- next-step transition into monthly auction

Monthly centralized auction was selected as the second node because it contains three repeated operating windows that can easily read like independent equal-weight cards unless the page clearly distinguishes:

- monthly participation operation
- monthly price and curve inputs
- window progress
- reference ranges and market features

## Implemented Boundary

Added `src/domain/retailCustomerLoadDisplay.ts`.

The module centralizes:

- customer segment order
- customer segment labels
- contract keys
- segment progress
- annual service volume
- total available customer capacity
- customer mix rows
- current status label

`RetailCustomerLoadNode.tsx` now renders this contract instead of deriving segment progress and status locally.

Added `src/domain/retailPackageDisplay.ts`.

The module centralizes:

- package option order
- package label and price text
- selected package state
- selected package explanation
- selection progress
- current status label

`RetailPackageNode.tsx` now renders this contract instead of deriving package state and next-step copy locally.

Added `src/domain/retailAnnualBilateralDisplay.ts`.

The module centralizes:

- price bounds
- long-term reference range
- counterparty floor price
- coverage range label
- completed field count
- deal tone
- deal message
- current status label

`RetailAnnualBilateralNode.tsx` now renders this contract instead of owning annual bilateral status copy locally.

Added `src/domain/retailMonthlyAuctionDisplay.ts`.

The module centralizes:

- selected monthly-window count
- participating monthly-window count
- total window count
- monthly status label
- annual price bounds for monthly bid input placeholders
- window decision tone and label
- window reference bid ranges and market features

`RetailMonthlyAuctionNode.tsx` now renders this contract instead of deriving monthly progress and status locally.

## Updated UI

The customer load node now uses the shared two-part layout:

- `retail-primary-action-panel`: customer segment contract quantity inputs.
- `retail-reference-feedback-panel`: annual service volume, total available capacity, filled segment count, customer mix, segment risk, and current status.

The retail package node now uses the same layout pattern:

- `retail-primary-action-panel`: selectable retail package options.
- `retail-reference-feedback-panel`: selected package, option count, selection progress, package explanation, price references, and current status.

The annual bilateral node now uses a two-part layout:

- `retail-primary-action-panel`: coverage ratio, bid price, and annual curve selection.
- `retail-reference-feedback-panel`: market reference, counterparty floor, deal feedback, and current status.

This keeps the user's main operation visually dominant while still preserving the market reference and feedback needed for training.

The monthly centralized auction node now uses the same layout pattern:

- `retail-primary-action-panel`: three monthly participation decisions and the inputs revealed for participating months.
- `retail-reference-feedback-panel`: selected-window count, participating-window count, bid price bounds, monthly reference ranges, and current status.

This keeps monthly participation and bidding as the main operation while making the monthly market references available without competing with the controls.

## Tests

Added a domain test for `buildRetailCustomerLoadDisplay` covering:

- empty segment state
- complete segment state
- segment order and contract keys
- annual service volume
- total available customer capacity
- customer mix and risk-copy contract
- current status label

Added a domain test for `buildRetailPackageDisplay` covering:

- empty package state
- selected package state
- package order
- package price text
- selected package explanation
- current status label

Added a domain test for `buildRetailAnnualBilateralDisplay` covering:

- idle state before bid entry
- blocked state when bid is below the simulated counterparty floor
- accepted state when the annual bilateral agreement is reached
- price-bound and reference-range contract
- completed-field count

Added a domain test for `buildRetailMonthlyAuctionDisplay` covering:

- initial undecided state
- partially selected monthly windows
- completed monthly-window state
- selected and participating counts
- window order
- decision tone labels
- price-bound and monthly-feature contract

## Browser Visual QA

Desktop customer load node:

- Route: `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- Viewport: `1920 x 876`
- Primary action panel size: about `597 x 248`.
- Reference feedback panel size: about `303 x 712`.
- Primary action panel is wider than the reference feedback panel.
- Three customer input cards rendered.
- Filled-state feedback displayed `3/3` customer segments and `105,000 MWh` annual service volume.
- Page-level horizontal overflow: none.
- Checked customer-load text clipping: none.

Mobile customer load node:

- Viewport: `390 x 844`
- Customer-load workbench collapsed to one column: `328px`.
- Primary action panel appears above the reference feedback panel.
- Three customer input cards rendered.
- Page document width stayed at `390px`.
- Page-level horizontal overflow: none.
- Checked customer-load text clipping: none.

Desktop package selection node:

- Route: `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- Viewport: `1920 x 876`
- Primary action panel size: about `597 x 274`.
- Reference feedback panel size: about `303 x 727`.
- Primary action panel is wider than the reference feedback panel.
- Three package cards rendered; one selected package was active in the checked state.
- Selected package feedback displayed `分时价套餐` and `1/1`.
- Page-level horizontal overflow: none.
- Checked package-node text clipping: none.

Mobile package selection node:

- Viewport: `390 x 844`
- Package workbench collapsed to one column: `328px`.
- Primary action panel appears above the reference feedback panel.
- Three package cards rendered; one selected package was active in the checked state.
- Page document width stayed at `390px`.
- Page-level horizontal overflow: none.
- Checked package-node text clipping: none.

Desktop annual bilateral node:

- Route: `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- Viewport: `1920 x 876`
- Primary action panel size: about `597 x 326`.
- Reference feedback panel size: about `303 x 497`.
- Primary action panel is wider than the reference feedback panel.
- Low bid scenario displayed counterparty rejection feedback correctly.
- Page-level horizontal overflow: none.
- Checked annual-node text clipping: none.

Mobile annual bilateral node:

- Viewport: `390 x 844`
- Annual node workbench collapsed to one column: `328px`.
- Primary action panel appears above the reference feedback panel.
- Page document width stayed at `390px`.
- Page-level horizontal overflow: none.
- Checked annual-node text clipping: none.

Console:

- No browser console errors were observed after the final pass.

Desktop monthly auction node:

- Route: `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- Viewport: `1920 x 876`
- Primary action panel size: about `597 x 919`.
- Reference feedback panel size: about `303 x 669`.
- Primary action panel is wider than the reference feedback panel.
- Three monthly decision cards rendered; two participating windows revealed input grids in the checked state.
- Selected-window status displayed `3/3`, with `2` participating windows.
- Page-level horizontal overflow: none.
- Checked monthly-node text clipping: none.

Mobile monthly auction node:

- Viewport: `390 x 844`
- Monthly node workbench collapsed to one column: `328px`.
- Primary action panel appears above the reference feedback panel.
- Three monthly decision cards rendered; two participating windows revealed input grids in the checked state.
- Page document width stayed at `390px`.
- Page-level horizontal overflow: none.
- Checked monthly-node text clipping: none.

Console:

- No browser console errors were observed after the monthly auction final pass.

## Product Boundary

This change stays inside the active v0.1 retailer execution workflow.

It does not add formulas, real market data, new participant flows, backend storage, or review-mode behavior.

## Remaining Phase 4 Work

- No remaining Phase 4 blocking work for node action hierarchy.
- Phase 4 exit audit is recorded in `docs/ADAX_PHASE_4_EXIT_AUDIT.md`.
