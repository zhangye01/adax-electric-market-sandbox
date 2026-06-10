import type { AdaxPageId, AdaxTrainingMode } from "../types";

export interface AdaxNavigationRule {
  page: AdaxPageId;
  requiresMode?: boolean;
  executionOnly?: boolean;
}

export type AdaxNavigationStatus = "active" | "done" | "idle" | "locked";

export interface AdaxFlowContextItem {
  label: string;
  value: string;
}

export interface AdaxFlowContext {
  items: AdaxFlowContextItem[];
  nextAction: string;
}

export const adaxExecutionFlow: AdaxPageId[] = ["start", "scenario", "role", "strategy", "settlement", "review"];
export const adaxReviewFlow: AdaxPageId[] = ["start", "scenario", "role", "strategy"];

const pageCopy: Record<AdaxPageId, { section: string; title: string }> = {
  home: { section: "产品入口", title: "首页" },
  about: { section: "产品入口", title: "关于" },
  start: { section: "本轮训练", title: "模式确认" },
  scenario: { section: "本轮训练", title: "市场场景" },
  role: { section: "本轮训练", title: "训练主体" },
  strategy: { section: "本轮训练", title: "工作台" },
  settlement: { section: "执行输出", title: "结算结果" },
  review: { section: "执行输出", title: "结果回看" },
  records: { section: "记录", title: "训练记录" },
  guide: { section: "产品入口", title: "关于" }
};

export function getAdaxFlow(mode: AdaxTrainingMode | null) {
  return mode === "review" ? adaxReviewFlow : adaxExecutionFlow;
}

export function shouldShowAdaxOutputNav(mode: AdaxTrainingMode | null) {
  return mode === "execution";
}

export function getAdaxWorkspaceLabel(mode: AdaxTrainingMode | null) {
  return mode === "review" ? "复盘工作台" : "交易工作台";
}

export function getAdaxPageMeta(page: AdaxPageId, mode: AdaxTrainingMode | null) {
  if (page === "strategy") {
    return {
      section: "本轮训练",
      title: getAdaxWorkspaceLabel(mode)
    };
  }
  return pageCopy[page] ?? pageCopy.home;
}

export function getAdaxTopbarBadge(page: AdaxPageId, mode: AdaxTrainingMode | null): { label: string; tone: "green" | "orange" | "slate" } {
  if (page === "home" || page === "about" || page === "guide") return { label: "产品入口", tone: "slate" };
  if (page === "records") return { label: "本地记录", tone: "slate" };
  if (mode === "execution") return { label: "执行模式", tone: "green" };
  if (mode === "review") return { label: "复盘模式", tone: "orange" };
  return { label: "模式待确认", tone: "slate" };
}

export function getAdaxFlowContext(page: AdaxPageId, mode: AdaxTrainingMode | null): AdaxFlowContext {
  const modeLabel = mode === "execution" ? "执行模式" : mode === "review" ? "复盘模式" : "待确认";
  const scenarioItem = { label: "市场", value: "虚拟省级市场 A" };
  const retailerItem = { label: "主体", value: "售电公司" };

  if (page === "home") {
    return {
      items: [{ label: "入口", value: "产品首页" }],
      nextAction: "开始训练或查看训练记录"
    };
  }

  if (page === "about" || page === "guide") {
    return {
      items: [{ label: "说明", value: "产品边界" }],
      nextAction: "返回首页或开始训练"
    };
  }

  if (page === "records") {
    return {
      items: [{ label: "记录", value: "浏览器本地" }],
      nextAction: "查看历史训练或开始新训练"
    };
  }

  if (page === "start") {
    return {
      items: [{ label: "模式", value: modeLabel }],
      nextAction: "选择执行模式或复盘模式"
    };
  }

  if (page === "scenario") {
    return {
      items: [{ label: "模式", value: modeLabel }, scenarioItem],
      nextAction: "确认市场场景后选择训练主体"
    };
  }

  if (page === "role") {
    return {
      items: [{ label: "模式", value: modeLabel }, scenarioItem, retailerItem],
      nextAction: "确认售电公司后进入工作台"
    };
  }

  if (page === "strategy") {
    return {
      items: [{ label: "模式", value: modeLabel }, scenarioItem, retailerItem, { label: "节点", value: "8 节点交易链" }],
      nextAction: mode === "review" ? "整理当前节点材料并保存复盘" : "完成当前节点并生成模拟结果"
    };
  }

  if (page === "settlement") {
    return {
      items: [{ label: "模式", value: "执行模式" }, scenarioItem, retailerItem, { label: "输出", value: "结算结果" }],
      nextAction: "查看交易结果回看"
    };
  }

  if (page === "review") {
    return {
      items: [{ label: "模式", value: "执行模式" }, scenarioItem, retailerItem, { label: "输出", value: "结果回看" }],
      nextAction: "保存训练记录或重新调整交易动作"
    };
  }

  return {
    items: [{ label: "模式", value: modeLabel }],
    nextAction: "继续当前训练"
  };
}

export function getAdaxNavStatus({
  item,
  currentPage,
  mode,
  canNavigate
}: {
  item: AdaxNavigationRule;
  currentPage: AdaxPageId;
  mode: AdaxTrainingMode | null;
  canNavigate: (page: AdaxPageId) => boolean;
}): AdaxNavigationStatus {
  if (item.page === currentPage) return "active";
  if (item.requiresMode && !mode) return "locked";
  if (item.executionOnly && mode !== "execution") return "locked";
  if (!canNavigate(item.page)) return "locked";

  const flow = getAdaxFlow(mode);
  const currentFlowIndex = flow.indexOf(currentPage);
  const itemIndex = flow.indexOf(item.page);
  if (itemIndex >= 0 && currentFlowIndex > itemIndex) return "done";
  return "idle";
}
