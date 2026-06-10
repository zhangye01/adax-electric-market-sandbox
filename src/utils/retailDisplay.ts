import { retailMarketData } from "../data/retailMarketData";
import type { RetailCustomerSegment, RetailPackageType, RetailRiskLevel, RetailTypicalMonth } from "../domain/retailTypes";
import { formatPercent } from "./formatters";

export const retailCustomerSegmentLabels: Record<RetailCustomerSegment, string> = {
  industrialStable: "工业稳定型",
  commercialPeak: "商业峰段型",
  volatileLoad: "波动负荷型"
};

export const retailPackageLabels: Record<RetailPackageType, string> = {
  fixed: "固定价套餐",
  tou: "分时价套餐",
  spotLinked: "现货联动套餐"
};

export const retailTypicalMonthShortLabels: Record<RetailTypicalMonth, string> = {
  march: "3 月",
  july: "7 月",
  december: "12 月"
};

export function retailPackagePriceText(packageType: RetailPackageType) {
  const item = retailMarketData.packages[packageType];
  if (item.id === "fixed") return `${item.fixedPrice} 元/MWh`;
  if (item.id === "tou") return `谷 ${item.valleyPrice} / 平 ${item.flatPrice} / 峰 ${item.peakPrice}`;
  return `现货 × ${formatPercent(item.spotFactor, 0)} + ${item.serviceFee}`;
}

export function retailRiskLabel(level: RetailRiskLevel) {
  if (level === "high") return "高";
  if (level === "medium") return "中";
  return "低";
}

export function retailRiskTone(level: RetailRiskLevel) {
  if (level === "high") return "red" as const;
  if (level === "medium") return "orange" as const;
  return "green" as const;
}
