import type { CurveMismatchRiskResult, RetailRiskLevel } from "./retailTypes";

export function classifyRiskLevel(input: {
  grossMarginRate: number;
  curveMatchScore: number;
  highPricePositiveExposureMwh: number;
  annualServiceMwh: number;
}): RetailRiskLevel {
  const highPriceExposureRate = input.annualServiceMwh > 0 ? input.highPricePositiveExposureMwh / input.annualServiceMwh : 1;
  if (input.grossMarginRate < 0 || input.curveMatchScore < 68 || highPriceExposureRate > 0.08) return "high";
  if (input.grossMarginRate < 0.08 || input.curveMatchScore < 82 || highPriceExposureRate > 0.035) return "medium";
  return "low";
}

export function buildDiagnostics(input: {
  riskLevel: RetailRiskLevel;
  grossMargin: number;
  totalNetExposureMwh: number;
  curveRisk: CurveMismatchRiskResult;
  annualServiceMwh: number;
}) {
  const diagnostics: string[] = [];
  if (input.totalNetExposureMwh > 0) diagnostics.push("中长期总量覆盖不足，仍需承担基础现货采购。");
  if (input.totalNetExposureMwh < 0) diagnostics.push("合约总量高于服务电量，存在过度锁定风险。");
  if (input.curveRisk.highPricePositiveExposureMwh > input.annualServiceMwh * 0.03) diagnostics.push("高价时段正敞口较明显，曲线错配会推高采购成本。");
  if (input.curveRisk.lowPriceNegativeExposureMwh > input.annualServiceMwh * 0.03) diagnostics.push("低价时段负敞口较明显，超额锁定会压缩毛利。");
  if (input.grossMargin < 0) diagnostics.push("本轮毛利为负，需要复核客户签约、套餐和采购安排。");
  if (diagnostics.length === 0) diagnostics.push("本轮交易动作形成了可解释的收入、采购成本和现货敞口结构。");
  if (input.riskLevel === "high" && !diagnostics.some((item) => item.includes("风险"))) {
    diagnostics.push("综合风险等级偏高，建议在复盘模式中重点查看曲线匹配和价格窗口。");
  }
  return diagnostics.slice(0, 4);
}
