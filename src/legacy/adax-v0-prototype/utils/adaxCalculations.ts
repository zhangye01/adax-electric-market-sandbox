import type {
  AdaxSettlement,
  MarketScenarioPackage,
  MonthlyPoint,
  PeakType,
  RetailerSettlement,
  RetailerStrategy,
  RetailCustomerType,
  RetailPackageId,
  SpotInterval,
  ThermalSettlement,
  ThermalStrategy,
  ThermalOfferSegment,
  ValidationResult
} from "../types";

const INTERVAL_HOURS = 0.25;
const CUSTOMER_KEYS: RetailCustomerType[] = ["industrialStable", "commercialPeak", "volatileLoad"];

export function defaultRetailerStrategy(): RetailerStrategy {
  return {
    customerMix: {
      industrialStable: 50,
      commercialPeak: 30,
      volatileLoad: 20
    },
    packageId: "fixed",
    contractEnergyMwh: 82000,
    contractPrice: 430
  };
}

export function defaultThermalStrategy(): ThermalStrategy {
  return {
    contractEnergyMwh: 1280000,
    contractPrice: 405,
    strategyTag: "balanced",
    offerSegments: [
      { segmentId: 1, loadRateLower: 0, loadRateUpper: 0.1, offerPrice: 292 },
      { segmentId: 2, loadRateLower: 0.1, loadRateUpper: 0.2, offerPrice: 308 },
      { segmentId: 3, loadRateLower: 0.2, loadRateUpper: 0.3, offerPrice: 328 },
      { segmentId: 4, loadRateLower: 0.3, loadRateUpper: 0.4, offerPrice: 350 },
      { segmentId: 5, loadRateLower: 0.4, loadRateUpper: 0.5, offerPrice: 378 },
      { segmentId: 6, loadRateLower: 0.5, loadRateUpper: 0.6, offerPrice: 410 },
      { segmentId: 7, loadRateLower: 0.6, loadRateUpper: 0.7, offerPrice: 450 },
      { segmentId: 8, loadRateLower: 0.7, loadRateUpper: 0.8, offerPrice: 498 },
      { segmentId: 9, loadRateLower: 0.8, loadRateUpper: 0.9, offerPrice: 560 },
      { segmentId: 10, loadRateLower: 0.9, loadRateUpper: 1, offerPrice: 650 }
    ]
  };
}

export function buildThermalStrategyFromTag(
  tag: Exclude<ThermalStrategy["strategyTag"], "custom">
): ThermalStrategy {
  const base = defaultThermalStrategy();
  const shift = tag === "conservative" ? 48 : tag === "aggressive" ? -38 : 0;
  return {
    ...base,
    strategyTag: tag,
    offerSegments: base.offerSegments.map((segment) => ({
      ...segment,
      offerPrice: round(segment.offerPrice + shift + segment.segmentId * (tag === "conservative" ? 3 : 0), 0)
    }))
  };
}

export function validateRetailerStrategy(
  scenario: MarketScenarioPackage,
  strategy: RetailerStrategy
): ValidationResult {
  const errors: string[] = [];
  const mixTotal = sum(CUSTOMER_KEYS.map((key) => strategy.customerMix[key] ?? 0));
  const totalLoad = estimateRetailerAnnualLoad(scenario, strategy);

  if (Math.abs(mixTotal - 100) > 0.1) {
    errors.push(`客户组合占比合计应为 100%，当前为 ${round(mixTotal, 1)}%。`);
  }
  if (!scenario.retailPackages.some((item) => item.id === strategy.packageId)) {
    errors.push("零售套餐不存在。");
  }
  if (strategy.contractEnergyMwh < 0) {
    errors.push("中长期合约电量不得小于 0。");
  }
  if (strategy.contractEnergyMwh > totalLoad * 1.15) {
    errors.push("中长期合约电量超过代理负荷 115% 边界。");
  }
  if (strategy.contractPrice < 120 || strategy.contractPrice > 760) {
    errors.push("中长期合约价格应在 120-760 元/MWh 范围内。");
  }

  return { ok: errors.length === 0, errors };
}

export function validateThermalStrategy(
  scenario: MarketScenarioPackage,
  strategy: ThermalStrategy
): ValidationResult {
  const errors: string[] = [];
  const maxContractEnergy = scenario.thermalUnit.availableCapacityMw * 8760 * 0.96;

  if (strategy.contractEnergyMwh < 0 || strategy.contractEnergyMwh > maxContractEnergy) {
    errors.push(`火电中长期合约电量应在 0-${round(maxContractEnergy, 0)} MWh 范围内。`);
  }
  if (strategy.contractPrice < 120 || strategy.contractPrice > 760) {
    errors.push("火电中长期合约价格应在 120-760 元/MWh 范围内。");
  }

  const sorted = [...strategy.offerSegments].sort((a, b) => a.segmentId - b.segmentId);
  if (sorted.length !== 10) {
    errors.push(`火电十段式报价必须包含 10 段，当前为 ${sorted.length} 段。`);
  }

  sorted.forEach((segment, index) => {
    const expectedId = index + 1;
    if (segment.segmentId !== expectedId) {
      errors.push(`火电报价段号必须为 1-10 且不重复，当前第 ${index + 1} 行为 ${segment.segmentId}。`);
    }
    if (segment.loadRateLower < 0 || segment.loadRateUpper > 1 || segment.loadRateLower >= segment.loadRateUpper) {
      errors.push(`第 ${segment.segmentId} 段负荷率区间无效。`);
    }
    if (segment.offerPrice < scenario.priceBounds.min || segment.offerPrice > scenario.priceBounds.max) {
      errors.push(
        `第 ${segment.segmentId} 段报价应在 ${scenario.priceBounds.min}-${scenario.priceBounds.max} 元/MWh。`
      );
    }
    if (index === 0 && Math.abs(segment.loadRateLower) > 0.0001) {
      errors.push("第 1 段负荷率下限必须为 0。");
    }
    if (index > 0 && Math.abs(segment.loadRateLower - sorted[index - 1].loadRateUpper) > 0.0001) {
      errors.push(`第 ${segment.segmentId} 段与前一段负荷率不连续。`);
    }
    if (index === sorted.length - 1 && Math.abs(segment.loadRateUpper - 1) > 0.0001) {
      errors.push("第 10 段负荷率上限必须为 1。");
    }
  });

  return { ok: errors.length === 0, errors: unique(errors) };
}

export function calculateRetailerSettlement(
  scenario: MarketScenarioPackage,
  strategy: RetailerStrategy
): RetailerSettlement {
  const packageConfig = scenario.retailPackages.find((item) => item.id === strategy.packageId)!;
  const profileWeights = buildProfileWeights(scenario);
  const monthly = new Map<number, MonthlyPoint>();
  let totalLoadMwh = 0;
  let retailRevenue = 0;
  let spotCost = 0;
  let highPriceExposureMwh = 0;

  const annualLoad = estimateRetailerAnnualLoad(scenario, strategy);
  const coverageRatio = annualLoad > 0 ? clamp(strategy.contractEnergyMwh / annualLoad, 0, 1.15) : 0;
  const spotRatio = Math.max(1 - coverageRatio, 0);

  for (const interval of scenario.spotIntervals) {
    const intervalLoad = calculateRetailerIntervalLoad(scenario, strategy, profileWeights, interval);
    const retailPrice = retailPriceForInterval(packageConfig.id, packageConfig, interval);
    const intervalRevenue = intervalLoad * retailPrice;
    const intervalSpotCost = intervalLoad * spotRatio * interval.defaultSpotPrice;

    totalLoadMwh += intervalLoad;
    retailRevenue += intervalRevenue;
    spotCost += intervalSpotCost;
    if (interval.defaultSpotPrice >= 520) highPriceExposureMwh += intervalLoad * spotRatio;

    addMonthly(monthly, interval.month, {
      revenue: intervalRevenue,
      cost: intervalSpotCost,
      margin: intervalRevenue - intervalSpotCost,
      exposure: intervalLoad * spotRatio
    });
  }

  const normalizedContractEnergy = Math.min(strategy.contractEnergyMwh, totalLoadMwh * 1.15);
  const contractCost = normalizedContractEnergy * strategy.contractPrice;
  const spotEnergyMwh = Math.max(totalLoadMwh - normalizedContractEnergy, 0);
  const grossMargin = retailRevenue - contractCost - spotCost;
  const monthlyPoints = finalizeMonthly(monthly).map((item) => {
    const contractCostShare = totalLoadMwh > 0 ? contractCost / 12 : 0;
    return {
      ...item,
      cost: round(item.cost + contractCostShare, 2),
      margin: round(item.margin - contractCostShare, 2)
    };
  });

  const diagnostics = buildRetailerDiagnostics({
    coverageRatio,
    spotRatio,
    highPriceExposureMwh,
    grossMargin,
    strategy,
    packageId: packageConfig.id
  });

  return {
    role: "retailer",
    totalLoadMwh: round(totalLoadMwh, 2),
    retailRevenue: round(retailRevenue, 2),
    contractEnergyMwh: round(normalizedContractEnergy, 2),
    contractCost: round(contractCost, 2),
    spotEnergyMwh: round(spotEnergyMwh, 2),
    spotCost: round(spotCost, 2),
    grossMargin: round(grossMargin, 2),
    grossMarginRate: retailRevenue > 0 ? round(grossMargin / retailRevenue, 4) : 0,
    spotExposureRate: round(spotRatio, 4),
    highPriceExposureMwh: round(highPriceExposureMwh, 2),
    diagnostics,
    suggestions: retailerSuggestions(diagnostics),
    monthly: monthlyPoints
  };
}

export function calculateThermalSettlement(
  scenario: MarketScenarioPackage,
  strategy: ThermalStrategy
): ThermalSettlement {
  const userClearing = clearThermalOffer(scenario, strategy.offerSegments);
  const defaultClearing = clearThermalOffer(scenario, scenario.defaultThermalOffer);
  const contractRevenue = strategy.contractEnergyMwh * strategy.contractPrice;
  const grossMargin = contractRevenue + userClearing.spotRevenue - userClearing.generationCost;
  const defaultGrossMargin = contractRevenue + defaultClearing.spotRevenue - defaultClearing.generationCost;
  const monthly = userClearing.monthly.map((point) => ({
    ...point,
    revenue: round(point.revenue + contractRevenue / 12, 2),
    margin: round(point.margin + contractRevenue / 12, 2)
  }));
  const diagnostics = buildThermalDiagnostics({
    clearedEnergyMwh: userClearing.clearedEnergyMwh,
    defaultClearedEnergyMwh: defaultClearing.clearedEnergyMwh,
    grossMargin,
    defaultGrossMargin,
    marginalIntervals: userClearing.marginalIntervals,
    averageOfferPrice: average(strategy.offerSegments.map((item) => item.offerPrice))
  });

  return {
    role: "thermal",
    clearedEnergyMwh: round(userClearing.clearedEnergyMwh, 2),
    defaultClearedEnergyMwh: round(defaultClearing.clearedEnergyMwh, 2),
    contractRevenue: round(contractRevenue, 2),
    spotRevenue: round(userClearing.spotRevenue, 2),
    generationCost: round(userClearing.generationCost, 2),
    grossMargin: round(grossMargin, 2),
    defaultGrossMargin: round(defaultGrossMargin, 2),
    profitDelta: round(grossMargin - defaultGrossMargin, 2),
    marginalIntervals: userClearing.marginalIntervals,
    diagnostics,
    suggestions: thermalSuggestions(diagnostics),
    monthly
  };
}

export function calculateSettlement(
  scenario: MarketScenarioPackage,
  role: "retailer" | "thermal",
  retailerStrategy: RetailerStrategy,
  thermalStrategy: ThermalStrategy
): AdaxSettlement {
  return role === "retailer"
    ? calculateRetailerSettlement(scenario, retailerStrategy)
    : calculateThermalSettlement(scenario, thermalStrategy);
}

export function estimateRetailerAnnualLoad(
  scenario: MarketScenarioPackage,
  strategy: RetailerStrategy
) {
  return sum(
    scenario.retailCustomers.map((customer) => customer.annualEnergyMwh * ((strategy.customerMix[customer.id] ?? 0) / 100))
  );
}

export function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("zh-CN")} 元`;
}

export function formatEnergy(value: number) {
  return `${Math.round(value).toLocaleString("zh-CN")} MWh`;
}

export function formatNumber(value: number, digits = 0) {
  return round(value, digits).toLocaleString("zh-CN");
}

export function formatPercent(value: number, digits = 1) {
  return `${round(value * 100, digits)}%`;
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function peakTypeName(type: PeakType) {
  if (type === "peak") return "峰段";
  if (type === "valley") return "谷段";
  return "平段";
}

function clearThermalOffer(scenario: MarketScenarioPackage, segments: ThermalOfferSegment[]) {
  const monthly = new Map<number, MonthlyPoint>();
  let clearedEnergyMwh = 0;
  let spotRevenue = 0;
  let generationCost = 0;
  let marginalIntervals = 0;

  const sorted = [...segments].sort((a, b) => a.offerPrice - b.offerPrice);

  for (const interval of scenario.spotIntervals) {
    const clearedSegments = sorted.filter((segment) => segment.offerPrice <= interval.defaultSpotPrice);
    const clearedMw = sum(
      clearedSegments.map((segment) =>
        Math.max(segment.loadRateUpper - segment.loadRateLower, 0) * scenario.thermalUnit.availableCapacityMw
      )
    );
    const highestClearedOffer = clearedSegments.length
      ? Math.max(...clearedSegments.map((segment) => segment.offerPrice))
      : 0;
    const eventPremium = interval.eventTag === "thermal-outage" || interval.eventTag === "fuel-cost-up" ? 18 : 0;
    const derivativePrice =
      clearedMw > 0 ? clamp(Math.max(interval.defaultSpotPrice * 0.92, highestClearedOffer) + eventPremium, 60, 950) : 0;
    const energy = clearedMw * INTERVAL_HOURS;
    const intervalRevenue = energy * derivativePrice;
    const intervalCost = energy * scenario.thermalUnit.marginalCost;

    clearedEnergyMwh += energy;
    spotRevenue += intervalRevenue;
    generationCost += intervalCost;
    if (clearedMw > 0 && Math.abs(derivativePrice - highestClearedOffer) <= 20) marginalIntervals += 1;

    addMonthly(monthly, interval.month, {
      revenue: intervalRevenue,
      cost: intervalCost,
      margin: intervalRevenue - intervalCost,
      clearedEnergy: energy
    });
  }

  return {
    clearedEnergyMwh,
    spotRevenue,
    generationCost,
    marginalIntervals,
    monthly: finalizeMonthly(monthly)
  };
}

function buildProfileWeights(scenario: MarketScenarioPackage) {
  const weights: Record<RetailCustomerType, number[]> = {
    industrialStable: [],
    commercialPeak: [],
    volatileLoad: []
  };

  scenario.spotIntervals.forEach((interval) => {
    weights.industrialStable.push(0.88 + 0.16 * gaussian(interval.hour + interval.quarter / 4, 10, 3.2) + 0.14 * gaussian(interval.hour + interval.quarter / 4, 19, 3.4));
    weights.commercialPeak.push(0.55 + 0.62 * gaussian(interval.hour + interval.quarter / 4, 11, 3.8) + 0.55 * gaussian(interval.hour + interval.quarter / 4, 19, 2.5));
    weights.volatileLoad.push(
      0.66 +
        0.35 * gaussian(interval.hour + interval.quarter / 4, 9, 2.6) +
        0.48 * gaussian(interval.hour + interval.quarter / 4, 20, 2.8) +
        (interval.eventTag === "high-heat" ? 0.22 : 0) +
        deterministicNoise(interval.dayOfYear, interval.hour, interval.quarter, 0.12)
    );
  });

  return {
    weights,
    totals: {
      industrialStable: sum(weights.industrialStable),
      commercialPeak: sum(weights.commercialPeak),
      volatileLoad: sum(weights.volatileLoad)
    }
  };
}

function calculateRetailerIntervalLoad(
  scenario: MarketScenarioPackage,
  strategy: RetailerStrategy,
  profileWeights: ReturnType<typeof buildProfileWeights>,
  interval: SpotInterval
) {
  return sum(
    scenario.retailCustomers.map((customer) => {
      const annualEnergy = customer.annualEnergyMwh * ((strategy.customerMix[customer.id] ?? 0) / 100);
      const weight = profileWeights.weights[customer.id][interval.index] ?? 0;
      const totalWeight = profileWeights.totals[customer.id] || 1;
      return annualEnergy * (weight / totalWeight);
    })
  );
}

function retailPriceForInterval(packageId: RetailPackageId, packageConfig: { peakPrice: number; flatPrice: number; valleyPrice: number; basePrice: number; spotLinkageFactor: number }, interval: SpotInterval) {
  if (packageId === "fixed") return packageConfig.basePrice;
  if (packageId === "tou") {
    const peakType = interval.hour <= 6 || interval.hour >= 23 ? "valley" : (interval.hour >= 8 && interval.hour <= 11) || (interval.hour >= 18 && interval.hour <= 21) ? "peak" : "flat";
    if (peakType === "peak") return packageConfig.peakPrice;
    if (peakType === "valley") return packageConfig.valleyPrice;
    return packageConfig.flatPrice;
  }
  return clamp(
    packageConfig.basePrice + (interval.defaultSpotPrice - 350) * packageConfig.spotLinkageFactor,
    packageConfig.valleyPrice,
    packageConfig.peakPrice
  );
}

function buildRetailerDiagnostics(input: {
  coverageRatio: number;
  spotRatio: number;
  highPriceExposureMwh: number;
  grossMargin: number;
  strategy: RetailerStrategy;
  packageId: RetailPackageId;
}) {
  const diagnostics: string[] = [];
  if (input.spotRatio > 0.38) diagnostics.push("现货敞口偏高，高价时段采购成本暴露较大。");
  if (input.coverageRatio > 0.9) diagnostics.push("合约覆盖偏高，在低价时段可能错过现货采购机会。");
  if (input.strategy.customerMix.commercialPeak >= 42) diagnostics.push("客户组合偏高峰，峰段价格风险会放大。");
  if (input.packageId === "fixed" && input.highPriceExposureMwh > 10000) diagnostics.push("固定价套餐传导不足，批发侧上涨无法有效传导给用户。");
  if (input.grossMargin < 0) diagnostics.push("经营毛利为负，需要同步调整套餐、合约覆盖和客户结构。");
  if (diagnostics.length === 0) diagnostics.push("策略整体均衡，合约覆盖和现货敞口处于可解释区间。");
  return diagnostics.slice(0, 3);
}

function buildThermalDiagnostics(input: {
  clearedEnergyMwh: number;
  defaultClearedEnergyMwh: number;
  grossMargin: number;
  defaultGrossMargin: number;
  marginalIntervals: number;
  averageOfferPrice: number;
}) {
  const diagnostics: string[] = [];
  const clearedRatio = input.defaultClearedEnergyMwh > 0 ? input.clearedEnergyMwh / input.defaultClearedEnergyMwh : 1;
  if (clearedRatio < 0.72) diagnostics.push("报价整体偏高，出清电量显著低于默认报价。");
  if (input.averageOfferPrice < 360 && input.grossMargin < input.defaultGrossMargin) diagnostics.push("报价偏低但收益未改善，低价出清压缩了边际收益。");
  if (input.marginalIntervals > 5000) diagnostics.push("成为边际机组次数较多，报价曲线对派生价格影响明显。");
  if (input.grossMargin < input.defaultGrossMargin) diagnostics.push("当前报价相对默认策略毛利下降，需要复核中高负荷段报价。");
  if (diagnostics.length === 0) diagnostics.push("报价曲线与成本、出清机会较匹配，收益表现优于或接近默认策略。");
  return diagnostics.slice(0, 3);
}

function retailerSuggestions(diagnostics: string[]) {
  return diagnostics.map((diagnosis) => {
    if (diagnosis.includes("敞口")) return "提高峰段合约覆盖或切换到现货联动套餐，降低高价采购暴露。";
    if (diagnosis.includes("覆盖偏高")) return "下调低价月份合约覆盖，保留现货低价采购弹性。";
    if (diagnosis.includes("高峰")) return "降低商业峰段型客户占比，或提高峰段零售价格传导。";
    if (diagnosis.includes("传导")) return "评估峰谷价或现货联动价套餐，避免固定价承担全部批发侧风险。";
    if (diagnosis.includes("负")) return "先恢复毛利底线，再优化风险偏好。";
    return "保持当前均衡策略，并对高温和低负荷事件做专项复盘。";
  });
}

function thermalSuggestions(diagnostics: string[]) {
  return diagnostics.map((diagnosis) => {
    if (diagnosis.includes("偏高")) return "下调中低负荷段报价，先确保关键时段出清机会。";
    if (diagnosis.includes("偏低")) return "抬高中高负荷段报价，避免低价出清侵蚀毛利。";
    if (diagnosis.includes("边际")) return "复核边际频次高的报价段，判断是否需要分段拉开价差。";
    if (diagnosis.includes("下降")) return "对比默认报价，优先调整 60%-90% 负荷率区间。";
    return "保留当前报价结构，下一轮可针对燃料成本上行事件做压力测试。";
  });
}

function addMonthly(
  monthly: Map<number, MonthlyPoint>,
  month: number,
  values: Omit<MonthlyPoint, "month">
) {
  const current = monthly.get(month) ?? {
    month: `${month}月`,
    revenue: 0,
    cost: 0,
    margin: 0,
    exposure: 0,
    clearedEnergy: 0
  };
  monthly.set(month, {
    month: current.month,
    revenue: current.revenue + values.revenue,
    cost: current.cost + values.cost,
    margin: current.margin + values.margin,
    exposure: (current.exposure ?? 0) + (values.exposure ?? 0),
    clearedEnergy: (current.clearedEnergy ?? 0) + (values.clearedEnergy ?? 0)
  });
}

function finalizeMonthly(monthly: Map<number, MonthlyPoint>) {
  return [...monthly.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, point]) => ({
      month: point.month,
      revenue: round(point.revenue, 2),
      cost: round(point.cost, 2),
      margin: round(point.margin, 2),
      exposure: point.exposure ? round(point.exposure, 2) : undefined,
      clearedEnergy: point.clearedEnergy ? round(point.clearedEnergy, 2) : undefined
    }));
}

function peakTypeForHour(hour: number): PeakType {
  if (hour <= 6 || hour >= 23) return "valley";
  if ((hour >= 8 && hour <= 11) || (hour >= 18 && hour <= 21)) return "peak";
  return "flat";
}

function deterministicNoise(dayOfYear: number, hour: number, quarter: number, amplitude: number) {
  const seed = Math.sin(dayOfYear * 17.913 + hour * 81.77 + quarter * 13.19) * 29311.131;
  return (seed - Math.floor(seed) - 0.5) * amplitude;
}

function gaussian(value: number, center: number, width: number) {
  return Math.exp(-((value - center) ** 2) / (2 * width ** 2));
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  return values.length ? sum(values) / values.length : 0;
}
