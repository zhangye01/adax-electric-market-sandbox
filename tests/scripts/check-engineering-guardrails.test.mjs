import assert from "node:assert/strict";
import test from "node:test";
import { runScriptFixture } from "./script-fixtures.mjs";

const requiredDocPaths = [
  "docs/ADAX_MVP_STARTER.md",
  "docs/ADAX_CHANGE_GATE_CHECKLIST.md",
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
          "tsc -p tsconfig.test.json && node tests/support/fix-esm-imports.mjs && node --test tests/scripts/check-engineering-guardrails.test.mjs tests/scripts/check-boundaries.test.mjs tests/scripts/check-source-shape.test.mjs tests/scripts/check-domain-contracts.test.mjs tests/scripts/publish-pages.test.mjs",
        quality:
          "npm run check:engineering-guardrails && npm run check:boundaries && npm run check:domain-contracts && npm run check:source-shape && npm run typecheck && npm run test && npm run build",
        build: "tsc -b && vite build",
        "publish:pages:dry": "node scripts/publish-pages.mjs --dry-run --allow-dirty",
        "publish:pages": "node scripts/publish-pages.mjs",
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
      "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
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
      "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "docs/ADAX_PHASE_5_ENTRY_GATE_REHEARSAL.md",
      "docs/ADAX_PHASE_5_SCOPE_CONTROL_MATRIX.md",
      "docs/ADAX_PHASE_5_RENEWABLE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_STORAGE_ENTRY_DRY_RUN.md",
      "docs/ADAX_PHASE_5_THERMAL_ENTRY_DRY_RUN.md",
      "scripts/check-engineering-guardrails.mjs"
    ].join("\n"),
    "docs/ADAX_LONG_TERM_PLAN.md": [
      "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
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
      "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "scripts/check-engineering-guardrails.mjs",
      "tests/scripts/check-engineering-guardrails.test.mjs"
    ].join("\n"),
    "docs/ACTIVE_ARCHITECTURE_MAP.md": [
      "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "scripts/check-engineering-guardrails.mjs"
    ].join("\n"),
    "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md": [
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
      "Status: exit audit complete. Engineering Hardening Hold is ready for user decision.",
      "Phase 5 remains closed.",
      "Do not resume feature expansion until the user explicitly confirms the project is ready, confirms exactly one participant startup card, and `npm run quality` passes.",
      "## Latest Verification Snapshot",
      "Freshness rule: `npm run quality` must be rerun after any later source, guardrail, or release-process change before using this audit to lift the hold.",
      "Engineering Hardening Hold is ready for user decision, but it is not automatically lifted."
    ].join("\n"),
    "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md": [
      "Status: decision checklist active. It does not lift Engineering Hardening Hold.",
      "Phase 5 remains closed until this checklist is completed and the user confirms the selected participant startup card.",
      "Do not write feature code from this checklist alone.",
      "Exactly one participant may enter implementation in the next wave."
    ].join("\n"),
    "docs/ADAX_RENEWABLE_STARTUP_CARD.md": [
      "状态：待用户确认。确认前不得实现新能源主体代码。",
      "不把新能源逻辑写进售电公司的 domain、components 或 tests 里。"
    ].join("\n"),
    "docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md": [
      "状态：待用户确认。确认前不得实现独立储能主体代码。",
      "不把独立储能逻辑写进售电公司或新能源的 domain、components 或 tests 里。"
    ].join("\n"),
    "docs/ADAX_THERMAL_STARTUP_CARD.md": [
      "状态：待用户确认。确认前不得实现火电主体代码。",
      "不把火电逻辑写进售电公司、新能源或独立储能的 domain、components 或 tests 里。"
    ].join("\n"),
    "docs/ADAX_RELEASE_PROCESS.md": [
      "npm run publish:pages:dry",
      "npm run publish:pages -- --yes",
      "scripts/publish-pages.mjs",
      "main",
      "gh-pages",
      "不要在源码仓库提交 `dist/`。",
      "真实发布必须显式传入 `--yes`：",
      "`--skip-quality` 只允许用于 dry-run 检查；真实发布会拒绝跳过 `npm run quality`。",
      "当前 Pages 发布不依赖 GitHub Actions。",
      "当前 Pages 发布依赖本地脚本更新 `gh-pages` 分支。"
    ].join("\n"),
    "scripts/publish-pages.mjs": [
      "const previewUrl = \"https://zhangye01.github.io/adax-electric-market-sandbox/\";",
      "fail(\"real publishing requires --yes. Use `npm run publish:pages:dry` first, then `npm run publish:pages -- --yes`.\");",
      "fail(\"skip quality is only allowed during dry-run checks. Real publishing always runs `npm run quality`.\");",
      "run(\"npm\", [\"run\", \"quality\"]);",
      "run(\"git\", [\"push\", \"origin\", \"HEAD:gh-pages\"], { cwd: releaseDir, writes: true });"
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

test("engineering guardrail checker rejects missing hardening exit audit", () => {
  const result = runGuardrailFixture({}, ["docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-engineering-file-missing/);
  assert.match(result.stderr, /ADAX_ENGINEERING_HARDENING_EXIT_AUDIT/);
});

test("engineering guardrail checker rejects missing feature resumption checklist", () => {
  const result = runGuardrailFixture({}, ["docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-engineering-file-missing/);
  assert.match(result.stderr, /ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST/);
});

test("engineering guardrail checker rejects missing publishing script", () => {
  const result = runGuardrailFixture({}, ["scripts/publish-pages.mjs"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-engineering-file-missing/);
  assert.match(result.stderr, /scripts\/publish-pages\.mjs/);
});

test("engineering guardrail checker rejects source repository build artifacts", () => {
  const result = runGuardrailFixture({
    "dist/index.html": "<div id=\"root\"></div>\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /source-repository-artifact-forbidden/);
  assert.match(result.stderr, /dist\/index\.html/);
});

test("engineering guardrail checker rejects source repository generated test artifacts", () => {
  const result = runGuardrailFixture({
    ".test-build/output.js": "export const generated = true;\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /source-repository-artifact-forbidden/);
  assert.match(result.stderr, /\.test-build\/output\.js/);
});

test("engineering guardrail checker rejects disconnected entry references", () => {
  const result = runGuardrailFixture({
    "AGENTS.md": "docs/ADAX_ENGINEERING_READINESS_AUDIT.md\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-engineering-reference-missing/);
  assert.match(result.stderr, /ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT/);
});

test("engineering guardrail checker rejects accidental hardening exit opening language", () => {
  const result = runGuardrailFixture({
    "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md": [
      "Status: exit audit complete. Engineering Hardening Hold is lifted.",
      "Phase 5 is open."
    ].join("\n")
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-phase-gate-phrase-missing/);
  assert.match(result.stderr, /Phase 5 remains closed/);
});

test("engineering guardrail checker rejects stale hardening exit audit evidence", () => {
  const result = runGuardrailFixture({
    "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md": [
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
      "Status: exit audit complete. Engineering Hardening Hold is ready for user decision.",
      "Phase 5 remains closed.",
      "Do not resume feature expansion until the user explicitly confirms the project is ready, confirms exactly one participant startup card, and `npm run quality` passes.",
      "Engineering Hardening Hold is ready for user decision, but it is not automatically lifted."
    ].join("\n")
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-phase-gate-phrase-missing/);
  assert.match(result.stderr, /Latest Verification Snapshot/);
});

test("engineering guardrail checker rejects accidental feature resumption approval language", () => {
  const result = runGuardrailFixture({
    "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md": [
      "Status: decision checklist complete. Engineering Hardening Hold is lifted.",
      "Feature code can start from this checklist alone.",
      "Multiple participants may enter implementation in the next wave."
    ].join("\n")
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-phase-gate-phrase-missing/);
  assert.match(result.stderr, /Do not write feature code from this checklist alone/);
});

test("engineering guardrail checker rejects release-process drift", () => {
  const result = runGuardrailFixture({
    "docs/ADAX_RELEASE_PROCESS.md": [
      "npm run publish:pages:dry",
      "npm run publish:pages -- --yes",
      "scripts/publish-pages.mjs",
      "main",
      "gh-pages"
    ].join("\n")
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-phase-gate-phrase-missing/);
  assert.match(result.stderr, /真实发布必须显式传入/);
});

test("engineering guardrail checker rejects publishing script drift", () => {
  const result = runGuardrailFixture({
    "scripts/publish-pages.mjs": [
      "const previewUrl = \"https://zhangye01.github.io/adax-electric-market-sandbox/\";",
      "fail(\"skip quality is only allowed during dry-run checks. Real publishing always runs `npm run quality`.\");",
      "run(\"git\", [\"push\", \"origin\", \"HEAD:gh-pages\"], { cwd: releaseDir, writes: true });"
    ].join("\n")
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-phase-gate-phrase-missing/);
  assert.match(result.stderr, /run\("npm", \["run", "quality"\]\)/);
});

const startupCardApprovalCases = [
  {
    name: "renewable",
    file: "docs/ADAX_RENEWABLE_STARTUP_CARD.md",
    expectedPhrase: "状态：待用户确认。确认前不得实现新能源主体代码。"
  },
  {
    name: "independent storage",
    file: "docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md",
    expectedPhrase: "状态：待用户确认。确认前不得实现独立储能主体代码。"
  },
  {
    name: "thermal",
    file: "docs/ADAX_THERMAL_STARTUP_CARD.md",
    expectedPhrase: "状态：待用户确认。确认前不得实现火电主体代码。"
  }
];

for (const { name, file, expectedPhrase } of startupCardApprovalCases) {
  test(`engineering guardrail checker rejects accidental ${name} startup-card approval language`, () => {
    const result = runGuardrailFixture({
      [file]: "状态：已确认。可以开始实现主体代码。\n"
    });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /required-phase-gate-phrase-missing/);
    assert.match(result.stderr, new RegExp(expectedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
}

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

test("engineering guardrail checker rejects missing publishing commands", () => {
  const result = runGuardrailFixture({
    "package.json": makePackageJson({
      "publish:pages:dry": "node scripts/publish-pages.mjs --dry-run",
      "publish:pages": "node scripts/publish-pages.mjs --yes"
    })
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required-package-script-mismatch/);
  assert.match(result.stderr, /publish:pages:dry/);
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

test("engineering guardrail checker rejects closed Phase 5 runtime files", () => {
  const result = runGuardrailFixture({
    "src/domain/thermalTypes.ts": "export type ThermalOffer = { price: number };\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /phase-5-runtime-code-must-stay-closed/);
  assert.match(result.stderr, /src\/domain\/thermalTypes\.ts/);
});

test("engineering guardrail checker allows legacy Phase 5 reference files", () => {
  const result = runGuardrailFixture({
    "src/legacy/thermalTypes.ts": "export type ThermalOffer = { price: number };\n"
  });

  assert.equal(result.status, 0, result.stderr);
});
