# ADAX Retail Contract Governance

状态：Engineering Hardening Hold 下的中心契约治理规则。

本文件约束 `src/domain/retailTypes.ts`。它是当前 ADAX 售电主线的中心类型契约，导入方多，不能因为行数压力而随意拆分，也不能在新增业务时静默扩张。

## Current Contract Groups

`npm run check:domain-contracts` 按分组和顺序审查中心导出。

`src/domain/retailTypes.ts` 当前分组：

1. Retail identity and workflow keys: 角色、月份、典型日、风险、节点等稳定枚举。
2. Execution decision state: 售电公司执行模式的用户决策状态。
3. Validation result: 域校验返回结构。
4. Virtual market data contract: 训练级虚拟市场输入数据结构。
5. Calculation intermediate contracts: 计算过程的中间结果结构。
6. Settlement output contract: 执行模式结算输出结构。
7. Execution record contract: 本地执行记录快照结构。

`src/types.ts` 当前分组：

1. App route and mode keys.
2. Local record and material contracts.

## Change Rules

新增或修改中心契约前先判断归属：

- 只服务一个展示组件的字段，优先放入对应 `src/domain/*Display.ts` 返回结构，不进入 `retailTypes.ts`。
- 只服务一个计算模块的内部中间值，优先留在该计算模块内部或窄的 helper 类型中。
- 影响模板导入、localStorage 记录、结算输出、训练状态或多模块共享的数据，才允许考虑进入 `retailTypes.ts`。
- 新主体工作流不得借用 `retailTypes.ts` 偷偷扩展 active v0.1 范围；必须先有已确认的 participant startup card。

任何中心导出新增、删除、重命名或重排，都必须同时更新：

- `scripts/check-domain-contracts.mjs`
- 本文件的分组说明
- `docs/ADAX_SOURCE_SHAPE_AUDIT.md`
- 覆盖该契约的 domain/service 测试

## Split Triggers

不要为了让 `retailTypes.ts` 低于 watch 阈值而机械拆分。只有出现以下情况之一，才考虑把中心契约拆成分类文件并由 `retailTypes.ts` 重新导出：

- 用户明确确认进入新主体开发，且共享类型开始跨售电/新能源/储能复用。
- 某个分组连续多轮变更，说明它已经形成独立模型边界。
- `retailTypes.ts` 同时出现高行数压力和高变更频率。
- 类型拆分可以减少真实依赖面，而不是只把导入路径隐藏到 barrel 文件后面。

拆分时必须保持外部导入迁移可控，并先更新 `check-domain-contracts` 的分组检查。

## Current Decision

当前不拆 `retailTypes.ts`。

理由：

- 它是 45 个 active importer 依赖的中心契约。
- 当前问题是未来扩张风险，不是职责混乱或行为缺陷。
- `check-domain-contracts` 已进入 `npm run quality`，并且现在按分组和顺序审查导出。
- 继续扩业务前，中心契约应保持稳定；新增业务优先进入窄 domain 模块和 startup card。
