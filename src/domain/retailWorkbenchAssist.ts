import type { AdaxTrainingMode } from "../types";

export function getRetailWorkbenchAssist(mode: AdaxTrainingMode) {
  if (mode === "review") {
    return {
      label: "材料入口",
      modeClass: "review",
      purpose: "导入或整理当前交易节点材料"
    };
  }

  return {
    label: "操作提示",
    modeClass: "execution",
    purpose: "查看当前交易节点操作提示"
  };
}
