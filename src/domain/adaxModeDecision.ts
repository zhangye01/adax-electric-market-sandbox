import type { AdaxTrainingMode } from "../types";

interface AdaxModeDecisionProfile {
  label: string;
  action: string;
}

const modeDecisionProfiles: Record<AdaxTrainingMode, AdaxModeDecisionProfile> = {
  execution: {
    label: "执行模式",
    action: "确认执行模式，进入场景"
  },
  review: {
    label: "复盘模式",
    action: "确认复盘模式，进入场景"
  }
};

export function getAdaxModeDecisionState(selectedMode: AdaxTrainingMode | null) {
  const selectedProfile = selectedMode ? modeDecisionProfiles[selectedMode] : null;

  if (!selectedProfile) {
    return {
      canConfirm: false,
      statusLabel: "待确认",
      nextTitle: "锁定本轮模式",
      helperText: "先选择执行模式或复盘模式，再正式进入市场场景。",
      confirmLabel: "确认模式"
    };
  }

  return {
    canConfirm: true,
    statusLabel: selectedProfile.label,
    nextTitle: selectedProfile.action,
    helperText: "确认后，本轮训练将按该模式进入同一套市场场景链路。",
    confirmLabel: selectedProfile.action
  };
}

export function getAdaxModeLaunchPath(selectedMode: AdaxTrainingMode | null) {
  if (selectedMode === "execution") {
    return ["模式确认", "市场场景", "训练主体", "交易工作台", "结算与回看"];
  }

  if (selectedMode === "review") {
    return ["模式确认", "市场场景", "训练主体", "复盘工作台", "复盘记录"];
  }

  return ["模式确认", "市场场景", "训练主体", "工作台", "训练记录"];
}
