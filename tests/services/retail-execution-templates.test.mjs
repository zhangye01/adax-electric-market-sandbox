import assert from "node:assert/strict";
import test from "node:test";

import {
  createRetailExecutionTemplateJson,
  parseRetailExecutionTemplate
} from "../../.test-build/src/services/retailExecutionTemplates.js";
import { completeRetailState } from "../support/retail-fixtures.mjs";

test("retail execution template round-trips and rejects invalid values", () => {
  const state = completeRetailState();
  const parsed = parseRetailExecutionTemplate(createRetailExecutionTemplateJson(state));
  assert.equal(parsed.ok, true, parsed.errors.join("; "));
  assert.deepEqual(parsed.data, state);

  const missingTypeParsed = parseRetailExecutionTemplate(
    JSON.stringify({
      version: "0.1",
      state
    })
  );
  assert.equal(missingTypeParsed.ok, false);
  assert.ok(missingTypeParsed.errors.some((error) => error.includes("模板类型")));

  const withExtraFields = structuredClone(state);
  withExtraFields.customerContracts.unreviewedField = 100;
  withExtraFields.annualBilateral.unreviewedField = "extra";
  withExtraFields.monthlyAuctions.march.unreviewedField = true;
  const normalizedParsed = parseRetailExecutionTemplate(
    JSON.stringify({
      exportType: "ADAX_RETAIL_EXECUTION_TEMPLATE",
      version: "0.1",
      state: withExtraFields
    })
  );
  assert.equal(normalizedParsed.ok, true, normalizedParsed.errors.join("; "));
  assert.deepEqual(normalizedParsed.data, state);
  assert.equal(Object.hasOwn(normalizedParsed.data.customerContracts, "unreviewedField"), false);
  assert.equal(Object.hasOwn(normalizedParsed.data.monthlyAuctions.march, "unreviewedField"), false);

  const invalid = structuredClone(state);
  invalid.customerContracts.industrialStableMwh = -1;
  const invalidParsed = parseRetailExecutionTemplate(
    JSON.stringify({
      exportType: "ADAX_RETAIL_EXECUTION_TEMPLATE",
      version: "0.1",
      state: invalid
    })
  );
  assert.equal(invalidParsed.ok, false);
  assert.ok(invalidParsed.errors.some((error) => error.includes("工业稳定型签约电量")));
});

test("retail execution template rejects invalid annual bilateral fields", () => {
  const invalidCoverage = completeRetailState();
  invalidCoverage.annualBilateral.coverageRatio = 121;
  const invalidCoverageParsed = parseRetailExecutionTemplate(
    JSON.stringify({
      exportType: "ADAX_RETAIL_EXECUTION_TEMPLATE",
      version: "0.1",
      state: invalidCoverage
    })
  );
  assert.equal(invalidCoverageParsed.ok, false);
  assert.ok(invalidCoverageParsed.errors.some((error) => error.includes("年度基础覆盖比例")));

  const invalidCurve = completeRetailState();
  invalidCurve.annualBilateral.curveType = "peak";
  const invalidCurveParsed = parseRetailExecutionTemplate(
    JSON.stringify({
      exportType: "ADAX_RETAIL_EXECUTION_TEMPLATE",
      version: "0.1",
      state: invalidCurve
    })
  );
  assert.equal(invalidCurveParsed.ok, false);
  assert.ok(invalidCurveParsed.errors.some((error) => error.includes("年度合约曲线")));
});

test("retail execution template rejects invalid monthly auction fields", () => {
  const skippedWithHiddenDetails = completeRetailState();
  skippedWithHiddenDetails.monthlyAuctions.july = {
    participates: false,
    coverageRatio: 10,
    bidPrice: 500,
    curveType: "flat"
  };
  const skippedParsed = parseRetailExecutionTemplate(
    JSON.stringify({
      exportType: "ADAX_RETAIL_EXECUTION_TEMPLATE",
      version: "0.1",
      state: skippedWithHiddenDetails
    })
  );
  assert.equal(skippedParsed.ok, false);
  assert.ok(skippedParsed.errors.some((error) => error.includes("7 月")));
  assert.ok(skippedParsed.errors.some((error) => error.includes("必须为 null")));

  const invalidCurve = completeRetailState();
  invalidCurve.monthlyAuctions.march.curveType = "industrial";
  const invalidCurveParsed = parseRetailExecutionTemplate(
    JSON.stringify({
      exportType: "ADAX_RETAIL_EXECUTION_TEMPLATE",
      version: "0.1",
      state: invalidCurve
    })
  );
  assert.equal(invalidCurveParsed.ok, false);
  assert.ok(invalidCurveParsed.errors.some((error) => error.includes("3 月")));
  assert.ok(invalidCurveParsed.errors.some((error) => error.includes("月度合约曲线")));
});
