import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessAdaxPage,
  fallbackAdaxPage,
  normalizeAdaxPage
} from "../../.test-build/src/domain/adaxFlowGuards.js";
import {
  getAdaxRecordRevisitLabel,
  getAdaxRecordRevisitTarget
} from "../../.test-build/src/domain/adaxRecords.js";
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
import {
  calculateAnnualContract,
  calculateCurveMismatchRisk,
  calculateHourlyExposureByTypicalDay,
  calculateMonthlyAuctionResults,
  calculateRetailSettlement,
  checkAnnualBilateralDeal
} from "../../.test-build/src/domain/retailCalculations.js";
import { getRetailMarketContext } from "../../.test-build/src/domain/retailMarketContext.js";
import { buildRetailExecutionRecord } from "../../.test-build/src/domain/retailRecords.js";
import { buildRetailAnnualBilateralDisplay } from "../../.test-build/src/domain/retailAnnualBilateralDisplay.js";
import { buildRetailCustomerLoadDisplay } from "../../.test-build/src/domain/retailCustomerLoadDisplay.js";
import { buildRetailExecutionResultDisplay } from "../../.test-build/src/domain/retailResultDisplay.js";
import { buildRetailMonthlyAuctionDisplay } from "../../.test-build/src/domain/retailMonthlyAuctionDisplay.js";
import { buildRetailPackageDisplay } from "../../.test-build/src/domain/retailPackageDisplay.js";
import { buildRetailSettlementDisplay } from "../../.test-build/src/domain/retailSettlementDisplay.js";
import {
  buildRetailReviewRecordSnapshot,
  canSaveRetailReviewRecord,
  getRetailReviewMaterialStats,
  mergeRetailReviewSnapshotMaterials
} from "../../.test-build/src/domain/retailReviewMaterials.js";
import { getRetailNodeValidationErrors } from "../../.test-build/src/domain/retailNodeValidation.js";
import { createEmptyRetailTrainingState, retailTypicalMonths } from "../../.test-build/src/domain/retailState.js";
import {
  validateAnnualBilateral,
  validateMonthlyAuction,
  validateMonthlyAuctions,
  validateRetailTrainingState
} from "../../.test-build/src/domain/retailValidation.js";
import { getRetailWorkbenchAssist } from "../../.test-build/src/domain/retailWorkbenchAssist.js";
import {
  saveRetailExecutionTrainingRecord,
  saveRetailReviewTrainingRecord
} from "../../.test-build/src/services/adaxTrainingRecords.js";
import {
  buildRecordExportJson,
  buildRecordsExportJson
} from "../../.test-build/src/services/adaxTrainingRecordExports.js";
import { retailTrainingNodes } from "../../.test-build/src/data/retailTrainingNodes.js";
import { retailMarketData } from "../../.test-build/src/data/retailMarketData.js";
import {
  retailExecutionChainContracts,
  validateRetailExecutionChainContracts
} from "../../.test-build/src/domain/retailExecutionChain.js";
import { buildRetailExecutionWorkbenchContext } from "../../.test-build/src/domain/retailExecutionWorkbench.js";
import { withFakeWindow } from "../support/browser-fixtures.mjs";
import {
  basicReviewMaterial,
  basicTrainingRecord,
  completeRetailState
} from "../support/retail-fixtures.mjs";

test("retail baseline state validates and calculates settlement", () => {
  const state = completeRetailState();
  const validation = validateRetailTrainingState(state);
  assert.equal(validation.ok, true, validation.errors.join("; "));

  const settlement = calculateRetailSettlement(state);
  assert.equal(settlement.annualServiceMwh, 105000);
  assert.equal(settlement.annualContract.accepted, true);
  assert.equal(settlement.monthlyAuction.byMonth.july.participates, false);
  assert.equal(settlement.monthlyAuction.byMonth.july.volumeMwh, 0);
  assert.ok(Number.isFinite(settlement.margin.grossMargin));
  assert.ok(settlement.exposure.positiveExposureMwh + settlement.exposure.negativeExposureMwh > 0);
  assert.ok(settlement.diagnostics.length > 0);
});

test("retail execution nodes form one linked scenario chain", () => {
  assert.deepEqual(
    retailExecutionChainContracts.map((node) => node.id),
    retailTrainingNodes.map((node) => node.id)
  );
  assert.deepEqual(
    retailExecutionChainContracts.map((node) => node.step),
    retailTrainingNodes.map((node) => node.step)
  );

  const validation = validateRetailExecutionChainContracts();
  assert.equal(validation.ok, true, validation.issues.join("; "));

  assert.deepEqual(retailExecutionChainContracts[0].consumes, []);
  assert.ok(retailExecutionChainContracts.find((node) => node.id === "settlement")?.consumes.includes("curveMismatchRisk"));
  assert.ok(retailExecutionChainContracts.find((node) => node.id === "resultReview")?.consumes.includes("settlementResult"));
});

test("retail execution workbench context keeps node status and next action centralized", () => {
  const annualContext = buildRetailExecutionWorkbenchContext({
    activeNodeId: "annualBilateral",
    activeNodeStep: 4,
    activeNodeTitle: "年度双边采购",
    activeNodeAction: "配置覆盖比例、报价和年度合约曲线。",
    totalNodeCount: retailTrainingNodes.length,
    activeErrorCount: 1,
    validationErrorCount: 1,
    hasSettlement: false,
    resultGenerated: false,
    saved: false,
    nextNodeTitle: "月度集中竞价"
  });

  assert.equal(annualContext.nodePositionLabel, "04 / 08");
  assert.equal(annualContext.stageLabel, "年度中长期");
  assert.equal(annualContext.artifactLabel, "3 项输入 / 2 项输出");
  assert.equal(annualContext.statusLabel, "需处理校验");
  assert.equal(annualContext.statusTone, "orange");
  assert.equal(annualContext.nextActionLabel, "修正当前输入");
  assert.match(annualContext.actionLabel, /覆盖比例/);

  const settlementContext = buildRetailExecutionWorkbenchContext({
    activeNodeId: "settlement",
    activeNodeStep: 7,
    activeNodeTitle: "模拟结算",
    activeNodeAction: "运行训练级结算，查看收入、成本和风险修正。",
    totalNodeCount: retailTrainingNodes.length,
    activeErrorCount: 0,
    validationErrorCount: 0,
    hasSettlement: true,
    resultGenerated: true,
    saved: false,
    nextNodeTitle: "交易结果回看"
  });

  assert.equal(settlementContext.stageLabel, "结算反馈");
  assert.equal(settlementContext.statusLabel, "结果已生成");
  assert.equal(settlementContext.statusTone, "green");
  assert.equal(settlementContext.nextActionLabel, "进入交易结果回看");

  const reviewContext = buildRetailExecutionWorkbenchContext({
    activeNodeId: "resultReview",
    activeNodeStep: 8,
    activeNodeTitle: "交易结果回看",
    activeNodeAction: "查看本轮交易动作摘要并保存执行记录。",
    totalNodeCount: retailTrainingNodes.length,
    activeErrorCount: 0,
    validationErrorCount: 0,
    hasSettlement: true,
    resultGenerated: true,
    saved: true,
    nextNodeTitle: null
  });

  assert.equal(reviewContext.statusLabel, "记录已保存");
  assert.equal(reviewContext.nextActionLabel, "查看训练记录");
});

test("retail node validation maps active nodes to domain validators", () => {
  const empty = createEmptyRetailTrainingState();
  assert.deepEqual(getRetailNodeValidationErrors("marketBrief", empty, ["全局错误"]), []);
  assert.ok(getRetailNodeValidationErrors("customerLoad", empty, []).some((error) => error.includes("工业稳定型签约电量")));
  assert.deepEqual(getRetailNodeValidationErrors("retailPackage", empty, []), ["请选择零售套餐。"]);

  const invalidAnnual = completeRetailState();
  invalidAnnual.annualBilateral.bidPrice = 300;
  assert.ok(getRetailNodeValidationErrors("annualBilateral", invalidAnnual, []).some((error) => error.includes("对手方不接受")));

  const invalidMonthly = completeRetailState();
  invalidMonthly.monthlyAuctions.december.participates = null;
  assert.ok(getRetailNodeValidationErrors("monthlyAuction", invalidMonthly, []).some((error) => error.includes("12 月")));

  assert.deepEqual(getRetailNodeValidationErrors("settlement", empty, ["全局错误"]), ["全局错误"]);
  assert.deepEqual(getRetailNodeValidationErrors("resultReview", empty, ["全局错误"]), ["全局错误"]);
});

test("retail market context organizes annual monthly and typical-day inputs", () => {
  const context = getRetailMarketContext(retailMarketData);

  assert.equal(context.annual.referenceServiceMwh, 120000);
  assert.equal(context.annual.counterpartyFloorPrice, 405);
  assert.deepEqual(context.annual.longTermReferenceRange, [380, 450]);
  assert.deepEqual(context.annual.priceBounds, [200, 800]);
  assert.match(context.annual.operationFocus, /年度双边/);

  assert.deepEqual(context.monthlyWindows.map((month) => month.id), ["march", "july", "december"]);
  assert.deepEqual(context.monthlyWindows.map((month) => month.label), ["3 月", "7 月", "12 月"]);
  assert.deepEqual(context.monthlyWindows.map((month) => month.referenceBidRange), [
    [300, 380],
    [470, 560],
    [440, 530]
  ]);
  assert.equal(context.monthlyWindows.find((month) => month.id === "july")?.typicalDayId, "julyHighPrice");
  assert.ok(context.monthlyWindows.every((month) => month.operationFocus.includes("月度集中竞价")));

  assert.deepEqual(context.typicalDays.map((day) => day.id), ["marchLowPrice", "julyHighPrice", "decemberEveningPeak"]);
  assert.deepEqual(context.typicalDays.map((day) => day.spotPrices.length), [24, 24, 24]);
  assert.equal(context.typicalDays.find((day) => day.id === "julyHighPrice")?.peakPrice, 760);
  assert.equal(context.typicalDays.find((day) => day.id === "marchLowPrice")?.valleyPrice, 220);
  assert.ok(context.typicalDays.every((day) => day.operationFocus.includes("曲线错配")));

  assert.equal(context.summary.peakTypicalDayPrice, 760);
  assert.equal(context.summary.highestAveragePriceMonth.id, "july");
  assert.equal(context.summary.lowestAveragePriceMonth.id, "march");
  assert.equal(context.summary.widestSpreadTypicalDay.id, "julyHighPrice");
  assert.deepEqual(context.operationSequence, ["年度行情", "典型月窗口", "24 小时典型日", "客户与交易动作"]);
});

test("customer load display contract keeps segment progress and mix status centralized", () => {
  const empty = createEmptyRetailTrainingState();
  let display = buildRetailCustomerLoadDisplay(empty);

  assert.equal(display.filledSegmentCount, 0);
  assert.equal(display.totalSegmentCount, 3);
  assert.equal(display.annualServiceMwh, 0);
  assert.equal(display.totalAvailableMwh, 160000);
  assert.deepEqual(display.segments.map((segment) => segment.id), ["industrialStable", "commercialPeak", "volatileLoad"]);
  assert.deepEqual(display.segments.map((segment) => segment.contractKey), ["industrialStableMwh", "commercialPeakMwh", "volatileLoadMwh"]);
  assert.ok(display.segments.every((segment) => !segment.completed));
  assert.match(display.statusLabel, /已填写 0\/3/);

  const complete = completeRetailState();
  display = buildRetailCustomerLoadDisplay(complete);
  assert.equal(display.filledSegmentCount, 3);
  assert.equal(display.annualServiceMwh, 105000);
  const industrialShare = display.mixRows.find((row) => row.label === "工业占比")?.value ?? 0;
  assert.ok(industrialShare > 0.5);
  assert.match(display.segments.find((segment) => segment.id === "volatileLoad")?.riskTag ?? "", /曲线错配/);
  assert.match(display.statusLabel, /下一步选择零售套餐/);
});

test("retail package display contract keeps package status and price text centralized", () => {
  const empty = createEmptyRetailTrainingState();
  let display = buildRetailPackageDisplay(empty);

  assert.equal(display.selectedPackage, null);
  assert.equal(display.selectedCount, 0);
  assert.equal(display.requiredCount, 1);
  assert.equal(display.options.length, 3);
  assert.deepEqual(display.options.map((option) => option.id), ["fixed", "tou", "spotLinked"]);
  assert.equal(display.options.find((option) => option.id === "fixed")?.priceText, "500 元/MWh");
  assert.match(display.options.find((option) => option.id === "spotLinked")?.priceText ?? "", /现货 x 85%/);
  assert.match(display.statusLabel, /请选择/);

  const complete = completeRetailState();
  complete.retailPackage.packageType = "tou";
  display = buildRetailPackageDisplay(complete);
  assert.equal(display.selectedPackage, "tou");
  assert.equal(display.selectedPackageLabel, "分时价套餐");
  assert.equal(display.selectedCount, 1);
  assert.ok(display.options.find((option) => option.id === "tou")?.active);
  assert.match(display.selectedPackageDescription, /峰平谷/);
  assert.match(display.statusLabel, /年度双边采购/);
});

test("annual bilateral rejects bids below simulated counterparty floor", () => {
  const state = completeRetailState();
  state.annualBilateral.bidPrice = 390;

  const deal = checkAnnualBilateralDeal(state);
  assert.equal(deal.accepted, false);
  assert.match(deal.message, /无法达成/);

  const validation = validateAnnualBilateral(state);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("对手方不接受")));
});

test("annual bilateral display contract separates main action status from component layout", () => {
  const state = completeRetailState();
  state.annualBilateral = {
    coverageRatio: null,
    bidPrice: null,
    curveType: null,
    counterpartyFloorPrice: 405,
    dealAccepted: null
  };

  let display = buildRetailAnnualBilateralDisplay(state);
  assert.equal(display.completedFieldCount, 0);
  assert.equal(display.totalFieldCount, 3);
  assert.equal(display.dealTone, "idle");
  assert.match(display.dealMessage, /填写报价/);
  assert.match(display.statusLabel, /选择年度合约曲线/);
  assert.deepEqual(display.priceBounds, [200, 800]);
  assert.deepEqual(display.referenceRange, [380, 450]);

  state.annualBilateral.coverageRatio = 100;
  state.annualBilateral.bidPrice = 390;
  state.annualBilateral.curveType = "industrial";
  display = buildRetailAnnualBilateralDisplay(state);
  assert.equal(display.completedFieldCount, 3);
  assert.equal(display.dealTone, "blocked");
  assert.match(display.dealMessage, /无法达成/);
  assert.match(display.statusLabel, /请调整年度双边报价/);

  state.annualBilateral.bidPrice = 420;
  display = buildRetailAnnualBilateralDisplay(state);
  assert.equal(display.dealTone, "accepted");
  assert.match(display.dealMessage, /已达成/);
  assert.match(display.statusLabel, /下一步选择月度集中竞价/);
});

test("annual bilateral enforces coverage bounds and curve selection", () => {
  const state = completeRetailState();

  state.annualBilateral.coverageRatio = 79;
  let validation = validateAnnualBilateral(state);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("80%-120%")));

  state.annualBilateral.coverageRatio = 80;
  validation = validateAnnualBilateral(state);
  assert.equal(validation.ok, true, validation.errors.join("; "));

  state.annualBilateral.coverageRatio = 120;
  validation = validateAnnualBilateral(state);
  assert.equal(validation.ok, true, validation.errors.join("; "));

  state.annualBilateral.coverageRatio = 121;
  validation = validateAnnualBilateral(state);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("80%-120%")));

  state.annualBilateral.coverageRatio = 100;
  state.annualBilateral.curveType = null;
  validation = validateAnnualBilateral(state);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("年度合约曲线")));
});

test("annual bilateral accepts floor price and preserves selected contract curve", () => {
  const state = completeRetailState();
  state.annualBilateral.coverageRatio = 120;
  state.annualBilateral.bidPrice = state.annualBilateral.counterpartyFloorPrice;
  state.annualBilateral.curveType = "flat";

  const deal = checkAnnualBilateralDeal(state);
  assert.equal(deal.accepted, true);

  const annual = calculateAnnualContract(state);
  assert.equal(annual.accepted, true);
  assert.equal(annual.curveType, "flat");
  assert.equal(annual.volumeMwh, 126000);
  assert.equal(annual.cost, 51030000);

  state.annualBilateral.bidPrice = state.annualBilateral.counterpartyFloorPrice - 1;
  const rejected = calculateAnnualContract(state);
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.volumeMwh, 0);
  assert.equal(rejected.cost, 0);
});

test("monthly auction opt-out accepts empty optional fields", () => {
  const state = completeRetailState();
  const validation = validateMonthlyAuction("july", state.monthlyAuctions.july);
  assert.equal(validation.ok, true, validation.errors.join("; "));
});

test("monthly auction starts with three undecided windows and no hidden defaults", () => {
  const state = createEmptyRetailTrainingState();

  assert.deepEqual(retailTypicalMonths, ["march", "july", "december"]);
  assert.deepEqual(Object.keys(state.monthlyAuctions), retailTypicalMonths);
  retailTypicalMonths.forEach((month) => {
    assert.deepEqual(state.monthlyAuctions[month], {
      participates: null,
      coverageRatio: null,
      bidPrice: null,
      curveType: null
    });
  });
});

test("monthly auction display contract keeps window progress and status centralized", () => {
  const empty = createEmptyRetailTrainingState();
  let display = buildRetailMonthlyAuctionDisplay(empty);
  assert.equal(display.selectedWindowCount, 0);
  assert.equal(display.participatingWindowCount, 0);
  assert.equal(display.totalWindowCount, 3);
  assert.deepEqual(display.windows.map((window) => window.id), ["march", "july", "december"]);
  assert.deepEqual(display.windows.map((window) => window.decisionTone), ["pending", "pending", "pending"]);
  assert.match(display.statusLabel, /已选择 0\/3/);
  assert.deepEqual(display.priceBounds, [200, 800]);

  const partial = completeRetailState();
  partial.monthlyAuctions.december = {
    participates: null,
    coverageRatio: null,
    bidPrice: null,
    curveType: null
  };
  display = buildRetailMonthlyAuctionDisplay(partial);
  assert.equal(display.selectedWindowCount, 2);
  assert.equal(display.participatingWindowCount, 1);
  assert.deepEqual(display.windows.map((window) => window.decisionTone), ["participating", "skipped", "pending"]);
  assert.match(display.statusLabel, /已选择 2\/3/);

  const complete = completeRetailState();
  display = buildRetailMonthlyAuctionDisplay(complete);
  assert.equal(display.selectedWindowCount, 3);
  assert.equal(display.participatingWindowCount, 2);
  assert.match(display.statusLabel, /参与 2 个/);
  assert.match(display.windows.find((window) => window.id === "july")?.feature ?? "", /高价窗口/);
});

test("monthly auction requires decisions for all three typical months", () => {
  const state = completeRetailState();
  state.monthlyAuctions.december = {
    participates: null,
    coverageRatio: null,
    bidPrice: null,
    curveType: null
  };

  const validation = validateMonthlyAuctions(state);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("12 月")));
  assert.ok(validation.errors.some((error) => error.includes("必须选择参与或不参与")));
});

test("monthly auction participation enforces coverage bounds and curve selection", () => {
  const state = completeRetailState();

  state.monthlyAuctions.march.coverageRatio = -1;
  let validation = validateMonthlyAuction("march", state.monthlyAuctions.march);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("0%-50%")));

  state.monthlyAuctions.march.coverageRatio = 0;
  validation = validateMonthlyAuction("march", state.monthlyAuctions.march);
  assert.equal(validation.ok, true, validation.errors.join("; "));

  state.monthlyAuctions.march.coverageRatio = 50;
  validation = validateMonthlyAuction("march", state.monthlyAuctions.march);
  assert.equal(validation.ok, true, validation.errors.join("; "));

  state.monthlyAuctions.march.coverageRatio = 51;
  validation = validateMonthlyAuction("march", state.monthlyAuctions.march);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("0%-50%")));

  state.monthlyAuctions.march.coverageRatio = 10;
  state.monthlyAuctions.march.curveType = null;
  validation = validateMonthlyAuction("march", state.monthlyAuctions.march);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("月度合约曲线")));
});

test("monthly auction skipped windows reject hidden details and calculate zero when clean", () => {
  const state = completeRetailState();
  state.monthlyAuctions.july = {
    participates: false,
    coverageRatio: 10,
    bidPrice: 500,
    curveType: "flat"
  };

  let validation = validateMonthlyAuction("july", state.monthlyAuctions.july);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("不参与时不应保留")));

  state.monthlyAuctions.july = {
    participates: false,
    coverageRatio: null,
    bidPrice: null,
    curveType: null
  };
  validation = validateMonthlyAuction("july", state.monthlyAuctions.july);
  assert.equal(validation.ok, true, validation.errors.join("; "));

  const monthly = calculateMonthlyAuctionResults(state);
  assert.equal(monthly.byMonth.july.participates, false);
  assert.equal(monthly.byMonth.july.volumeMwh, 0);
  assert.equal(monthly.byMonth.july.cost, 0);
  assert.equal(monthly.byMonth.july.bidPrice, null);
  assert.equal(monthly.byMonth.july.curveType, null);
});

test("monthly auction participation rejects out-of-range bid", () => {
  const state = completeRetailState();
  state.monthlyAuctions.march.bidPrice = 900;
  const validation = validateMonthlyAuction("march", state.monthlyAuctions.march);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("3 月")));
});

test("full volume coverage still produces curve mismatch and spot exposure", () => {
  const state = completeRetailState();
  state.annualBilateral = {
    coverageRatio: 100,
    bidPrice: 420,
    curveType: "flat",
    counterpartyFloorPrice: 405,
    dealAccepted: null
  };
  state.monthlyAuctions = {
    march: {
      participates: false,
      coverageRatio: null,
      bidPrice: null,
      curveType: null
    },
    july: {
      participates: false,
      coverageRatio: null,
      bidPrice: null,
      curveType: null
    },
    december: {
      participates: false,
      coverageRatio: null,
      bidPrice: null,
      curveType: null
    }
  };

  const validation = validateRetailTrainingState(state);
  assert.equal(validation.ok, true, validation.errors.join("; "));

  const settlement = calculateRetailSettlement(state);
  assert.equal(settlement.annualContract.volumeMwh, settlement.annualServiceMwh);
  assert.equal(settlement.monthlyAuction.totalVolumeMwh, 0);
  assert.equal(settlement.exposure.totalNetExposureMwh, 0);
  assert.equal(settlement.costs.baseSpotCost, 0);
  assert.ok(settlement.exposure.positiveExposureMwh > 0);
  assert.ok(settlement.exposure.negativeExposureMwh > 0);
  assert.ok(settlement.costs.curveMismatchRiskAdjustment > 0);
  assert.ok(settlement.exposure.curveMatchScore < 100);
  assert.ok(settlement.diagnostics.some((item) => item.includes("曲线错配")));

  const annual = calculateAnnualContract(state);
  const monthly = calculateMonthlyAuctionResults(state);
  const risk = calculateCurveMismatchRisk(state, annual, monthly);
  const julyExposure = calculateHourlyExposureByTypicalDay(state, "julyHighPrice", annual, monthly);
  assert.equal(risk.positiveExposureMwh, settlement.exposure.positiveExposureMwh);
  assert.equal(risk.negativeExposureMwh, settlement.exposure.negativeExposureMwh);
  assert.ok(julyExposure.hourly.some((point) => point.positiveExposureMwh > 0));
  assert.ok(julyExposure.hourly.some((point) => point.negativeExposureMwh > 0));
});

test("retail execution result display explains settlement without formula-heavy copy", () => {
  const settlement = calculateRetailSettlement(completeRetailState());
  const display = buildRetailExecutionResultDisplay(settlement);

  assert.ok(display.verdict.title.includes("毛利"));
  assert.ok(display.verdict.detail.length > 0);
  assert.deepEqual(display.insights.map((item) => item.id), ["margin", "procurement", "exposure", "risk", "review"]);
  assert.ok(display.insights.every((item) => item.label && item.title && item.detail && item.severity));
  assert.ok(display.insights.some((item) => item.id === "exposure" && item.detail.includes("客户用电曲线")));

  const displayText = [
    display.verdict.title,
    display.verdict.detail,
    ...display.insights.flatMap((item) => [item.label, item.title, item.detail])
  ].join("\n");

  assert.doesNotMatch(displayText, /[=×÷]/);
  assert.doesNotMatch(displayText, /公式|计算公式|grossMargin|totalProcurementCost|curveMismatchRiskAdjustment/);
});

test("retail settlement display organizes result signals for visual hierarchy", () => {
  const settlement = calculateRetailSettlement(completeRetailState());
  const display = buildRetailSettlementDisplay(settlement);

  assert.equal(display.signals.length, 4);
  assert.deepEqual(display.signals.map((item) => item.id), ["retailRevenue", "procurementCost", "grossMargin", "riskLevel"]);
  assert.deepEqual(display.exposure.signals.map((item) => item.id), [
    "positiveExposure",
    "negativeExposure",
    "highPricePositiveExposure",
    "lowPriceNegativeExposure"
  ]);
  assert.deepEqual(display.costStack.items.map((item) => item.id), ["annualContract", "monthlyAuction", "baseSpot", "curveMismatch"]);

  assert.equal(display.signals.find((item) => item.id === "grossMargin")?.value, settlement.margin.grossMargin);
  assert.equal(display.exposure.curveMatchScore, settlement.exposure.curveMatchScore);
  assert.equal(display.exposure.signals.find((item) => item.id === "positiveExposure")?.valueMwh, settlement.exposure.positiveExposureMwh);
  assert.ok(display.exposure.signals.every((item) => item.shareOfService >= 0 && item.shareOfService <= 1));
  assert.ok(display.costStack.items.every((item) => item.shareOfTotalCost >= 0 && item.shareOfTotalCost <= 1));

  const displayText = [
    display.headline.title,
    display.headline.detail,
    display.exposure.title,
    display.exposure.detail,
    display.costStack.title,
    display.costStack.detail,
    ...display.signals.flatMap((item) => [item.label, item.detail]),
    ...display.exposure.signals.flatMap((item) => [item.label, item.detail]),
    ...display.costStack.items.flatMap((item) => [item.label, item.detail])
  ].join("\n");

  assert.doesNotMatch(displayText, /grossMargin|totalProcurementCost|curveMismatchRiskAdjustment/);
  assert.match(display.exposure.detail, /敞口|曲线|现货/);
});

test("training result boundary copy states virtual simplified non-production limits", () => {
  const boundaryText = getAdaxTrainingModelBoundaryText();

  assert.equal(adaxTrainingModelBoundary.title, "模型边界说明");
  assert.match(boundaryText, /虚拟省级市场/);
  assert.match(boundaryText, /训练级简化机制/);
  assert.match(boundaryText, /不代表任何真实省份市场结果/);
  assert.match(boundaryText, /不可用于真实交易申报/);
  assert.match(boundaryText, /投资决策/);
});

test("retail execution records preserve decisions, settlement result, and revisit target", () => {
  const state = completeRetailState();
  const settlement = calculateRetailSettlement(state);
  const record = buildRetailExecutionRecord(state, settlement, "2026-06-10T00:00:00.000Z", "record-1");

  state.customerContracts.industrialStableMwh = 1;
  settlement.margin.grossMargin = -999;

  assert.equal(record.id, "record-1");
  assert.equal(record.savedAt, "2026-06-10T00:00:00.000Z");
  assert.equal(record.decisions.customerContracts.industrialStableMwh, 60000);
  assert.notEqual(record.result.margin.grossMargin, -999);
  assert.ok(record.summary.includes("售电公司执行记录"));

  withFakeWindow(() => {
    const nextRecords = saveRetailExecutionTrainingRecord(completeRetailState(), calculateRetailSettlement(completeRetailState()));
    const saved = nextRecords[0];
    assert.equal(saved.schemaVersion, "0.1");
    assert.equal(saved.mode, "execution");
    assert.ok(saved.savedAtIso.includes("T"));
    assert.ok(saved.execution?.decisions);
    assert.ok(saved.execution?.result);
    assert.equal(saved.execution?.participant, "retailer");
    assert.deepEqual(getAdaxRecordRevisitTarget(saved), {
      page: "settlement",
      mode: "execution",
      scenarioId: "SCN-A-STD-001",
      roleId: "retailer"
    });
    assert.equal(getAdaxRecordRevisitLabel(saved), "回看结算结果");
  });
});

test("training record export JSON preserves sandbox boundary", () => {
  const record = basicTrainingRecord("export-1");
  const singleExport = JSON.parse(buildRecordExportJson(record));
  const batchExport = JSON.parse(buildRecordsExportJson([record]));

  assert.equal(singleExport.exportType, "ADAX_TRAINING_RECORD");
  assert.equal(singleExport.record.id, "export-1");
  assert.match(singleExport.boundary, /local training sandbox/);
  assert.equal(batchExport.exportType, "ADAX_TRAINING_RECORDS");
  assert.equal(batchExport.count, 1);
  assert.equal(batchExport.records[0].id, "export-1");
  assert.match(batchExport.boundary, /real market settlement/);
});

test("retail review materials stay scoped to scenario participant node and material type", () => {
  const scope = { scenarioId: "SCN-A-STD-001", participantType: "retailer" };
  const valid = basicReviewMaterial();
  const materials = [
    valid,
    basicReviewMaterial({
      id: "blank",
      materialType: "教材摘录",
      content: "   "
    }),
    basicReviewMaterial({
      id: "other-scenario",
      scenarioId: "SCN-B"
    }),
    basicReviewMaterial({
      id: "other-role",
      participantType: "thermal"
    }),
    basicReviewMaterial({
      id: "bad-node",
      nodeId: "genericFolder"
    }),
    basicReviewMaterial({
      id: "bad-type",
      materialType: "附件"
    })
  ];

  const stats = getRetailReviewMaterialStats(materials, scope);
  assert.equal(stats.materialCount, 1);
  assert.equal(stats.coveredNodeCount, 1);
  assert.equal(stats.nodeCount, 8);
  assert.equal(stats.materialSlotTotal, 24);
  assert.deepEqual(stats.coveredNodeIds, ["marketBrief"]);
  assert.equal(canSaveRetailReviewRecord(materials, scope), true);
  assert.equal(canSaveRetailReviewRecord([basicReviewMaterial({ content: "" })], scope), false);

  const snapshot = buildRetailReviewRecordSnapshot(materials, scope);
  assert.equal(snapshot?.materialCount, 1);
  assert.equal(snapshot?.materials[0].content, valid.content);
  assert.deepEqual(buildRetailReviewRecordSnapshot([], scope), null);

  const merged = mergeRetailReviewSnapshotMaterials([basicReviewMaterial({ id: "unrelated", nodeId: "customerLoad" })], snapshot);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, valid.id);
});

test("retail review records snapshot materials and expose review revisit target", () => {
  withFakeWindow(() => {
    assert.deepEqual(saveRetailReviewTrainingRecord([]), []);

    const sourceMaterial = basicReviewMaterial();
    const nextRecords = saveRetailReviewTrainingRecord([sourceMaterial]);
    sourceMaterial.content = "changed after save";

    const saved = nextRecords[0];
    assert.equal(saved.schemaVersion, "0.1");
    assert.equal(saved.mode, "review");
    assert.equal(saved.grossMargin, 0);
    assert.equal(saved.materialCount, 1);
    assert.equal(saved.review?.materialCount, 1);
    assert.equal(saved.review?.materials[0].content, "年度供需和典型日价格会影响售电公司采购节奏。");
    assert.deepEqual(saved.review?.coveredNodeIds, ["marketBrief"]);
    assert.ok(saved.summary.includes("覆盖 1/8 个交易节点"));
    assert.ok(saved.diagnostics[0].includes("不是交易收益结果"));
    assert.deepEqual(getAdaxRecordRevisitTarget(saved), {
      page: "strategy",
      mode: "review",
      scenarioId: "SCN-A-STD-001",
      roleId: "retailer"
    });
    assert.equal(getAdaxRecordRevisitLabel(saved), "回到复盘工作台");
  });
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

test("retail workbench assist stays aligned across execution and review modes", () => {
  assert.deepEqual(getRetailWorkbenchAssist("execution"), {
    label: "操作提示",
    modeClass: "execution",
    purpose: "查看当前交易节点操作提示"
  });
  assert.deepEqual(getRetailWorkbenchAssist("review"), {
    label: "材料入口",
    modeClass: "review",
    purpose: "导入或整理当前交易节点材料"
  });
});
