import type { RetailExecutionRecord, RetailSettlementResult, RetailTrainingState } from "./retailTypes";

export function buildRetailExecutionRecord(
  state: RetailTrainingState,
  result: RetailSettlementResult,
  savedAt = new Date().toISOString(),
  id = `retail-execution-${Date.now()}`
): RetailExecutionRecord {
  return {
    id,
    mode: "execution",
    participant: "retailer",
    participantName: "售电公司",
    savedAt,
    decisions: cloneState(state),
    result: cloneSettlementResult(result),
    summary: buildExecutionSummary(result)
  };
}

export function buildExecutionSummary(result: RetailSettlementResult) {
  const margin = Math.round(result.margin.grossMargin).toLocaleString("zh-CN");
  const revenue = Math.round(result.retailRevenue).toLocaleString("zh-CN");
  const riskLabel = result.exposure.riskLevel === "high" ? "高" : result.exposure.riskLevel === "medium" ? "中" : "低";
  return `售电公司执行记录：零售收入 ${revenue} 元，毛利 ${margin} 元，综合风险 ${riskLabel}。`;
}

function cloneState(state: RetailTrainingState): RetailTrainingState {
  return {
    customerContracts: { ...state.customerContracts },
    retailPackage: { ...state.retailPackage },
    annualBilateral: { ...state.annualBilateral },
    monthlyAuctions: {
      march: { ...state.monthlyAuctions.march },
      july: { ...state.monthlyAuctions.july },
      december: { ...state.monthlyAuctions.december }
    }
  };
}

function cloneSettlementResult(result: RetailSettlementResult): RetailSettlementResult {
  return JSON.parse(JSON.stringify(result)) as RetailSettlementResult;
}
