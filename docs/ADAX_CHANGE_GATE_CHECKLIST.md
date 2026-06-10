# ADAX Change Gate Checklist

Status: active.

Use this checklist before starting any non-trivial ADAX change. The purpose is to keep future work modular, testable, and aligned with the current retail training baseline.

## 1. Change Classification

Classify the requested change before editing.

| Change type | Allowed during current engineering hardening? | Required evidence |
| --- | --- | --- |
| Engineering process, docs, tests, scripts | Yes | Updated guardrail or automation artifact |
| Retail-domain validation or calculation | Yes, if it strengthens the existing retail path | Domain test proving the rule |
| Retail UI flow or operation surface | Yes, if it keeps operation clearer and cleaner | Typecheck, build, and visual QA when layout changes |
| Route, state, record, template, or storage behavior | Yes, if it preserves local-first boundaries | Domain/service test and local persistence guard |
| New participant workflow | No, unless explicitly re-entered by the user | Confirmed startup card first |
| Real market data, backend, account system, external API | No | Project Rescue, not implementation |
| GitHub Pages or release behavior | Yes, if it follows release process | `npm run publish:pages:dry` before real publish |

If the change does not fit a row, stop and write a short project-start or rescue note before coding.

## 2. Pre-Edit Gate

Before editing, confirm:

- Scope still matches `docs/ADAX_MVP_STARTER.md`.
- The change supports the active retail path or the engineering baseline.
- Execution mode and review mode remain on the same scenario, participant, and eight-node chain.
- The change has a clear target layer from `docs/ACTIVE_ARCHITECTURE_MAP.md`.
- No active code will import from `src/legacy/**`.
- No real province, customer, bid, transaction, settlement, or external market data is introduced.
- Any user-facing result continues to state the virtual, training-grade, non-production boundary where relevant.

## 3. Project Rescue Gate

Switch to Project Rescue before coding if any of these are true:

- The request would make ADAX look like a real trading, pricing, settlement, or investment system.
- The request adds active non-retailer operation before the startup card is confirmed.
- The request turns review mode into a generic file cabinet detached from trade nodes.
- Execution mode and review mode would need different scenario or node chains.
- The main operation surface becomes explanation-heavy instead of action-focused.
- Business rules would need to live in React components to make the change quickly.
- The implementation would require backend storage, login, permissions, or network APIs in v0.1.

## 4. Layer Placement Gate

Put the change in the narrowest correct layer.

| Need | Target layer |
| --- | --- |
| Validation, settlement, risk interpretation, workflow contracts | `src/domain/**` |
| Virtual market inputs and static training nodes | `src/data/**` |
| localStorage, template import/export, material persistence | `src/services/**` or `src/utils/adaxStorage.ts` |
| Browser route parsing and path generation | `src/routes/**` |
| Session orchestration and action coordination | `src/app/**` |
| Page composition | `src/pages/**` |
| Reusable operation and display surfaces | `src/components/**` |
| Release, repository, or local automation | `scripts/**` |
| Architecture or operating rules | `docs/**`, `AGENTS.md` |

Do not place settlement math, template parsing, route guards, or storage rules inside React components.

## 5. UI Flow Gate

For page or component changes, verify the intended user experience before implementation:

- 首页 stays an entry page; 关于 stays product explanation unless the product decision changes again.
- Operation pages prioritize what the user can do now.
- Persistent explanatory cards are avoided on formal operation pages.
- Execution hints stay hidden or button-adjacent.
- Review materials use the same physical locations as execution hints.
- Execution mode and review mode look structurally aligned when hints/materials are collapsed.
- Market supply-demand context appears before the user is expected to operate.
- The workspace preserves a professional electricity-market training feel, not a generic admin dashboard.

## 6. Test Selection Gate

Choose tests based on the touched behavior.

| Touched area | Required check |
| --- | --- |
| Domain calculation or validation | Add or update domain test, then run `npm run test` |
| Route guards or navigation | Add or update route/domain test, then run `npm run test` |
| Template import/export | Add or update service/domain test, then run `npm run test` |
| localStorage parsing | Add or update storage filtering test, then run `npm run test` |
| UI composition only | Run `npm run typecheck` and `npm run build`; add domain tests only if behavior changes |
| Visual layout or responsive structure | Run build and perform desktop/mobile visual QA; update visual QA log if material |
| Architecture, import, IO, or source-boundary rule | Run `npm run check:boundaries` |
| Broad refactor or source-size concern | Run `npm run audit:source` |
| Release process | Run `npm run publish:pages:dry` |
| Docs only | Run `git diff --check`; run broader checks if commands, scripts, or contracts changed |

For code changes, the default handoff gate remains:

```bash
npm run typecheck
npm run test
npm run build
```

## 7. Completion Evidence

A change is not complete until the handoff can answer:

1. What changed?
2. Why is it inside the current scope?
3. Which layer owns the new responsibility?
4. What tests or checks prove it?
5. What risk remains?
6. Whether GitHub Pages needs a real publish.

If any answer is vague, keep the change smaller or add evidence before handoff.
