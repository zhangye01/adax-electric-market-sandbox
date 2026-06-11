import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";

const rootDir = process.cwd();
const sourceDir = resolve(rootDir, "src");

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const ignoredDirectories = new Set(["node_modules", "dist", ".git"]);

const violations = [];

function log(message = "") {
  console.log(`[check-boundaries] ${message}`);
}

function toProjectPath(path) {
  return relative(rootDir, path).split(sep).join("/");
}

function isInside(projectPath, prefix) {
  return projectPath === prefix || projectPath.startsWith(`${prefix}/`);
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory).flatMap((entry) => {
    if (ignoredDirectories.has(entry)) return [];

    const path = resolve(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return listFiles(path);
    if (!stats.isFile()) return [];
    return [path];
  });
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function addViolation(file, rule, detail) {
  violations.push({ file, rule, detail });
}

function extractImports(content) {
  const imports = [];
  const staticImportRegex = /\b(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/gs;
  const dynamicImportRegex = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of content.matchAll(staticImportRegex)) {
    imports.push(match[1]);
  }
  for (const match of content.matchAll(dynamicImportRegex)) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImport(filePath, importSpec) {
  if (!importSpec.startsWith(".")) return null;
  return toProjectPath(resolve(dirname(filePath), importSpec));
}

function importTargetsPath(filePath, importSpec, targetPrefix) {
  const target = resolveImport(filePath, importSpec);
  return Boolean(target && isInside(target, targetPrefix));
}

function lineForPattern(content, pattern) {
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex((line) => pattern.test(line));
  return index >= 0 ? index + 1 : null;
}

const sourceFiles = listFiles(sourceDir).filter((file) => sourceExtensions.has(extname(file)));
const activeSourceFiles = sourceFiles.filter((file) => !isInside(toProjectPath(file), "src/legacy"));

function checkNoActiveLegacyImports() {
  for (const file of activeSourceFiles) {
    const projectPath = toProjectPath(file);
    const content = readText(file);

    for (const importSpec of extractImports(content)) {
      const resolvedImport = resolveImport(file, importSpec);
      const isLegacyImport =
        importSpec.includes("src/legacy") ||
        importSpec.includes("/legacy/") ||
        importSpec.startsWith("legacy/") ||
        Boolean(resolvedImport && isInside(resolvedImport, "src/legacy"));

      if (isLegacyImport) {
        addViolation(projectPath, "active-code-must-not-import-legacy", `imports ${importSpec}`);
      }
    }
  }
}

function checkDomainLayer() {
  const forbiddenPackages = new Set(["react", "react-dom", "lucide-react", "recharts"]);
  const forbiddenTargets = ["src/app", "src/components", "src/pages", "src/routes", "src/services"];
  const forbiddenBrowserPatterns = [
    { pattern: /\btypeof\s+window\b/, label: "typeof window" },
    { pattern: /\bwindow\.(?:location|history|localStorage|addEventListener|removeEventListener|scrollTo|matchMedia|confirm|open)\b/, label: "window browser API" },
    { pattern: /\bdocument\./, label: "document." },
    { pattern: /\blocalStorage\b/, label: "localStorage" },
    { pattern: /\bBlob\b/, label: "Blob" },
    { pattern: /\bFileReader\b/, label: "FileReader" },
    { pattern: /\bURL\.createObjectURL\b/, label: "URL.createObjectURL" },
    { pattern: /\bfetch\s*\(/, label: "fetch" }
  ];

  for (const file of activeSourceFiles.filter((item) => isInside(toProjectPath(item), "src/domain"))) {
    const projectPath = toProjectPath(file);
    const content = readText(file);

    for (const importSpec of extractImports(content)) {
      if (forbiddenPackages.has(importSpec)) {
        addViolation(projectPath, "domain-must-not-import-ui-packages", `imports ${importSpec}`);
      }

      for (const target of forbiddenTargets) {
        if (importTargetsPath(file, importSpec, target)) {
          addViolation(projectPath, "domain-must-not-import-outer-layers", `imports ${importSpec}`);
        }
      }

      if (importTargetsPath(file, importSpec, "src/utils/adaxStorage") || importTargetsPath(file, importSpec, "src/utils/download")) {
        addViolation(projectPath, "domain-must-not-import-browser-io-utils", `imports ${importSpec}`);
      }
    }

    for (const { pattern, label } of forbiddenBrowserPatterns) {
      const line = lineForPattern(content, pattern);
      if (line) {
        addViolation(projectPath, "domain-must-stay-browser-free", `${label} at line ${line}`);
      }
    }
  }
}

function checkServicesLayer() {
  const forbiddenPackages = new Set(["react", "react-dom", "lucide-react", "recharts"]);
  const forbiddenTargets = ["src/app", "src/components", "src/pages"];

  for (const file of activeSourceFiles.filter((item) => isInside(toProjectPath(item), "src/services"))) {
    const projectPath = toProjectPath(file);

    for (const importSpec of extractImports(readText(file))) {
      if (forbiddenPackages.has(importSpec)) {
        addViolation(projectPath, "services-must-not-import-ui-packages", `imports ${importSpec}`);
      }

      for (const target of forbiddenTargets) {
        if (importTargetsPath(file, importSpec, target)) {
          addViolation(projectPath, "services-must-not-import-ui-layers", `imports ${importSpec}`);
        }
      }
    }
  }
}

function checkBrowserIoBoundaries() {
  const localStorageAllowed = new Set(["src/utils/adaxStorage.ts"]);
  const documentAllowed = new Set(["src/main.tsx", "src/utils/download.ts"]);
  const historyAllowed = new Set(["src/app/useAdaxBrowserRouteSync.ts"]);

  for (const file of activeSourceFiles) {
    const projectPath = toProjectPath(file);
    const content = readText(file);

    if (/\blocalStorage\b/.test(content) && !localStorageAllowed.has(projectPath)) {
      addViolation(projectPath, "local-storage-must-stay-in-storage-util", "contains localStorage");
    }

    if (/\bdocument\./.test(content) && !documentAllowed.has(projectPath)) {
      addViolation(projectPath, "document-api-must-stay-in-browser-boundaries", "contains document.");
    }

    if (/\bhistory\.(pushState|replaceState)\b/.test(content) && !historyAllowed.has(projectPath)) {
      addViolation(projectPath, "history-writes-must-stay-in-route-sync", "writes browser history");
    }
  }
}

function checkNetworkAndBackendBoundaries() {
  const forbiddenPatterns = [
    { pattern: /\bfetch\s*\(/, label: "fetch" },
    { pattern: /\baxios\b/, label: "axios" },
    { pattern: /\bsupabase\b/i, label: "supabase" },
    { pattern: /\bfirebase\b/i, label: "firebase" },
    { pattern: /\bindexedDB\b/, label: "indexedDB" },
    { pattern: /\bWebSocket\b/, label: "WebSocket" },
    { pattern: /\blocalforage\b/i, label: "localforage" },
    { pattern: /\bcreateClient\s*\(/, label: "createClient" }
  ];

  for (const file of activeSourceFiles) {
    const projectPath = toProjectPath(file);
    const content = readText(file);

    for (const { pattern, label } of forbiddenPatterns) {
      const line = lineForPattern(content, pattern);
      if (line) {
        addViolation(projectPath, "no-backend-or-network-in-v0-1", `${label} at line ${line}`);
      }
    }
  }
}

function checkRealProvinceDataBoundary() {
  const provincePattern =
    /北京|天津|上海|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾|内蒙古|广西|西藏|宁夏|新疆|香港|澳门/;

  for (const file of activeSourceFiles.filter((item) => isInside(toProjectPath(item), "src/data"))) {
    const projectPath = toProjectPath(file);
    const content = readText(file);
    const line = lineForPattern(content, provincePattern);

    if (line) {
      addViolation(projectPath, "runtime-data-must-stay-virtual-not-real-province", `province-like name at line ${line}`);
    }
  }
}

function checkPresentationBusinessBoundaries() {
  const reviewedDomainRuleTargets = [
    "src/domain/retailCalculations",
    "src/domain/retailValidation",
    "src/domain/retailCustomerCalculations",
    "src/domain/retailRevenueCalculations",
    "src/domain/retailContractCalculations",
    "src/domain/retailExposureCalculations",
    "src/domain/retailRiskDiagnostics",
    "src/domain/retailCalculationUtils"
  ];
  const allowedDomainRuleImports = new Set([
    "src/components/retail/RetailExecutionWorkspace.tsx -> src/domain/retailCalculations",
    "src/components/retail/RetailExecutionWorkspace.tsx -> src/domain/retailValidation",
    "src/components/retail/RetailExecutionResultPanel.tsx -> src/domain/retailCalculations"
  ]);

  for (const file of activeSourceFiles.filter((item) => {
    const projectPath = toProjectPath(item);
    return isInside(projectPath, "src/components") || isInside(projectPath, "src/pages");
  })) {
    const projectPath = toProjectPath(file);
    const content = readText(file);

    if (/\bcalculateRetailSettlement\s*\(/.test(content)) {
      addViolation(projectPath, "components-must-not-run-settlement-calculation", "calls calculateRetailSettlement");
    }

    for (const importSpec of extractImports(content)) {
      const resolvedImport = resolveImport(file, importSpec);
      if (!resolvedImport) continue;

      const importsDomainRule = reviewedDomainRuleTargets.some((target) => isInside(resolvedImport, target));

      const allowanceKey = `${projectPath} -> ${resolvedImport}`;
      if (importsDomainRule && !allowedDomainRuleImports.has(allowanceKey)) {
        addViolation(projectPath, "new-component-domain-rule-imports-need-review", `imports ${importSpec}`);
      }
    }
  }
}

function checkWorkflowBoundary() {
  const workflowsPath = resolve(rootDir, ".github", "workflows");
  if (existsSync(workflowsPath)) {
    addViolation(".github/workflows", "github-workflows-require-intentional-scope-change", "workflow files exist in current source repo");
  }
}

function main() {
  log(`source files checked: ${activeSourceFiles.length}`);

  checkNoActiveLegacyImports();
  checkDomainLayer();
  checkServicesLayer();
  checkBrowserIoBoundaries();
  checkNetworkAndBackendBoundaries();
  checkRealProvinceDataBoundary();
  checkPresentationBusinessBoundaries();
  checkWorkflowBoundary();

  if (violations.length > 0) {
    console.error("\nBoundary check failed:\n");
    for (const violation of violations) {
      console.error(`- ${violation.file}`);
      console.error(`  rule: ${violation.rule}`);
      console.error(`  detail: ${violation.detail}`);
    }
    process.exit(1);
  }

  log("all boundary checks passed.");
}

main();
