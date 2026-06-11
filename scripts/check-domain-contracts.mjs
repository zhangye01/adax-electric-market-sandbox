import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const reviewedContracts = [
  {
    path: "src/domain/retailTypes.ts",
    exports: [
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
    ]
  },
  {
    path: "src/types.ts",
    exports: [
      "AdaxPageId",
      "AdaxTrainingStep",
      "AdaxTrainingMode",
      "AdaxRoleId",
      "UserMaterial",
      "AdaxReviewRecordSnapshot",
      "AdaxRecordRevisitTarget",
      "AdaxTrainingRecord"
    ]
  }
];

function log(message = "") {
  console.log(`[check-domain-contracts] ${message}`);
}

function extractExportedContracts(content) {
  return [...content.matchAll(/^export\s+(?:type|interface)\s+([A-Za-z0-9_]+)/gm)].map((match) => match[1]);
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

const violations = [];

for (const contract of reviewedContracts) {
  const actualExports = extractExportedContracts(readFileSync(resolve(rootDir, contract.path), "utf8"));
  const missingExports = difference(contract.exports, actualExports);
  const unreviewedExports = difference(actualExports, contract.exports);

  log(`${contract.path} exports checked: ${actualExports.length}`);

  if (missingExports.length > 0) {
    violations.push({ path: contract.path, kind: "Missing reviewed exports", exports: missingExports });
  }

  if (unreviewedExports.length > 0) {
    violations.push({ path: contract.path, kind: "New or renamed exports that need review", exports: unreviewedExports });
  }
}

if (violations.length > 0) {
  console.error("\nDomain contract check failed:\n");

  for (const violation of violations) {
    console.error(`- ${violation.path}: ${violation.kind}`);
    for (const name of violation.exports) console.error(`  - ${name}`);
  }

  console.error(
    "\nIf this contract change is intentional, update scripts/check-domain-contracts.mjs, docs/ADAX_SOURCE_SHAPE_AUDIT.md, and the relevant tests before handing off."
  );
  process.exit(1);
}

log("all central contract exports are reviewed.");
