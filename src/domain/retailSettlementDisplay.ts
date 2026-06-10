import type { RetailRiskLevel, RetailSettlementResult } from "./retailTypes";

export type RetailSettlementSignalTone = "positive" | "watch" | "risk" | "neutral";

export interface RetailSettlementSignal {
  id: "retailRevenue" | "procurementCost" | "grossMargin" | "riskLevel";
  label: string;
  value: number | RetailRiskLevel;
  detail: string;
  tone: RetailSettlementSignalTone;
}

export interface RetailExposureSignal {
  id: "positiveExposure" | "negativeExposure" | "highPricePositiveExposure" | "lowPriceNegativeExposure";
  label: string;
  valueMwh: number;
  shareOfService: number;
  detail: string;
  tone: RetailSettlementSignalTone;
}

export interface RetailCostStackItem {
  id: "annualContract" | "monthlyAuction" | "baseSpot" | "curveMismatch";
  label: string;
  amount: number;
  shareOfTotalCost: number;
  detail: string;
  tone: RetailSettlementSignalTone;
}

export interface RetailSettlementDisplay {
  headline: {
    title: string;
    detail: string;
    tone: RetailSettlementSignalTone;
  };
  signals: RetailSettlementSignal[];
  exposure: {
    title: string;
    detail: string;
    netPosition: "short" | "overLocked" | "balanced";
    riskLevel: RetailRiskLevel;
    curveMatchScore: number;
    signals: RetailExposureSignal[];
  };
  costStack: {
    title: string;
    detail: string;
    items: RetailCostStackItem[];
  };
}

export function buildRetailSettlementDisplay(result: RetailSettlementResult): RetailSettlementDisplay {
  const hasPositiveMargin = result.margin.grossMargin >= 0;
  const netPosition = getNetPosition(result.exposure.totalNetExposureMwh);
  const riskTone = toneForRisk(result.exposure.riskLevel);

  return {
    headline: {
      title: hasPositiveMargin ? "收入覆盖采购成本" : "采购成本高于零售收入",
      detail: headlineDetail(result, netPosition),
      tone: hasPositiveMargin ? riskTone : "risk"
    },
    signals: [
      {
        id: "retailRevenue",
        label: "零售收入",
        value: result.retailRevenue,
        detail: "客户套餐形成的收入侧输入。",
        tone: "positive"
      },
      {
        id: "procurementCost",
        label: "采购总成本",
        value: result.costs.totalProcurementCost,
        detail: "中长期采购、现货采购和风险修正合计。",
        tone: "watch"
      },
      {
        id: "grossMargin",
        label: "经营毛利",
        value: result.margin.grossMargin,
        detail: hasPositiveMargin ? "本轮形成正向训练结果。" : "本轮结果需要回到策略配置复核。",
        tone: hasPositiveMargin ? "positive" : "risk"
      },
      {
        id: "riskLevel",
        label: "风险等级",
        value: result.exposure.riskLevel,
        detail: "由毛利、曲线匹配和高价暴露共同判断。",
        tone: riskTone
      }
    ],
    exposure: {
      title: exposureTitle(netPosition),
      detail: exposureDetail(result, netPosition),
      netPosition,
      riskLevel: result.exposure.riskLevel,
      curveMatchScore: result.exposure.curveMatchScore,
      signals: [
        {
          id: "positiveExposure",
          label: "正敞口",
          valueMwh: result.exposure.positiveExposureMwh,
          shareOfService: share(result.exposure.positiveExposureMwh, result.annualServiceMwh),
          detail: "需要通过现货采购补足的小时缺口。",
          tone: result.exposure.positiveExposureMwh > 0 ? "watch" : "positive"
        },
        {
          id: "negativeExposure",
          label: "负敞口",
          valueMwh: result.exposure.negativeExposureMwh,
          shareOfService: share(result.exposure.negativeExposureMwh, result.annualServiceMwh),
          detail: "合约曲线高于客户用电曲线的小时锁定。",
          tone: result.exposure.negativeExposureMwh > 0 ? "neutral" : "positive"
        },
        {
          id: "highPricePositiveExposure",
          label: "高价正敞口",
          valueMwh: result.exposure.highPricePositiveExposureMwh,
          shareOfService: share(result.exposure.highPricePositiveExposureMwh, result.annualServiceMwh),
          detail: "高价窗口中需要现货补足的部分。",
          tone: result.exposure.highPricePositiveExposureMwh > result.annualServiceMwh * 0.03 ? "risk" : "watch"
        },
        {
          id: "lowPriceNegativeExposure",
          label: "低价负敞口",
          valueMwh: result.exposure.lowPriceNegativeExposureMwh,
          shareOfService: share(result.exposure.lowPriceNegativeExposureMwh, result.annualServiceMwh),
          detail: "低价窗口中过度锁定的部分。",
          tone: result.exposure.lowPriceNegativeExposureMwh > result.annualServiceMwh * 0.03 ? "watch" : "neutral"
        }
      ]
    },
    costStack: {
      title: "采购成本结构",
      detail: "用于区分中长期采购、基础现货采购和曲线错配风险修正。",
      items: [
        {
          id: "annualContract",
          label: "年度双边采购",
          amount: result.costs.annualContractCost,
          shareOfTotalCost: share(result.costs.annualContractCost, result.costs.totalProcurementCost),
          detail: "年度双边协议形成的基础采购成本。",
          tone: "neutral"
        },
        {
          id: "monthlyAuction",
          label: "月度集中竞价",
          amount: result.costs.monthlyAuctionCost,
          shareOfTotalCost: share(result.costs.monthlyAuctionCost, result.costs.totalProcurementCost),
          detail: "三个月度窗口的补仓成本。",
          tone: "positive"
        },
        {
          id: "baseSpot",
          label: "基础现货采购",
          amount: result.costs.baseSpotCost,
          shareOfTotalCost: share(result.costs.baseSpotCost, result.costs.totalProcurementCost),
          detail: "中长期总量缺口进入现货后的成本。",
          tone: result.costs.baseSpotCost > 0 ? "watch" : "neutral"
        },
        {
          id: "curveMismatch",
          label: "风险修正金额",
          amount: result.costs.curveMismatchRiskAdjustment,
          shareOfTotalCost: share(result.costs.curveMismatchRiskAdjustment, result.costs.totalProcurementCost),
          detail: "曲线错配进入毛利的训练级修正。",
          tone: result.costs.curveMismatchRiskAdjustment > result.retailRevenue * 0.03 ? "risk" : "watch"
        }
      ]
    }
  };
}

function getNetPosition(totalNetExposureMwh: number): RetailSettlementDisplay["exposure"]["netPosition"] {
  if (totalNetExposureMwh > 0) return "short";
  if (totalNetExposureMwh < 0) return "overLocked";
  return "balanced";
}

function toneForRisk(level: RetailRiskLevel): RetailSettlementSignalTone {
  if (level === "high") return "risk";
  if (level === "medium") return "watch";
  return "positive";
}

function headlineDetail(result: RetailSettlementResult, netPosition: RetailSettlementDisplay["exposure"]["netPosition"]) {
  if (result.margin.grossMargin < 0) return "先看采购成本、风险修正和高价时段敞口，再回到工作台调整策略。";
  if (result.exposure.riskLevel === "high") return "毛利为正，但风险信号偏高，需要优先检查曲线错配。";
  if (netPosition !== "balanced") return "毛利为正，但中长期总量仓位仍需要结合小时曲线复核。";
  return "收入、采购、敞口和风险修正结构相对稳定。";
}

function exposureTitle(netPosition: RetailSettlementDisplay["exposure"]["netPosition"]) {
  if (netPosition === "short") return "中长期总量偏短";
  if (netPosition === "overLocked") return "中长期总量过度锁定";
  return "总量平衡但仍需看小时曲线";
}

function exposureDetail(result: RetailSettlementResult, netPosition: RetailSettlementDisplay["exposure"]["netPosition"]) {
  if (netPosition === "short") return "服务电量仍有总量缺口，现货采购压力和高价窗口暴露需要重点查看。";
  if (netPosition === "overLocked") return "合约总量高于服务电量，低价时段负敞口可能压缩毛利。";
  if (result.exposure.positiveExposureMwh + result.exposure.negativeExposureMwh > 0) {
    return "总量相等不代表曲线完全匹配，小时级正负敞口仍会进入风险修正。";
  }
  return "总量和小时曲线都较为稳定，复盘时可记录本轮策略作为对比基线。";
}

function share(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, value / total));
}
