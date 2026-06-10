import type { RetailExecutionRecord } from "./domain/retailTypes";

export type AdaxPageId = "home" | "start" | "scenario" | "role" | "strategy" | "settlement" | "review" | "records" | "about" | "guide";

export type AdaxTrainingStep = "start" | "scenario" | "role" | "strategy" | "settlement" | "review";

export type AdaxTrainingMode = "execution" | "review";

export type AdaxRoleId = "retailer" | "thermal" | "renewable" | "storage";

export interface UserMaterial {
  id: string;
  nodeId: string;
  scenarioId: string;
  participantType: AdaxRoleId;
  title: string;
  materialType: "我的理解" | "教材摘录" | "业务案例";
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdaxReviewRecordSnapshot {
  scenarioId: string;
  roleId: "retailer";
  materials: UserMaterial[];
  materialCount: number;
  coveredNodeIds: string[];
}

export interface AdaxRecordRevisitTarget {
  page: AdaxPageId;
  mode: AdaxTrainingMode;
  scenarioId: string;
  roleId: "retailer";
}

export interface AdaxTrainingRecord {
  id: string;
  schemaVersion?: "0.1";
  mode?: AdaxTrainingMode;
  scenarioId: string;
  scenarioName: string;
  roleId: AdaxRoleId;
  roleName: string;
  savedAt: string;
  savedAtIso?: string;
  grossMargin: number;
  summary: string;
  diagnostics: string[];
  materialCount?: number;
  execution?: RetailExecutionRecord;
  review?: AdaxReviewRecordSnapshot;
  revisit?: AdaxRecordRevisitTarget;
}
