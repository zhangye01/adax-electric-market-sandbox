import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const requiredFiles = [
  "AGENTS.md",
  "docs/ADAX_MVP_STARTER.md",
  "docs/ADAX_LONG_TERM_PLAN.md",
  "docs/ENGINEERING_BASELINE.md",
  "docs/ADAX_CHANGE_GATE_CHECKLIST.md",
  "docs/ACTIVE_ARCHITECTURE_MAP.md",
  "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
  "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
  "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
  "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
  "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
  "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
  "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
  "docs/ADAX_RENEWABLE_STARTUP_CARD.md",
  "docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md",
  "docs/ADAX_THERMAL_STARTUP_CARD.md",
  "docs/ADAX_RELEASE_PROCESS.md",
  "docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md",
  "docs/ADAX_SOURCE_SHAPE_AUDIT.md"
];

const requiredReferences = [
  {
    file: "AGENTS.md",
    references: [
      "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
      "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
      "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
      "docs/ADAX_RELEASE_PROCESS.md"
    ]
  },
  {
    file: "docs/ENGINEERING_BASELINE.md",
    references: [
      "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
      "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
      "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
      "scripts/check-engineering-guardrails.mjs"
    ]
  },
  {
    file: "docs/ADAX_LONG_TERM_PLAN.md",
    references: [
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
      "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
      "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
      "docs/ADAX_RENEWABLE_STARTUP_CARD.md",
      "docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md",
      "docs/ADAX_THERMAL_STARTUP_CARD.md"
    ]
  },
  {
    file: "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
    references: [
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "scripts/check-engineering-guardrails.mjs",
      "tests/scripts/check-engineering-guardrails.test.mjs"
    ]
  },
  {
    file: "docs/ACTIVE_ARCHITECTURE_MAP.md",
    references: [
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "scripts/check-engineering-guardrails.mjs"
    ]
  },
  {
    file: "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
    references: ["docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md"]
  },
  {
    file: "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
    references: ["docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md"]
  }
];

const requiredPhrases = [
  {
    file: "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
    phrases: [
      "Status: audit complete. Phase 5 remains closed.",
      "Do not implement renewable, independent storage, or thermal workflows yet.",
      "Only one participant may enter implementation in the next wave.",
      "When Phase 5 opens, implement exactly one participant in the next wave."
    ]
  },
  {
    file: "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
    phrases: [
      "Status: rehearsal complete. Phase 5 remains closed.",
      "Do not start Phase 5 implementation yet."
    ]
  },
  {
    file: "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
    phrases: [
      "Status: scope-control baseline. Phase 5 remains closed.",
      "Do not implement any Phase 5 participant yet.",
      "Select exactly one participant for the next implementation wave."
    ]
  },
  {
    file: "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
    phrases: [
      "Status: dry run complete. Renewable implementation is not approved.",
      "Do not implement the renewable workflow yet.",
      "| Active code changes allowed now | No |"
    ]
  },
  {
    file: "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
    phrases: [
      "Status: dry run complete. Independent-storage implementation is not approved.",
      "Do not implement the independent-storage workflow yet.",
      "| Active code changes allowed now | No |"
    ]
  },
  {
    file: "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
    phrases: [
      "Status: dry run complete. Thermal implementation is not approved.",
      "Do not implement the thermal workflow yet.",
      "| Active code changes allowed now | No |"
    ]
  }
];

const violations = [];

function log(message = "") {
  console.log(`[check-engineering-guardrails] ${message}`);
}

function readText(projectPath) {
  return readFileSync(resolve(rootDir, projectPath), "utf8");
}

function addViolation(file, rule, detail) {
  violations.push({ file, rule, detail });
}

function fileExists(projectPath) {
  return existsSync(resolve(rootDir, projectPath));
}

for (const file of requiredFiles) {
  if (!fileExists(file)) {
    addViolation(file, "required-engineering-file-missing", "file does not exist");
  }
}

for (const { file, references } of requiredReferences) {
  if (!fileExists(file)) continue;
  const content = readText(file);

  for (const reference of references) {
    if (!content.includes(reference)) {
      addViolation(file, "required-engineering-reference-missing", `missing ${reference}`);
    }
  }
}

for (const { file, phrases } of requiredPhrases) {
  if (!fileExists(file)) continue;
  const content = readText(file);

  for (const phrase of phrases) {
    if (!content.includes(phrase)) {
      addViolation(file, "required-phase-gate-phrase-missing", `missing ${phrase}`);
    }
  }
}

if (violations.length > 0) {
  console.error("\nEngineering guardrail check failed:\n");

  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.rule}`);
    console.error(`  ${violation.detail}`);
  }

  console.error(
    "\nIf this governance change is intentional, update the relevant startup card, gate audit, architecture map, engineering baseline, and script test before handing off."
  );
  process.exit(1);
}

log(`${requiredFiles.length} required files checked.`);
log("engineering guardrails are connected and Phase 5 remains closed.");
