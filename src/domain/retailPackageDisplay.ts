import { retailMarketData } from "../data/retailMarketData";
import type { RetailMarketData, RetailPackageType, RetailTrainingState } from "./retailTypes";

export interface RetailPackageOptionDisplay {
  id: RetailPackageType;
  label: string;
  priceText: string;
  description: string;
  active: boolean;
}

export interface RetailPackageDisplay {
  options: RetailPackageOptionDisplay[];
  selectedPackage: RetailPackageType | null;
  selectedPackageLabel: string;
  selectedPackageDescription: string;
  selectedCount: number;
  requiredCount: number;
  statusLabel: string;
}

const packageOrder: readonly RetailPackageType[] = ["fixed", "tou", "spotLinked"];

export function buildRetailPackageDisplay(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
): RetailPackageDisplay {
  const selectedPackage = state.retailPackage.packageType;
  const options = packageOrder.map((packageType) => {
    const item = market.packages[packageType];
    return {
      id: packageType,
      label: item.name,
      priceText: getPackagePriceText(packageType, market),
      description: item.description,
      active: selectedPackage === packageType
    };
  });
  const selectedOption = selectedPackage ? options.find((option) => option.id === selectedPackage) ?? null : null;

  return {
    options,
    selectedPackage,
    selectedPackageLabel: selectedOption?.label ?? "待选择",
    selectedPackageDescription: selectedOption?.description ?? "选择套餐后，将据此计算零售收入并进入年度双边采购。",
    selectedCount: selectedPackage ? 1 : 0,
    requiredCount: 1,
    statusLabel: selectedOption
      ? `已选择${selectedOption.label}，下一步配置年度双边采购。`
      : "请选择一种零售套餐。"
  };
}

function getPackagePriceText(packageType: RetailPackageType, market: RetailMarketData) {
  const item = market.packages[packageType];
  if (item.id === "fixed") return `${item.fixedPrice} 元/MWh`;
  if (item.id === "tou") return `谷 ${item.valleyPrice} / 平 ${item.flatPrice} / 峰 ${item.peakPrice}`;
  return `现货 x ${Math.round(item.spotFactor * 100)}% + ${item.serviceFee}`;
}
