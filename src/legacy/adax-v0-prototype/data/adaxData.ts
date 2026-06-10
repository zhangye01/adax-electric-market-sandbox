import type {
  ContractHour,
  MarketEvent,
  MarketScenarioPackage,
  PeakType,
  RetailCustomerProfile,
  RetailPackage,
  SpotInterval,
  ThermalOfferSegment,
  ThermalUnitProfile
} from "../types";

const MARKET_YEAR = 2026;
const DAYS = 365;
const INTERVALS_PER_DAY = 96;
const HOURS_PER_DAY = 24;

const events: MarketEvent[] = [
  {
    id: "cold-wave",
    name: "寒潮负荷事件",
    startDay: 15,
    endDay: 23,
    impact: "冬季负荷抬升，现货价格上行。"
  },
  {
    id: "low-load-holiday",
    name: "低负荷假期事件",
    startDay: 40,
    endDay: 46,
    impact: "低负荷与低价时段增多，合约覆盖过高会压缩灵活性。"
  },
  {
    id: "renewable-surge",
    name: "新能源大发事件",
    startDay: 105,
    endDay: 112,
    impact: "风光出力偏高，午间低价风险上升。"
  },
  {
    id: "high-heat",
    name: "高温负荷事件",
    startDay: 190,
    endDay: 205,
    impact: "尖峰负荷和高价暴露显著增加。"
  },
  {
    id: "thermal-outage",
    name: "火电检修集中事件",
    startDay: 250,
    endDay: 257,
    impact: "可控电源裕度收紧，边际价格上升。"
  },
  {
    id: "fuel-cost-up",
    name: "燃料成本上行事件",
    startDay: 300,
    endDay: 315,
    impact: "火电报价中枢上移，高价时段更集中。"
  }
];

const retailCustomers: RetailCustomerProfile[] = [
  {
    id: "industrialStable",
    name: "工业稳定型",
    annualEnergyMwh: 118000,
    peakRatio: 0.31,
    riskTag: "基础负荷稳定，适合训练合约覆盖匹配。"
  },
  {
    id: "commercialPeak",
    name: "商业峰段型",
    annualEnergyMwh: 86000,
    peakRatio: 0.46,
    riskTag: "峰段负荷集中，高价暴露更敏感。"
  },
  {
    id: "volatileLoad",
    name: "波动负荷型",
    annualEnergyMwh: 62000,
    peakRatio: 0.39,
    riskTag: "负荷不确定性高，现货敞口风险更大。"
  }
];

const retailPackages: RetailPackage[] = [
  {
    id: "fixed",
    name: "固定价套餐",
    basePrice: 520,
    peakPrice: 520,
    flatPrice: 520,
    valleyPrice: 520,
    spotLinkageFactor: 0,
    description: "用户侧价格固定，售电公司承担批发侧价格波动。"
  },
  {
    id: "tou",
    name: "峰谷价套餐",
    basePrice: 500,
    peakPrice: 640,
    flatPrice: 505,
    valleyPrice: 360,
    spotLinkageFactor: 0,
    description: "按峰平谷设置零售价格，训练负荷曲线匹配。"
  },
  {
    id: "spotLinked",
    name: "现货联动价套餐",
    basePrice: 468,
    peakPrice: 560,
    flatPrice: 470,
    valleyPrice: 340,
    spotLinkageFactor: 0.32,
    description: "零售价格部分跟随现货，训练风险传导。"
  }
];

const thermalUnit: ThermalUnitProfile = {
  id: "TH-A-001",
  name: "岭北 1 号火电机组",
  ratedCapacityMw: 600,
  availableCapacityMw: 540,
  marginalCost: 315,
  minStableLoadRate: 0.32
};

const defaultThermalOffer: ThermalOfferSegment[] = [
  { segmentId: 1, loadRateLower: 0, loadRateUpper: 0.1, offerPrice: 285 },
  { segmentId: 2, loadRateLower: 0.1, loadRateUpper: 0.2, offerPrice: 300 },
  { segmentId: 3, loadRateLower: 0.2, loadRateUpper: 0.3, offerPrice: 318 },
  { segmentId: 4, loadRateLower: 0.3, loadRateUpper: 0.4, offerPrice: 338 },
  { segmentId: 5, loadRateLower: 0.4, loadRateUpper: 0.5, offerPrice: 365 },
  { segmentId: 6, loadRateLower: 0.5, loadRateUpper: 0.6, offerPrice: 392 },
  { segmentId: 7, loadRateLower: 0.6, loadRateUpper: 0.7, offerPrice: 426 },
  { segmentId: 8, loadRateLower: 0.7, loadRateUpper: 0.8, offerPrice: 468 },
  { segmentId: 9, loadRateLower: 0.8, loadRateUpper: 0.9, offerPrice: 525 },
  { segmentId: 10, loadRateLower: 0.9, loadRateUpper: 1, offerPrice: 620 }
];

export const adaxScenario = buildScenarioPackage();

function buildScenarioPackage(): MarketScenarioPackage {
  const spotIntervals: SpotInterval[] = [];

  for (let dayOfYear = 1; dayOfYear <= DAYS; dayOfYear += 1) {
    const date = dateFromDayOfYear(dayOfYear);
    const month = Number(date.slice(5, 7));
    const event = eventForDay(dayOfYear);

    for (let quarterOfDay = 0; quarterOfDay < INTERVALS_PER_DAY; quarterOfDay += 1) {
      const hour = Math.floor(quarterOfDay / 4);
      const quarter = quarterOfDay % 4;
      const intervalIndex = (dayOfYear - 1) * INTERVALS_PER_DAY + quarterOfDay;
      const point = buildSpotPoint(dayOfYear, month, hour, quarter, event?.id ?? "normal");

      spotIntervals.push({
        index: intervalIndex,
        date,
        dayOfYear,
        month,
        hour,
        quarter,
        ...point,
        eventTag: event?.id ?? "normal"
      });
    }
  }

  const contractHours = buildContractHours(spotIntervals);

  return {
    id: "SCN-A-STD-001",
    name: "虚拟省级市场 A | 标准年度场景",
    marketYear: MARKET_YEAR,
    status: "locked",
    difficulty: "standard",
    spotIntervals,
    contractHours,
    events,
    retailCustomers,
    retailPackages,
    thermalUnit,
    defaultThermalOffer,
    priceBounds: {
      min: 60,
      max: 950
    }
  };
}

function buildContractHours(spotIntervals: SpotInterval[]): ContractHour[] {
  const hours: ContractHour[] = [];
  for (let i = 0; i < spotIntervals.length; i += 4) {
    const slice = spotIntervals.slice(i, i + 4);
    const first = slice[0];
    hours.push({
      hourIndex: i / 4,
      date: first.date,
      dayOfYear: first.dayOfYear,
      month: first.month,
      hour: first.hour,
      peakType: peakTypeForHour(first.hour),
      averageLoadMw: round(average(slice.map((item) => item.loadMw)), 2),
      averageSpotPrice: round(average(slice.map((item) => item.defaultSpotPrice)), 2)
    });
  }
  return hours;
}

function buildSpotPoint(
  dayOfYear: number,
  month: number,
  hour: number,
  quarter: number,
  eventTag: string
): Omit<SpotInterval, "index" | "date" | "dayOfYear" | "month" | "hour" | "quarter" | "eventTag"> {
  const season = Math.sin(((dayOfYear - 80) / DAYS) * Math.PI * 2);
  const summer = month >= 6 && month <= 8 ? 1 : 0;
  const winter = month <= 2 || month === 12 ? 1 : 0;
  const daytime = Math.max(0, Math.sin(((hour + quarter / 4 - 6) / 12) * Math.PI));
  const morningPeak = gaussian(hour + quarter / 4, 9, 2.1);
  const eveningPeak = gaussian(hour + quarter / 4, 19, 2.5);
  const eventLoadBoost = eventTag === "high-heat" ? 690 : eventTag === "cold-wave" ? 530 : eventTag === "low-load-holiday" ? -720 : 0;
  const loadMw = round(
    5200 +
      360 * winter +
      520 * summer +
      260 * season +
      640 * morningPeak +
      980 * eveningPeak +
      eventLoadBoost +
      deterministicNoise(dayOfYear, hour, quarter, 130),
    2
  );
  const windBoost = eventTag === "renewable-surge" ? 310 : 0;
  const windMw = round(
    clamp(
      780 +
        260 * Math.sin(((dayOfYear + 30) / DAYS) * Math.PI * 2) +
        170 * Math.sin(((hour + quarter / 4) / 24) * Math.PI * 2 + 1.2) +
        windBoost +
        deterministicNoise(dayOfYear + 7, hour, quarter, 95),
      180,
      1450
    ),
    2
  );
  const solarWeather = eventTag === "renewable-surge" ? 1.16 : eventTag === "cold-wave" ? 0.82 : 1;
  const solarMw = round(clamp(1380 * daytime * (0.83 + 0.17 * season) * solarWeather, 0, 1600), 2);
  const renewableMw = round(windMw + solarMw, 2);
  const netLoad = loadMw - renewableMw;
  const scarcity = eventTag === "thermal-outage" ? 78 : eventTag === "fuel-cost-up" ? 52 : 0;
  const lowLoadDiscount = eventTag === "low-load-holiday" ? 48 : eventTag === "renewable-surge" && daytime > 0.55 ? 62 : 0;
  const defaultSpotPrice = round(
    clamp(
      165 +
        netLoad * 0.046 +
        72 * eveningPeak +
        36 * morningPeak +
        44 * summer +
        28 * winter +
        scarcity -
        lowLoadDiscount +
        deterministicNoise(dayOfYear + 19, hour, quarter, 16),
      60,
      950
    ),
    2
  );

  return {
    loadMw: Math.max(loadMw, 0),
    windMw,
    solarMw,
    renewableMw,
    defaultSpotPrice
  };
}

function eventForDay(dayOfYear: number) {
  return events.find((event) => dayOfYear >= event.startDay && dayOfYear <= event.endDay);
}

function dateFromDayOfYear(dayOfYear: number) {
  const date = new Date(Date.UTC(MARKET_YEAR, 0, dayOfYear));
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${MARKET_YEAR}-${month}-${day}`;
}

function peakTypeForHour(hour: number): PeakType {
  if (hour <= 6 || hour >= 23) return "valley";
  if ((hour >= 8 && hour <= 11) || (hour >= 18 && hour <= 21)) return "peak";
  return "flat";
}

function deterministicNoise(dayOfYear: number, hour: number, quarter: number, amplitude: number) {
  const seed = Math.sin(dayOfYear * 12.9898 + hour * 78.233 + quarter * 37.719) * 43758.5453;
  return (seed - Math.floor(seed) - 0.5) * amplitude;
}

function gaussian(value: number, center: number, width: number) {
  return Math.exp(-((value - center) ** 2) / (2 * width ** 2));
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
