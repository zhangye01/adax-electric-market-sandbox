# ADAX Engineering Readiness Audit

Date: 2026-06-11

Status: Engineering Hardening Hold is active.

This audit is the current handoff baseline for maintainability work. It is not a feature specification and does not authorize Phase 5 participant expansion.

## Readiness Decision

ADAX is ready to continue engineering hardening on the current retail baseline.

ADAX is not yet ready for new participant implementation unless the user explicitly resumes feature expansion and confirms the target participant startup card.

## Scope Baseline

Current active product scope:

- one unified virtual provincial market
- 售电公司 execution mode
- 售电公司 review mode
- one shared eight-node retail transaction chain
- local browser storage for training records and review materials
- retail template import/export

Out of current implementation scope:

- new active participant workflows
- real province data
- backend storage, login, accounts, or external market APIs
- production trading, filing, or investment-decision use
- renewable, independent-storage, or thermal implementation without a confirmed startup card

## Current Quality Evidence

Latest full quality command:

```bash
npm run quality
```

Result on 2026-06-12: passed.

Latest quality coverage:

| Gate | Latest evidence |
| --- | --- |
| Engineering guardrails | 23 required files checked; source-repository artifacts excluded; Phase 5 remains closed. |
| Boundary check | 104 source files checked. |
| Domain contracts | `src/domain/retailTypes.ts` exports checked: 33; `src/types.ts` exports checked: 8. |
| Source shape | 223 source files checked; 1 budgeted pressure file. |
| Typecheck | `tsc -b` passed. |
| Tests | 85 tests passed. |
| Build | `vite build` passed. |

Latest source-shape command:

```bash
npm run audit:source
```

Result on 2026-06-11: passed.

Current source-shape snapshot:

| Metric | Value |
| --- | --- |
| Active source files | 223 |
| Code files | 104 |
| Style files | 119 |
| Total active source lines | 14810 |
| Watch line threshold | 220 code / 400 CSS |
| High line threshold | 300 code / 800 CSS |

Current line-pressure file:

| File | Lines | Required control |
| --- | --- | --- |
| `src/domain/retailTypes.ts` | 257 | Follow `docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md`; keep central exports conservative and test-backed. |

Run the full gate before handing off any code change:

```bash
npm run quality
```

## Guardrail Matrix

| Area | Current guardrail |
| --- | --- |
| Scope and drift | `AGENTS.md`, `docs/ADAX_MVP_STARTER.md`, `docs/ADAX_CHANGE_GATE_CHECKLIST.md` |
| Long-term execution | `docs/ADAX_LONG_TERM_PLAN.md` |
| Hardening exit decision | `docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md` |
| Feature resumption decision | `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md` |
| Phase 5 entry | `docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md`, `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md`, `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`, `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md`, `docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md`, `docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md`, `scripts/check-engineering-guardrails.mjs`, `tests/scripts/check-engineering-guardrails.test.mjs` |
| Quality pipeline | `package.json`, `scripts/check-engineering-guardrails.mjs`, `tests/scripts/check-engineering-guardrails.test.mjs` |
| Source repository artifacts | `docs/ADAX_RELEASE_PROCESS.md`, `scripts/check-engineering-guardrails.mjs`, `tests/scripts/check-engineering-guardrails.test.mjs` |
| Source boundaries | `docs/ACTIVE_ARCHITECTURE_MAP.md`, `scripts/check-boundaries.mjs`, `tests/scripts/check-boundaries.test.mjs` |
| Central contracts | `docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md`, `scripts/check-domain-contracts.mjs`, `tests/scripts/check-domain-contracts.test.mjs` |
| Source shape | `docs/ADAX_SOURCE_SHAPE_AUDIT.md`, `scripts/check-source-shape.mjs`, `tests/scripts/check-source-shape.test.mjs` |
| App decisions | `tests/app/adax-training-actions.test.mjs`, `tests/app/adax-route-sync-decisions.test.mjs`, `tests/app/adax-session-derivations.test.mjs` |
| Shared test setup | `tests/support/retail-fixtures.mjs`, `tests/support/browser-fixtures.mjs` |
| Publishing | `docs/ADAX_RELEASE_PROCESS.md`, `scripts/publish-pages.mjs`, `scripts/check-engineering-guardrails.mjs` |

## Remaining Engineering Risks

| Risk | Level | Current control |
| --- | --- | --- |
| New participant implementation starts before scope confirmation | High | Keep Phase 5 closed until user confirms feature expansion and the participant startup card. |
| Candidate startup cards are accidentally treated as approved | High | `npm run check:engineering-guardrails` fails if renewable, independent-storage, or thermal startup cards lose their pending-user-confirmation statements. |
| Closed Phase 5 participant runtime files appear silently | High | `npm run check:engineering-guardrails` fails if active source adds renewable, independent-storage, or thermal runtime files while Phase 5 remains closed. |
| Closed participant id leaks into generated active URLs | Medium | `pathForPage` normalizes generated participant URLs back to `retailer`; `tests/domain/retail-domain.test.mjs` covers closed participant inputs. |
| Closed participant records or materials enter active localStorage | Medium | `getAdaxTrainingRecords`, `saveAdaxTrainingRecord`, `getAdaxUserMaterials`, `saveAdaxUserMaterials`, and `upsertUserMaterial` keep active persisted data limited to `retailer`; `tests/domain/retail-domain.test.mjs` covers closed participant records and materials. |
| Engineering status becomes chat-memory-only | Medium | Keep this audit current and link it from `AGENTS.md`, `docs/ENGINEERING_BASELINE.md`, and `docs/ADAX_LONG_TERM_PLAN.md`. |
| Preview publishing path drifts from source branch | Medium | Use `docs/ADAX_RELEASE_PROCESS.md`; `npm run check:engineering-guardrails` verifies the package publishing commands, release-process gate phrases, and `scripts/publish-pages.mjs` quality/push safeguards. `tests/scripts/publish-pages.test.mjs` rejects real publishing when quality is skipped. |
| Generated build, coverage, or cache output is committed to `main` | Medium | Keep generated output in ignored local directories or the `gh-pages` static release path; `npm run check:engineering-guardrails` rejects tracked `dist/`, `coverage/`, `.vite/`, and `.test-build/` files. |
| Hardening exit audit becomes stale after later changes | Medium | Keep `docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md` synchronized with the latest quality evidence; `npm run check:engineering-guardrails` rejects removal of its verification snapshot and freshness rule. |
| GitHub workflow files are added without token/workflow-scope confirmation | Medium | Keep `.github/workflows/**` blocked unless the deployment strategy intentionally changes. |
| Template import/export corrupts session state | Medium | Keep template IO in services and preserve round-trip and invalid-import tests. |
| UI changes reduce professional market immersion | Medium | Use `docs/ADAX_VISUAL_QA_CHECKLIST.md` and browser QA when changing operation surfaces. |
| App action tests grow repetitive | Low | Extract shared app action harnesses only if more stateful scenarios are added. |

## Feature Expansion Entry Gate

Do not enter Phase 5 or implement a new participant until all of these are true:

1. The user explicitly says to resume feature expansion.
2. The target participant startup card is confirmed.
3. `npm run quality` passes on the current baseline.
4. No Project Rescue trigger is active.
5. The new participant has defined scope, data, rules, UI contracts, and tests before code starts.

## Next Recommended Action

Keep Engineering Hardening Hold active.

If continuing autonomously, use `docs/ADAX_CHANGE_GATE_CHECKLIST.md` before each change and keep this audit current when a guardrail, quality gate, source-shape budget, or active risk changes.

Use `docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md` before deciding whether Engineering Hardening Hold can be lifted.

Use `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md` before preparing any feature-expansion implementation plan.

Do not review or implement `docs/ADAX_RENEWABLE_STARTUP_CARD.md`, `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md`, or `docs/ADAX_THERMAL_STARTUP_CARD.md` until the user explicitly resumes participant expansion. Use `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md`, `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md`, and the relevant entry dry run before deciding whether any new participant is ready for code.
