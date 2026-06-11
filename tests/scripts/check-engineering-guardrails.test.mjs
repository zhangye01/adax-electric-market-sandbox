import assert from "node:assert/strict";
import test from "node:test";
import { runScriptFixture } from "./script-fixtures.mjs";

const requiredDocPaths = [
  "docs/ADAX_MVP_STARTER.md",
  "docs/ADAX_CHANGE_GATE_CHECKLIST.md",
  "docs/ADAX_RENEWABLE_STARTUP_CARD.md",
  "docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md",
  "docs/ADAX_THERMAL_STARTUP_CARD.md",
  "docs/ADAX_RELEASE_PROCESS.md",
  "docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md",
  "docs/ADAX_SOURCE_SHAPE_AUDIT.md"
];

function makePackageJson(overrides = {}) {
  return `${JSON.stringify(
    {
      scripts: {
        "check:engineering-guardrails": "node scripts/check-engineering-guardrails.mjs",
        "check:boundaries": "node scripts/check-boundaries.mjs",
        "check:domain-contracts": "node scripts/check-domain-contracts.mjs",
        "check:source-shape": "node scripts/check-source-shape.mjs",
        typecheck: "tsc -b",
        test:
          "tsc -p tsconfig.test.json && node tests/support/fix-esm-imports.mjs && node --test tests/scripts/check-engineering-guardrails.test.mjs tests/scripts/check-boundaries.test.mjs tests/scripts/check-source-shape.test.mjs tests/scripts/check-domain-contracts.test.mjs",
        quality:
          "npm run check:engineering-guardrails && npm run check:boundaries && npm run check:domain-contracts && npm run check:source-shape && npm run typecheck && npm run test && npm run build",
        build: "tsc -b && vite build",
        ...overrides
      }
    },
    null,
    2
  )}\n`;
}

function runGuardrailFixture(overrides = {}, omitted = []) {
  const files = {
    "package.json": makePackageJson(),
    "AGENTS.md": [
      "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
      "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
      "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
      "docs/ADAX_RELEASE_PROCESS.md",
      "npm run check:engineering-guardrails",
      "npm run check:boundaries",
      "npm run check:domain-contracts",
      "npm run check:source-shape",
      "npm run typecheck",
      "npm run test",
      "npm run build"
    ].join("\n"),
    "docs/ENGINEERING_BASELINE.md": [
      "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
      "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
      "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
      "scripts/check-engineering-guardrails.mjs"
    ].join("\n"),
    "docs/ADAX_LONG_TERM_PLAN.md": [
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
      "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
      "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
      "docs/ADAX_RENEWABLE_STARTUP_CARD.md",
      "docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md",
      "docs/ADAX_THERMAL_STARTUP_CARD.md"
    ].join("\n"),
    "docs/ADAX_ENGINEERING_READINESS_AUDIT.md": [
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "scripts/check-engineering-guardrails.mjs",
      "tests/scripts/check-engineering-guardrails.test.mjs"
    ].join("\n"),
    "docs/ACTIVE_ARCHITECTURE_MAP.md": [
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "scripts/check-engineering-guardrails.mjs"
    ].join("\n"),
    "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md": [
      "Status: rehearsal complete. Phase 5 remains closed.",
      "Do not start Phase 5 implementation yet.",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md"
    ].join("\n"),
    "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md": [
      "Status: scope-control baseline. Phase 5 remains closed.",
      "Do not implement any Phase 5 participant yet.",
      "Select exactly one participant for the next implementation wave.",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md"
    ].join("\n"),
    "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md": [
      "Status: audit complete. Phase 5 remains closed.",
      "Do not implement renewable, independent storage, or thermal workflows yet.",
      "Only one participant may enter implementation in the next wave.",
      "When Phase 5 opens, implement exactly one participant in the next wave."
    ].join("\n"),
    "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md": [
      "Status: dry run complete. Renewable implementation is not approved.",
      "Do not implement the renewable workflow yet.",
      "| Active code changes allowed now | No |"
    ].join("\n"),
    "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md": [
      "Status: dry run complete. Independent-storage implementation is not approved.",
      "Do not implement the independent-storage workflow yet.",
      "| Active code changes allowed now | No |"
    ].join("\n"),
    "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md": [
      "Status: dry run complete. Thermal implementation is not approved.",
      "Do not implement the thermal workflow yet.",
      "| Active code changes allowed now | No |"
    ].join("\n")
  };

  for (const path of requiredDocPaths) files[path] = `${path}\n`;
  for (const path of omitted) delete files[path];

  return runScriptFixture("scripts/check-engineering-guardrails.mjs", {
    ...files,
    ...overrides
  });
}

test("engineering guardrail checker accepts connected closed Phase 5 docs", () => {
  const result = runGuardrailFixture();

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /engineering guardrails are connected/);
});

test("engineering guardrail checker rejects missing required docs", () => {
  const result = runGuardrailFixture({}, ["docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-engineering-file-missing/);
  assert.match(result.stderr, /ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT/);
});

test("engineering guardrail checker rejects disconnected entry references", () => {
  const result = runGuardrailFixture({
    "AGENTS.md": "docs/ADAX_ENGINEERING_READINESS_AUDIT.md\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-engineering-reference-missing/);
  assert.match(result.stderr, /ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT/);
});

test("engineering guardrail checker rejects accidental Phase 5 opening language", () => {
  const result = runGuardrailFixture({
    "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md": [
      "Status: audit complete. Phase 5 is open.",
      "When Phase 5 opens, implement exactly one participant in the next wave."
    ].join("\n")
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-phase-gate-phrase-missing/);
  assert.match(result.stderr, /Phase 5 remains closed/);
});

test("engineering guardrail checker rejects missing quality commands", () => {
  const result = runGuardrailFixture({
    "package.json": makePackageJson({
      quality: "npm run check:engineering-guardrails && npm run typecheck && npm run test && npm run build"
    })
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-quality-command-missing/);
  assert.match(result.stderr, /check:boundaries/);
});

test("engineering guardrail checker rejects missing script test targets", () => {
  const result = runGuardrailFixture({
    "package.json": makePackageJson({
      test: "tsc -p tsconfig.test.json && node --test tests/scripts/check-boundaries.test.mjs"
    })
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-test-target-missing/);
  assert.match(result.stderr, /check-engineering-guardrails\.test\.mjs/);
});
