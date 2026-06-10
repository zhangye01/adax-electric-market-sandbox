import { retailMarketData } from "../data/retailMarketData";
import { getRetailMarketContext } from "./retailMarketContext";
import type { RetailMarketData, RetailTrainingState, RetailTypicalMonth } from "./retailTypes";

export type RetailMonthlyAuctionDecisionTone = "pending" | "participating" | "skipped";

export interface RetailMonthlyAuctionWindowDisplay {
  id: RetailTypicalMonth;
  label: string;
  name: string;
  referenceBidRange: readonly [number, number];
  feature: string;
  decisionTone: RetailMonthlyAuctionDecisionTone;
  decisionLabel: string;
}

export interface RetailMonthlyAuctionDisplay {
  selectedWindowCount: number;
  participatingWindowCount: number;
  totalWindowCount: number;
  statusLabel: string;
  priceBounds: readonly [number, number];
  windows: RetailMonthlyAuctionWindowDisplay[];
}

export function buildRetailMonthlyAuctionDisplay(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailMonthlyAuctionDisplay {
  const context = getRetailMarketContext(market);
  const windows = context.monthlyWindows.map((window) => {
    const decision = state.monthlyAuctions[window.id];
    return {
      id: window.id,
      label: window.label,
      name: window.name,
      referenceBidRange: window.referenceBidRange,
      feature: window.feature,
      decisionTone: getDecisionTone(decision.participates),
      decisionLabel: getDecisionLabel(decision.participates)
    };
  });
  const selectedWindowCount = windows.filter((window) => window.decisionTone !== "pending").length;
  const participatingWindowCount = windows.filter((window) => window.decisionTone === "participating").length;

  return {
    selectedWindowCount,
    participatingWindowCount,
    totalWindowCount: windows.length,
    statusLabel:
      selectedWindowCount === windows.length
        ? `${windows.length} 个月度窗口已选择，参与 ${participatingWindowCount} 个。下一步查看现货敞口。`
        : `已选择 ${selectedWindowCount}/${windows.length} 个月度窗口。`,
    priceBounds: context.annual.priceBounds,
    windows
  };
}

function getDecisionTone(participates: boolean | null): RetailMonthlyAuctionDecisionTone {
  if (participates === null) return "pending";
  return participates ? "participating" : "skipped";
}

function getDecisionLabel(participates: boolean | null) {
  if (participates === null) return "待选择";
  return participates ? "参与" : "不参与";
}
