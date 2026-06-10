export type RetailCustomerType = "industrialStable" | "commercialPeak" | "volatileLoad";

export type RetailPackageId = "fixed" | "tou" | "spotLinked";

export type PeakType = "valley" | "flat" | "peak";

export interface SpotInterval {
  index: number;
  date: string;
  dayOfYear: number;
  month: number;
  hour: number;
  quarter: number;
  loadMw: number;
  windMw: number;
  solarMw: number;
  renewableMw: number;
  defaultSpotPrice: number;
  eventTag: string;
}

export interface ContractHour {
  hourIndex: number;
  date: string;
  dayOfYear: number;
  month: number;
  hour: number;
  peakType: PeakType;
  averageLoadMw: number;
  averageSpotPrice: number;
}

export interface MarketEvent {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
  impact: string;
}

export interface RetailCustomerProfile {
  id: RetailCustomerType;
  name: string;
  annualEnergyMwh: number;
  peakRatio: number;
  riskTag: string;
}

export interface RetailPackage {
  id: RetailPackageId;
  name: string;
  basePrice: number;
  peakPrice: number;
  flatPrice: number;
  valleyPrice: number;
  spotLinkageFactor: number;
  description: string;
}

export interface ThermalUnitProfile {
  id: string;
  name: string;
  ratedCapacityMw: number;
  availableCapacityMw: number;
  marginalCost: number;
  minStableLoadRate: number;
}

export interface ThermalOfferSegment {
  segmentId: number;
  loadRateLower: number;
  loadRateUpper: number;
  offerPrice: number;
}

export interface MarketScenarioPackage {
  id: string;
  name: string;
  marketYear: number;
  status: "locked";
  difficulty: "standard";
  spotIntervals: SpotInterval[];
  contractHours: ContractHour[];
  events: MarketEvent[];
  retailCustomers: RetailCustomerProfile[];
  retailPackages: RetailPackage[];
  thermalUnit: ThermalUnitProfile;
  defaultThermalOffer: ThermalOfferSegment[];
  priceBounds: {
    min: number;
    max: number;
  };
}

export interface RetailerStrategy {
  customerMix: Record<RetailCustomerType, number>;
  packageId: RetailPackageId;
  contractEnergyMwh: number;
  contractPrice: number;
}

export interface ThermalStrategy {
  contractEnergyMwh: number;
  contractPrice: number;
  strategyTag: "conservative" | "balanced" | "aggressive" | "custom";
  offerSegments: ThermalOfferSegment[];
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  cost: number;
  margin: number;
  exposure?: number;
  clearedEnergy?: number;
}

export interface RetailerSettlement {
  role: "retailer";
  totalLoadMwh: number;
  retailRevenue: number;
  contractEnergyMwh: number;
  contractCost: number;
  spotEnergyMwh: number;
  spotCost: number;
  grossMargin: number;
  grossMarginRate: number;
  spotExposureRate: number;
  highPriceExposureMwh: number;
  diagnostics: string[];
  suggestions: string[];
  monthly: MonthlyPoint[];
}

export interface ThermalSettlement {
  role: "thermal";
  clearedEnergyMwh: number;
  defaultClearedEnergyMwh: number;
  contractRevenue: number;
  spotRevenue: number;
  generationCost: number;
  grossMargin: number;
  defaultGrossMargin: number;
  profitDelta: number;
  marginalIntervals: number;
  diagnostics: string[];
  suggestions: string[];
  monthly: MonthlyPoint[];
}

export type AdaxSettlement = RetailerSettlement | ThermalSettlement;

export interface MaterialSlot {
  id: string;
  title: string;
  type: "text" | "case" | "rule" | "note";
  description: string;
}

export interface TradeNode {
  id: string;
  title: string;
  participantType: "retailer" | "thermal";
  step: number;
  execution: {
    guidance: string;
    requiredAction?: string;
    formType?: string;
    validationRules?: string[];
  };
  review: {
    knowledgePrompt: string;
    standardExplanation: string;
    materialSlots: MaterialSlot[];
    commonMisunderstandings: string[];
    relatedConcepts: string[];
  };
  outputs: string[];
}
