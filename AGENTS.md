# ADAX Agent Rules

This file is the required entry point for any future ADAX coding work.

## Read Before Editing

Read these files before changing code:

1. `docs/ADAX_MVP_STARTER.md`
2. `docs/ADAX_LONG_TERM_PLAN.md`
3. `docs/ENGINEERING_BASELINE.md`
4. `docs/ADAX_CHANGE_GATE_CHECKLIST.md`
5. `docs/ACTIVE_ARCHITECTURE_MAP.md`
6. `PROJECT_SPEC.md`
7. `GUARDRAILS.md`
8. `TEST_CASES.md`
9. `UI_REQUIREMENTS.md`

Read `docs/ADAX_RELEASE_PROCESS.md` before publishing, changing Pages configuration, changing Vite build base paths, or touching `gh-pages`.

Read `docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md` before changing `src/domain/retailTypes.ts`, `src/types.ts`, or `scripts/check-domain-contracts.mjs`.

Read `docs/ADAX_ENGINEERING_READINESS_AUDIT.md` before changing Engineering Hardening Hold status or resuming feature expansion.

Read `docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md` before deciding whether Engineering Hardening Hold can be lifted.

Read `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md` before preparing any feature-expansion implementation plan.

Read `docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md` before selecting any Phase 5 participant candidate or leaving Engineering Hardening Hold for participant expansion.

Read `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md` before entering Phase 5 or implementing any new participant workflow.

Read `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md` before choosing between renewable, independent storage, and thermal implementation.

Read `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md` before implementing the renewable candidate.

Read `docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md` before implementing the independent-storage candidate.

Read `docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md` before implementing the thermal candidate.

If those files conflict, treat `docs/ADAX_MVP_STARTER.md` as the scope baseline, `docs/ADAX_LONG_TERM_PLAN.md` as the execution roadmap, and update the stale document before continuing feature work.

## Current Active Scope

ADAX v0.1 is a local React/Vite prototype for electricity market transaction training.

The active implementation scope is:

- 售电公司 execution mode.
- 售电公司 review mode.
- One unified virtual provincial market.
- Eight shared retail trade nodes.
- Template import/export for the retail execution state.
- Review materials stored by scenario, participant, and trade node.
- Training records stored in browser localStorage.

Other participant types may appear as product seats or planning context, but they are not active operational flows in v0.1.

## Engineering Rules

- Do not add new business scope while engineering baseline work is in progress.
- For an open-ended "继续", follow `docs/ADAX_LONG_TERM_PLAN.md` and continue the current phase's next action.
- Use `docs/ADAX_CHANGE_GATE_CHECKLIST.md` before starting any non-trivial change.
- Keep business rules in `src/domain/**`.
- Keep browser persistence and template IO in `src/services/**` or `src/utils/**`.
- Keep page components focused on flow and composition.
- Do not place calculation logic inside React components.
- Do not use real province data, real customer data, real bids, real transaction records, or external market APIs.
- Do not make review mode a separate product flow; it must stay attached to the same scenario, participant, and trade-node chain as execution mode.
- Do not import legacy photovoltaic prototype code into the ADAX retail flow.
- Do not edit `dist/`, `node_modules/`, or generated temporary output.

## Required Checks

Run these before handing off a code change:

- `npm run check:engineering-guardrails`
- `npm run check:boundaries`
- `npm run check:domain-contracts`
- `npm run check:source-shape`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Preferred combined gate: `npm run quality`.

If one cannot be run, state the reason explicitly.

## Publishing Rules

- Public preview URL: `https://zhangye01.github.io/adax-electric-market-sandbox/`.
- Source code is pushed to `main`.
- GitHub Pages is served from `gh-pages`.
- `dist/` remains ignored in the source repo; publish it only through the static release repo described in `docs/ADAX_RELEASE_PROCESS.md`.
- Use `npm run publish:pages:dry` before a real Pages publish.
- Use `npm run publish:pages -- --yes` for a real Pages publish.
- Do not add or push `.github/workflows/**` unless GitHub CLI has `workflow` scope and the Pages deployment strategy has been intentionally changed.

## Project Rescue Triggers

Pause feature work and switch to Project Rescue if any of these happen:

- The requested change expands v0.1 beyond the confirmed active scope.
- The implementation starts mixing legacy prototype pages into the retail flow.
- A new feature requires backend storage, login, network APIs, or real market data.
- Calculations become difficult to explain in user-facing review.
- Execution mode and review mode diverge into different scenario or participant chains.
- UI additions make the operation surface explanation-heavy instead of action-focused.
