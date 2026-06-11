import { retailMarketData } from "../data/retailMarketData";
import {
  calculateAnnualContract,
  calculateBaseSpotCost,
  calculateMonthlyAuctionResults
} from "./retailContractCalculations";
import { calculateAnnualServiceMwh, calculateCustomerMix } from "./retailCustomerCalculations";
import { calculateCurveMismatchRisk } from "./retailExposureCalculations";
import { calculateRetailRevenue } from "./retailRevenueCalculations";
import { buildDiagnostics, classifyRiskLevel } from "./retailRiskDiagnostics";
import { round } from "./retailCalculationUtils";
import type { RetailMarketData, RetailSettlementResult, RetailTrainingState } from "./retailTypes";
import { validateForSettlement } from "./retailValidation";

export {
  calculateAnnualServiceMwh,
  calculateCombinedCustomerCurve,
  calculateCustomerMix
} from "./retailCustomerCalculations";
export { calculateRetailRevenue } from "./retailRevenueCalculations";
export {
  calculateAnnualContract,
  calculateBaseSpotCost,
  calculateMonthlyAuctionResults,
  calculateWeightedContractPrice,
  checkAnnualBilateralDeal
} from "./retailContractCalculations";
export {
  calculateCurveMismatchRisk,
  calculateHourlyExposureByTypicalDay
} from "./retailExposureCalculations";

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
