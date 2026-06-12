import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const rootDir = process.cwd();

const requiredFiles = [
  "package.json",
  "AGENTS.md",
  "docs/ADAX_MVP_STARTER.md",
  "docs/ADAX_LONG_TERM_PLAN.md",
  "docs/ENGINEERING_BASELINE.md",
  "docs/ADAX_CHANGE_GATE_CHECKLIST.md",
  "docs/ACTIVE_ARCHITECTURE_MAP.md",
  "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
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
  "docs/ADAX_THERMAL_STARTUP_CARD.md",
  "docs/ADAX_RELEASE_PROCESS.md",
  "docs/ADAX_RETAIL_CONTRACT_GOVERNANCE.md",
  "docs/ADAX_SOURCE_SHAPE_AUDIT.md",
  "scripts/publish-pages.mjs"
];

const requiredReferences = [
  {
    file: "AGENTS.md",
    references: [
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
    ]
  },
  {
    file: "docs/ENGINEERING_BASELINE.md",
    references: [
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
    ]
  },
  {
    file: "docs/ADAX_LONG_TERM_PLAN.md",
    references: [
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
    ]
  },
  {
    file: "docs/ADAX_ENGINEERING_READINESS_AUDIT.md",
    references: [
      "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
      "docs/ADAX_PHASE_5_CANDIDATE_READINESS_AUDIT.md",
      "scripts/check-engineering-guardrails.mjs",
      "tests/scripts/check-engineering-guardrails.test.mjs"
    ]
  },
  {
    file: "docs/ACTIVE_ARCHITECTURE_MAP.md",
    references: [
      "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
      "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
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
  },
  {
    file: "docs/ADAX_RELEASE_PROCESS.md",
    references: [
      "npm run publish:pages:dry",
      "npm run publish:pages -- --yes",
      "scripts/publish-pages.mjs",
      "main",
      "gh-pages"
    ]
  }
];

const requiredPhrases = [
  {
    file: "docs/ADAX_FEATURE_RESUMPTION_DECISION_CHECKLIST.md",
    phrases: [
      "Status: decision checklist active. It does not lift Engineering Hardening Hold.",
      "Phase 5 remains closed until this checklist is completed and the user confirms the selected participant startup card.",
      "Do not write feature code from this checklist alone.",
      "Exactly one participant may enter implementation in the next wave."
    ]
  },
  {
    file: "docs/ADAX_RENEWABLE_STARTUP_CARD.md",
    phrases: [
      "状态：待用户确认。确认前不得实现新能源主体代码。",
      "不把新能源逻辑写进售电公司的 domain、components 或 tests 里。"
    ]
  },
  {
    file: "docs/ADAX_INDEPENDENT_STORAGE_STARTUP_CARD.md",
    phrases: [
      "状态：待用户确认。确认前不得实现独立储能主体代码。",
      "不把独立储能逻辑写进售电公司或新能源的 domain、components 或 tests 里。"
    ]
  },
  {
    file: "docs/ADAX_THERMAL_STARTUP_CARD.md",
    phrases: [
      "状态：待用户确认。确认前不得实现火电主体代码。",
      "不把火电逻辑写进售电公司、新能源或独立储能的 domain、components 或 tests 里。"
    ]
  },
  {
    file: "docs/ADAX_ENGINEERING_HARDENING_EXIT_AUDIT.md",
    phrases: [
      "Status: exit audit complete. Engineering Hardening Hold is ready for user decision.",
      "Phase 5 remains closed.",
      "Do not resume feature expansion until the user explicitly confirms the project is ready, confirms exactly one participant startup card, and `npm run quality` passes."
    ]
  },
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
  },
  {
    file: "docs/ADAX_RELEASE_PROCESS.md",
    phrases: [
      "不要在源码仓库提交 `dist/`。",
      "真实发布必须显式传入 `--yes`：",
      "`--skip-quality` 只允许用于 dry-run 检查；真实发布会拒绝跳过 `npm run quality`。",
      "当前 Pages 发布不依赖 GitHub Actions。",
      "当前 Pages 发布依赖本地脚本更新 `gh-pages` 分支。"
    ]
  },
  {
    file: "scripts/publish-pages.mjs",
    phrases: [
      "const previewUrl = \"https://zhangye01.github.io/adax-electric-market-sandbox/\";",
      "fail(\"real publishing requires --yes. Use `npm run publish:pages:dry` first, then `npm run publish:pages -- --yes`.\");",
      "fail(\"skip quality is only allowed during dry-run checks. Real publishing always runs `npm run quality`.\");",
      "run(\"npm\", [\"run\", \"quality\"]);",
      "run(\"git\", [\"push\", \"origin\", \"HEAD:gh-pages\"], { cwd: releaseDir, writes: true });"
    ]
  }
];

const requiredPackageScripts = {
  "check:engineering-guardrails": "node scripts/check-engineering-guardrails.mjs",
  "check:boundaries": "node scripts/check-boundaries.mjs",
  "check:domain-contracts": "node scripts/check-domain-contracts.mjs",
  "check:source-shape": "node scripts/check-source-shape.mjs",
  "typecheck": "tsc -b",
  "build": "tsc -b && vite build",
  "publish:pages:dry": "node scripts/publish-pages.mjs --dry-run --allow-dirty",
  "publish:pages": "node scripts/publish-pages.mjs"
};

const requiredQualityCommands = [
  "npm run check:engineering-guardrails",
  "npm run check:boundaries",
  "npm run check:domain-contracts",
  "npm run check:source-shape",
  "npm run typecheck",
  "npm run test",
  "npm run build"
];

const requiredTestTargets = [
  "tests/scripts/check-engineering-guardrails.test.mjs",
  "tests/scripts/check-boundaries.test.mjs",
  "tests/scripts/check-source-shape.test.mjs",
  "tests/scripts/check-domain-contracts.test.mjs",
  "tests/scripts/publish-pages.test.mjs"
];

const phase5ClosedForbiddenRuntimePatterns = [
  /^src\/(?:app|data|domain|routes|services)\/(?:renewable|storage|thermal)[A-Z/._-]/i,
  /^src\/components\/(?:renewable|storage|thermal)\//i,
  /^src\/pages\/(?:Renewable|Storage|Thermal)[A-Za-z0-9_-]*\.(?:ts|tsx|js|jsx)$/i
];

const forbiddenSourceRepositoryArtifactPaths = [
  {
    path: "dist",
    detail: "Vite build output must stay out of the source repository; publish it through scripts/publish-pages.mjs and gh-pages"
  },
  {
    path: "coverage",
    detail: "coverage output must stay out of the source repository"
  },
  {
    path: ".vite",
    detail: "Vite cache output must stay out of the source repository"
  },
  {
    path: ".test-build",
    detail: "temporary test build output must stay out of the source repository"
  }
];

const violations = [];

function log(message = "") {
  console.log(`[check-engineering-guardrails] ${message}`);
}

function readText(projectPath) {
  return readFileSync(resolve(rootDir, projectPath), "utf8");
}

function toProjectPath(path) {
  return relative(rootDir, path).split(sep).join("/");
}

function addViolation(file, rule, detail) {
  violations.push({ file, rule, detail });
}

function fileExists(projectPath) {
  return existsSync(resolve(rootDir, projectPath));
}

function parseJsonFile(projectPath) {
  try {
    return JSON.parse(readText(projectPath));
  } catch (error) {
    addViolation(projectPath, "required-json-invalid", error.message);
    return null;
  }
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return listFiles(path);
    if (!stats.isFile()) return [];
    return [path];
  });
}

function listTrackedProjectFiles() {
  const result = spawnSync("git", ["ls-files"], {
    cwd: rootDir,
    encoding: "utf8"
  });

  if (result.status !== 0) return null;

  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function isInsideProjectPath(projectPath, boundaryPath) {
  return projectPath === boundaryPath || projectPath.startsWith(`${boundaryPath}/`);
}

function listExistingProjectFilesUnder(boundaryPath) {
  const absolutePath = resolve(rootDir, boundaryPath);
  return listFiles(absolutePath).map(toProjectPath);
}

for (const file of requiredFiles) {
  if (!fileExists(file)) {
    addViolation(file, "required-engineering-file-missing", "file does not exist");
  }
}

const trackedProjectFiles = listTrackedProjectFiles();
for (const { path, detail } of forbiddenSourceRepositoryArtifactPaths) {
  const artifactFiles =
    trackedProjectFiles === null
      ? listExistingProjectFilesUnder(path)
      : trackedProjectFiles.filter((file) => isInsideProjectPath(file, path));

  for (const artifactFile of artifactFiles) {
    addViolation(artifactFile, "source-repository-artifact-forbidden", detail);
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

if (fileExists("package.json")) {
  const packageJson = parseJsonFile("package.json");
  const scripts = packageJson?.scripts && typeof packageJson.scripts === "object" ? packageJson.scripts : null;

  if (!scripts) {
    addViolation("package.json", "required-package-scripts-missing", "scripts object is missing");
  } else {
    for (const [scriptName, expectedCommand] of Object.entries(requiredPackageScripts)) {
      if (!Object.hasOwn(scripts, scriptName)) {
        addViolation("package.json", "required-package-script-missing", `missing ${scriptName}`);
      } else if (scripts[scriptName] !== expectedCommand) {
        addViolation("package.json", "required-package-script-mismatch", `${scriptName} should be ${expectedCommand}`);
      }
    }

    const qualityScript = scripts.quality;
    if (typeof qualityScript !== "string") {
      addViolation("package.json", "required-package-script-missing", "missing quality");
    } else {
      let previousIndex = -1;
      for (const command of requiredQualityCommands) {
        const index = qualityScript.indexOf(command);
        if (index < 0) {
          addViolation("package.json", "required-quality-command-missing", `quality missing ${command}`);
        } else if (index <= previousIndex) {
          addViolation("package.json", "required-quality-command-order", `${command} appears out of order`);
        }
        previousIndex = Math.max(previousIndex, index);
      }
    }

    const testScript = scripts.test;
    if (typeof testScript !== "string") {
      addViolation("package.json", "required-package-script-missing", "missing test");
    } else {
      for (const target of requiredTestTargets) {
        if (!testScript.includes(target)) {
          addViolation("package.json", "required-test-target-missing", `test missing ${target}`);
        }
      }
    }
  }
}

for (const file of listFiles(resolve(rootDir, "src"))) {
  const projectPath = toProjectPath(file);
  if (projectPath.startsWith("src/legacy/")) continue;

  const isForbiddenPhase5RuntimeFile = phase5ClosedForbiddenRuntimePatterns.some((pattern) => pattern.test(projectPath));
  if (isForbiddenPhase5RuntimeFile) {
    addViolation(
      projectPath,
      "phase-5-runtime-code-must-stay-closed",
      "Phase 5 is closed; confirm one participant startup card before adding renewable, storage, or thermal runtime files"
    );
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
log(
  "engineering guardrails are connected, source-repository artifacts are excluded, quality and publishing pipelines are intact, active runtime scope is retail-only, and Phase 5 remains closed."
);
