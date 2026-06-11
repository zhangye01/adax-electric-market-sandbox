import assert from "node:assert/strict";
import test from "node:test";

import { createAdaxTrainingActions } from "../../.test-build/src/app/createAdaxTrainingActions.js";
import { calculateRetailSettlement } from "../../.test-build/src/domain/retailCalculations.js";
import { createEmptyRetailTrainingState } from "../../.test-build/src/domain/retailState.js";

function completeRetailState() {
  const state = createEmptyRetailTrainingState();
  state.customerContracts = {
    industrialStableMwh: 60000,
    commercialPeakMwh: 30000,
    volatileLoadMwh: 15000
  };
  state.retailPackage.packageType = "fixed";
  state.annualBilateral = {
    coverageRatio: 100,
    bidPrice: 420,
    curveType: "industrial",
    counterpartyFloorPrice: 405,
    dealAccepted: null
  };
  state.monthlyAuctions = {
    march: {
      participates: true,
      coverageRatio: 10,
      bidPrice: 330,
      curveType: "typicalMonth"
    },
    july: {
      participates: false,
      coverageRatio: null,
      bidPrice: null,
      curveType: null
    },
    december: {
      participates: true,
      coverageRatio: 12,
      bidPrice: 500,
      curveType: "flat"
    }
  };
  return state;
}

function resolveStateAction(currentValue, nextValue) {
  return typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
}

function withFakeWindow(callback) {
  const previousWindow = globalThis.window;
  const store = new Map();
  const fakeWindow = {
    localStorage: {
      getItem(key) {
        return store.has(key) ? store.get(key) : null;
      },
      setItem(key, value) {
        store.set(key, String(value));
      },
      removeItem(key) {
        store.delete(key);
      }
    },
    confirm() {
      return true;
    }
  };

  globalThis.window = fakeWindow;
  try {
    return callback({ store, window: fakeWindow });
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
}

function createHarness(overrides = {}) {
  const calls = [];
  let currentPage = overrides.currentPage ?? "strategy";
  let mode = overrides.mode ?? "execution";
  let selectedRole = overrides.selectedRole ?? "retailer";
  let retailTrainingState = overrides.retailTrainingState ?? completeRetailState();
  let retailDomainSettlement =
    Object.hasOwn(overrides, "retailDomainSettlement")
      ? overrides.retailDomainSettlement
      : calculateRetailSettlement(retailTrainingState);
  let materials = overrides.materials ?? [];
  let records = overrides.records ?? [];
  let templateMessage = overrides.templateMessage ?? "stale template message";
  let executionResultGenerated = overrides.executionResultGenerated ?? true;
  let settlementViewed = overrides.settlementViewed ?? true;
  let recordSaved = overrides.recordSaved ?? true;

  function getFlowAccessState() {
    return {
      mode,
      hasRetailSettlement: Boolean(retailDomainSettlement),
      executionResultGenerated,
      settlementViewed
    };
  }

  function getActions() {
    return createAdaxTrainingActions({
      currentPage,
      mode,
      selectedRole,
      retailTrainingState,
      retailDomainSettlement,
      flowAccessState: getFlowAccessState(),
      materials,
      setCurrentPage(value) {
        currentPage = resolveStateAction(currentPage, value);
        calls.push(["setCurrentPage", currentPage]);
      },
      setMode(value) {
        mode = resolveStateAction(mode, value);
        calls.push(["setMode", mode]);
      },
      setSelectedRole(value) {
        selectedRole = resolveStateAction(selectedRole, value);
        calls.push(["setSelectedRole", selectedRole]);
      },
      setRetailTrainingState(value) {
        retailTrainingState = resolveStateAction(retailTrainingState, value);
        calls.push(["setRetailTrainingState"]);
      },
      setTemplateMessage(value) {
        templateMessage = resolveStateAction(templateMessage, value);
        calls.push(["setTemplateMessage", templateMessage]);
      },
      setExecutionResultGenerated(value) {
        executionResultGenerated = resolveStateAction(executionResultGenerated, value);
        calls.push(["setExecutionResultGenerated", executionResultGenerated]);
      },
      setSettlementViewed(value) {
        settlementViewed = resolveStateAction(settlementViewed, value);
        calls.push(["setSettlementViewed", settlementViewed]);
      },
      setRecordSaved(value) {
        recordSaved = resolveStateAction(recordSaved, value);
        calls.push(["setRecordSaved", recordSaved]);
      },
      setRecords(value) {
        records = resolveStateAction(records, value);
        calls.push(["setRecords", records.length]);
      },
      setMaterials(value) {
        materials = resolveStateAction(materials, value);
        calls.push(["setMaterials", materials.length]);
      },
      pushRoute(...args) {
        calls.push(["pushRoute", ...args]);
      },
      replaceRoute(...args) {
        calls.push(["replaceRoute", ...args]);
      },
      scrollToTop(behavior) {
        calls.push(["scrollToTop", behavior]);
      }
    });
  }

  return {
    getActions,
    calls,
    get currentPage() {
      return currentPage;
    },
    get mode() {
      return mode;
    },
    get selectedRole() {
      return selectedRole;
    },
    get retailTrainingState() {
      return retailTrainingState;
    },
    get materials() {
      return materials;
    },
    get records() {
      return records;
    },
    get templateMessage() {
      return templateMessage;
    },
    get executionResultGenerated() {
      return executionResultGenerated;
    },
    get settlementViewed() {
      return settlementViewed;
    },
    get recordSaved() {
      return recordSaved;
    }
  };
}

test("training actions choose mode resets stale session state before entering scenario", () => {
  const harness = createHarness({
    currentPage: "records",
    mode: "review",
    templateMessage: "old import failed"
  });

  harness.getActions().chooseTrainingMode("execution");

  assert.equal(harness.mode, "execution");
  assert.equal(harness.selectedRole, "retailer");
  assert.deepEqual(harness.retailTrainingState, createEmptyRetailTrainingState());
  assert.equal(harness.executionResultGenerated, false);
  assert.equal(harness.settlementViewed, false);
  assert.equal(harness.recordSaved, false);
  assert.equal(harness.templateMessage, "");
  assert.equal(harness.currentPage, "scenario");
  assert.deepEqual(harness.calls.filter((call) => call[0] === "pushRoute"), [["pushRoute", "scenario", "execution"]]);
});

test("training actions require settlement before generating or saving execution results", () => {
  withFakeWindow(() => {
    const blocked = createHarness({
      retailDomainSettlement: null,
      executionResultGenerated: false,
      settlementViewed: false,
      recordSaved: false,
      records: []
    });

    blocked.getActions().generateExecutionResult();
    blocked.getActions().saveExecutionRecord();

    assert.equal(blocked.executionResultGenerated, false);
    assert.equal(blocked.recordSaved, false);
    assert.equal(blocked.records.length, 0);

    const ready = createHarness({
      executionResultGenerated: false,
      settlementViewed: true,
      recordSaved: true,
      records: []
    });

    ready.getActions().generateExecutionResult();

    assert.equal(ready.executionResultGenerated, true);
    assert.equal(ready.settlementViewed, false);
    assert.equal(ready.recordSaved, false);

    ready.getActions().saveExecutionRecord();

    assert.equal(ready.recordSaved, true);
    assert.equal(ready.records.length, 1);
    assert.equal(ready.records[0].mode, "execution");
    assert.equal(ready.records[0].revisit.page, "settlement");
    assert.deepEqual(ready.records[0].execution.decisions, ready.retailTrainingState);
  });
});

test("training actions keep review materials node-bound before saving review records", () => {
  withFakeWindow(() => {
    const harness = createHarness({
      mode: "review",
      materials: [],
      records: [],
      recordSaved: false
    });

    harness.getActions().saveReviewRecord();

    assert.equal(harness.records.length, 0);
    assert.equal(harness.recordSaved, false);

    harness.getActions().updateMaterial(
      { id: "marketBrief", title: "市场行情" },
      "我的理解",
      "年度供需和典型日价格会影响售电公司采购节奏。"
    );

    assert.equal(harness.materials.length, 1);
    assert.equal(harness.materials[0].scenarioId, "SCN-A-STD-001");
    assert.equal(harness.materials[0].participantType, "retailer");
    assert.equal(harness.materials[0].nodeId, "marketBrief");
    assert.equal(harness.recordSaved, false);

    harness.getActions().saveReviewRecord();

    assert.equal(harness.records.length, 1);
    assert.equal(harness.recordSaved, true);
    assert.equal(harness.records[0].mode, "review");
    assert.equal(harness.records[0].materialCount, 1);
    assert.deepEqual(harness.records[0].review.coveredNodeIds, ["marketBrief"]);
    assert.equal(harness.records[0].revisit.page, "strategy");
  });
});
