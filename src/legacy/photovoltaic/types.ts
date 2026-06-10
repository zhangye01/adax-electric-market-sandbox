export type PageId = "home" | "task" | "market" | "declaration" | "report";

export type TrainingStep = "task" | "market" | "declaration" | "report";

export type StrategyId = "steady" | "balanced" | "aggressive" | "custom";

export interface HourlyMarketData {
  hour: number;
  forecastPower: number;
  actualPower: number;
  dayAheadPrice: number;
  confidenceLevel: number;
  recommendedMin: number;
  recommendedMax: number;
  weatherType: string;
  cloudCover: number;
  irradiance: number;
  riskHint: string;
}

export interface TrainingScenario {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  stationName: string;
  stationType: string;
  installedCapacity: number;
  availableCapacity: number;
  levelTags: string[];
  data: HourlyMarketData[];
}

export interface HourlyResult extends HourlyMarketData {
  declaredPower: number;
  clearedPower: number;
  deviationPower: number;
  revenue: number;
  chargeableDeviation: number;
  penalty: number;
  profit: number;
}

export interface SummaryMetrics {
  totalForecast: number;
  totalDeclared: number;
  totalActual: number;
  totalRevenue: number;
  totalPenalty: number;
  totalProfit: number;
  totalDeviationRate: number;
  unitProfit: number;
  penaltyRatio: number;
}

export interface ScoreBreakdown {
  processCompletion: number;
  declarationRationality: number;
  deviationControl: number;
  revenuePerformance: number;
  reviewUnderstanding: number;
  totalScore: number;
  grade: string;
  strategyProfile: string;
}

export interface BenchmarkResult {
  id: Exclude<StrategyId, "custom">;
  name: string;
  totalDeclared: number;
  totalProfit: number;
  totalPenalty: number;
  deviationRate: number;
}

export interface TrainingRecord {
  id: string;
  scenarioId: string;
  scenarioName: string;
  date: string;
  savedAt: string;
  score: number;
  grade: string;
  strategyProfile: string;
  totalProfit: number;
  totalPenalty: number;
  totalDeviationRate: number;
}
