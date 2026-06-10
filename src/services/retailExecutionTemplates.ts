import { retailMarketData } from "../data/retailMarketData";
import type {
  AnnualContractCurveType,
  MonthlyContractCurveType,
  RetailPackageType,
  RetailTrainingState,
  RetailTypicalMonth
} from "../domain/retailTypes";

const EXPORT_TYPE = "ADAX_RETAIL_EXECUTION_TEMPLATE";
const MONTHS: RetailTypicalMonth[] = ["march", "july", "december"];
const PACKAGE_TYPES: RetailPackageType[] = ["fixed", "tou", "spotLinked"];
const ANNUAL_CURVES: AnnualContractCurveType[] = ["flat", "industrial"];
const MONTHLY_CURVES: MonthlyContractCurveType[] = ["flat", "typicalMonth"];

export function createRetailExecutionTemplateJson(state: RetailTrainingState) {
  return JSON.stringify(
    {
      exportType: EXPORT_TYPE,
      version: "0.1",
      state
    },
    null,
    2
  );
}

export function parseRetailExecutionTemplate(raw: string): { ok: boolean; data?: RetailTrainingState; errors: string[] } {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return { ok: false, errors: ["模板必须是 JSON 对象。"] };
    }
    if (typeof parsed.exportType === "string" && parsed.exportType !== EXPORT_TYPE) {
      return { ok: false, errors: ["模板类型不是售电公司执行模板。"] };
    }

    const state = parsed.state;
    const errors = validateTemplateState(state);
    if (errors.length > 0 || !isRecord(state)) {
      return { ok: false, errors };
    }

    return { ok: true, data: state as unknown as RetailTrainingState, errors: [] };
  } catch {
    return { ok: false, errors: ["JSON 模板解析失败。"] };
  }
}

function validateTemplateState(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return ["模板缺少售电公司执行状态。"];
  }

  validateCustomerContracts(value.customerContracts, errors);
  validateRetailPackage(value.retailPackage, errors);
  validateAnnualBilateral(value.annualBilateral, errors);
  validateMonthlyAuctions(value.monthlyAuctions, errors);

  return unique(errors);
}

function validateCustomerContracts(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("模板缺少客户签约电量。");
    return;
  }

  validateNullableNumber(value.industrialStableMwh, "工业稳定型签约电量", errors, {
    min: 0,
    max: retailMarketData.customerPools.industrialStable.maxContractMwh
  });
  validateNullableNumber(value.commercialPeakMwh, "商业峰段型签约电量", errors, {
    min: 0,
    max: retailMarketData.customerPools.commercialPeak.maxContractMwh
  });
  validateNullableNumber(value.volatileLoadMwh, "波动负荷型签约电量", errors, {
    min: 0,
    max: retailMarketData.customerPools.volatileLoad.maxContractMwh
  });
}

function validateRetailPackage(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("模板缺少零售套餐选择。");
    return;
  }
  validateNullableEnum(value.packageType, "零售套餐", PACKAGE_TYPES, errors);
}

function validateAnnualBilateral(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("模板缺少年度双边交易。");
    return;
  }

  validateNullableNumber(value.coverageRatio, "年度基础覆盖比例", errors, { min: 80, max: 120 });
  validateNullableNumber(value.bidPrice, "年度双边报价", errors, {
    min: retailMarketData.annual.priceBounds[0],
    max: retailMarketData.annual.priceBounds[1]
  });
  validateNullableEnum(value.curveType, "年度合约曲线", ANNUAL_CURVES, errors);
  validateRequiredNumber(value.counterpartyFloorPrice, "模拟对手方可接受下限", errors, {
    min: retailMarketData.annual.priceBounds[0],
    max: retailMarketData.annual.priceBounds[1]
  });
  if (value.dealAccepted !== null && typeof value.dealAccepted !== "boolean") {
    errors.push("年度双边成交状态必须为 true、false 或 null。");
  }
}

function validateMonthlyAuctions(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("模板缺少月度集中竞价。");
    return;
  }

  MONTHS.forEach((month) => {
    const decision = value[month];
    const monthLabel = retailMarketData.typicalMonths[month].name;
    if (!isRecord(decision)) {
      errors.push(`${monthLabel}缺少月度竞价决策。`);
      return;
    }
    if (decision.participates !== null && typeof decision.participates !== "boolean") {
      errors.push(`${monthLabel}参与状态必须为 true、false 或 null。`);
    }
    if (decision.participates !== true && hasMonthlyAuctionDetails(decision)) {
      errors.push(`${monthLabel}未参与时补仓比例、申报价格和月度合约曲线必须为 null。`);
    }
    validateNullableNumber(decision.coverageRatio, `${monthLabel}补仓覆盖比例`, errors, { min: 0, max: 50 });
    validateNullableNumber(decision.bidPrice, `${monthLabel}申报价格`, errors, {
      min: retailMarketData.annual.priceBounds[0],
      max: retailMarketData.annual.priceBounds[1]
    });
    validateNullableEnum(decision.curveType, `${monthLabel}月度合约曲线`, MONTHLY_CURVES, errors);
  });
}

function validateNullableNumber(
  value: unknown,
  label: string,
  errors: string[],
  range: { min: number; max: number }
) {
  if (value === null) return;
  validateRequiredNumber(value, label, errors, range);
}

function validateRequiredNumber(
  value: unknown,
  label: string,
  errors: string[],
  range: { min: number; max: number }
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${label}必须是数字或 null。`);
    return;
  }
  if (value < range.min || value > range.max) {
    errors.push(`${label}需在 ${range.min}-${range.max} 之间。`);
  }
}

function validateNullableEnum<T extends string>(value: unknown, label: string, allowed: readonly T[], errors: string[]) {
  if (value === null) return;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    errors.push(`${label}不是支持的选项。`);
  }
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
