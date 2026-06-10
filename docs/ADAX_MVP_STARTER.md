# ADAX MVP Starter

## Project Position

ADAX is an offline-first electricity market multi-agent training sandbox. Its purpose is to let users experience transaction organization, transaction methods, result feedback, and review around a virtual provincial market.

ADAX is a training-grade simplified tool. It is not a real trading, pricing, bidding, settlement, investment, or production decision system.

## v0.1 Active Scope

v0.1 must stay focused on one complete, maintainable training path:

- Local runnable web prototype.
- Unified virtual provincial market.
- Start with a clear choice between execution mode and review mode.
- User sees market situation before operating.
- Participant selection remains in the flow.
- 售电公司 is the only active selectable operating participant.
- 火电、新能源、独立储能 may be shown as market ecosystem seats or later-planned seats, but they are not active operating flows in this baseline.
- Execution mode and review mode use the same scenario, participant, and eight-node trade chain.
- Execution mode focuses on operation and result visibility.
- Review mode focuses on materials, explanation, and decision reasoning around the same trade nodes.
- Training records are stored only in browser localStorage.
- Review materials are stored only in browser localStorage.
- Retail execution templates are imported/exported as local files.

## Retail Trade Nodes

The active retail workflow has eight nodes:

1. Market brief and supply-demand situation.
2. Customer load contract selection.
3. Retail package selection.
4. Annual bilateral transaction.
5. Monthly centralized auction.
6. Spot exposure and curve mismatch.
7. Settlement result.
8. Result review or knowledge consolidation.

## Retail Transaction Rules

- Annual bilateral transaction uses coverage ratio, bid price, and contract curve.
- Annual coverage ratio is 80%-120%.
- Annual bid price must meet the simulated counterparty floor price before the bilateral agreement is accepted.
- Annual contract curve options are flat curve and industrial-user curve.
- Monthly centralized auction uses participate / not participate decisions.
- Monthly windows are March, July, and December.
- Monthly curve options are flat curve and typical-month curve.
- 100% volume coverage does not mean zero spot exposure because contract curves and customer load curves can mismatch.
- Curve mismatch enters the risk adjustment and affects gross margin.
- Execution mode shows results without exposing formulas as the main user experience.

## Market Data Boundary

The active retail UI uses training-grade virtual market data at these levels:

- Annual supply-demand and price boundary.
- Three typical months.
- Three 24-hour typical-day curves.

Any future full 365-day package or higher-resolution market data must be introduced through domain models and tests before it is used by UI pages.

## Explicit Non-Goals

Do not implement these in the active v0.1 baseline:

- Real province reconstruction.
- Real market data import.
- External APIs.
- Backend storage.
- Login, account, or permission systems.
- Production-grade spot clearing.
- Real transaction declaration.
- Market operator workflow.
- Wholesale user workflow.
- Active fire-power, renewable, or storage operating workflows.
- Multi-agent adversarial market game.
- Formula-heavy explanation pages in the main operation flow.

## Quality Gate

A change is not complete until:

- Scope still matches this starter.
- Business logic remains outside React components.
- Template import validates shape and values before applying data.
- Typecheck passes.
- Domain tests pass.
- Build passes.
- Any unresolved risk is written in the handoff message.
