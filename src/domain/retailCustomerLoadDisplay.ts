import { retailMarketData } from "../data/retailMarketData";
import { calculateAnnualServiceMwh, calculateCustomerMix } from "./retailCalculations";
import type { RetailCustomerSegment, RetailMarketData, RetailTrainingState } from "./retailTypes";

type RetailCustomerContractKey = keyof RetailTrainingState["customerContracts"];

export interface RetailCustomerLoadSegmentDisplay {
  id: RetailCustomerSegment;
  label: string;
  contractKey: RetailCustomerContractKey;
  value: number | null;
  maxContractMwh: number;
  sizeTag: string;
  riskTag: string;
  completed: boolean;
}

export interface RetailCustomerLoadDisplay {
  segments: RetailCustomerLoadSegmentDisplay[];
  filledSegmentCount: number;
  totalSegmentCount: number;
  annualServiceMwh: number;
  totalAvailableMwh: number;
  mixRows: Array<{
    label: string;
    value: number;
  }>;
  statusLabel: string;
}

const customerSegmentOrder: readonly RetailCustomerSegment[] = ["industrialStable", "commercialPeak", "volatileLoad"];

const customerSegmentLabels: Record<RetailCustomerSegment, string> = {
  industrialStable: "工业稳定型",
  commercialPeak: "商业峰段型",
  volatileLoad: "波动负荷型"
};

const customerContractKeys: Record<RetailCustomerSegment, RetailCustomerContractKey> = {
  industrialStable: "industrialStableMwh",
  commercialPeak: "commercialPeakMwh",
  volatileLoad: "volatileLoadMwh"
};

export function buildRetailCustomerLoadDisplay(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailCustomerLoadDisplay {
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  const customerMix = calculateCustomerMix(state);
  const segments = customerSegmentOrder.map((segment) => {
    const pool = market.customerPools[segment];
    const contractKey = customerContractKeys[segment];
    const value = state.customerContracts[contractKey];
    return {
      id: segment,
      label: customerSegmentLabels[segment],
      contractKey,
      value,
      maxContractMwh: pool.maxContractMwh,
      sizeTag: pool.sizeTag,
      riskTag: pool.riskTag,
      completed: value !== null
    };
  });
  const filledSegmentCount = segments.filter((segment) => segment.completed).length;

  return {
    segments,
    filledSegmentCount,
    totalSegmentCount: segments.length,
    annualServiceMwh,
    totalAvailableMwh: segments.reduce((sum, segment) => sum + segment.maxContractMwh, 0),
    mixRows: [
      { label: "工业占比", value: customerMix.industrialShare },
      { label: "商业占比", value: customerMix.commercialShare },
      { label: "波动占比", value: customerMix.volatileShare }
    ],
    statusLabel:
      filledSegmentCount === segments.length
        ? "客户负荷已形成，下一步选择零售套餐。"
        : `已填写 ${filledSegmentCount}/${segments.length} 类客户签约电量。`
  };
}
