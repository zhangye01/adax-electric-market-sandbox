import type { AdaxRecordRevisitTarget, AdaxTrainingRecord } from "../types";

export function getAdaxRecordModeLabel(record: AdaxTrainingRecord) {
  return record.mode === "review" ? "复盘模式" : "执行模式";
}

export function getAdaxRecordTypeLabel(record: AdaxTrainingRecord) {
  return record.mode === "review" ? "复盘材料" : "策略结算";
}

export function getAdaxRecordRevisitTarget(record: AdaxTrainingRecord): AdaxRecordRevisitTarget | null {
  if (!record.revisit) return null;
  if (record.revisit.roleId !== "retailer") return null;

  if (record.revisit.mode === "execution") {
    if (record.mode === "review") return null;
    if (!record.execution?.decisions || !record.execution.result) return null;
    if (record.revisit.page !== "settlement" && record.revisit.page !== "review") return null;
    return record.revisit;
  }

  if (record.revisit.mode === "review") {
    if (record.mode !== "review") return null;
    if (record.revisit.page !== "strategy") return null;
    return record.revisit;
  }

  return null;
}

export function getAdaxRecordRevisitLabel(record: AdaxTrainingRecord) {
  const target = getAdaxRecordRevisitTarget(record);
  if (!target) return null;
  if (target.mode === "review") return "回到复盘工作台";
  return target.page === "review" ? "回看交易结果" : "回看结算结果";
}
