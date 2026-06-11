import assert from "node:assert/strict";
import test from "node:test";

import {
  getAdaxSessionFlowAccessState,
  getRetailSessionSettlement
} from "../../.test-build/src/app/adaxSessionDerivations.js";
import { createEmptyRetailTrainingState } from "../../.test-build/src/domain/retailState.js";
import { validateRetailTrainingState } from "../../.test-build/src/domain/retailValidation.js";

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

test("session derivation skips settlement calculation when retail validation fails", () => {
  const state = createEmptyRetailTrainingState();
  const validation = validateRetailTrainingState(state);
  let calculationCalls = 0;

  const result = getRetailSessionSettlement(state, validation, () => {
    calculationCalls += 1;
    throw new Error("should not calculate invalid state");
  });

  assert.equal(validation.ok, false);
  assert.equal(calculationCalls, 0);
  assert.equal(result, null);
});

test("session derivation returns settlement only for valid retail state", () => {
  const state = completeRetailState();
  const validation = validateRetailTrainingState(state);
  const result = getRetailSessionSettlement(state, validation);

  assert.equal(validation.ok, true, validation.errors.join("; "));
  assert.ok(result);
  assert.equal(result.annualServiceMwh, 105000);
  assert.equal(result.annualContract.accepted, true);
});

test("session derivation safely hides calculation exceptions from session state", () => {
  const state = completeRetailState();
  const validation = validateRetailTrainingState(state);

  const result = getRetailSessionSettlement(state, validation, () => {
    throw new Error("calculation failed");
  });

  assert.equal(validation.ok, true, validation.errors.join("; "));
  assert.equal(result, null);
});

test("session derivation builds flow access state from session outputs", () => {
  const state = completeRetailState();
  const settlement = getRetailSessionSettlement(state, validateRetailTrainingState(state));

  assert.deepEqual(
    getAdaxSessionFlowAccessState({
      mode: "execution",
      retailDomainSettlement: settlement,
      executionResultGenerated: true,
      settlementViewed: false
    }),
    {
      mode: "execution",
      hasRetailSettlement: true,
      executionResultGenerated: true,
      settlementViewed: false
    }
  );

  assert.deepEqual(
    getAdaxSessionFlowAccessState({
      mode: null,
      retailDomainSettlement: null,
      executionResultGenerated: true,
      settlementViewed: true
    }),
    {
      mode: null,
      hasRetailSettlement: false,
      executionResultGenerated: true,
      settlementViewed: true
    }
  );
});
