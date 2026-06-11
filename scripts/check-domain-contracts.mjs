import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const expectedRetailTypeExports = [
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

const retailTypesPath = resolve(rootDir, "src/domain/retailTypes.ts");
const actualRetailTypeExports = extractExportedContracts(readFileSync(retailTypesPath, "utf8"));

const missingExports = difference(expectedRetailTypeExports, actualRetailTypeExports);
const unreviewedExports = difference(actualRetailTypeExports, expectedRetailTypeExports);

log(`retailTypes exports checked: ${actualRetailTypeExports.length}`);

if (missingExports.length > 0 || unreviewedExports.length > 0) {
  console.error("\nDomain contract check failed:\n");

  if (missingExports.length > 0) {
    console.error("- Missing reviewed exports:");
    for (const name of missingExports) console.error(`  - ${name}`);
  }

  if (unreviewedExports.length > 0) {
    console.error("- New or renamed exports that need review:");
    for (const name of unreviewedExports) console.error(`  - ${name}`);
  }

  console.error(
    "\nIf this contract change is intentional, update scripts/check-domain-contracts.mjs, docs/ADAX_SOURCE_SHAPE_AUDIT.md, and the relevant tests before handing off."
  );
  process.exit(1);
}

log("all domain contract exports are reviewed.");
