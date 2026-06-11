import assert from "node:assert/strict";
import test from "node:test";
import { runScriptFixture } from "./script-fixtures.mjs";

const retailTypeExports = [
  "RetailCustomerSegment",
  "RetailPackageType",
  "AnnualContractCurveType",
  "MonthlyContractCurveType",
  "RetailTypicalMonth",
  "RetailTypicalDay",
  "RetailRiskLevel",
  "RetailPricePosition",
  "RetailNodeId",
  "RetailHourlyCurve",
  "RetailTrainingState",
  "MonthlyAuctionDecision",
  "RetailValidationResult",
  "RetailAnnualMarketData",
  "RetailCustomerPoolItem",
  "RetailPackageConfig",
  "RetailFixedPackageConfig",
  "RetailTouPackageConfig",
  "RetailSpotLinkedPackageConfig",
  "RetailPackageDefinition",
  "RetailTypicalMonthData",
  "RetailTypicalDayData",
  "RetailMarketData",
  "CustomerMixResult",
  "AnnualBilateralDealResult",
  "AnnualContractResult",
  "MonthlyAuctionResult",
  "RetailMonthlyAuctionResults",
  "HourlyExposurePoint",
  "TypicalDayExposureResult",
  "CurveMismatchRiskResult",
  "RetailSettlementResult",
  "RetailExecutionRecord"
];

const appTypeExports = [
  "AdaxPageId",
  "AdaxTrainingStep",
  "AdaxTrainingMode",
  "AdaxRoleId",
  "UserMaterial",
  "AdaxReviewRecordSnapshot",
  "AdaxRecordRevisitTarget",
  "AdaxTrainingRecord"
];

function typeFile(exports) {
  return `${exports.map((name) => `export interface ${name} {}`).join("\n")}\n`;
}

function runDomainContractFixture({ retailExports = retailTypeExports, appExports = appTypeExports } = {}) {
  return runScriptFixture("scripts/check-domain-contracts.mjs", {
    "src/domain/retailTypes.ts": typeFile(retailExports),
    "src/types.ts": typeFile(appExports)
  });
}

test("domain-contract checker accepts reviewed export groups in order", () => {
  const result = runDomainContractFixture();

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /7 reviewed groups/);
  assert.match(result.stdout, /2 reviewed groups/);
});

test("domain-contract checker rejects unreviewed central exports", () => {
  const result = runDomainContractFixture({
    retailExports: [...retailTypeExports, "UnexpectedRetailContract"]
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /New or renamed exports that need review/);
  assert.match(result.stderr, /UnexpectedRetailContract/);
});

test("domain-contract checker rejects reviewed exports in the wrong group order", () => {
  const reordered = [...retailTypeExports];
  [reordered[0], reordered[1]] = [reordered[1], reordered[0]];

  const result = runDomainContractFixture({ retailExports: reordered });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Export order no longer matches reviewed groups/);
  assert.match(result.stderr, /expected RetailCustomerSegment/);
});

test("domain-contract checker rejects missing reviewed exports", () => {
  const result = runDomainContractFixture({
    appExports: appTypeExports.filter((name) => name !== "AdaxTrainingRecord")
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing reviewed exports/);
  assert.match(result.stderr, /AdaxTrainingRecord/);
});
