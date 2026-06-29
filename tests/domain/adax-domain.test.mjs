import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessAdaxPage,
  fallbackAdaxPage,
  normalizeAdaxPage
} from "../../.test-build/src/domain/adaxFlowGuards.js";
import {
  adaxTrainingModelBoundary,
  getAdaxTrainingModelBoundaryText
} from "../../.test-build/src/domain/adaxModelBoundary.js";
import {
  canAdaxSurfaceUseReviewMaterials,
  canAdaxSurfaceUseSettlement,
  getAdaxModeBoundary
} from "../../.test-build/src/domain/adaxModeBoundary.js";
import {
  getAdaxModeDecisionState,
  getAdaxModeLaunchPath
} from "../../.test-build/src/domain/adaxModeDecision.js";
import {
  getAdaxFlowContext,
  getAdaxFlow,
  getAdaxNavStatus,
  getAdaxPageMeta,
  getAdaxTopbarBadge,
  getAdaxWorkspaceLabel,
  shouldShowAdaxOutputNav
} from "../../.test-build/src/domain/adaxNavigation.js";

test("training result boundary copy states virtual simplified non-production limits", () => {
  const boundaryText = getAdaxTrainingModelBoundaryText();

  assert.equal(adaxTrainingModelBoundary.title, "模型边界说明");
  assert.match(boundaryText, /虚拟省级市场/);
  assert.match(boundaryText, /训练级简化机制/);
  assert.match(boundaryText, /不代表任何真实省份市场结果/);
  assert.match(boundaryText, /不可用于真实交易申报/);
  assert.match(boundaryText, /投资决策/);
});

test("flow guards protect execution outputs and normalize merged product pages", () => {
  assert.equal(normalizeAdaxPage("about"), "about");
  assert.equal(normalizeAdaxPage("guide"), "about");

  const noMode = {
    mode: null,
    hasRetailSettlement: false,
    executionResultGenerated: false,
    settlementViewed: false
  };
  assert.equal(canAccessAdaxPage("home", noMode), true);
  assert.equal(canAccessAdaxPage("about", noMode), true);
  assert.equal(canAccessAdaxPage("scenario", noMode), false);
  assert.equal(fallbackAdaxPage("settlement", noMode), "home");

  const reviewMode = {
    mode: "review",
    hasRetailSettlement: true,
    executionResultGenerated: true,
    settlementViewed: true
  };
  assert.equal(canAccessAdaxPage("strategy", reviewMode), true);
  assert.equal(canAccessAdaxPage("settlement", reviewMode), false);
  assert.equal(canAccessAdaxPage("review", reviewMode), false);

  const executionBeforeResult = {
    mode: "execution",
    hasRetailSettlement: true,
    executionResultGenerated: false,
    settlementViewed: false
  };
  assert.equal(canAccessAdaxPage("settlement", executionBeforeResult), false);
  assert.equal(fallbackAdaxPage("settlement", executionBeforeResult), "strategy");

  const executionAfterSettlement = {
    mode: "execution",
    hasRetailSettlement: true,
    executionResultGenerated: true,
    settlementViewed: true
  };
  assert.equal(canAccessAdaxPage("settlement", executionAfterSettlement), true);
  assert.equal(canAccessAdaxPage("review", executionAfterSettlement), true);
});

test("mode boundary keeps review workspace distinct from execution result review", () => {
  const executionReview = getAdaxModeBoundary("executionResultReview");
  const reviewWorkspace = getAdaxModeBoundary("reviewWorkspace");

  assert.equal(executionReview.mode, "execution");
  assert.equal(executionReview.label, "执行结果回看");
  assert.match(executionReview.purpose, /收入、成本、敞口、风险/);
  assert.equal(executionReview.primaryOutput, "交易结果记录");
  assert.ok(executionReview.mustNot.some((item) => item.includes("不组织教材材料")));

  assert.equal(reviewWorkspace.mode, "review");
  assert.equal(reviewWorkspace.label, "复盘模式");
  assert.match(reviewWorkspace.purpose, /规则、案例和个人理解/);
  assert.equal(reviewWorkspace.primaryOutput, "节点复盘材料");
  assert.ok(reviewWorkspace.mustNot.some((item) => item.includes("不计算交易收益")));
  assert.ok(reviewWorkspace.mustNot.some((item) => item.includes("不作为执行结果报告")));

  assert.equal(canAdaxSurfaceUseSettlement("executionResultReview"), true);
  assert.equal(canAdaxSurfaceUseReviewMaterials("executionResultReview"), false);
  assert.equal(canAdaxSurfaceUseSettlement("reviewWorkspace"), false);
  assert.equal(canAdaxSurfaceUseReviewMaterials("reviewWorkspace"), true);
});

test("navigation shell rules keep execution and review flows aligned", () => {
  assert.deepEqual(getAdaxFlow("execution"), ["start", "scenario", "role", "strategy", "settlement", "review"]);
  assert.deepEqual(getAdaxFlow("review"), ["start", "scenario", "role", "strategy"]);
  assert.equal(shouldShowAdaxOutputNav("execution"), true);
  assert.equal(shouldShowAdaxOutputNav("review"), false);

  assert.equal(getAdaxWorkspaceLabel("execution"), "交易工作台");
  assert.equal(getAdaxWorkspaceLabel("review"), "复盘工作台");
  assert.deepEqual(getAdaxPageMeta("strategy", "review"), {
    section: "本轮训练",
    title: "复盘工作台"
  });
  assert.deepEqual(getAdaxPageMeta("about", null), {
    section: "产品入口",
    title: "关于"
  });
  assert.deepEqual(getAdaxTopbarBadge("records", null), {
    label: "本地记录",
    tone: "slate"
  });
  assert.deepEqual(getAdaxFlowContext("about", null), {
    items: [{ label: "说明", value: "产品边界" }],
    nextAction: "返回首页或开始训练"
  });
  assert.deepEqual(getAdaxFlowContext("strategy", "execution"), {
    items: [
      { label: "模式", value: "执行模式" },
      { label: "市场", value: "虚拟省级市场 A" },
      { label: "主体", value: "售电公司" },
      { label: "节点", value: "8 节点交易链" }
    ],
    nextAction: "完成当前节点并生成模拟结果"
  });
  assert.deepEqual(getAdaxFlowContext("strategy", "review"), {
    items: [
      { label: "模式", value: "复盘模式" },
      { label: "市场", value: "虚拟省级市场 A" },
      { label: "主体", value: "售电公司" },
      { label: "节点", value: "8 节点交易链" }
    ],
    nextAction: "整理当前节点材料并保存复盘"
  });
  assert.deepEqual(getAdaxFlowContext("role", "execution"), {
    items: [
      { label: "模式", value: "执行模式" },
      { label: "市场", value: "虚拟省级市场 A" },
      { label: "主体", value: "售电公司" }
    ],
    nextAction: "确认售电公司后进入工作台"
  });

  const canNavigate = (page) => page !== "review";
  assert.equal(
    getAdaxNavStatus({
      item: { page: "scenario", requiresMode: true },
      currentPage: "home",
      mode: null,
      canNavigate
    }),
    "locked"
  );
  assert.equal(
    getAdaxNavStatus({
      item: { page: "role", requiresMode: true },
      currentPage: "strategy",
      mode: "execution",
      canNavigate
    }),
    "done"
  );
  assert.equal(
    getAdaxNavStatus({
      item: { page: "review", requiresMode: true, executionOnly: true },
      currentPage: "strategy",
      mode: "review",
      canNavigate: () => true
    }),
    "locked"
  );
  assert.equal(
    getAdaxNavStatus({
      item: { page: "review", requiresMode: true, executionOnly: true },
      currentPage: "settlement",
      mode: "execution",
      canNavigate
    }),
    "locked"
  );
});

test("mode decision requires explicit selection before entering scenario", () => {
  assert.deepEqual(getAdaxModeDecisionState(null), {
    canConfirm: false,
    statusLabel: "待确认",
    nextTitle: "锁定本轮模式",
    helperText: "先选择执行模式或复盘模式，再正式进入市场场景。",
    confirmLabel: "确认模式"
  });
  assert.deepEqual(getAdaxModeDecisionState("execution"), {
    canConfirm: true,
    statusLabel: "执行模式",
    nextTitle: "确认执行模式，进入场景",
    helperText: "确认后，本轮训练将按该模式进入同一套市场场景链路。",
    confirmLabel: "确认执行模式，进入场景"
  });
  assert.equal(getAdaxModeDecisionState("review").statusLabel, "复盘模式");
  assert.deepEqual(getAdaxModeLaunchPath(null), ["模式确认", "市场场景", "训练主体", "工作台", "训练记录"]);
  assert.deepEqual(getAdaxModeLaunchPath("execution"), ["模式确认", "市场场景", "训练主体", "交易工作台", "结算与回看"]);
  assert.deepEqual(getAdaxModeLaunchPath("review"), ["模式确认", "市场场景", "训练主体", "复盘工作台", "复盘记录"]);
});
