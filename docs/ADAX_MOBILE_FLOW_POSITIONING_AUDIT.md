# ADAX Mobile Flow Positioning Audit

Date: 2026-06-10

Phase: 4 - Professional Market Immersion

## Purpose

This audit records the mobile layout pass for the active retail flow.

The goal is to keep small screens usable without pretending they can provide the full desktop trading-desk experience. On mobile, the first priority is that the user reaches the current market, operation, or result board quickly.

## Findings Before Change

- The mobile app topbar stacked path, title, context chips, mode badge, and next action vertically.
- `StepIndicator` still consumed a large vertical block.
- Scenario and role headers repeated path information already present in the shell.
- Workspace mobile order showed the eight-node rail before the current operation panel, pushing the market board too far down.
- Workspace command facts stacked vertically, increasing header height before the operation panel.

## Implemented Boundary

The change stays in shell and responsive style boundaries:

- mobile topbar now uses a compact grid: title, mode badge, horizontal context chips, and a single next-action line
- mobile step indicator uses compact horizontal pills
- mobile flow-page headers hide duplicate operation-chain pills and reduce aside density
- mobile cockpit topbars use compact padding and horizontal metric strips
- mobile workspace order is now operation panel first, result feedback second, node rail third
- workspace command facts are horizontal scroll items instead of a tall stacked grid

No route contract, calculation, validation, template, record, participant, or training-node logic changed.

## Browser QA Evidence

Viewport: 390 x 844.

Checked routes:

- `/scenarios?mode=execution`
- `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- `/result?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- `/report?mode=execution&scenario=SCN-A-STD-001&participant=retailer`

Observed after the pass:

- mobile sidebar height: about 63px
- app topbar height: about 99px
- step indicator height: about 58px
- scenario market board top: about 505px
- workspace market board top: about 537px, down from about 1330px before workspace reordering
- settlement result board top: about 502px
- execution result-review board top: about 466px
- no horizontal overflow detected at 390 x 844
- no clipped checked topbar, flow, market, settlement, or result-review text detected
- browser console showed no error logs during this pass

## Remaining Work

- The mobile shell is now usable, but topbar + step indicator still consume about 157px before page content.
- A future pass can consider a page-local compact current-step summary for mobile, but it should not remove the user's ability to understand current mode, scenario, participant, node, and next action.
