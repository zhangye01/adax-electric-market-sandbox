import { retailMarketData } from "../data/retailMarketData";
import type {
  AnnualContractCurveType,
  MonthlyAuctionDecision,
  MonthlyContractCurveType,
  RetailPackageType,
  RetailTrainingState,
  RetailTypicalMonth
} from "../domain/retailTypes";

const MONTHS: RetailTypicalMonth[] = ["march", "july", "december"];
const PACKAGE_TYPES: RetailPackageType[] = ["fixed", "tou", "spotLinked"];
const ANNUAL_CURVES: AnnualContractCurveType[] = ["flat", "industrial"];
const MONTHLY_CURVES: MonthlyContractCurveType[] = ["flat", "typicalMonth"];

export function normalizeRetailExecutionTemplateState(value: unknown): { data?: RetailTrainingState; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { errors: ["模板缺少售电公司执行状态。"] };
  }

  const customerContracts = normalizeCustomerContracts(value.customerContracts, errors);
  const retailPackage = normalizeRetailPackage(value.retailPackage, errors);
  const annualBilateral = normalizeAnnualBilateral(value.annualBilateral, errors);
  const monthlyAuctions = normalizeMonthlyAuctions(value.monthlyAuctions, errors);

  if (errors.length > 0) {
    return { errors: unique(errors) };
  }

  return {
    data: {
      customerContracts,
      retailPackage,
      annualBilateral,
      monthlyAuctions
    },
    errors: []
  };
}

function normalizeCustomerContracts(value: unknown, errors: string[]): RetailTrainingState["customerContracts"] {
  if (!isRecord(value)) {
    errors.push("模板缺少客户签约电量。");
    return {
      industrialStableMwh: null,
      commercialPeakMwh: null,
      volatileLoadMwh: null
    };
  }

  return {
    industrialStableMwh: normalizeNullableNumber(value.industrialStableMwh, "工业稳定型签约电量", errors, {
      min: 0,
      max: retailMarketData.customerPools.industrialStable.maxContractMwh
    }),
    commercialPeakMwh: normalizeNullableNumber(value.commercialPeakMwh, "商业峰段型签约电量", errors, {
      min: 0,
      max: retailMarketData.customerPools.commercialPeak.maxContractMwh
    }),
    volatileLoadMwh: normalizeNullableNumber(value.volatileLoadMwh, "波动负荷型签约电量", errors, {
      min: 0,
      max: retailMarketData.customerPools.volatileLoad.maxContractMwh
    })
  };
}

function normalizeRetailPackage(value: unknown, errors: string[]): RetailTrainingState["retailPackage"] {
  if (!isRecord(value)) {
    errors.push("模板缺少零售套餐选择。");
    return { packageType: null };
  }

  return {
    packageType: normalizeNullableEnum(value.packageType, "零售套餐", PACKAGE_TYPES, errors)
  };
}

function normalizeAnnualBilateral(value: unknown, errors: string[]): RetailTrainingState["annualBilateral"] {
  if (!isRecord(value)) {
    errors.push("模板缺少年度双边交易。");
    return {
      coverageRatio: null,
      bidPrice: null,
      curveType: null,
      counterpartyFloorPrice: retailMarketData.annual.counterpartyFloorPrice,
      dealAccepted: null
    };
  }

  return {
    coverageRatio: normalizeNullableNumber(value.coverageRatio, "年度基础覆盖比例", errors, { min: 80, max: 120 }),
    bidPrice: normalizeNullableNumber(value.bidPrice, "年度双边报价", errors, {
      min: retailMarketData.annual.priceBounds[0],
      max: retailMarketData.annual.priceBounds[1]
    }),
    curveType: normalizeNullableEnum(value.curveType, "年度合约曲线", ANNUAL_CURVES, errors),
    counterpartyFloorPrice: normalizeRequiredNumber(value.counterpartyFloorPrice, "模拟对手方可接受下限", errors, {
      min: retailMarketData.annual.priceBounds[0],
      max: retailMarketData.annual.priceBounds[1]
    }),
    dealAccepted: normalizeNullableBoolean(value.dealAccepted, "年度双边成交状态", errors)
  };
}

function normalizeMonthlyAuctions(value: unknown, errors: string[]): RetailTrainingState["monthlyAuctions"] {
  const monthlyAuctions: RetailTrainingState["monthlyAuctions"] = {
    march: createNormalizedMonthlyAuction(),
    july: createNormalizedMonthlyAuction(),
    december: createNormalizedMonthlyAuction()
  };

  if (!isRecord(value)) {
    errors.push("模板缺少月度集中竞价。");
    return monthlyAuctions;
  }

  MONTHS.forEach((month) => {
    const decision = value[month];
    const monthLabel = retailMarketData.typicalMonths[month].name;
    if (!isRecord(decision)) {
      errors.push(`${monthLabel}缺少月度竞价决策。`);
      return;
    }
    const participates = normalizeNullableBoolean(decision.participates, `${monthLabel}参与状态`, errors);
    if (decision.participates !== true && hasMonthlyAuctionDetails(decision)) {
      errors.push(`${monthLabel}未参与时补仓比例、申报价格和月度合约曲线必须为 null。`);
    }
    monthlyAuctions[month] = {
      participates,
      coverageRatio: normalizeNullableNumber(decision.coverageRatio, `${monthLabel}补仓覆盖比例`, errors, { min: 0, max: 50 }),
      bidPrice: normalizeNullableNumber(decision.bidPrice, `${monthLabel}申报价格`, errors, {
        min: retailMarketData.annual.priceBounds[0],
        max: retailMarketData.annual.priceBounds[1]
      }),
      curveType: normalizeNullableEnum(decision.curveType, `${monthLabel}月度合约曲线`, MONTHLY_CURVES, errors)
    };
  });

  return monthlyAuctions;
}

function normalizeNullableNumber(
  value: unknown,
  label: string,
  errors: string[],
  range: { min: number; max: number }
): number | null {
  if (value === null) return null;
  return normalizeRequiredNumber(value, label, errors, range);
}

function normalizeRequiredNumber(
  value: unknown,
  label: string,
  errors: string[],
  range: { min: number; max: number }
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${label}必须是数字或 null。`);
    return range.min;
  }
  if (value < range.min || value > range.max) {
    errors.push(`${label}需在 ${range.min}-${range.max} 之间。`);
  }
  return value;
}

function normalizeNullableEnum<T extends string>(value: unknown, label: string, allowed: readonly T[], errors: string[]): T | null {
  if (value === null) return null;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    errors.push(`${label}不是支持的选项。`);
    return null;
  }
  return value as T;
}

function normalizeNullableBoolean(value: unknown, label: string, errors: string[]): boolean | null {
  if (value === null) return null;
  if (typeof value !== "boolean") {
    errors.push(`${label}必须为 true、false 或 null。`);
    return null;
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function hasMonthlyAuctionDetails(decision: Record<string, unknown>) {
  return decision.coverageRatio !== null || decision.bidPrice !== null || decision.curveType !== null;
}

function createNormalizedMonthlyAuction(): MonthlyAuctionDecision {
  return {
    participates: null,
    coverageRatio: null,
    bidPrice: null,
    curveType: null
  };
}
