import type { AdaxTrainingRecord, UserMaterial } from "../types";

const STORAGE_KEY = "adax-training-records-v0-1";
const MATERIALS_KEY = "adax-user-materials-v0-1";

export function getAdaxTrainingRecords(): AdaxTrainingRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAdaxTrainingRecord);
  } catch {
    return [];
  }
}

export function saveAdaxTrainingRecord(record: AdaxTrainingRecord) {
  if (typeof window === "undefined") return [record];
  const records = getAdaxTrainingRecords();
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  return nextRecords;
}

export function clearAdaxTrainingRecords() {
  if (typeof window === "undefined") return [];
  window.localStorage.removeItem(STORAGE_KEY);
  return [];
}

export function getAdaxUserMaterials(): UserMaterial[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(MATERIALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isUserMaterial);
  } catch {
    return [];
  }
}

export function saveAdaxUserMaterials(materials: UserMaterial[]) {
  if (typeof window === "undefined") return materials.filter(isUserMaterial);
  const nextMaterials = materials.filter(isUserMaterial);
  window.localStorage.setItem(MATERIALS_KEY, JSON.stringify(nextMaterials));
  return nextMaterials;
}

function isAdaxTrainingRecord(value: unknown): value is AdaxTrainingRecord {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.scenarioId === "string" &&
    typeof value.scenarioName === "string" &&
    typeof value.roleId === "string" &&
    typeof value.roleName === "string" &&
    typeof value.savedAt === "string" &&
    typeof value.grossMargin === "number" &&
    Number.isFinite(value.grossMargin) &&
    typeof value.summary === "string" &&
    Array.isArray(value.diagnostics)
  );
}

function isUserMaterial(value: unknown): value is UserMaterial {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.nodeId === "string" &&
    typeof value.scenarioId === "string" &&
    typeof value.participantType === "string" &&
    isAdaxRoleId(value.participantType) &&
    typeof value.title === "string" &&
    typeof value.materialType === "string" &&
    isUserMaterialType(value.materialType) &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isAdaxRoleId(value: string) {
  return value === "retailer" || value === "thermal" || value === "renewable" || value === "storage";
}

function isUserMaterialType(value: string) {
  return value === "我的理解" || value === "教材摘录" || value === "业务案例";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
