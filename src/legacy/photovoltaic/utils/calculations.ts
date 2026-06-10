import type {
  BenchmarkResult,
  HourlyResult,
  ScoreBreakdown,
  StrategyId,
  SummaryMetrics,
  TrainingScenario
} from "../types";

const TOLERANCE_RATE = 0.05;
const PENALTY_RATE = 0.2;

const strategyConfig: Record<Exclude<StrategyId, "custom">, { name: string; ratio: number }> = {
  steady: { name: "稳健申报", ratio: 0.88 },
  balanced: { name: "均衡申报", ratio: 0.94 },
  aggressive: { name: "积极申报", ratio: 1 }
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function generateStrategyDeclarations(
  scenario: TrainingScenario,
  strategy: Exclude<StrategyId, "custom">
) {
  const ratio = strategyConfig[strategy].ratio;
  return scenario.data.map((item) =>
    round(clamp(item.forecastPower * ratio, 0, scenario.availableCapacity), 1)
  );
}

export function calculateTrainingResult(
  scenario: TrainingScenario,
  declarations: number[]
): { hourlyResults: HourlyResult[]; summary: SummaryMetrics } {
  const hourlyResults = scenario.data.map((item, index) => {
    const declaredPower = round(clamp(declarations[index] ?? 0, 0, scenario.availableCapacity), 2);
    const clearedPower = round(Math.min(declaredPower, scenario.availableCapacity), 2);
    const deviationPower = round(item.actualPower - clearedPower, 2);
    const revenue = clearedPower * item.dayAheadPrice;
    const chargeableDeviation = Math.max(
      Math.abs(deviationPower) - clearedPower * TOLERANCE_RATE,
      0
    );
    const penalty = chargeableDeviation * item.dayAheadPrice * PENALTY_RATE;
    const profit = revenue - penalty;

    return {
      ...item,
      declaredPower,
      clearedPower,
      deviationPower,
      revenue: round(revenue, 2),
      chargeableDeviation: round(chargeableDeviation, 2),
      penalty: round(penalty, 2),
      profit: round(profit, 2)
    };
  });

  const totalForecast = sum(hourlyResults.map((item) => item.forecastPower));
  const totalDeclared = sum(hourlyResults.map((item) => item.declaredPower));
  const totalActual = sum(hourlyResults.map((item) => item.actualPower));
  const totalRevenue = sum(hourlyResults.map((item) => item.revenue));
  const totalPenalty = sum(hourlyResults.map((item) => item.penalty));
  const totalProfit = sum(hourlyResults.map((item) => item.profit));
  const absoluteDeviation = sum(hourlyResults.map((item) => Math.abs(item.deviationPower)));
  const totalDeviationRate = totalDeclared > 0 ? absoluteDeviation / totalDeclared : 0;
  const unitProfit = totalDeclared > 0 ? totalProfit / totalDeclared : 0;
  const penaltyRatio = totalRevenue > 0 ? totalPenalty / totalRevenue : 0;

  return {
    hourlyResults,
    summary: {
      totalForecast: round(totalForecast, 1),
      totalDeclared: round(totalDeclared, 1),
      totalActual: round(totalActual, 1),
      totalRevenue: round(totalRevenue, 2),
      totalPenalty: round(totalPenalty, 2),
      totalProfit: round(totalProfit, 2),
      totalDeviationRate: round(totalDeviationRate, 4),
      unitProfit: round(unitProfit, 2),
      penaltyRatio: round(penaltyRatio, 4)
    }
  };
}

export function calculateBenchmarks(scenario: TrainingScenario): BenchmarkResult[] {
  return (Object.keys(strategyConfig) as Array<Exclude<StrategyId, "custom">>).map((id) => {
    const declarations = generateStrategyDeclarations(scenario, id);
    const { summary } = calculateTrainingResult(scenario, declarations);

    return {
      id,
      name: strategyConfig[id].name,
      totalDeclared: summary.totalDeclared,
      totalProfit: summary.totalProfit,
      totalPenalty: summary.totalPenalty,
      deviationRate: summary.totalDeviationRate
    };
  });
}

export function calculateScores(
  scenario: TrainingScenario,
  declarations: number[],
  summary: SummaryMetrics,
  benchmarks = calculateBenchmarks(scenario)
): ScoreBreakdown {
  const processCompletion = 100;
  const declarationRationality = calculateDeclarationRationality(scenario, declarations);
  const deviationControl = clamp(100 - Math.max(summary.totalDeviationRate - 0.05, 0) * 280, 45, 100);
  const benchmarkProfits = benchmarks.map((item) => item.totalProfit);
  const minBenchmark = Math.min(...benchmarkProfits);
  const maxBenchmark = Math.max(...benchmarkProfits);
  const revenuePerformance =
    maxBenchmark === minBenchmark
      ? 85
      : clamp(60 + ((summary.totalProfit - minBenchmark) / (maxBenchmark - minBenchmark)) * 40, 45, 100);
  const reviewUnderstanding = 80;
  const totalScore =
    processCompletion * 0.1 +
    declarationRationality * 0.3 +
    deviationControl * 0.25 +
    revenuePerformance * 0.25 +
    reviewUnderstanding * 0.1;

  return {
    processCompletion: round(processCompletion, 0),
    declarationRationality: round(declarationRationality, 0),
    deviationControl: round(deviationControl, 0),
    revenuePerformance: round(revenuePerformance, 0),
    reviewUnderstanding: round(reviewUnderstanding, 0),
    totalScore: round(totalScore, 0),
    grade: getGrade(totalScore),
    strategyProfile: getStrategyProfile(scenario, declarations)
  };
}

export function getDeclarationWarnings(scenario: TrainingScenario, declarations: number[]) {
  return scenario.data.flatMap((item, index) => {
    const declared = declarations[index] ?? 0;
    const warnings: string[] = [];

    if (declared < 0) {
      warnings.push(`${formatHour(item.hour)} 申报不得小于 0。`);
    }
    if (declared > scenario.availableCapacity) {
      warnings.push(`${formatHour(item.hour)} 申报超过可用容量 ${scenario.availableCapacity} MW。`);
    }
    if (item.forecastPower === 0 && declared > 0) {
      warnings.push(`${formatHour(item.hour)} 光伏夜间建议申报为 0。`);
    }
    if (item.confidenceLevel < 0.7 && declared > item.recommendedMax) {
      warnings.push(`${formatHour(item.hour)} 低置信度时段申报偏高，偏差费用风险上升。`);
    }
    if (item.dayAheadPrice >= 450 && item.forecastPower > 0 && declared < item.recommendedMin) {
      warnings.push(`${formatHour(item.hour)} 高价可发时段申报偏低，收益捕捉不足。`);
    }
    if (item.dayAheadPrice <= 180 && declared > item.recommendedMax) {
      warnings.push(`${formatHour(item.hour)} 午间低价时段申报偏积极，收益效率可能偏低。`);
    }

    return warnings;
  });
}

export function getReportNarrative(scores: ScoreBreakdown, summary: SummaryMetrics) {
  const roundedScore = round(scores.totalScore, 0);
  const deviation = `${round(summary.totalDeviationRate * 100, 1)}%`;

  return `本轮综合评分为 ${roundedScore} 分，整体表现为${scores.grade}。你的申报策略属于${scores.strategyProfile}，综合收益为 ${formatCurrency(summary.totalProfit)}，总偏差率为 ${deviation}。建议下一轮重点关注高价可发时段的申报策略优化，并在低置信度时段主动收窄偏差风险。`;
}

export function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

export function formatNumber(value: number, digits = 1) {
  return round(value, digits).toLocaleString("zh-CN");
}

function calculateDeclarationRationality(scenario: TrainingScenario, declarations: number[]) {
  const scores = scenario.data.map((item, index) => {
    const declared = clamp(declarations[index] ?? 0, 0, scenario.availableCapacity);

    if (item.recommendedMin === 0 && item.recommendedMax === 0) {
      return declared === 0 ? 100 : clamp(100 - declared * 8, 35, 100);
    }
    if (declared >= item.recommendedMin && declared <= item.recommendedMax) {
      return 100;
    }

    const distance =
      declared < item.recommendedMin ? item.recommendedMin - declared : declared - item.recommendedMax;
    const tolerance = Math.max(item.forecastPower * 0.18, 4);
    return clamp(100 - (distance / tolerance) * 28, 45, 100);
  });

  return average(scores);
}

function getGrade(score: number) {
  if (score >= 90) return "优秀";
  if (score >= 80) return "良好";
  if (score >= 70) return "合格";
  return "需改进";
}

function getStrategyProfile(scenario: TrainingScenario, declarations: number[]) {
  const totalDeclared = sum(declarations);
  const totalForecast = sum(scenario.data.map((item) => item.forecastPower));
  const ratio = totalForecast > 0 ? totalDeclared / totalForecast : 0;
  const lowConfidenceHours = scenario.data.filter((item) => item.confidenceLevel < 0.7);
  const lowConfidenceDeclared = lowConfidenceHours.reduce(
    (total, item) => total + (declarations[item.hour] ?? 0),
    0
  );
  const lowConfidenceRecommended = lowConfidenceHours.reduce(
    (total, item) => total + item.recommendedMax,
    0
  );

  if (ratio < 0.9) return "稳健偏保守";
  if (lowConfidenceDeclared > lowConfidenceRecommended * 1.08) return "积极偏冒进";
  if (ratio > 0.97) return "贴近预测型";
  return "均衡控制型";
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  return values.length ? sum(values) / values.length : 0;
}
