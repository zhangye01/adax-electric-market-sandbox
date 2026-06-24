import type { RetailTrainingState } from "../domain/retailTypes";
import { normalizeRetailExecutionTemplateState } from "./retailExecutionTemplateState";

const EXPORT_TYPE = "ADAX_RETAIL_EXECUTION_TEMPLATE";

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
    if (parsed.exportType !== EXPORT_TYPE) {
      return { ok: false, errors: ["模板类型不是售电公司执行模板。"] };
    }

    const normalized = normalizeRetailExecutionTemplateState(parsed.state);
    if (normalized.errors.length > 0 || !normalized.data) {
      return { ok: false, errors: normalized.errors };
    }

    return { ok: true, data: normalized.data, errors: [] };
  } catch {
    return { ok: false, errors: ["JSON 模板解析失败。"] };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
