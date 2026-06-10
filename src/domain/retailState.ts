import { retailMarketData } from "../data/retailMarketData";
import type { RetailTrainingState, RetailTypicalMonth } from "./retailTypes";

export const retailTypicalMonths: RetailTypicalMonth[] = ["march", "july", "december"];

export function createEmptyRetailTrainingState(): RetailTrainingState {
  return {
    customerContracts: {
      industrialStableMwh: null,
      commercialPeakMwh: null,
      volatileLoadMwh: null
    },
    retailPackage: {
      packageType: null
    },
    annualBilateral: {
      coverageRatio: null,
      bidPrice: null,
      curveType: null,
      counterpartyFloorPrice: retailMarketData.annual.counterpartyFloorPrice,
      dealAccepted: null
    },
    monthlyAuctions: {
      march: createEmptyMonthlyAuction(),
      july: createEmptyMonthlyAuction(),
      december: createEmptyMonthlyAuction()
    }
  };
}

function createEmptyMonthlyAuction() {
  return {
    participates: null,
    coverageRatio: null,
    bidPrice: null,
    curveType: null
  };
}
