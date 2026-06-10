import { calculateRetailSettlement } from "./retailCalculations";
import { buildRetailExecutionRecord } from "./retailRecords";
import type { RetailTrainingState } from "./retailTypes";
import { validateAnnualBilateral, validateRetailTrainingState } from "./retailValidation";

export const normalRetailState: RetailTrainingState = {
  customerContracts: {
    industrialStableMwh: 60000,
    commercialPeakMwh: 30000,
    volatileLoadMwh: 10000
  },
  retailPackage: {
    packageType: "tou"
  },
  annualBilateral: {
    coverageRatio: 100,
    bidPrice: 420,
    curveType: "industrial",
    counterpartyFloorPrice: 405,
    dealAccepted: null
  },
  monthlyAuctions: {
    march: {
      participates: false,
      coverageRatio: null,
      bidPrice: null,
      curveType: null
    },
    july: {
      participates: true,
      coverageRatio: 30,
      bidPrice: 530,
      curveType: "typicalMonth"
    },
    december: {
      participates: true,
      coverageRatio: 20,
      bidPrice: 500,
      curveType: "typicalMonth"
    }
  }
};

export const rejectedAnnualBilateralState: RetailTrainingState = {
  ...normalRetailState,
  annualBilateral: {
    ...normalRetailState.annualBilateral,
    bidPrice: 390
  }
};

export const curveMismatchAtFullCoverageState: RetailTrainingState = {
  ...normalRetailState,
  customerContracts: {
    industrialStableMwh: 10000,
    commercialPeakMwh: 50000,
    volatileLoadMwh: 10000
  },
  annualBilateral: {
    ...normalRetailState.annualBilateral,
    coverageRatio: 100,
    bidPrice: 420,
    curveType: "flat"
  },
  monthlyAuctions: {
    march: { participates: false, coverageRatio: null, bidPrice: null, curveType: null },
    july: { participates: false, coverageRatio: null, bidPrice: null, curveType: null },
    december: { participates: false, coverageRatio: null, bidPrice: null, curveType: null }
  }
};

export const overCoveredState: RetailTrainingState = {
  ...normalRetailState,
  annualBilateral: {
    ...normalRetailState.annualBilateral,
    coverageRatio: 120,
    bidPrice: 430,
    curveType: "flat"
  },
  monthlyAuctions: {
    march: { participates: false, coverageRatio: null, bidPrice: null, curveType: null },
    july: { participates: true, coverageRatio: 20, bidPrice: 520, curveType: "flat" },
    december: { participates: false, coverageRatio: null, bidPrice: null, curveType: null }
  }
};

export const noMonthlyAuctionState: RetailTrainingState = {
  ...normalRetailState,
  annualBilateral: {
    ...normalRetailState.annualBilateral,
    coverageRatio: 90,
    bidPrice: 415,
    curveType: "industrial"
  },
  monthlyAuctions: {
    march: { participates: false, coverageRatio: null, bidPrice: null, curveType: null },
    july: { participates: false, coverageRatio: null, bidPrice: null, curveType: null },
    december: { participates: false, coverageRatio: null, bidPrice: null, curveType: null }
  }
};

export function runRetailDomainChecks() {
  const normalValidation = validateRetailTrainingState(normalRetailState);
  assert(normalValidation.ok, `正常样例应通过校验：${normalValidation.errors.join("；")}`);
  const normalResult = calculateRetailSettlement(normalRetailState);
  assert(normalResult.annualContract.accepted, "正常样例年度双边应成交。");
  assert(normalResult.margin.grossMargin !== 0, "正常样例应生成毛利。");
  const record = buildRetailExecutionRecord(normalRetailState, normalResult, "2026-06-08T00:00:00.000Z");
  assert(record.mode === "execution" && record.participant === "retailer", "执行记录应标识售电公司执行模式。");

  const rejectedValidation = validateAnnualBilateral(rejectedAnnualBilateralState);
  assert(!rejectedValidation.ok, "年度报价 390 应被对手方拒绝。");
  assert(rejectedValidation.errors.some((item) => item.includes("无法达成")), "拒绝样例应提示双边协议无法达成。");

  const mismatchResult = calculateRetailSettlement(curveMismatchAtFullCoverageState);
  assert(mismatchResult.exposure.highPricePositiveExposureMwh > 0, "100% 覆盖的商业峰段组合仍应有高价时段正敞口。");
  assert(mismatchResult.costs.curveMismatchRiskAdjustment > 0, "100% 覆盖的曲线错配风险修正应大于 0。");

  const overCoveredResult = calculateRetailSettlement(overCoveredState);
  assert(overCoveredResult.exposure.negativeExposureMwh > 0, "120% 覆盖样例应出现负敞口。");
  assert(overCoveredResult.costs.negativeExposureRisk > 0, "120% 覆盖样例应产生过度锁定风险。");

  const noMonthlyResult = calculateRetailSettlement(noMonthlyAuctionState);
  assert(noMonthlyResult.monthlyAuction.totalVolumeMwh === 0, "月度全部不参与时补仓电量应为 0。");
  assert(noMonthlyResult.exposure.positiveExposureMwh > 0, "月度全部不参与仍应产生现货敞口。");

  return {
    normal: {
      annualServiceMwh: normalResult.annualServiceMwh,
      grossMargin: normalResult.margin.grossMargin,
      riskLevel: normalResult.exposure.riskLevel
    },
    rejectedAnnualBilateral: rejectedValidation.errors,
    fullCoverageMismatch: {
      highPricePositiveExposureMwh: mismatchResult.exposure.highPricePositiveExposureMwh,
      curveMismatchRiskAdjustment: mismatchResult.costs.curveMismatchRiskAdjustment
    },
    overCovered: {
      negativeExposureMwh: overCoveredResult.exposure.negativeExposureMwh,
      negativeExposureRisk: overCoveredResult.costs.negativeExposureRisk
    },
    noMonthlyAuction: {
      monthlyAuctionMwh: noMonthlyResult.monthlyAuction.totalVolumeMwh,
      positiveExposureMwh: noMonthlyResult.exposure.positiveExposureMwh
    },
    recordSummary: record.summary
  };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
