import type { RetailPricePosition, RetailTypicalDay, RetailTypicalMonth } from "./retailTypes";

export const RETAIL_TYPICAL_MONTHS: RetailTypicalMonth[] = ["march", "july", "december"];
export const RETAIL_TYPICAL_DAYS: RetailTypicalDay[] = ["marchLowPrice", "julyHighPrice", "decemberEveningPeak"];

export const HIGH_PRICE_THRESHOLD = 520;
export const LOW_PRICE_THRESHOLD = 335;

export function normalizeCurve(curve: readonly number[]) {
  const total = sum(curve);
  if (curve.length !== 24 || total <= 0) {
    throw new Error("24 小时曲线必须包含 24 个正向权重。");
  }
  return curve.map((value) => value / total);
}

export function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function pricePosition(value: number, range: readonly [number, number]): RetailPricePosition {
  if (value < range[0]) return "belowReference";
  if (value > range[1]) return "aboveReference";
  return "insideReference";
}
