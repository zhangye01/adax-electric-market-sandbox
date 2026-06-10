import { retailMarketData } from "../data/retailMarketData";
import type {
  MonthlyAuctionDecision,
  RetailMarketData,
  RetailTypicalMonth,
  RetailTrainingState,
  RetailValidationResult
} from "./retailTypes";

const MONTHS: RetailTypicalMonth[] = ["march", "july", "december"];

export function validateCustomerContracts(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailValidationResult {
  const errors: string[] = [];
  const entries = [
    ["工业稳定型签约电量", state.customerContracts.industrialStableMwh, market.customerPools.industrialStable.maxContractMwh],
    ["商业峰段型签约电量", state.customerContracts.commercialPeakMwh, market.customerPools.commercialPeak.maxContractMwh],
    ["波动负荷型签约电量", state.customerContracts.volatileLoadMwh, market.customerPools.volatileLoad.maxContractMwh]
  ] as const;

  entries.forEach(([label, value, max]) => {
    if (value === null || !Number.isFinite(value)) {
      errors.push(`${label}必须填写。`);
      return;
    }
    if (value < 0 || value > max) {
      errors.push(`${label}需在 0-${max.toLocaleString("zh-CN")} MWh 之间。`);
    }
  });

  const total =
    (state.customerContracts.industrialStableMwh ?? 0) +
    (state.customerContracts.commercialPeakMwh ?? 0) +
    (state.customerContracts.volatileLoadMwh ?? 0);

  if (errors.length === 0 && (total < 60000 || total > 160000)) {
    errors.push("年度服务电量需在 60,000-160,000 MWh 之间。");
  }

  return result(errors);
}

export function validateRetailPackage(state: RetailTrainingState): RetailValidationResult {
  return result(state.retailPackage.packageType ? [] : ["请选择零售套餐。"]);
}

export function validateAnnualBilateral(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailValidationResult {
  const errors: string[] = [];
  const { coverageRatio, bidPrice, curveType } = state.annualBilateral;
  const [minPrice, maxPrice] = market.annual.priceBounds;

  if (coverageRatio === null || !Number.isFinite(coverageRatio)) {
    errors.push("年度基础覆盖比例必须填写。");
  } else if (coverageRatio < 80 || coverageRatio > 120) {
    errors.push("年度基础覆盖比例需在 80%-120% 之间。");
  }

  if (bidPrice === null || !Number.isFinite(bidPrice)) {
    errors.push("年度双边报价必须填写。");
  } else {
    if (bidPrice < minPrice || bidPrice > maxPrice) {
      errors.push(`年度双边报价需在 ${minPrice}-${maxPrice} 元/MWh 之间。`);
    }
    if (bidPrice < state.annualBilateral.counterpartyFloorPrice) {
      errors.push("对手方不接受该价格，年度双边协议无法达成。");
    }
  }

  if (!curveType) {
    errors.push("请选择年度合约曲线。");
  }

  return result(errors);
}

export function validateMonthlyAuction(
  month: RetailTypicalMonth,
  decision: MonthlyAuctionDecision,
  market: RetailMarketData = retailMarketData
): RetailValidationResult {
  const errors: string[] = [];
  const monthLabel = market.typicalMonths[month].name;
  const [minPrice, maxPrice] = market.annual.priceBounds;

  if (decision.participates === null) {
    errors.push(`${monthLabel}必须选择参与或不参与。`);
    if (hasMonthlyAuctionDetails(decision)) {
      errors.push(`${monthLabel}未选择参与状态时不应保留补仓参数。`);
    }
    return result(errors);
  }

  if (!decision.participates) {
    if (hasMonthlyAuctionDetails(decision)) {
      errors.push(`${monthLabel}不参与时不应保留补仓比例、申报价格或月度合约曲线。`);
    }
    return result(errors);
  }

  if (decision.coverageRatio === null || !Number.isFinite(decision.coverageRatio)) {
    errors.push(`${monthLabel}补仓覆盖比例必须填写。`);
  } else if (decision.coverageRatio < 0 || decision.coverageRatio > 50) {
    errors.push(`${monthLabel}补仓覆盖比例需在 0%-50% 之间。`);
  }

  if (decision.bidPrice === null || !Number.isFinite(decision.bidPrice)) {
    errors.push(`${monthLabel}申报价格必须填写。`);
  } else if (decision.bidPrice < minPrice || decision.bidPrice > maxPrice) {
    errors.push(`${monthLabel}申报价格需在 ${minPrice}-${maxPrice} 元/MWh 之间。`);
  }

  if (!decision.curveType) {
    errors.push(`${monthLabel}必须选择月度合约曲线。`);
  }

  return result(errors);
}

export function validateMonthlyAuctions(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailValidationResult {
  return result(MONTHS.flatMap((month) => validateMonthlyAuction(month, state.monthlyAuctions[month], market).errors));
}

export function validateForSpotExposure(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailValidationResult {
  return result([
    ...validateCustomerContracts(state, market).errors,
    ...validateRetailPackage(state).errors,
    ...validateAnnualBilateral(state, market).errors,
    ...validateMonthlyAuctions(state, market).errors
  ]);
}

export function validateForSettlement(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailValidationResult {
  return validateForSpotExposure(state, market);
}

export function validateRetailTrainingState(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailValidationResult {
  return validateForSettlement(state, market);
}

function result(errors: string[]): RetailValidationResult {
  return { ok: errors.length === 0, errors: unique(errors) };
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function hasMonthlyAuctionDetails(decision: MonthlyAuctionDecision) {
  return decision.coverageRatio !== null || decision.bidPrice !== null || decision.curveType !== null;
}
