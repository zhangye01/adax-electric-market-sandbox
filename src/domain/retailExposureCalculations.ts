import {
  annualContractCurves,
  monthlyContractCurves
} from "../data/retailCurves";
import { retailMarketData } from "../data/retailMarketData";
import { calculateAdjustedMonthlyDemand, calculateWeightedContractPrice } from "./retailContractCalculations";
import { calculateAnnualServiceMwh, calculateCombinedCustomerCurve } from "./retailCustomerCalculations";
import {
  clamp,
  HIGH_PRICE_THRESHOLD,
  LOW_PRICE_THRESHOLD,
  normalizeCurve,
  RETAIL_TYPICAL_DAYS,
  round,
  sum
} from "./retailCalculationUtils";
import type {
  AnnualContractResult,
  CurveMismatchRiskResult,
  HourlyExposurePoint,
  RetailMarketData,
  RetailMonthlyAuctionResults,
  RetailTypicalDay,
  RetailTrainingState,
  TypicalDayExposureResult
} from "./retailTypes";

export function calculateHourlyExposureByTypicalDay(
  state: RetailTrainingState,
  day: RetailTypicalDay,
  annualContract: AnnualContractResult,
  monthlyAuction: RetailMonthlyAuctionResults,
  market: RetailMarketData = retailMarketData
): TypicalDayExposureResult {
  const dayData = market.typicalDays[day];
  const monthData = market.typicalMonths[dayData.month];
  const customerCurve = normalizeCurve(calculateCombinedCustomerCurve(state));
  const annualCurve = normalizeCurve(annualContractCurves[annualContract.curveType]);
  const monthResult = monthlyAuction.byMonth[dayData.month];
  const monthlyCurve = monthResult.curveType ? normalizeCurve(monthlyContractCurves[monthResult.curveType][dayData.month]) : annualCurve.map(() => 0);
  const annualDailyVolume = annualContract.volumeMwh / 365;
  const monthlyDailyVolume = monthResult.volumeMwh / monthData.daysInMonth;
  const customerDailyLoad = calculateAdjustedMonthlyDemand(dayData.month, state, market) / monthData.daysInMonth;
  const weightedContractPrice = calculateWeightedContractPrice(annualContract, monthlyAuction, market);
  const totalNetExposureMwh = calculateAnnualServiceMwh(state) - annualContract.volumeMwh - monthlyAuction.totalVolumeMwh;

  const hourly: HourlyExposurePoint[] = dayData.spotPrices.map((spotPrice, hour) => {
    const customerLoadMwh = customerDailyLoad * customerCurve[hour];
    const annualContractMwh = annualDailyVolume * annualCurve[hour];
    const monthlyContractMwh = monthlyDailyVolume * monthlyCurve[hour];
    const netExposureMwh = customerLoadMwh - annualContractMwh - monthlyContractMwh;
    const positiveExposureMwh = Math.max(netExposureMwh, 0);
    const negativeExposureMwh = Math.max(-netExposureMwh, 0);
    const positiveExposureCostComponent =
      totalNetExposureMwh > 0
        ? positiveExposureMwh * (spotPrice - market.annual.averageSpotPrice)
        : positiveExposureMwh * spotPrice;
    const negativeExposureRisk = negativeExposureMwh * Math.max(weightedContractPrice - spotPrice, 0);

    return {
      hour,
      customerLoadMwh: round(customerLoadMwh, 4),
      annualContractMwh: round(annualContractMwh, 4),
      monthlyContractMwh: round(monthlyContractMwh, 4),
      spotPrice,
      netExposureMwh: round(netExposureMwh, 4),
      positiveExposureMwh: round(positiveExposureMwh, 4),
      negativeExposureMwh: round(negativeExposureMwh, 4),
      positiveExposureCostComponent: round(positiveExposureCostComponent, 4),
      negativeExposureRisk: round(negativeExposureRisk, 4)
    };
  });

  const positiveExposureMwh = sum(hourly.map((item) => item.positiveExposureMwh));
  const negativeExposureMwh = sum(hourly.map((item) => item.negativeExposureMwh));
  const highPricePositiveExposureMwh = sum(
    hourly.filter((item) => item.spotPrice >= HIGH_PRICE_THRESHOLD).map((item) => item.positiveExposureMwh)
  );
  const lowPriceNegativeExposureMwh = sum(
    hourly.filter((item) => item.spotPrice <= LOW_PRICE_THRESHOLD).map((item) => item.negativeExposureMwh)
  );
  const positiveExposureCostComponent = sum(hourly.map((item) => item.positiveExposureCostComponent));
  const negativeExposureRisk = sum(hourly.map((item) => item.negativeExposureRisk));
  const annualizedRiskAdjustment = (positiveExposureCostComponent + negativeExposureRisk) * dayData.dayWeight;

  return {
    day,
    month: dayData.month,
    dayWeight: dayData.dayWeight,
    hourly,
    positiveExposureMwh: round(positiveExposureMwh * dayData.dayWeight, 2),
    negativeExposureMwh: round(negativeExposureMwh * dayData.dayWeight, 2),
    highPricePositiveExposureMwh: round(highPricePositiveExposureMwh * dayData.dayWeight, 2),
    lowPriceNegativeExposureMwh: round(lowPriceNegativeExposureMwh * dayData.dayWeight, 2),
    positiveExposureCostComponent: round(positiveExposureCostComponent * dayData.dayWeight, 2),
    negativeExposureRisk: round(negativeExposureRisk * dayData.dayWeight, 2),
    annualizedRiskAdjustment: round(annualizedRiskAdjustment, 2)
  };
}

export function calculateCurveMismatchRisk(
  state: RetailTrainingState,
  annualContract: AnnualContractResult,
  monthlyAuction: RetailMonthlyAuctionResults,
  market: RetailMarketData = retailMarketData
): CurveMismatchRiskResult {
  const byTypicalDay = Object.fromEntries(
    RETAIL_TYPICAL_DAYS.map((day) => [day, calculateHourlyExposureByTypicalDay(state, day, annualContract, monthlyAuction, market)])
  ) as Record<RetailTypicalDay, TypicalDayExposureResult>;
  const positiveExposureMwh = sum(RETAIL_TYPICAL_DAYS.map((day) => byTypicalDay[day].positiveExposureMwh));
  const negativeExposureMwh = sum(RETAIL_TYPICAL_DAYS.map((day) => byTypicalDay[day].negativeExposureMwh));
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  const mismatchRatio = annualServiceMwh > 0 ? (positiveExposureMwh + negativeExposureMwh) / annualServiceMwh : 1;
  const curveMatchScore = clamp(100 - mismatchRatio * 100, 0, 100);

  return {
    byTypicalDay,
    positiveExposureMwh: round(positiveExposureMwh, 2),
    negativeExposureMwh: round(negativeExposureMwh, 2),
    highPricePositiveExposureMwh: round(sum(RETAIL_TYPICAL_DAYS.map((day) => byTypicalDay[day].highPricePositiveExposureMwh)), 2),
    lowPriceNegativeExposureMwh: round(sum(RETAIL_TYPICAL_DAYS.map((day) => byTypicalDay[day].lowPriceNegativeExposureMwh)), 2),
    positiveExposureCostComponent: round(sum(RETAIL_TYPICAL_DAYS.map((day) => byTypicalDay[day].positiveExposureCostComponent)), 2),
    negativeExposureRisk: round(sum(RETAIL_TYPICAL_DAYS.map((day) => byTypicalDay[day].negativeExposureRisk)), 2),
    curveMismatchRiskAdjustment: round(sum(RETAIL_TYPICAL_DAYS.map((day) => byTypicalDay[day].annualizedRiskAdjustment)), 2),
    curveMatchScore: round(curveMatchScore, 1)
  };
}
