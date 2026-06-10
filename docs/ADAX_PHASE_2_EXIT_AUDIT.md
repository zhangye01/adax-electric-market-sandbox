# ADAX Phase 2 Exit Audit

Date: 2026-06-10

Phase: Phase 2 - Retail Execution Closure

## Question

Is the active 售电公司 execution mode complete enough to serve as a credible v0.1 training run before ADAX moves into retail review closure?

## Scope

This exit audit covers only the active v0.1 retail-company execution path:

- execution mode route flow
- unified virtual market scenario
- retail participant selection
- eight retail trade nodes
- annual bilateral transaction
- monthly centralized auction
- spot exposure and curve mismatch
- settlement result display
- execution result review
- local training-record save and revisit
- model-boundary notice on result surfaces

No backend, login, real-market data, non-retailer operating flow, production trading advice, or new participant behavior was introduced.

## Exit Criteria Evidence

### 1. The eight retail nodes form one linked scenario.

Evidence:

- `src/domain/retailExecutionChain.ts` defines the node input/output contract.
- `src/data/retailTrainingNodes.ts` uses the same node order.
- `tests/domain/retail-domain.test.mjs` verifies that the contract order matches the UI node order and that downstream nodes consume upstream artifacts.
- `docs/ADAX_RETAIL_EXECUTION_CHAIN_AUDIT.md` records the detailed audit.

Decision: pass.

### 2. The annual bilateral transaction is explicit and bounded.

Evidence:

- Empty state has no default coverage ratio, bid price, or curve choice.
- `validateAnnualBilateral` enforces 80%-120% coverage.
- Bids below the simulated counterparty floor produce the rejection message: "对手方不接受该价格，年度双边协议无法达成。"
- Annual curve choice is required and preserved in settlement.
- `docs/ADAX_ANNUAL_BILATERAL_AUDIT.md` records the detailed audit.

Decision: pass.

### 3. The monthly centralized auction is explicit and typical-month based.

Evidence:

- `retailTypicalMonths` is fixed to March, July, and December.
- Empty state starts each month with `participates: null`.
- Validation requires participate / not participate for all three months.
- Skipped months must keep coverage, price, and curve empty.
- Participating months require coverage, bid price, and monthly contract curve.
- `docs/ADAX_MONTHLY_AUCTION_AUDIT.md` records the detailed audit.

Decision: pass.

### 4. 100% total volume coverage can still produce spot exposure.

Evidence:

- Settlement calculates 24-hour typical-day exposure from customer load curves and contract curves.
- Tests prove 100% annual volume coverage can still produce positive exposure, negative exposure, and risk adjustment.
- `docs/ADAX_CURVE_MISMATCH_AUDIT.md` records the detailed audit.

Decision: pass.

### 5. Execution result display is understandable without formulas.

Evidence:

- `src/domain/retailResultDisplay.ts` owns the plain-language result interpretation contract.
- Workspace result snapshot and settlement page consume the shared interpretation.
- Tests verify the result interpretation sequence and reject formula-heavy/internal-field copy.
- `docs/ADAX_RESULT_DISPLAY_AUDIT.md` records the detailed audit.

Decision: pass.

### 6. Financial-looking outputs show the training boundary.

Evidence:

- `src/domain/adaxModelBoundary.ts` defines a shared model-boundary contract.
- `src/components/adax/ModelBoundaryNotice.tsx` renders the shared boundary notice.
- The notice appears on:
  - workspace result snapshot after generating a result
  - settlement detail page
  - execution-mode result review page
- Tests verify the boundary copy states virtual market, training-grade simplification, no real province result, and no real trading/investment use.

Decision: pass after this audit's fix.

### 7. Execution records are stable in localStorage.

Evidence:

- Execution records preserve retail decisions, settlement result, scenario identity, participant identity, and revisit target.
- Record parsing filters corrupted or invalid localStorage entries.
- Record storage keeps the latest 20 entries.
- Old/basic records remain readable but do not expose a broken revisit action.
- `docs/ADAX_RECORD_REVISIT_AUDIT.md` records the detailed audit.

Decision: pass.

## Remaining Non-Blocking Risks

These items are not Phase 2 blockers, but they should stay visible:

- Session actions are still primarily covered through domain-level contracts rather than direct hook/action tests.
- Browser visual QA should be repeated when Phase 3 changes review-mode materials.
- The active flow remains 售电公司 only; adding 新能源、独立储能、火电 still requires separate startup cards and domain tests.
- The UI can still improve professional market immersion in Phase 4, especially around market situation visual density.

## Decision

Phase 2 is acceptable to close for the current v0.1 engineering baseline.

The next phase should start Retail Review Closure:

1. keep review mode on the same eight-node chain
2. strengthen material persistence edge cases
3. improve review-record revisit behavior
4. keep review mode distinct from execution result review
