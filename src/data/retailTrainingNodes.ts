import type { RetailNodeId } from "../domain/retailTypes";

export interface RetailTrainingNode {
  id: RetailNodeId;
  step: number;
  title: string;
  executionAction: string;
  reviewFocus: string;
}

export const retailTrainingNodes: RetailTrainingNode[] = [
  {
    id: "marketBrief",
    step: 1,
    title: "市场行情",
    executionAction: "阅读年度、月度和典型日行情。",
    reviewFocus: "理解供需和价格环境如何形成交易依据。"
  },
  {
    id: "customerLoad",
    step: 2,
    title: "客户负荷",
    executionAction: "从可签约客户池中配置签约电量。",
    reviewFocus: "理解客户结构如何影响负荷曲线和套餐适配。"
  },
  {
    id: "retailPackage",
    step: 3,
    title: "零售套餐",
    executionAction: "选择固定价、分时价或现货联动套餐。",
    reviewFocus: "理解零售套餐如何影响收入和风险传导。"
  },
  {
    id: "annualBilateral",
    step: 4,
    title: "年度双边采购",
    executionAction: "配置覆盖比例、报价和年度合约曲线。",
    reviewFocus: "理解双边协商、成交价格和合约曲线。"
  },
  {
    id: "monthlyAuction",
    step: 5,
    title: "月度集中竞价",
    executionAction: "分别处理 3 月、7 月、12 月补仓决策。",
    reviewFocus: "理解典型月补仓如何修正现货风险。"
  },
  {
    id: "spotExposure",
    step: 6,
    title: "现货敞口",
    executionAction: "查看总量敞口和 24 小时曲线错配。",
    reviewFocus: "理解覆盖比例不等于没有现货敞口。"
  },
  {
    id: "settlement",
    step: 7,
    title: "模拟结算",
    executionAction: "运行训练级结算，查看收入、成本和风险修正。",
    reviewFocus: "理解收入成本拆解和毛利形成。"
  },
  {
    id: "resultReview",
    step: 8,
    title: "交易结果回看",
    executionAction: "查看本轮交易动作摘要并保存执行记录。",
    reviewFocus: "沉淀整轮售电交易链路理解。"
  }
];
