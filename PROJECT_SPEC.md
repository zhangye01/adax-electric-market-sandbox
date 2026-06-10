# ADAX v0.1 Project Spec

## Tool Purpose

ADAX is an offline-first electricity market multi-agent training sandbox. It helps users understand market roles, medium/long-term transactions, spot exposure, settlement, and review through a virtual provincial market.

The product trains transaction cognition and operation familiarity. It is not a production trading system and must not be presented as one.

## Confirmed v0.1 Scope

- Runnable local web prototype.
- Dual-mode training mechanism:
  - Execution mode: guided transaction simulation that answers "what operations happen in this transaction chain?"
  - Review mode: trade-node knowledge organization that answers "what should be understood behind this business node?"
  - Both modes must share the same scenario, participant selection, and eight-node retail chain.
- Retail market data package:
  - Annual supply-demand and price boundary.
  - Three typical months: March, July, and December.
  - Three 24-hour typical-day spot price curves.
  - Built-in virtual customer pools, package options, contract curve options, and counterparty floor price.
- One complete active training role:
  - Retailer operation training.
- Participant selection remains in the flow:
  - Retailer is the only active selectable operating participant in v0.1.
  - Thermal, renewable, and independent storage may appear as ecosystem seats or later-planned seats, but they are not active operating flows in this baseline.
- Retailer workflow:
  - Market brief and supply-demand situation.
  - Customer load contract selection.
  - Retail package selection.
  - Annual bilateral transaction.
  - Monthly centralized auction.
  - Spot exposure and curve mismatch.
  - Settlement result.
  - Result review or knowledge consolidation.
- Template import/export:
  - Retailer execution-state template.
  - JSON supported in v0.1.
- Training records saved only in browser localStorage.
- Review-mode materials saved only in browser localStorage.
- Review mode v0.1 supports text material slots only:
  - My understanding.
  - Teaching/rule excerpt.
  - Business case.

## Explicit Non-Goals

- No real trading system integration.
- No external market data API.
- No real province rule reconstruction.
- No production-grade spot clearing algorithm.
- No real transaction declaration.
- No market operator workflow.
- No wholesale user workflow.
- No active thermal, renewable, or independent-storage operation workflow in the current baseline.
- No multi-agent adversarial market game.
- No medium/long-term contract matching engine.
- No nodal price, network constraint, ancillary service, capacity mechanism, green power, or green certificate logic.
- No login, permission system, backend service, or database.
- No public deployment assumption.

## Risk Level

Risk level: B with selected C-grade guardrails.

Rationale: the prototype is a repeatable internal training tool with local file import/export and financial-looking outputs. Because electricity market settlement and bidding results can be misunderstood as decision advice, every result page must state that the model is virtual, simplified, and not suitable for real trading decisions.

## Implementation Rules

- Prefer the existing React/Vite project structure.
- Keep all data virtual and deterministic.
- Never use real market data or customer data in fixtures.
- If the prototype drifts toward a production trading system, stop feature work and enter Project Rescue.
- Preserve offline operation.
- Keep calculations explainable over highly complex realism.
- Do not implement execution mode and review mode as two disconnected products.
- Use a shared trade-node chain so execution and review are two views of the same transaction path.
- Keep current scope aligned with `docs/ADAX_MVP_STARTER.md`.
- Other participant calculations must not be wired into the active v0.1 user flow until their own startup card, domain model, and tests are accepted.
- Future UI overhaul must follow `UI_REQUIREMENTS.md`; ADAX should feel like a professional electricity market trading simulation cockpit, not a generic admin dashboard, BI report, big screen, or SaaS template.
