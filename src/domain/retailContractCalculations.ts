import { retailMarketData } from "../data/retailMarketData";
import { calculateAnnualServiceMwh } from "./retailCustomerCalculations";
import {
  pricePosition,
  RETAIL_TYPICAL_MONTHS,
  round,
  sum
} from "./retailCalculationUtils";
import type {
  AnnualBilateralDealResult,
  AnnualContractResult,
  MonthlyAuctionResult,
  RetailMarketData,
  RetailMonthlyAuctionResults,
  RetailTypicalMonth,
  RetailTrainingState
} from "./retailTypes";

export function checkAnnualBilateralDeal(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): AnnualBilateralDealResult {
  const bidPrice = state.annualBilateral.bidPrice;
  const floorPrice = state.annualBilateral.counterpartyFloorPrice || market.annual.counterpartyFloorPrice;
  const accepted = bidPrice !== null && Number.isFinite(bidPrice) && bidPrice >= floorPrice;
  return {
    accepted,
    floorPrice,
    bidPrice,
    message: accepted ? "对手方接受该价格，年度双边协议已达成。" : "对手方不接受该价格，年度双边协议无法达成。"
  };
}

export function calculateAnnualContract(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): AnnualContractResult {
  const deal = checkAnnualBilateralDeal(state, market);
  const coverageRatio = state.annualBilateral.coverageRatio ?? 0;
  const bidPrice = state.annualBilateral.bidPrice ?? 0;
  const curveType = state.annualBilateral.curveType ?? "flat";
  const volumeMwh = deal.accepted ? calculateAnnualServiceMwh(state) * (coverageRatio / 100) : 0;
  return {
    volumeMwh: round(volumeMwh, 2),
    cost: round(volumeMwh * bidPrice, 2),
    accepted: deal.accepted,
    coverageRatio,
    bidPrice,
    curveType
  };
}

export function calculateMonthlyAuctionResults(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailMonthlyAuctionResults {
  const byMonth = Object.fromEntries(
    RETAIL_TYPICAL_MONTHS.map((month) => [month, calculateMonthlyAuctionResult(month, state, market)])
  ) as Record<RetailTypicalMonth, MonthlyAuctionResult>;

  return {
    totalVolumeMwh: round(sum(RETAIL_TYPICAL_MONTHS.map((month) => byMonth[month].volumeMwh)), 2),
    totalCost: round(sum(RETAIL_TYPICAL_MONTHS.map((month) => byMonth[month].cost)), 2),
    byMonth
  };
}

export function calculateWeightedContractPrice(
  annualContract: AnnualContractResult,
  monthlyAuction: RetailMonthlyAuctionResults,
  market: RetailMarketData = retailMarketData
) {
  const volume = annualContract.volumeMwh + monthlyAuction.totalVolumeMwh;
  if (volume <= 0) return market.annual.averageSpotPrice;
  return round((annualContract.cost + monthlyAuction.totalCost) / volume, 4);
}

export function calculateBaseSpotCost(
  state: RetailTrainingState,
  annualContract: AnnualContractResult,
  monthlyAuction: RetailMonthlyAuctionResults,
  market: RetailMarketData = retailMarketData
) {
  const totalNetExposureMwh = calculateAnnualServiceMwh(state) - annualContract.volumeMwh - monthlyAuction.totalVolumeMwh;
  return round(Math.max(totalNetExposureMwh, 0) * market.annual.averageSpotPrice, 2);
}

export function calculateAdjustedMonthlyDemand(
  month: RetailTypicalMonth,
  state: RetailTrainingState,
  market: RetailMarketData
) {
  return market.typicalMonths[month].baseDemandMwh * (calculateAnnualServiceMwh(state) / market.annual.referenceServiceMwh);
}

function calculateMonthlyAuctionResult(
  month: RetailTypicalMonth,
  state: RetailTrainingState,
  market: RetailMarketData
): MonthlyAuctionResult {
  const decision = state.monthlyAuctions[month];
  const demandMwh = calculateAdjustedMonthlyDemand(month, state, market);
  const participates = decision.participates === true;
  const coverageRatio = participates ? decision.coverageRatio ?? 0 : 0;
  const volumeMwh = participates ? demandMwh * (coverageRatio / 100) : 0;
  const bidPrice = participates ? decision.bidPrice ?? null : null;
  const cost = participates && bidPrice !== null ? volumeMwh * bidPrice : 0;
  return {
    month,
    participates,
    demandMwh: round(demandMwh, 2),
    volumeMwh: round(volumeMwh, 2),
    cost: round(cost, 2),
    coverageRatio,
    bidPrice,
    curveType: participates ? decision.curveType : null,
    pricePosition: participates && bidPrice !== null ? pricePosition(bidPrice, market.typicalMonths[month].referenceBidRange) : null
  };
}
