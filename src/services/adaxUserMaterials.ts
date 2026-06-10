import type { UserMaterial } from "../types";
import { saveAdaxUserMaterials } from "../utils/adaxStorage";

interface UpsertUserMaterialInput {
  materials: UserMaterial[];
  scenarioId: string;
  participantType: UserMaterial["participantType"];
  node: {
    id: string;
    title: string;
  };
  materialType: UserMaterial["materialType"];
  content: string;
}

export function upsertUserMaterial({
  materials,
  scenarioId,
  participantType,
  node,
  materialType,
  content
}: UpsertUserMaterialInput) {
  const now = new Date().toISOString();
  const id = `${scenarioId}-${participantType}-${node.id}-${materialType}`;
  const existing = materials.find((item) => item.id === id);

  if (!content.trim()) {
    return saveAdaxUserMaterials(materials.filter((item) => item.id !== id));
  }

  const nextMaterial: UserMaterial = {
    id,
    nodeId: node.id,
    scenarioId,
    participantType,
    title: node.title,
    materialType,
    content,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  return saveAdaxUserMaterials([
    nextMaterial,
    ...materials.filter((item) => item.id !== id)
  ]);
}
