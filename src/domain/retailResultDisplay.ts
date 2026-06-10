import type { RetailRiskLevel, RetailSettlementResult } from "./retailTypes";

export type RetailResultInsightSeverity = "positive" | "watch" | "risk" | "neutral";

export interface RetailResultInsight {
  id: "margin" | "procurement" | "exposure" | "risk" | "review";
  label: string;
  title: string;
  detail: string;
  severity: RetailResultInsightSeverity;
}

export interface RetailExecutionResultDisplay {
  verdict: {
    title: string;
    detail: string;
    severity: RetailResultInsightSeverity;
  };
  insights: RetailResultInsight[];
}

export function buildRetailExecutionResultDisplay(result: RetailSettlementResult): RetailExecutionResultDisplay {
  const hasPositiveMargin = result.margin.grossMargin >= 0;
  const hasVolumeShortage = result.exposure.totalNetExposureMwh > 0;
  const hasVolumeOverLock = result.exposure.totalNetExposureMwh < 0;
  const hasHourlyExposure = result.exposure.positiveExposureMwh + result.exposure.negativeExposureMwh > 0;

  return {
    verdict: {
      title: hasPositiveMargin ? "本轮交易形成正向毛利" : "本轮交易毛利为负",
      detail: buildVerdictDetail(result),
      severity: result.exposure.riskLevel === "high" || !hasPositiveMargin ? "risk" : result.exposure.riskLevel === "medium" ? "watch" : "positive"
    },
    insights: [
      {
        id: "margin",
        label: "经营结果",
        title: hasPositiveMargin ? "零售收入覆盖采购成本" : "采购成本高于零售收入",
        detail: hasPositiveMargin
          ? "本轮套餐收入能够覆盖年度双边、月度竞价、现货采购和风险修正后的成本。"
          : "本轮交易结果提示经营压力，需要回到客户组合、套餐定价或采购安排重新检查。",
        severity: hasPositiveMargin ? "positive" : "risk"
      },
      {
        id: "procurement",
        label: "采购结构",
        title: buildProcurementTitle({ hasVolumeShortage, hasVolumeOverLock }),
        detail: buildProcurementDetail({ hasVolumeShortage, hasVolumeOverLock }),
        severity: hasVolumeShortage || hasVolumeOverLock ? "watch" : "neutral"
      },
      {
        id: "exposure",
        label: "现货敞口",
        title: hasHourlyExposure ? "小时曲线仍存在错配" : "小时曲线基本匹配",
        detail: hasHourlyExposure
          ? "即使总量接近覆盖，客户用电曲线和合约曲线也可能在不同时段错开，形成正敞口和负敞口。"
          : "本轮客户用电曲线和合约曲线较为接近，现货补足和过度锁定压力较低。",
        severity: hasHourlyExposure ? "watch" : "positive"
      },
      {
        id: "risk",
        label: "风险状态",
        title: `综合风险为${riskText(result.exposure.riskLevel)}水平`,
        detail: buildRiskDetail(result.exposure.riskLevel),
        severity: result.exposure.riskLevel === "high" ? "risk" : result.exposure.riskLevel === "medium" ? "watch" : "positive"
      },
      {
        id: "review",
        label: "复盘重点",
        title: buildReviewTitle(result),
        detail: buildReviewDetail(result),
        severity: result.exposure.riskLevel === "low" && hasPositiveMargin ? "neutral" : "watch"
      }
    ]
  };
}

function buildVerdictDetail(result: RetailSettlementResult) {
  if (result.margin.grossMargin < 0) {
    return "先关注采购成本、曲线错配和高价时段敞口，再回到交易工作台调整策略。";
  }
  if (result.exposure.riskLevel === "high") {
    return "毛利为正，但风险状态偏高，建议优先复核高价时段敞口和曲线匹配。";
  }
  if (result.exposure.riskLevel === "medium") {
    return "结果具备可解释性，但仍需要关注补仓安排、曲线匹配和风险修正。";
  }
  return "收入、采购和敞口结构相对稳定，可进入结果回看沉淀本轮交易经验。";
}

function buildProcurementTitle(input: { hasVolumeShortage: boolean; hasVolumeOverLock: boolean }) {
  if (input.hasVolumeShortage) return "中长期总量覆盖不足";
  if (input.hasVolumeOverLock) return "中长期总量存在过度锁定";
  return "中长期总量基本匹配服务电量";
}

function buildProcurementDetail(input: { hasVolumeShortage: boolean; hasVolumeOverLock: boolean }) {
  if (input.hasVolumeShortage) {
    return "年度双边和月度竞价电量不足以覆盖客户服务电量，缺口会进入现货采购。";
  }
  if (input.hasVolumeOverLock) {
    return "合约总量高于客户服务电量，低价时段的负敞口可能压缩毛利。";
  }
  return "全年合约总量与服务电量接近，但仍需要继续观察小时曲线是否匹配。";
}

function buildRiskDetail(level: RetailRiskLevel) {
  if (level === "high") return "需要优先复核毛利、曲线匹配和高价时段正敞口。";
  if (level === "medium") return "本轮结果可继续推进，但复盘时要关注风险修正和敞口来源。";
  return "本轮风险状态较低，复盘重点可以放在策略结构是否可复制。";
}

function buildReviewTitle(result: RetailSettlementResult) {
  if (result.margin.grossMargin < 0) return "先解释亏损来源";
  if (result.exposure.riskLevel === "high") return "先解释风险来源";
  if (result.exposure.positiveExposureMwh + result.exposure.negativeExposureMwh > 0) return "重点解释曲线错配";
  return "沉淀可复用交易路径";
}

function buildReviewDetail(result: RetailSettlementResult) {
  if (result.margin.grossMargin < 0) {
    return "复盘时按客户签约、套餐收入、合约采购、现货敞口的顺序定位问题。";
  }
  if (result.exposure.riskLevel === "high") {
    return "复盘时先看高价时段正敞口，再看低价时段负敞口和合约曲线选择。";
  }
  if (result.exposure.positiveExposureMwh + result.exposure.negativeExposureMwh > 0) {
    return "复盘时说明为什么总量覆盖不等于小时曲线完全匹配。";
  }
  return "复盘时记录本轮客户组合、采购节奏和风险控制动作，作为后续对比基线。";
}

function riskText(level: RetailRiskLevel) {
  if (level === "high") return "高";
  if (level === "medium") return "中";
  return "低";
}
