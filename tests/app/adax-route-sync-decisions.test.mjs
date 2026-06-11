import assert from "node:assert/strict";
import test from "node:test";

import { getAdaxOutputRouteSyncDecision } from "../../.test-build/src/app/adaxRouteSyncDecisions.js";

function decision(overrides = {}) {
  return getAdaxOutputRouteSyncDecision({
    currentPage: "settlement",
    mode: "execution",
    selectedRole: "retailer",
    settlementViewed: false,
    flowAccessState: {
      mode: "execution",
      hasRetailSettlement: true,
      executionResultGenerated: true,
      settlementViewed: false
    },
    ...overrides
  });
}

test("route sync output decision ignores non-output pages", () => {
  assert.deepEqual(
    decision({
      currentPage: "strategy"
    }),
    { kind: "none" }
  );
});

test("route sync output decision marks accessible settlement as viewed once", () => {
  assert.deepEqual(decision(), { kind: "markSettlementViewed" });

  assert.deepEqual(
    decision({
      settlementViewed: true,
      flowAccessState: {
        mode: "execution",
        hasRetailSettlement: true,
        executionResultGenerated: true,
        settlementViewed: true
      }
    }),
    { kind: "none" }
  );
});

test("route sync output decision sends blocked execution outputs back to the nearest valid page", () => {
  assert.deepEqual(
    decision({
      currentPage: "settlement",
      flowAccessState: {
        mode: "execution",
        hasRetailSettlement: true,
        executionResultGenerated: false,
        settlementViewed: false
      }
    }),
    {
      kind: "replaceRoute",
      page: "strategy",
      mode: "execution",
      role: "retailer"
    }
  );

  assert.deepEqual(
    decision({
      currentPage: "review",
      settlementViewed: false,
      flowAccessState: {
        mode: "execution",
        hasRetailSettlement: true,
        executionResultGenerated: true,
        settlementViewed: false
      }
    }),
    {
      kind: "replaceRoute",
      page: "settlement",
      mode: "execution",
      role: "retailer"
    }
  );
});

test("route sync output decision blocks review-mode output routes", () => {
  assert.deepEqual(
    decision({
      currentPage: "review",
      mode: "review",
      flowAccessState: {
        mode: "review",
        hasRetailSettlement: true,
        executionResultGenerated: true,
        settlementViewed: true
      }
    }),
    {
      kind: "replaceRoute",
      page: "strategy",
      mode: "review",
      role: "retailer"
    }
  );
});

test("route sync output decision falls back to home when no mode exists", () => {
  assert.deepEqual(
    decision({
      currentPage: "settlement",
      mode: null,
      flowAccessState: {
        mode: null,
        hasRetailSettlement: false,
        executionResultGenerated: false,
        settlementViewed: false
      }
    }),
    {
      kind: "replaceRoute",
      page: "home",
      mode: null,
      role: "retailer"
    }
  );
});
