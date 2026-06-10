import type { RetailMarketData, RetailTypicalDay, RetailTypicalMonth } from "./retailTypes";

type RetailMarketMonthLabel = "3 月" | "7 月" | "12 月";

export interface RetailAnnualMarketContext {
  referenceServiceMwh: number;
  averageSpotPrice: number;
  longTermReferenceRange: readonly [number, number];
  priceBounds: readonly [number, number];
  counterpartyFloorPrice: number;
  minLoadMw: number;
  maxLoadMw: number;
  peakValleySpreadMw: number;
  highPriceHours: number;
  lowPriceHours: number;
  operationFocus: string;
}

export interface RetailMonthlyMarketContext {
  id: RetailTypicalMonth;
  label: RetailMarketMonthLabel;
  name: string;
  baseDemandMwh: number;
  averageSpotPrice: number;
  referenceBidRange: readonly [number, number];
  daysInMonth: number;
  typicalDayId: RetailTypicalDay;
  typicalDayName: string;
  valleyPrice: number;
  peakPrice: number;
  spread: number;
  feature: string;
  operationFocus: string;
}

export interface RetailTypicalDayMarketContext {
  id: RetailTypicalDay;
  month: RetailTypicalMonth;
  monthLabel: RetailMarketMonthLabel;
  name: string;
  dayWeight: number;
  spotPrices: readonly number[];
  valleyPrice: number;
  peakPrice: number;
  valleyHour: number;
  peakHour: number;
  spread: number;
  operationFocus: string;
}

export interface RetailMarketContext {
  annual: RetailAnnualMarketContext;
  monthlyWindows: RetailMonthlyMarketContext[];
  typicalDays: RetailTypicalDayMarketContext[];
  summary: {
    peakTypicalDayPrice: number;
    highestAveragePriceMonth: RetailMonthlyMarketContext;
    lowestAveragePriceMonth: RetailMonthlyMarketContext;
    widestSpreadTypicalDay: RetailTypicalDayMarketContext;
  };
  operationSequence: readonly string[];
}

const retailTypicalMonthLabels: Record<RetailTypicalMonth, RetailMarketMonthLabel> = {
  march: "3 月",
  july: "7 月",
  december: "12 月"
};

const retailMarketMonthOrder: readonly RetailTypicalMonth[] = ["march", "july", "december"];

export function getRetailMarketContext(data: RetailMarketData): RetailMarketContext {
  const monthlyWindows = retailMarketMonthOrder.map((month) => buildMonthlyContext(data, month));
  const typicalDays = monthlyWindows.map((month) => buildTypicalDayContext(data, month.typicalDayId));

  return {
    annual: {
      referenceServiceMwh: data.annual.referenceServiceMwh,
      averageSpotPrice: data.annual.averageSpotPrice,
      longTermReferenceRange: data.annual.longTermReferenceRange,
      priceBounds: data.annual.priceBounds,
      counterpartyFloorPrice: data.annual.counterpartyFloorPrice,
      minLoadMw: data.annual.minLoadMw,
      maxLoadMw: data.annual.maxLoadMw,
      peakValleySpreadMw: data.annual.peakValleySpreadMw,
      highPriceHours: data.annual.highPriceHours,
      lowPriceHours: data.annual.lowPriceHours,
      operationFocus: "用于进入年度双边前判断签约量级、报价边界和曲线错配风险。"
    },
    monthlyWindows,
    typicalDays,
    summary: {
      peakTypicalDayPrice: Math.max(...typicalDays.map((day) => day.peakPrice)),
      highestAveragePriceMonth: maxBy(monthlyWindows, (month) => month.averageSpotPrice),
      lowestAveragePriceMonth: minBy(monthlyWindows, (month) => month.averageSpotPrice),
      widestSpreadTypicalDay: maxBy(typicalDays, (day) => day.spread)
    },
    operationSequence: ["年度行情", "典型月窗口", "24 小时典型日", "客户与交易动作"]
  };
}

function buildMonthlyContext(data: RetailMarketData, month: RetailTypicalMonth): RetailMonthlyMarketContext {
  const item = data.typicalMonths[month];
  const day = data.typicalDays[item.typicalDayId];
  const priceSummary = summarizePrices(day.spotPrices);

  return {
    id: item.id,
    label: retailTypicalMonthLabels[item.id],
    name: item.name,
    baseDemandMwh: item.baseDemandMwh,
    averageSpotPrice: item.averageSpotPrice,
    referenceBidRange: item.referenceBidRange,
    daysInMonth: item.daysInMonth,
    typicalDayId: item.typicalDayId,
    typicalDayName: day.name,
    valleyPrice: priceSummary.valleyPrice,
    peakPrice: priceSummary.peakPrice,
    spread: priceSummary.spread,
    feature: item.feature,
    operationFocus: "用于月度集中竞价的参与选择、补仓比例、申报价格和月度曲线选择。"
  };
}

function buildTypicalDayContext(data: RetailMarketData, dayId: RetailTypicalDay): RetailTypicalDayMarketContext {
  const day = data.typicalDays[dayId];
  const priceSummary = summarizePrices(day.spotPrices);

  return {
    id: day.id,
    month: day.month,
    monthLabel: retailTypicalMonthLabels[day.month],
    name: day.name,
    dayWeight: day.dayWeight,
    spotPrices: day.spotPrices,
    valleyPrice: priceSummary.valleyPrice,
    peakPrice: priceSummary.peakPrice,
    valleyHour: priceSummary.valleyHour,
    peakHour: priceSummary.peakHour,
    spread: priceSummary.spread,
    operationFocus: "用于观察高价正敞口、低价负敞口和合约曲线错配。"
  };
}

function summarizePrices(prices: readonly number[]) {
  const peakPrice = Math.max(...prices);
  const valleyPrice = Math.min(...prices);

  return {
    peakPrice,
    valleyPrice,
    peakHour: prices.findIndex((price) => price === peakPrice),
    valleyHour: prices.findIndex((price) => price === valleyPrice),
    spread: peakPrice - valleyPrice
  };
}

function maxBy<T>(items: readonly T[], getValue: (item: T) => number): T {
  return items.reduce((best, item) => (getValue(item) > getValue(best) ? item : best));
}

function minBy<T>(items: readonly T[], getValue: (item: T) => number): T {
  return items.reduce((best, item) => (getValue(item) < getValue(best) ? item : best));
}
