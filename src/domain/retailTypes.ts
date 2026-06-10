export type RetailCustomerSegment = "industrialStable" | "commercialPeak" | "volatileLoad";

export type RetailPackageType = "fixed" | "tou" | "spotLinked";

export type AnnualContractCurveType = "flat" | "industrial";

export type MonthlyContractCurveType = "flat" | "typicalMonth";

export type RetailTypicalMonth = "march" | "july" | "december";

export type RetailTypicalDay = "marchLowPrice" | "julyHighPrice" | "decemberEveningPeak";

export type RetailRiskLevel = "low" | "medium" | "high";

export type RetailPricePosition = "belowReference" | "insideReference" | "aboveReference";

export type RetailNodeId =
  | "marketBrief"
  | "customerLoad"
  | "retailPackage"
  | "annualBilateral"
  | "monthlyAuction"
  | "spotExposure"
  | "settlement"
  | "resultReview";

export type RetailHourlyCurve = readonly number[];

export interface RetailTrainingState {
  customerContracts: {
    industrialStableMwh: number | null;
    commercialPeakMwh: number | null;
    volatileLoadMwh: number | null;
  };
  retailPackage: {
    packageType: RetailPackageType | null;
  };
  annualBilateral: {
    coverageRatio: number | null;
    bidPrice: number | null;
    curveType: AnnualContractCurveType | null;
    counterpartyFloorPrice: number;
    dealAccepted: boolean | null;
  };
  monthlyAuctions: Record<RetailTypicalMonth, MonthlyAuctionDecision>;
}

export interface MonthlyAuctionDecision {
  participates: boolean | null;
  coverageRatio: number | null;
  bidPrice: number | null;
  curveType: MonthlyContractCurveType | null;
}

export interface RetailValidationResult {
  ok: boolean;
  errors: string[];
}

export interface RetailAnnualMarketData {
  referenceServiceMwh: number;
  averageSpotPrice: number;
  longTermReferenceRange: readonly [number, number];
  maxLoadMw: number;
  minLoadMw: number;
  peakValleySpreadMw: number;
  highPriceHours: number;
  lowPriceHours: number;
  priceBounds: readonly [number, number];
  counterpartyFloorPrice: number;
}

export interface RetailCustomerPoolItem {
  id: RetailCustomerSegment;
  name: string;
  maxContractMwh: number;
  sizeTag: string;
  riskTag: string;
}

export interface RetailPackageConfig {
  id: RetailPackageType;
  name: string;
  description: string;
}

export interface RetailFixedPackageConfig extends RetailPackageConfig {
  id: "fixed";
  fixedPrice: number;
}

export interface RetailTouPackageConfig extends RetailPackageConfig {
  id: "tou";
  valleyPrice: number;
  flatPrice: number;
  peakPrice: number;
}

export interface RetailSpotLinkedPackageConfig extends RetailPackageConfig {
  id: "spotLinked";
  spotFactor: number;
  serviceFee: number;
}

export type RetailPackageDefinition =
  | RetailFixedPackageConfig
  | RetailTouPackageConfig
  | RetailSpotLinkedPackageConfig;

export interface RetailTypicalMonthData {
  id: RetailTypicalMonth;
  name: string;
  baseDemandMwh: number;
  averageSpotPrice: number;
  referenceBidRange: readonly [number, number];
  daysInMonth: number;
  typicalDayId: RetailTypicalDay;
  feature: string;
}

export interface RetailTypicalDayData {
  id: RetailTypicalDay;
  month: RetailTypicalMonth;
  name: string;
  dayWeight: number;
  spotPrices: readonly number[];
}

export interface RetailMarketData {
  annual: RetailAnnualMarketData;
  customerPools: Record<RetailCustomerSegment, RetailCustomerPoolItem>;
  packages: Record<RetailPackageType, RetailPackageDefinition>;
  typicalMonths: Record<RetailTypicalMonth, RetailTypicalMonthData>;
  typicalDays: Record<RetailTypicalDay, RetailTypicalDayData>;
}

export interface CustomerMixResult {
  industrialShare: number;
  commercialShare: number;
  volatileShare: number;
}

export interface AnnualBilateralDealResult {
  accepted: boolean;
  floorPrice: number;
  bidPrice: number | null;
  message: string;
}

export interface AnnualContractResult {
  volumeMwh: number;
  cost: number;
  accepted: boolean;
  coverageRatio: number;
  bidPrice: number;
  curveType: AnnualContractCurveType;
}

export interface MonthlyAuctionResult {
  month: RetailTypicalMonth;
  participates: boolean;
  demandMwh: number;
  volumeMwh: number;
  cost: number;
  coverageRatio: number;
  bidPrice: number | null;
  curveType: MonthlyContractCurveType | null;
  pricePosition: RetailPricePosition | null;
}

export interface RetailMonthlyAuctionResults {
  totalVolumeMwh: number;
  totalCost: number;
  byMonth: Record<RetailTypicalMonth, MonthlyAuctionResult>;
}

export interface HourlyExposurePoint {
  hour: number;
  customerLoadMwh: number;
  annualContractMwh: number;
  monthlyContractMwh: number;
  spotPrice: number;
  netExposureMwh: number;
  positiveExposureMwh: number;
  negativeExposureMwh: number;
  positiveExposureCostComponent: number;
  negativeExposureRisk: number;
}

export interface TypicalDayExposureResult {
  day: RetailTypicalDay;
  month: RetailTypicalMonth;
  dayWeight: number;
  hourly: HourlyExposurePoint[];
  positiveExposureMwh: number;
  negativeExposureMwh: number;
  highPricePositiveExposureMwh: number;
  lowPriceNegativeExposureMwh: number;
  positiveExposureCostComponent: number;
  negativeExposureRisk: number;
  annualizedRiskAdjustment: number;
}

export interface CurveMismatchRiskResult {
  byTypicalDay: Record<RetailTypicalDay, TypicalDayExposureResult>;
  positiveExposureMwh: number;
  negativeExposureMwh: number;
  highPricePositiveExposureMwh: number;
  lowPriceNegativeExposureMwh: number;
  positiveExposureCostComponent: number;
  negativeExposureRisk: number;
  curveMismatchRiskAdjustment: number;
  curveMatchScore: number;
}

export interface RetailSettlementResult {
  annualServiceMwh: number;
  customerMix: CustomerMixResult;
  retailRevenue: number;
  annualContract: AnnualContractResult;
  monthlyAuction: RetailMonthlyAuctionResults;
  exposure: {
    totalNetExposureMwh: number;
    positiveExposureMwh: number;
    negativeExposureMwh: number;
    highPricePositiveExposureMwh: number;
    lowPriceNegativeExposureMwh: number;
    curveMatchScore: number;
    riskLevel: RetailRiskLevel;
  };
  costs: {
    annualContractCost: number;
    monthlyAuctionCost: number;
    baseSpotCost: number;
    positiveExposureCostComponent: number;
    negativeExposureRisk: number;
    curveMismatchRiskAdjustment: number;
    totalProcurementCost: number;
  };
  margin: {
    grossMargin: number;
    grossMarginRate: number;
  };
  diagnostics: string[];
}

export interface RetailExecutionRecord {
  id: string;
  mode: "execution";
  participant: "retailer";
  participantName: "售电公司";
  savedAt: string;
  decisions: RetailTrainingState;
  result: RetailSettlementResult;
  summary: string;
}
