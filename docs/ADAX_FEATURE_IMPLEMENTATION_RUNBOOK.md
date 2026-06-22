# ADAX Feature Implementation Runbook

Date: 2026-06-22

Status: implementation runbook active. It does not lift Engineering Hardening Hold.

This runbook controls how a confirmed feature-expansion slice is implemented after the user has explicitly resumed feature work. It is an execution discipline, not a scope approval.

## When To Use This Runbook

Use this runbook only after `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md` is complete and the selected startup card is confirmed.

Do not write participant runtime code until the selected startup card is confirmed.

If the user only says "继续", stay in Engineering Hardening Hold and do not use this runbook as permission to start Phase 5 work.

## Required Entry Evidence

Before the first implementation edit, all of these must be true:

1. The user explicitly confirms feature expansion should resume.
2. Exactly one participant startup card is selected and confirmed.
3. `npm run quality` passes on the current baseline after any later hardening change.
4. `docs/ADAX_CHANGE_GATE_CHECKLIST.md` classifies the work as a controlled feature slice rather than Project Rescue.
5. The first implementation slice names its domain files, data files, UI files, tests, and rollback boundary.

## Implementation Order

Follow this order for every participant slice:

1. Define domain and data contracts.
   - Implement domain and data contracts before pages or components.
   - Keep participant logic out of retail modules unless the change is a reviewed shared contract.
   - Update `docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md` before changing shared retail or app exports.
2. Add tests before UI wiring is considered complete.
   - Add or update tests in the same slice before UI wiring is considered complete.
   - Cover validation, calculation, route access, storage shape, and record/material behavior where applicable.
3. Wire app orchestration narrowly.
   - Keep route normalization in `src/routes/**` and app decisions in `src/app/**`.
   - Keep persistence in `src/services/**` or `src/utils/**`.
   - Do not place browser IO or settlement math in React components.
4. Compose pages and components.
   - Pages compose the flow.
   - Components render operation controls and results.
   - Execution and review must stay on the same participant, scenario, and node chain.
5. Run quality and inspect the changed surface.
   - Run `npm run quality`.
   - Add visual QA only when the changed surface is visible or layout-sensitive.
6. Publish only when the user needs a shareable preview.
   - Use `npm run publish:pages:dry` before `npm run publish:pages -- --yes`.

## Participant Isolation Rules

- Exactly one participant may be active in a feature slice.
- The other Phase 5 candidates remain closed until their own startup cards are confirmed.
- Do not write new participant logic into `src/domain/retail*`, `src/components/retail/**`, or retail-only tests unless the change is explicitly a shared retail contract update.
- Do not add real province data, real customer data, real bids, backend storage, login, or external market APIs.
- Do not import `src/legacy/**` into active source.

## Stop Conditions

Stop implementation and switch to Project Rescue before more coding if any of these happen:

- If execution and review chains diverge, stop and enter Project Rescue.
- The new flow makes operation pages explanation-heavy again.
- The first slice requires more than one participant to be implemented together.
- A React component starts owning validation, settlement math, route guards, or file parsing.
- User-facing output starts sounding like real transaction advice rather than training-grade simplification.
- The implementation cannot be rolled back as one participant slice.

## Handoff Evidence

Every feature-slice handoff must report:

- selected participant and confirmed startup card path
- first slice scope and explicit non-scope
- changed domain, data, app, service, page, component, and style files
- tests added or updated
- `npm run quality` result
- visual QA result if a visible surface changed
- rollback boundary

Passing this runbook means the slice followed the engineering order. It does not approve a second participant or a larger phase.
