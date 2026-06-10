import {
  annualContractCurves,
  monthlyContractCurves,
  retailCustomerLoadCurves
} from "../data/retailCurves";
import { retailMarketData } from "../data/retailMarketData";
import type {
  AnnualBilateralDealResult,
  AnnualContractResult,
  CurveMismatchRiskResult,
  CustomerMixResult,
  HourlyExposurePoint,
  MonthlyAuctionResult,
  RetailMarketData,
  RetailMonthlyAuctionResults,
  RetailPackageDefinition,
  RetailPricePosition,
  RetailRiskLevel,
  RetailSettlementResult,
  RetailTypicalDay,
  RetailTypicalMonth,
  RetailTrainingState,
  TypicalDayExposureResult
} from "./retailTypes";
import { validateForSettlement } from "./retailValidation";

const MONTHS: RetailTypicalMonth[] = ["march", "july", "december"];
const TYPICAL_DAYS: RetailTypicalDay[] = ["marchLowPrice", "julyHighPrice", "decemberEveningPeak"];
const HIGH_PRICE_THRESHOLD = 520;
const LOW_PRICE_THRESHOLD = 335;

export function calculateAnnualServiceMwh(state: RetailTrainingState) {
  return round(
    (state.customerContracts.industrialStableMwh ?? 0) +
      (state.customerContracts.commercialPeakMwh ?? 0) +
      (state.customerContracts.volatileLoadMwh ?? 0),
    2
  );
}

export function calculateCustomerMix(state: RetailTrainingState): CustomerMixResult {
  const total = calculateAnnualServiceMwh(state);
  if (total <= 0) {
    return { industrialShare: 0, commercialShare: 0, volatileShare: 0 };
  }
  return {
    industrialShare: round((state.customerContracts.industrialStableMwh ?? 0) / total, 4),
    commercialShare: round((state.customerContracts.commercialPeakMwh ?? 0) / total, 4),
    volatileShare: round((state.customerContracts.volatileLoadMwh ?? 0) / total, 4)
  };
}

export function calculateCombinedCustomerCurve(state: RetailTrainingState) {
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  if (annualServiceMwh <= 0) return normalizeCurve(retailCustomerLoadCurves.industrialStable).map((value) => round(value * 100, 4));

  const industrial = normalizeCurve(retailCustomerLoadCurves.industrialStable);
  const commercial = normalizeCurve(retailCustomerLoadCurves.commercialPeak);
  const volatile = normalizeCurve(retailCustomerLoadCurves.volatileLoad);
  const industrialMwh = state.customerContracts.industrialStableMwh ?? 0;
  const commercialMwh = state.customerContracts.commercialPeakMwh ?? 0;
  const volatileMwh = state.customerContracts.volatileLoadMwh ?? 0;

  return industrial.map((_, hour) =>
    round(
      ((industrialMwh * industrial[hour] + commercialMwh * commercial[hour] + volatileMwh * volatile[hour]) /
        annualServiceMwh) *
        100,
      4
    )
  );
}

export function calculateRetailRevenue(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
) {
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  const packageType = state.retailPackage.packageType;
  if (!packageType) return 0;

  const packageConfig = market.packages[packageType];
  const customerCurve = normalizeCurve(calculateCombinedCustomerCurve(state));

  if (packageConfig.id === "fixed") {
    return round(annualServiceMwh * packageConfig.fixedPrice, 2);
  }

  if (packageConfig.id === "tou") {
    return round(
      annualServiceMwh *
        sum(
          customerCurve.map((share, hour) => {
            const price = touPriceForHour(packageConfig, hour);
            return share * price;
          })
        ),
      2
    );
  }

  return round(
    annualServiceMwh *
      sum(
        customerCurve.map((share, hour) => {
          const representativeSpotPrice = calculateRepresentativeSpotPriceByHour(hour, market);
          return share * (representativeSpotPrice * packageConfig.spotFactor + packageConfig.serviceFee);
        })
      ),
    2
  );
}

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
    MONTHS.map((month) => [month, calculateMonthlyAuctionResult(month, state, market)])
  ) as Record<RetailTypicalMonth, MonthlyAuctionResult>;

  return {
    totalVolumeMwh: round(sum(MONTHS.map((month) => byMonth[month].volumeMwh)), 2),
    totalCost: round(sum(MONTHS.map((month) => byMonth[month].cost)), 2),
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
    TYPICAL_DAYS.map((day) => [day, calculateHourlyExposureByTypicalDay(state, day, annualContract, monthlyAuction, market)])
  ) as Record<RetailTypicalDay, TypicalDayExposureResult>;
  const positiveExposureMwh = sum(TYPICAL_DAYS.map((day) => byTypicalDay[day].positiveExposureMwh));
  const negativeExposureMwh = sum(TYPICAL_DAYS.map((day) => byTypicalDay[day].negativeExposureMwh));
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  const mismatchRatio = annualServiceMwh > 0 ? (positiveExposureMwh + negativeExposureMwh) / annualServiceMwh : 1;
  const curveMatchScore = clamp(100 - mismatchRatio * 100, 0, 100);

  return {
    byTypicalDay,
    positiveExposureMwh: round(positiveExposureMwh, 2),
    negativeExposureMwh: round(negativeExposureMwh, 2),
    highPricePositiveExposureMwh: round(sum(TYPICAL_DAYS.map((day) => byTypicalDay[day].highPricePositiveExposureMwh)), 2),
    lowPriceNegativeExposureMwh: round(sum(TYPICAL_DAYS.map((day) => byTypicalDay[day].lowPriceNegativeExposureMwh)), 2),
    positiveExposureCostComponent: round(sum(TYPICAL_DAYS.map((day) => byTypicalDay[day].positiveExposureCostComponent)), 2),
    negativeExposureRisk: round(sum(TYPICAL_DAYS.map((day) => byTypicalDay[day].negativeExposureRisk)), 2),
    curveMismatchRiskAdjustment: round(sum(TYPICAL_DAYS.map((day) => byTypicalDay[day].annualizedRiskAdjustment)), 2),
    curveMatchScore: round(curveMatchScore, 1)
  };
}

export function calculateRetailSettlement(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailSettlementResult {
  const validation = validateForSettlement(state, market);
  if (!validation.ok) {
    throw new Error(validation.errors.join("；"));
  }

  const annualServiceMwh = calculateAnnualServiceMwh(state);
  const customerMix = calculateCustomerMix(state);
  const retailRevenue = calculateRetailRevenue(state, market);
  const annualContract = calculateAnnualContract(state, market);
  const monthlyAuction = calculateMonthlyAuctionResults(state, market);
  const baseSpotCost = calculateBaseSpotCost(state, annualContract, monthlyAuction, market);
  const curveRisk = calculateCurveMismatchRisk(state, annualContract, monthlyAuction, market);
  const totalNetExposureMwh = annualServiceMwh - annualContract.volumeMwh - monthlyAuction.totalVolumeMwh;
  const totalProcurementCost =
    annualContract.cost + monthlyAuction.totalCost + baseSpotCost + curveRisk.curveMismatchRiskAdjustment;
  const grossMargin = retailRevenue - totalProcurementCost;
  const grossMarginRate = retailRevenue > 0 ? grossMargin / retailRevenue : 0;
  const riskLevel = classifyRiskLevel({
    grossMarginRate,
    curveMatchScore: curveRisk.curveMatchScore,
    highPricePositiveExposureMwh: curveRisk.highPricePositiveExposureMwh,
    annualServiceMwh
  });

  return {
    annualServiceMwh: round(annualServiceMwh, 2),
    customerMix,
    retailRevenue: round(retailRevenue, 2),
    annualContract,
    monthlyAuction,
    exposure: {
      totalNetExposureMwh: round(totalNetExposureMwh, 2),
      positiveExposureMwh: curveRisk.positiveExposureMwh,
      negativeExposureMwh: curveRisk.negativeExposureMwh,
      highPricePositiveExposureMwh: curveRisk.highPricePositiveExposureMwh,
      lowPriceNegativeExposureMwh: curveRisk.lowPriceNegativeExposureMwh,
      curveMatchScore: curveRisk.curveMatchScore,
      riskLevel
    },
    costs: {
      annualContractCost: annualContract.cost,
      monthlyAuctionCost: monthlyAuction.totalCost,
      baseSpotCost,
      positiveExposureCostComponent: curveRisk.positiveExposureCostComponent,
      negativeExposureRisk: curveRisk.negativeExposureRisk,
      curveMismatchRiskAdjustment: curveRisk.curveMismatchRiskAdjustment,
      totalProcurementCost: round(totalProcurementCost, 2)
    },
    margin: {
      grossMargin: round(grossMargin, 2),
      grossMarginRate: round(grossMarginRate, 4)
    },
    diagnostics: buildDiagnostics({
      riskLevel,
      grossMargin,
      totalNetExposureMwh,
      curveRisk,
      annualServiceMwh
    })
  };
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

function calculateAdjustedMonthlyDemand(
  month: RetailTypicalMonth,
  state: RetailTrainingState,
  market: RetailMarketData
) {
  return market.typicalMonths[month].baseDemandMwh * (calculateAnnualServiceMwh(state) / market.annual.referenceServiceMwh);
}

function calculateRepresentativeSpotPriceByHour(hour: number, market: RetailMarketData) {
  const weighted = TYPICAL_DAYS.map((day) => {
    const dayData = market.typicalDays[day];
    return dayData.spotPrices[hour] * dayData.dayWeight;
  });
  return sum(weighted) / sum(TYPICAL_DAYS.map((day) => market.typicalDays[day].dayWeight));
}

function touPriceForHour(packageConfig: Extract<RetailPackageDefinition, { id: "tou" }>, hour: number) {
  if (hour >= 0 && hour <= 6) return packageConfig.valleyPrice;
  if (hour >= 17 && hour <= 21) return packageConfig.peakPrice;
  return packageConfig.flatPrice;
}

function pricePosition(value: number, range: readonly [number, number]): RetailPricePosition {
  if (value < range[0]) return "belowReference";
  if (value > range[1]) return "aboveReference";
  return "insideReference";
}

function classifyRiskLevel(input: {
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

function buildDiagnostics(input: {
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

function normalizeCurve(curve: readonly number[]) {
  const total = sum(curve);
  if (curve.length !== 24 || total <= 0) {
    throw new Error("24 小时曲线必须包含 24 个正向权重。");
  }
  return curve.map((value) => value / total);
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
