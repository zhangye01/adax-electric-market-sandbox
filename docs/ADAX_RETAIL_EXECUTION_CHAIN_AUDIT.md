# ADAX Retail Execution Chain Audit

Date: 2026-06-10

Phase: Phase 2 - Retail Execution Closure

## Question

Do the eight retail execution nodes form one linked trading scenario, or are they only a set of fragmented forms?

## Current Finding

The active UI already presents a sequential 8-node chain:

1. 市场行情
2. 客户负荷
3. 零售套餐
4. 年度双边采购
5. 月度集中竞价
6. 现货敞口
7. 模拟结算
8. 交易结果回看

Before this audit, the linkage was mostly implicit in UI order, validation, and settlement calculation. That was not strong enough as a long-term engineering guardrail.

## Engineering Control Added

`src/domain/retailExecutionChain.ts` now defines the execution-chain contract:

- each node id
- step order
- artifacts consumed by the node
- artifacts produced for downstream nodes

The contract makes the scenario chain explicit:

- market context feeds customer and procurement decisions
- customer load feeds package revenue, annual contracts, monthly auctions, and exposure
- annual and monthly contract positions feed spot exposure
- exposure and procurement costs feed settlement
- settlement feeds result review and record creation

## Test Coverage Added

`tests/domain/retail-domain.test.mjs` now verifies:

- domain chain order matches `retailTrainingNodes`
- step numbers match UI node order
- each downstream node consumes artifacts produced by earlier nodes
- settlement consumes curve mismatch risk
- result review consumes settlement result

## Decision

The eight retail execution nodes now have an explicit, tested linked-scenario contract.

Phase 2 can proceed to detailed transaction behavior checks:

1. annual bilateral coverage, counterparty-floor rejection, and curve selection
2. monthly centralized auction participate / not participate behavior
3. curve mismatch and spot exposure under 100% volume coverage
