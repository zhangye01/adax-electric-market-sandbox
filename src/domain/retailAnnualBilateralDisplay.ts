import { retailMarketData } from "../data/retailMarketData";
import { checkAnnualBilateralDeal } from "./retailCalculations";
import type { RetailMarketData, RetailTrainingState } from "./retailTypes";

export type RetailAnnualBilateralDealTone = "idle" | "blocked" | "accepted";

export interface RetailAnnualBilateralDisplay {
  priceBounds: readonly [number, number];
  referenceRange: readonly [number, number];
  counterpartyFloorPrice: number;
  coverageRangeLabel: string;
  completedFieldCount: number;
  totalFieldCount: number;
  dealTone: RetailAnnualBilateralDealTone;
  dealMessage: string;
  statusLabel: string;
}

export function buildRetailAnnualBilateralDisplay(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailAnnualBilateralDisplay {
  const deal = checkAnnualBilateralDeal(state, market);
  const hasCoverageRatio = state.annualBilateral.coverageRatio !== null;
  const hasBidPrice = state.annualBilateral.bidPrice !== null;
  const hasCurveType = state.annualBilateral.curveType !== null;
  const completedFieldCount = [hasCoverageRatio, hasBidPrice, hasCurveType].filter(Boolean).length;

  return {
    priceBounds: market.annual.priceBounds,
    referenceRange: market.annual.longTermReferenceRange,
    counterpartyFloorPrice: deal.floorPrice,
    coverageRangeLabel: "80%-120%",
    completedFieldCount,
    totalFieldCount: 3,
    dealTone: getDealTone(hasBidPrice, deal.accepted),
    dealMessage: hasBidPrice ? deal.message : "填写报价后显示模拟对手方反馈。",
    statusLabel: getAnnualBilateralStatusLabel(state, deal.accepted)
  };
}

function getDealTone(hasBidPrice: boolean, accepted: boolean): RetailAnnualBilateralDealTone {
  if (!hasBidPrice) return "idle";
  return accepted ? "accepted" : "blocked";
}

function getAnnualBilateralStatusLabel(state: RetailTrainingState, accepted: boolean) {
  const { coverageRatio, bidPrice, curveType } = state.annualBilateral;
  if (coverageRatio === null || bidPrice === null || curveType === null) return "请填写覆盖比例、报价并选择年度合约曲线。";
  if (!accepted) return "报价未被模拟对手方接受，请调整年度双边报价。";
  return "年度双边协议已达成，下一步选择月度集中竞价是否补仓。";
}
