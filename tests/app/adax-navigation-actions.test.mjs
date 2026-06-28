import assert from "node:assert/strict";
import test from "node:test";

import { createAdaxNavigationActions } from "../../.test-build/src/app/createAdaxNavigationActions.js";

test("navigation actions reset product routes and guard review outputs", () => {
  function createHarness(mode, flowAccessState) {
    const calls = [];
    let currentPage = "strategy";
    let currentMode = mode;
    let settlementViewed = true;
    let recordSaved = true;
    let outputResetCount = 0;

    const setCurrentPage = (value) => {
      currentPage = typeof value === "function" ? value(currentPage) : value;
      calls.push(["setCurrentPage", currentPage]);
    };
    const setMode = (value) => {
      currentMode = typeof value === "function" ? value(currentMode) : value;
      calls.push(["setMode", currentMode]);
    };
    const setSettlementViewed = (value) => {
      settlementViewed = typeof value === "function" ? value(settlementViewed) : value;
      calls.push(["setSettlementViewed", settlementViewed]);
    };
    const setRecordSaved = (value) => {
      recordSaved = typeof value === "function" ? value(recordSaved) : value;
      calls.push(["setRecordSaved", recordSaved]);
    };
    const pushRoute = (...args) => calls.push(["pushRoute", ...args]);
    const resetOutputState = () => {
      outputResetCount += 1;
      settlementViewed = false;
      recordSaved = false;
      calls.push(["resetOutputState"]);
    };
    const scrollToTop = (behavior) => calls.push(["scrollToTop", behavior]);

    const actions = createAdaxNavigationActions({
      mode,
      flowAccessState,
      setCurrentPage,
      setMode,
      setSettlementViewed,
      setRecordSaved,
      pushRoute,
      resetOutputState,
      scrollToTop
    });

    return {
      actions,
      calls,
      get currentPage() {
        return currentPage;
      },
      get currentMode() {
        return currentMode;
      },
      get settlementViewed() {
        return settlementViewed;
      },
      get recordSaved() {
        return recordSaved;
      },
      get outputResetCount() {
        return outputResetCount;
      }
    };
  }

  const productRouteHarness = createHarness("review", {
    mode: "review",
    hasRetailSettlement: true,
    executionResultGenerated: true,
    settlementViewed: true
  });

  productRouteHarness.actions.navigate("records");

  assert.equal(productRouteHarness.currentMode, null);
  assert.equal(productRouteHarness.currentPage, "records");
  assert.equal(productRouteHarness.settlementViewed, false);
  assert.equal(productRouteHarness.recordSaved, false);
  assert.equal(productRouteHarness.outputResetCount, 1);
  assert.deepEqual(productRouteHarness.calls, [
    ["setMode", null],
    ["resetOutputState"],
    ["pushRoute", "records", null],
    ["setCurrentPage", "records"],
    ["scrollToTop", "smooth"]
  ]);

  const reviewOutputHarness = createHarness("review", {
    mode: "review",
    hasRetailSettlement: true,
    executionResultGenerated: true,
    settlementViewed: true
  });

  reviewOutputHarness.actions.navigate("settlement");

  assert.equal(reviewOutputHarness.currentPage, "strategy");
  assert.deepEqual(reviewOutputHarness.calls, [
    ["setCurrentPage", "strategy"],
    ["pushRoute", "strategy", "review"],
    ["scrollToTop", "smooth"]
  ]);
});
