# ADAX Active Architecture Map

This map describes the current active ADAX v0.1 code path. It is meant to help future work stay maintainable before new participant workflows are added.

## Active Boundary

Active v0.1 is the local retail-company training flow:

- one unified virtual provincial market
- execution mode and review mode on the same chain
- 售电公司 as the only active operating participant
- browser localStorage for records and review materials
- local template import/export for retail execution state

The active app must not import from:

- `src/legacy/**`
- `single-html-prototype.html`
- `dist/**`
- external market APIs or real market-data files

## Runtime Flow

```mermaid
flowchart TD
  URL["Browser URL"] --> Routes["routes/adaxRoutes.ts"]
  Routes --> RouteSync["app/useAdaxBrowserRouteSync.ts"]
  RouteSync --> Session["app/useAdaxTrainingSession.ts"]

  UserAction["User action"] --> Actions["app/createAdaxTrainingActions.ts"]
  Actions --> Session
  Actions --> Services["services/**"]
  Services --> Storage["utils/adaxStorage.ts"]

  Session --> Validation["domain/retailValidation.ts"]
  Session --> Calculation["domain/retailCalculations.ts"]
  Validation --> Settlement["Retail settlement result"]
  Calculation --> Settlement

  Session --> Renderer["app/AdaxPageRenderer.tsx"]
  Renderer --> Pages["pages/**"]
  Pages --> Components["components/**"]
  Components --> Data["data/**"]
  Components --> DisplayUtils["utils/formatters.ts + utils/retailDisplay.ts"]
```

## Layer Responsibilities

### `src/App.tsx`

Application shell only.

Allowed:

- call `useAdaxTrainingSession`
- render `Layout`
- render `AdaxPageRenderer`

Not allowed:

- business rules
- page selection branches
- route-guard logic
- localStorage or template IO

### `src/app/**`

Application orchestration.

- `useAdaxTrainingSession.ts`: owns state composition and derived settlement/validation values.
- `useAdaxBrowserRouteSync.ts`: owns browser URL, history, popstate, route normalization, and output-page route fallback.
- `createAdaxTrainingActions.ts`: owns user action handlers that coordinate state updates, records, review materials, and route writers.
- `AdaxPageRenderer.tsx`: owns page composition and page-level prop wiring.

Rules:

- browser history writes stay in `useAdaxBrowserRouteSync.ts`
- training action implementations stay in `createAdaxTrainingActions.ts`
- page imports stay in `AdaxPageRenderer.tsx`
- `useAdaxTrainingSession.ts` should remain a composition hook

### `src/domain/**`

Pure business and flow logic.

Current modules:

- `retailTypes.ts`
- `retailState.ts`
- `retailExecutionChain.ts`
- `retailExecutionWorkbench.ts`
- `retailCustomerLoadDisplay.ts`
- `retailPackageDisplay.ts`
- `retailAnnualBilateralDisplay.ts`
- `retailMonthlyAuctionDisplay.ts`
- `retailValidation.ts`
- `retailCalculations.ts`
- `retailMarketContext.ts`
- `retailRecords.ts`
- `retailResultDisplay.ts`
- `retailSettlementDisplay.ts`
- `retailReviewMaterials.ts`
- `retailScenarioSamples.ts`
- `retailWorkbenchAssist.ts`
- `adaxModeBoundary.ts`
- `adaxModelBoundary.ts`
- `adaxRecords.ts`
- `adaxFlowGuards.ts`
- `adaxModeDecision.ts`
- `adaxNavigation.ts`

Allowed:

- pure functions
- type definitions
- calculation and validation rules
- flow and navigation decisions

Not allowed:

- React imports
- `window`, `document`, `localStorage`, `Blob`, or DOM APIs
- direct file import/export
- UI text layout decisions

### `src/data/**`

Virtual training data and static training-node definitions.

Current modules:

- `adaxScenarioMeta.ts`
- `adaxRoles.ts`
- `retailMarketData.ts`
- `retailCurves.ts`
- `retailTrainingNodes.ts`
- `retailReviewMaterials.ts`

Rules:

- data remains virtual and training-grade
- no real province, customer, declaration, transaction, or settlement data
- full 365-day/high-resolution data must not enter active UI without a domain model and tests

### `src/services/**`

IO-facing application services.

Current modules:

- `retailExecutionTemplates.ts`
- `adaxTrainingRecords.ts`
- `adaxUserMaterials.ts`

Allowed:

- local template parsing and export preparation
- localStorage record/material coordination
- runtime validation before applying imported templates

Not allowed:

- React components
- settlement math
- real network APIs
- backend assumptions

### `src/utils/**`

Small shared helpers.

Current modules:

- `adaxStorage.ts`
- `download.ts`
- `formatters.ts`
- `retailDisplay.ts`

Rules:

- keep helpers narrow and UI-neutral when possible
- do not regrow broad business utility modules
- move business rules into `src/domain/**`

### `scripts/**`

Local engineering automation.

Current scripts:

- `audit-source-shape.mjs`: reports active source line pressure, layer size, and import fan-in/fan-out hotspots.
- `check-boundaries.mjs`: validates active source import, IO, network, data, and presentation-layer boundaries.
- `publish-pages.mjs`: runs the Pages release procedure for the current static preview.

Rules:

- scripts may coordinate local commands, file copying, release validation, and Git operations
- scripts must not contain ADAX business rules, settlement math, route logic, or UI behavior
- scripts must not import from `src/legacy/**`
- boundary scripts may encode current allowed exceptions, but new exceptions require architecture review
- publishing scripts must keep `main` and `gh-pages` responsibilities separated

### `docs/**` and `AGENTS.md`

Project operating system and engineering guardrails.

Current entry and gate documents:

- `AGENTS.md`: required entry point for future ADAX coding work.
- `docs/ADAX_MVP_STARTER.md`: scope baseline.
- `docs/ADAX_LONG_TERM_PLAN.md`: autonomous execution roadmap.
- `docs/ENGINEERING_BASELINE.md`: maintainability baseline and risk register.
- `docs/ADAX_CHANGE_GATE_CHECKLIST.md`: pre-change classification, rescue gate, layer placement, and test selection.
- `docs/ADAX_SOURCE_SHAPE_AUDIT.md`: source size and import hotspot audit for refactor prioritization.
- `docs/ADAX_RELEASE_PROCESS.md`: Pages publishing process.

Rules:

- update these documents when source boundaries, phase order, release flow, or guardrail rules change
- do not use docs to justify hidden scope expansion; update the startup card first
- keep checklists short enough to be usable before each change
- stale docs must be corrected before continuing feature work

### `src/styles/**`

Responsibility-based CSS partitions imported from `src/styles.css`.

Current high-level split:

- base and app shell styles, with app shell split into grid/sidebar shell, sidebar panel, sidebar navigation, and topbar
- home/about/records/flow page styles, with home split into shell/hero/sections/records/boundary, records split into shell/empty/cards/field-rows/detail/boundary, mode flow split into base/decision/confirmation/path/records, role flow split into cards/details/ecosystem/info-pack/seat-summary, scenario flow split into shell/market/activity/confirmation, and shared flow rows split into data-list/step-list/side-helper partitions
- cockpit base, summary, layout, form controls, action buttons, template actions, template field guides, panels, output, mode-card, comparison/event, feedback, notice, and message surface styles
- retail shell, node rail, operation head/content, execution context, assist entry, grid primitives, market board/load/price/months/briefs, trade base/reference/cards/controls/feedback, result base, settlement, result breakdown, result-review, and review styles
- responsive rules split by desktop/tablet/mobile/narrow breakpoints and mobile sub-surfaces

Rules:

- keep `src/styles.css` as the ordered import entry
- preserve import order when splitting CSS to avoid visual regressions
- split large CSS files by surface responsibility, not by arbitrary line count
- do not place behavior, business rules, or generated CSS output in this layer

### `src/pages/**`

High-level page composition.

Current pages:

- `AboutPage.tsx`
- `HomePage.tsx`
- `ModeSelectionPage.tsx`
- `ScenarioPage.tsx`
- `RolePage.tsx`
- `WorkspacePage.tsx`
- `RecordsPage.tsx`

Rules:

- pages may compose components and pass callbacks
- pages may present active data
- pages must not own settlement math, template parsing, or route guards
- mobile sidebar collapse and shell-level responsive navigation stay in `Layout.tsx` and app-layout styles, not individual pages

### `src/components/**`

Reusable UI and retail work surfaces.

Rules:

- components should render controls, panels, charts, and local UI states
- complex transaction validation belongs in domain modules
- execution/review layout should stay structurally aligned where they represent the same node chain
- `RetailMarketSituationBoard.tsx` renders the shared market context for scenario and retail workspace pages; market context derivation stays in `src/domain/retailMarketContext.ts`
- `RetailSettlementSignalBoard.tsx` renders shared exposure and settlement result signals across workspace, settlement, and execution result-review surfaces; exposure/cost-stack display interpretation stays in `src/domain/retailSettlementDisplay.ts`
- execution workspace node context, status, input/output artifact counts, and next-action labels stay in `src/domain/retailExecutionWorkbench.ts`; `RetailExecutionWorkspace.tsx` renders that contract
- customer load node segment progress, customer mix, available capacity, and status copy stay in `src/domain/retailCustomerLoadDisplay.ts`; `RetailCustomerLoadNode.tsx` renders that contract in a primary-action plus reference-feedback layout
- retail package node option list, price text, selected package feedback, and status copy stay in `src/domain/retailPackageDisplay.ts`; `RetailPackageNode.tsx` renders that contract in the same primary-action plus reference-feedback layout
- annual bilateral node deal tone, completion count, reference bounds, and status copy stay in `src/domain/retailAnnualBilateralDisplay.ts`; `RetailAnnualBilateralNode.tsx` renders that contract in a primary-action plus reference-feedback layout
- monthly auction node window progress, participation counts, window status, and reference ranges stay in `src/domain/retailMonthlyAuctionDisplay.ts`; `RetailMonthlyAuctionNode.tsx` renders that contract in the same primary-action plus reference-feedback layout
- mobile retail workspace ordering is a responsive layout concern: current operation panel comes before result feedback and node rail so the active market/operation board is not buried below navigation
- retail execution action nodes are split by node: package, annual bilateral, and monthly auction
- retail review is split into workspace composition, material grid, and output panel

## Active Data Flow

1. `routeFromLocation` reads current browser URL into `{ page, mode, role }`.
2. `useAdaxBrowserRouteSync` keeps route state, legacy merged product paths, participant query params, and guarded output URLs synchronized.
3. `useAdaxTrainingSession` composes React state and derives validation/settlement.
4. `createAdaxTrainingActions` updates state, records, materials, and routes in response to user actions.
5. Retail validation and settlement come from `src/domain/**`.
6. Records and review materials persist through `src/services/**` and `src/utils/adaxStorage.ts`.
7. `AdaxPageRenderer` renders the active page and passes only the needed props.

## Import Rules

Preferred direction:

```text
App
  -> app
  -> pages
  -> components

app
  -> domain/routes/services/utils/data

pages/components
  -> domain/data/services/utils

services
  -> domain/data/utils

domain
  -> domain types only
```

Forbidden:

- `src/domain/**` importing React, services, browser APIs, pages, or components
- active code importing `src/legacy/**`
- React components importing old prototype data packages
- pages/components writing browser history directly
- calculation logic placed inside React components

## Test Coverage Map

Current no-dependency tests live in `tests/domain/retail-domain.test.mjs`.

Covered:

- retail state validation
- retail execution chain continuity
- retail settlement calculation
- 100% total volume coverage still producing hourly curve mismatch, positive/negative exposure, and risk adjustment
- execution-mode result display contract without formula-heavy copy
- shared model-boundary copy for financial-looking training outputs
- annual bilateral coverage bounds, counterparty-floor rejection/acceptance, selected curve preservation, and invalid annual template rejection
- monthly auction windows, explicit participation decisions, coverage bounds, curve selection, opt-out zero calculation, hidden skipped-field rejection, and invalid monthly template rejection
- market situation context for annual boundary, three monthly windows, and three 24-hour typical-day curves
- settlement display hierarchy for result signals, exposure signals, and cost-stack items
- execution workspace context contract for node status and next action
- customer load display contract for segment progress and mix status
- retail package display contract for option status and price text
- annual bilateral display contract for primary action status and counterparty feedback
- monthly auction display contract for window progress and status
- retail execution template round trip and invalid import rejection
- execution record snapshot, localStorage filtering, latest-20 cap, and saved-record revisit target
- review material scope, invalid material filtering, empty-save blocking, review record snapshot, and review revisit target
- review-mode vs execution-result-review boundary
- route helpers
- route-sync decisions
- flow guards
- navigation shell rules

Next useful coverage:

- session action decisions without browser history
- browser visual QA for professional market immersion changes

## Current Risk

The biggest remaining active risk entering Phase 5 is scope expansion without a startup card. New participant workflows must not enter active code until scope, data, rules, UI contracts, and tests are explicitly defined.
