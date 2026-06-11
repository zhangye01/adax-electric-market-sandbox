import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const reviewedContracts = [
  {
    path: "src/domain/retailTypes.ts",
    groups: [
      {
        name: "retail identity and workflow keys",
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
          "RetailHourlyCurve"
        ]
      },
      {
        name: "execution decision state",
        exports: ["RetailTrainingState", "MonthlyAuctionDecision"]
      },
      {
        name: "validation result",
        exports: ["RetailValidationResult"]
      },
      {
        name: "virtual market data contract",
        exports: [
          "RetailAnnualMarketData",
          "RetailCustomerPoolItem",
          "RetailPackageConfig",
          "RetailFixedPackageConfig",
          "RetailTouPackageConfig",
          "RetailSpotLinkedPackageConfig",
          "RetailPackageDefinition",
          "RetailTypicalMonthData",
          "RetailTypicalDayData",
          "RetailMarketData"
        ]
      },
      {
        name: "calculation intermediate contracts",
        exports: [
          "CustomerMixResult",
          "AnnualBilateralDealResult",
          "AnnualContractResult",
          "MonthlyAuctionResult",
          "RetailMonthlyAuctionResults",
          "HourlyExposurePoint",
          "TypicalDayExposureResult",
          "CurveMismatchRiskResult"
        ]
      },
      {
        name: "settlement output contract",
        exports: ["RetailSettlementResult"]
      },
      {
        name: "execution record contract",
        exports: ["RetailExecutionRecord"]
      }
    ]
  },
  {
    path: "src/types.ts",
    groups: [
      {
        name: "app route and mode keys",
        exports: ["AdaxPageId", "AdaxTrainingStep", "AdaxTrainingMode", "AdaxRoleId"]
      },
      {
        name: "local record and material contracts",
        exports: [
          "UserMaterial",
          "AdaxReviewRecordSnapshot",
          "AdaxRecordRevisitTarget",
          "AdaxTrainingRecord"
        ]
      }
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

function flattenReviewedExports(contract) {
  return contract.groups.flatMap((group) => group.exports);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function orderMismatches(expected, actual) {
  const length = Math.max(expected.length, actual.length);
  const mismatches = [];
  for (let index = 0; index < length; index += 1) {
    if (expected[index] !== actual[index]) {
      mismatches.push(`${index + 1}: expected ${expected[index] ?? "<none>"}, found ${actual[index] ?? "<none>"}`);
    }
  }
  return mismatches;
}

const violations = [];

for (const contract of reviewedContracts) {
  const actualExports = extractExportedContracts(readFileSync(resolve(rootDir, contract.path), "utf8"));
  const reviewedExports = flattenReviewedExports(contract);
  const duplicateReviewedExports = duplicateValues(reviewedExports);
  const duplicateActualExports = duplicateValues(actualExports);
  const missingExports = difference(reviewedExports, actualExports);
  const unreviewedExports = difference(actualExports, reviewedExports);
  const mismatchedOrder = missingExports.length === 0 && unreviewedExports.length === 0
    ? orderMismatches(reviewedExports, actualExports)
    : [];

  log(`${contract.path} exports checked: ${actualExports.length} (${contract.groups.length} reviewed groups)`);

  if (duplicateReviewedExports.length > 0) {
    violations.push({ path: contract.path, kind: "Duplicate reviewed exports in grouped contract", exports: duplicateReviewedExports });
  }

  if (duplicateActualExports.length > 0) {
    violations.push({ path: contract.path, kind: "Duplicate actual exports", exports: duplicateActualExports });
  }

  if (missingExports.length > 0) {
    violations.push({ path: contract.path, kind: "Missing reviewed exports", exports: missingExports });
  }

  if (unreviewedExports.length > 0) {
    violations.push({ path: contract.path, kind: "New or renamed exports that need review", exports: unreviewedExports });
  }

  if (mismatchedOrder.length > 0) {
    violations.push({ path: contract.path, kind: "Export order no longer matches reviewed groups", exports: mismatchedOrder });
  }
}

if (violations.length > 0) {
  console.error("\nDomain contract check failed:\n");

  for (const violation of violations) {
    console.error(`- ${violation.path}: ${violation.kind}`);
    for (const name of violation.exports) console.error(`  - ${name}`);
  }

  console.error(
    "\nIf this contract change is intentional, update the grouped review contract in scripts/check-domain-contracts.mjs, docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md, docs/ADAX_SOURCE_SHAPE_AUDIT.md, and the relevant tests before handing off."
  );
  process.exit(1);
}

log("all central contract exports are reviewed.");
