import type { AdaxTrainingMode } from "../types";

export type AdaxModeSurface = "executionResultReview" | "reviewWorkspace";

export interface AdaxModeBoundary {
  surface: AdaxModeSurface;
  mode: AdaxTrainingMode;
  label: string;
  title: string;
  purpose: string;
  primaryOutput: string;
  mustNot: string[];
}

const executionResultReviewBoundary: AdaxModeBoundary = {
  surface: "executionResultReview",
  mode: "execution",
  label: "执行结果回看",
  title: "本轮交易结果统计",
  purpose: "回答本轮模拟交易的收入、成本、敞口、风险和保存状态。",
  primaryOutput: "交易结果记录",
  mustNot: ["不组织教材材料", "不替代复盘模式", "不生成真实交易建议"]
};

const reviewWorkspaceBoundary: AdaxModeBoundary = {
  surface: "reviewWorkspace",
  mode: "review",
  label: "复盘模式",
  title: "节点知识组织",
  purpose: "围绕同一条交易节点链路沉淀规则、案例和个人理解。",
  primaryOutput: "节点复盘材料",
  mustNot: ["不计算交易收益", "不展示模拟结算结果", "不作为执行结果报告"]
};

export function getAdaxModeBoundary(surface: AdaxModeSurface): AdaxModeBoundary {
  return surface === "reviewWorkspace" ? reviewWorkspaceBoundary : executionResultReviewBoundary;
}

export function canAdaxSurfaceUseSettlement(surface: AdaxModeSurface) {
  return surface === "executionResultReview";
}

export function canAdaxSurfaceUseReviewMaterials(surface: AdaxModeSurface) {
  return surface === "reviewWorkspace";
}
