# ADAX v0.1 Guardrails

## Data Safety

- Use virtual market data only.
- Do not include real province names as modeled targets.
- Do not include real customer names, real bids, real contract prices, or real transaction records.
- Imported templates are parsed in-browser only and are not uploaded.
- Training records stay in browser localStorage.

## File Operations

- Template upload must validate before applying data.
- Template errors must identify missing fields, invalid numbers, invalid ranges, or unsupported enum values.
- Exported templates should be generated client-side.
- Do not overwrite user files.

## Product Boundary

Every training result should communicate:

- ADAX is a virtual provincial market sandbox.
- The mechanism is training-level simplified.
- Results do not represent any real province or real transaction outcome.
- Results must not be used for real trading, pricing, bidding, or settlement decisions.

## Dual-Mode Boundary

- Execution mode is for guided simulation, forms, validation, calculations, settlement, and review report output.
- Review mode is for knowledge organization around trade nodes, not for calculating transaction results.
- Review mode is larger than a review report. A review report answers "how did this run perform"; review mode answers "what should this business node teach?"
- Review materials must be attached to a specific scenario, participant, and trade node.
- v0.1 review materials are text-only. File upload, link libraries, search, tagging, shared material libraries, and knowledge maps are post-v0.1.

## Calculation Boundary

- Retailer settlement uses simplified retail revenue, contract procurement cost, spot procurement cost, curve mismatch risk adjustment, gross margin, and spot exposure.
- Other participant settlement or clearing models are not active in the v0.1 engineering baseline.
- Future participant models must be added through a startup card, domain model, tests, and explicit product confirmation.

## Project Rescue Trigger

Switch to Project Rescue before additional coding if any of these occur:

- Scope expands into real-market simulation or production trading workflows.
- Scope expands into active non-retailer workflows before the retail engineering baseline is stable.
- The UI hides or weakens the model-boundary statement.
- Calculations become too complex to explain in the training report.
- Imported files can silently overwrite current strategy data.
- A feature requires backend storage or network APIs for v0.1.
- Review mode becomes a generic file cabinet instead of node-bound knowledge material.
- Execution mode and review mode start using divergent scenario or participant chains.
