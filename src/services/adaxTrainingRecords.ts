import { adaxScenarioMeta } from "../data/adaxScenarioMeta";
import { roleMeta } from "../data/adaxRoles";
import { buildRetailExecutionRecord } from "../domain/retailRecords";
import {
  buildRetailReviewRecordSnapshot,
  buildRetailReviewRecordSummary,
  getRetailReviewMaterialStats
} from "../domain/retailReviewMaterials";
import type { RetailSettlementResult, RetailTrainingState } from "../domain/retailTypes";
import type { AdaxTrainingRecord, UserMaterial } from "../types";
import { getAdaxTrainingRecords, saveAdaxTrainingRecord } from "../utils/adaxStorage";

export function saveRetailExecutionTrainingRecord(state: RetailTrainingState, result: RetailSettlementResult) {
  const savedAtIso = new Date().toISOString();
  const savedAt = formatTrainingSavedAt(savedAtIso);
  const recordId = `retail-execution-${Date.now()}`;
  const retailRecord = buildRetailExecutionRecord(state, result, savedAtIso, recordId);
  const record: AdaxTrainingRecord = {
    id: recordId,
    schemaVersion: "0.1",
    mode: "execution",
    scenarioId: adaxScenarioMeta.id,
    scenarioName: adaxScenarioMeta.name,
    roleId: "retailer",
    roleName: roleMeta.retailer.name,
    savedAt,
    savedAtIso,
    grossMargin: result.margin.grossMargin,
    summary: retailRecord.summary,
    diagnostics: result.diagnostics,
    execution: retailRecord,
    revisit: {
      page: "settlement",
      mode: "execution",
      scenarioId: adaxScenarioMeta.id,
      roleId: "retailer"
    }
  };

  return saveAdaxTrainingRecord(record);
}

export function saveRetailReviewTrainingRecord(materials: UserMaterial[]) {
  const savedAtIso = new Date().toISOString();
  const roleName = roleMeta.retailer.name;
  const scope = { scenarioId: adaxScenarioMeta.id, participantType: "retailer" as const };
  const review = buildRetailReviewRecordSnapshot(materials, scope);
  if (!review) return getAdaxTrainingRecords();

  const stats = getRetailReviewMaterialStats(materials, scope);
  const record: AdaxTrainingRecord = {
    id: `review-retailer-${Date.now()}`,
    schemaVersion: "0.1",
    mode: "review",
    scenarioId: adaxScenarioMeta.id,
    scenarioName: adaxScenarioMeta.name,
    roleId: "retailer",
    roleName,
    savedAt: formatTrainingSavedAt(savedAtIso),
    savedAtIso,
    grossMargin: 0,
    summary: buildRetailReviewRecordSummary(roleName, stats),
    diagnostics: ["复盘模式记录的是复盘材料，不是交易收益结果。"],
    materialCount: stats.materialCount,
    review,
    revisit: {
      page: "strategy",
      mode: "review",
      scenarioId: adaxScenarioMeta.id,
      roleId: "retailer"
    }
  };

  return saveAdaxTrainingRecord(record);
}

function formatTrainingSavedAt(savedAtIso: string) {
  return new Date(savedAtIso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
