import { adaxScenarioMeta } from "../../data/adaxScenarioMeta";
import type { AdaxRoleId, AdaxTrainingMode } from "../../types";

interface LaunchPathRowsProps {
  stage: "mode" | "scenario" | "role";
  mode: AdaxTrainingMode | null;
  selectedRole?: "retailer" | "thermal";
  roleNames: Record<AdaxRoleId, string>;
}

export function LaunchPathRows({ stage, mode, selectedRole, roleNames }: LaunchPathRowsProps) {
  const currentIndex = stage === "mode" ? 0 : stage === "scenario" ? 1 : 2;
  const workspaceName = mode === "review" ? "复盘工作台" : mode === "execution" ? "交易工作台" : "待确认工作台";
  const rows = [
    {
      title: "模式确认",
      detail: mode ? `已确认：${mode === "execution" ? "执行模式" : "复盘模式"}` : "先选择执行模式或复盘模式"
    },
    {
      title: "场景确认",
      detail: stage === "mode" ? "统一虚拟省级市场 A" : `已锁定：${adaxScenarioMeta.name}`
    },
    {
      title: "主体确认",
      detail: selectedRole ? `当前主体：${roleNames[selectedRole]}` : "选择本轮训练主体席位"
    },
    {
      title: "进入工作台",
      detail: workspaceName
    }
  ];

  return (
    <div className="flow-step-list launch-step-list">
      {rows.map((row, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "idle";
        return (
          <div key={row.title} className={`flow-step-row launch-step-row ${state}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{row.title}</strong>
            <p>{row.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
