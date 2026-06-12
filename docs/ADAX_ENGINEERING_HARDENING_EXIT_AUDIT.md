# ADAX Engineering Hardening Exit Audit

Date: 2026-06-11

Status: exit audit complete. Engineering Hardening Hold is ready for user decision.

Phase 5 remains closed.

This audit records whether the current engineering-hardening phase is strong enough to support a controlled decision about future feature expansion. It is not a feature approval and does not open renewable, independent-storage, or thermal implementation.

Do not resume feature expansion until the user explicitly confirms the project is ready, confirms exactly one participant startup card, and `npm run quality` passes.

## Decision

ADAX now has a maintainability baseline that is ready for user review.

The current evidence supports leaving the pure hardening phase only as a deliberate product decision. It does not support automatic continuation into Phase 5.

## Scope State

Current active runtime scope remains:

- one unified virtual provincial market
- 售电公司 execution mode
- 售电公司 review mode
- one shared eight-node retail transaction chain
- local browser storage for records and review materials
- retail template import/export

Still closed:

- 新能源 active workflow
- 独立储能 active workflow
- 火电 active workflow
- 市场运营机构 workflow
- 批发用户 workflow
- real province data
- backend, accounts, login, or external APIs

## Evidence Matrix

| Area | Evidence | Exit reading |
| --- | --- | --- |
| Scope baseline | `AGENTS.md`, `docs/ADAX_MVP_STARTER.md`, `docs/ADAX_LONG_TERM_PLAN.md` | Active implementation stays retail-only. |
| Architecture map | `docs/ACTIVE_ARCHITECTURE_MAP.md` | Runtime layers and source boundaries are documented. |
| Change gate | `docs/ADAX_CHANGE_GATE_CHECKLIST.md` | Non-trivial changes have a pre-edit classification path. |
| Engineering baseline | `docs/ENGINEERING_BASELINE.md` | Maintainability risks and controls are tracked. |
| Current readiness | `docs/ADAX_ENGINEERING_READINESS_AUDIT.md` | Hardening hold status and feature-expansion gate are explicit. |
| Feature resumption decision | `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md` | Resume-development decisions must be explicit and ordered. |
| Phase 5 gate | `docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md` | Candidate comparison exists; implementation remains closed. |
| Phase 5 rehearsal | `docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md` | Entry decision can be rehearsed before code. |
| Phase 5 scope control | `docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md` | Only one future participant may be selected per wave. |
| Candidate dry runs | `docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md`, `docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md`, `docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md` | Candidate-specific gaps are visible before implementation. |
| Startup cards | `docs/ADAX_RENEWABLE_STARTUP_CARD.md`, `docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md`, `docs/ADAX_THERMAL_STARTUP_CARD.md` | Future participant scopes exist but remain unconfirmed. |
| Quality gate | `npm run quality` | Engineering guardrails, boundaries, contracts, source shape, typecheck, tests, and build run as one gate. |
| Guardrail script | `scripts/check-engineering-guardrails.mjs` | Required governance files, references, package scripts, publishing safeguards, source-repository artifacts, GitHub workflow files, test targets, Phase 5 closed phrases, and closed participant runtime files are checked. Real publishing cannot skip the quality gate. |
| Script tests | `tests/scripts/check-engineering-guardrails.test.mjs` | The engineering guardrail behavior has negative fixtures. |
| Route containment | `src/routes/adaxRoutes.ts` | Generated participant URLs normalize back to retailer while Phase 5 is closed. |
| Persistence containment | `src/utils/adaxStorage.ts`, `src/services/adaxUserMaterials.ts` | Active records and materials are filtered to retailer while Phase 5 is closed. |

## Latest Verification Snapshot

Current recorded handoff evidence:

| Check | Latest evidence |
| --- | --- |
| Full quality gate | `npm run quality` on 2026-06-12: passed. |
| Script tests | 86 tests passed, including engineering guardrail, boundary, source-shape, domain-contract, publishing, domain, app, route-sync, and session-derivation tests. |
| Build | `tsc -b && vite build` passed through the quality gate. |
| Source artifact boundary | `npm run check:engineering-guardrails` verifies that tracked `dist/`, `coverage/`, `.vite/`, and `.test-build/` artifacts are excluded from `main`. |
| Pages workflow boundary | `npm run check:engineering-guardrails` rejects `.github/workflows/**` under the current local-script Pages strategy. |
| Runtime scope | Active source remains retail-only; closed Phase 5 participant runtime files are still rejected by guardrail. |

Freshness rule: `npm run quality` must be rerun after any later source, guardrail, or release-process change before using this audit to lift the hold.

## Hardening Outcomes

- The project has a documented operating path from entry rules to long-term phase order.
- Business logic, browser IO, route handling, app orchestration, page composition, and UI components have declared boundaries.
- Retail calculation and validation contracts are covered by domain tests.
- App navigation, browser route sync, and session derivations are covered by app tests.
- Engineering guardrails are part of the normal quality gate.
- Closed Phase 5 scope is protected at document, package-script, active source, URL, and localStorage layers.
- GitHub Pages publishing is documented separately from source development.
- Generated build, coverage, cache, and test artifacts are excluded from the source repository by the engineering guardrail.
- GitHub Actions workflow files are excluded while Pages publishing remains a local script pushing `gh-pages`.

## Exit Criteria Check

| Criterion | Result | Evidence |
| --- | --- | --- |
| Engineering baseline is current | Pass | `docs/ENGINEERING_BASELINE.md`, `docs/ADAX_ENGINEERING_READINESS_AUDIT.md` |
| Active architecture map is current | Pass | `docs/ACTIVE_ARCHITECTURE_MAP.md` |
| Current retail-only scope is protected | Pass | route and storage containment plus engineering guardrail runtime scan |
| Phase 5 remains closed | Pass | Phase 5 audit, rehearsal, matrix, and dry-run documents |
| Future participant entry requires user confirmation | Pass | `docs/ADAX_LONG_TERM_PLAN.md`, `docs/ADAX_ENGINEERING_READINESS_AUDIT.md` |
| Quality gate can prove the baseline | Pass for current handoff; rerun before lift | Latest verification snapshot; `npm run quality` |

## Remaining Risks

| Risk | Level | Required control |
| --- | --- | --- |
| User has not selected the next participant | High | Do not resume feature expansion without explicit selection. |
| Candidate startup cards are not confirmed | High | Show and confirm exactly one startup card before implementation. |
| Feature pressure bypasses hardening gates | Medium | Start every non-trivial change from `docs/ADAX_CHANGE_GATE_CHECKLIST.md`. |
| UI drift returns during feature work | Medium | Use browser QA and `docs/ADAX_VISUAL_QA_CHECKLIST.md` before visual handoff. |
| Publishing is confused with source changes | Medium | Follow `docs/ADAX_RELEASE_PROCESS.md`; keep `main` and `gh-pages` responsibilities separate. |
| Generated artifacts enter source history | Medium | Keep build, coverage, cache, and test output untracked in `main`; `npm run check:engineering-guardrails` rejects tracked generated artifacts. |
| GitHub Actions deployment appears without strategy change | Medium | Keep `.github/workflows/**` absent unless authorization and Pages strategy are intentionally changed; `npm run check:engineering-guardrails` rejects workflow files. |

## Allowed Next Actions

Allowed during Engineering Hardening Hold:

- update guardrail docs when source boundaries or risks change
- improve tests, scripts, or small refactors that reduce maintenance risk
- rerun quality gates and record evidence

Allowed only after user confirmation:

- use `docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md`
- select exactly one Phase 5 participant
- confirm the relevant startup card
- prepare a code-level implementation plan for that participant
- implement the selected participant after `npm run quality` passes on the baseline

## Handoff Rule

Engineering Hardening Hold is ready for user decision, but it is not automatically lifted.

The next agent should keep the hold active unless the user explicitly says to resume feature expansion and confirms exactly one participant startup card.
