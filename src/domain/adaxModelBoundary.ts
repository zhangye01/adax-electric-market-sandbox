export const adaxTrainingModelBoundary = {
  title: "模型边界说明",
  summary:
    "ADAX 使用统一虚拟省级市场和训练级简化机制，当前结果只用于理解交易组织、价格风险、结算结构和复盘逻辑。",
  restriction:
    "结果不代表任何真实省份市场结果，不可用于真实交易申报、定价、投标、结算或投资决策。"
} as const;

export function getAdaxTrainingModelBoundaryText() {
  return `${adaxTrainingModelBoundary.summary}${adaxTrainingModelBoundary.restriction}`;
}
