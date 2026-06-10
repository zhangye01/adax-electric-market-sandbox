import { retailReviewMaterialTypes } from "../data/retailReviewMaterials";
import { retailTrainingNodes } from "../data/retailTrainingNodes";
import type { AdaxReviewRecordSnapshot, UserMaterial } from "../types";

export interface RetailReviewMaterialScope {
  scenarioId: string;
  participantType: "retailer";
}

export interface RetailReviewMaterialStats {
  materials: UserMaterial[];
  materialCount: number;
  coveredNodeIds: string[];
  coveredNodeCount: number;
  nodeCount: number;
  materialSlotTotal: number;
  progressPercent: number;
}

const retailReviewNodeIds = new Set<string>(retailTrainingNodes.map((node) => node.id));
const retailReviewMaterialTypeSet = new Set<string>(retailReviewMaterialTypes);

export function getRetailReviewMaterials(
  materials: UserMaterial[],
  scope: RetailReviewMaterialScope,
  options: { nodeId?: string; filledOnly?: boolean } = {}
) {
  const filledOnly = options.filledOnly ?? true;
  return materials.filter((item) => {
    if (!isRetailReviewMaterialInScope(item, scope)) return false;
    if (options.nodeId && item.nodeId !== options.nodeId) return false;
    return filledOnly ? item.content.trim().length > 0 : true;
  });
}

export function getRetailReviewMaterialStats(
  materials: UserMaterial[],
  scope: RetailReviewMaterialScope
): RetailReviewMaterialStats {
  const scopedMaterials = getRetailReviewMaterials(materials, scope);
  const coveredNodeIds = unique(scopedMaterials.map((item) => item.nodeId));
  const nodeCount = retailTrainingNodes.length;
  const materialSlotTotal = nodeCount * retailReviewMaterialTypes.length;
  return {
    materials: scopedMaterials,
    materialCount: scopedMaterials.length,
    coveredNodeIds,
    coveredNodeCount: coveredNodeIds.length,
    nodeCount,
    materialSlotTotal,
    progressPercent: materialSlotTotal > 0 ? Math.round((scopedMaterials.length / materialSlotTotal) * 100) : 0
  };
}

export function canSaveRetailReviewRecord(materials: UserMaterial[], scope: RetailReviewMaterialScope) {
  return getRetailReviewMaterialStats(materials, scope).materialCount > 0;
}

export function buildRetailReviewRecordSummary(roleName: string, stats: RetailReviewMaterialStats) {
  return `${roleName}复盘模式已沉淀 ${stats.materialCount} 条材料，覆盖 ${stats.coveredNodeCount}/${stats.nodeCount} 个交易节点。`;
}

export function buildRetailReviewRecordSnapshot(
  materials: UserMaterial[],
  scope: RetailReviewMaterialScope
): AdaxReviewRecordSnapshot | null {
  const stats = getRetailReviewMaterialStats(materials, scope);
  if (stats.materialCount === 0) return null;

  return {
    scenarioId: scope.scenarioId,
    roleId: scope.participantType,
    materials: stats.materials.map(cloneMaterial),
    materialCount: stats.materialCount,
    coveredNodeIds: stats.coveredNodeIds
  };
}

export function isRetailReviewMaterialInScope(material: UserMaterial, scope: RetailReviewMaterialScope) {
  return (
    material.scenarioId === scope.scenarioId &&
    material.participantType === scope.participantType &&
    retailReviewNodeIds.has(material.nodeId) &&
    retailReviewMaterialTypeSet.has(material.materialType)
  );
}

export function mergeRetailReviewSnapshotMaterials(
  currentMaterials: UserMaterial[],
  snapshot: AdaxReviewRecordSnapshot
) {
  const snapshotIds = new Set(snapshot.materials.map((item) => item.id));
  return [
    ...snapshot.materials.map(cloneMaterial),
    ...currentMaterials.filter((item) => !snapshotIds.has(item.id))
  ];
}

function cloneMaterial(material: UserMaterial): UserMaterial {
  return { ...material };
}

function unique(values: string[]) {
  return [...new Set(values)];
}
