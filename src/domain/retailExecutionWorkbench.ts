import { getRetailExecutionNodeContract } from "./retailExecutionChain";
import type { RetailNodeId } from "./retailTypes";

export type RetailExecutionWorkbenchStatusTone = "green" | "orange" | "slate";

export interface RetailExecutionWorkbenchContextInput {
  activeNodeId: RetailNodeId;
  activeNodeStep: number;
  activeNodeTitle: string;
  activeNodeAction: string;
  totalNodeCount: number;
  activeErrorCount: number;
  validationErrorCount: number;
  hasSettlement: boolean;
  resultGenerated: boolean;
  saved: boolean;
  nextNodeTitle: string | null;
}

export interface RetailExecutionWorkbenchContext {
  nodePositionLabel: string;
  nodeTitle: string;
  stageLabel: string;
  actionLabel: string;
  artifactLabel: string;
  statusLabel: string;
  statusTone: RetailExecutionWorkbenchStatusTone;
  nextActionLabel: string;
}

const stageLabels: Record<RetailNodeId, string> = {
  marketBrief: "市场输入",
  customerLoad: "客户组合",
  retailPackage: "收入模型",
  annualBilateral: "年度中长期",
  monthlyAuction: "月度中长期",
  spotExposure: "现货敞口",
  settlement: "结算反馈",
  resultReview: "结果沉淀"
};

const outputNodeIds = new Set<RetailNodeId>(["spotExposure", "settlement", "resultReview"]);

export function buildRetailExecutionWorkbenchContext(
  input: RetailExecutionWorkbenchContextInput
): RetailExecutionWorkbenchContext {
  const contract = getRetailExecutionNodeContract(input.activeNodeId);
  const status = getStatus(input);

  return {
    nodePositionLabel: `${String(input.activeNodeStep).padStart(2, "0")} / ${String(input.totalNodeCount).padStart(2, "0")}`,
    nodeTitle: input.activeNodeTitle,
    stageLabel: stageLabels[input.activeNodeId],
    actionLabel: input.activeNodeAction,
    artifactLabel: `${contract?.consumes.length ?? 0} 项输入 / ${contract?.produces.length ?? 0} 项输出`,
    statusLabel: status.label,
    statusTone: status.tone,
    nextActionLabel: getNextActionLabel(input)
  };
}

function getStatus(input: RetailExecutionWorkbenchContextInput) {
  if (input.activeErrorCount > 0) {
    return { label: "需处理校验", tone: "orange" as const };
  }

  if (outputNodeIds.has(input.activeNodeId) && !input.hasSettlement) {
    return {
      label: input.validationErrorCount > 0 ? "等待前序完成" : "等待模拟结果",
      tone: "orange" as const
    };
  }

  if (input.activeNodeId === "resultReview") {
    return {
      label: input.saved ? "记录已保存" : "待保存记录",
      tone: input.saved ? "green" as const : "slate" as const
    };
  }

  if (input.activeNodeId === "settlement") {
    return {
      label: input.resultGenerated ? "结果已生成" : "可生成结果",
      tone: "green" as const
    };
  }

  return { label: "当前可推进", tone: "green" as const };
}

function getNextActionLabel(input: RetailExecutionWorkbenchContextInput) {
  if (input.activeErrorCount > 0) return "修正当前输入";

  if (outputNodeIds.has(input.activeNodeId) && !input.hasSettlement) {
    return "完成前序交易动作";
  }

  if (input.activeNodeId === "resultReview") {
    return input.saved ? "查看训练记录" : "保存训练记录";
  }

  if (input.activeNodeId === "settlement" && input.resultGenerated) {
    return "进入交易结果回看";
  }

  if (input.activeNodeId === "settlement") return "生成模拟结果";

  if (input.nextNodeTitle) return `进入${input.nextNodeTitle}`;

  return "完成本轮训练";
}
