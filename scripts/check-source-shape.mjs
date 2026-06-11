import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";

const rootDir = process.cwd();
const sourceDir = resolve(rootDir, "src");

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);
const ignoredDirectories = new Set(["node_modules", "dist", ".git", "legacy"]);

const codeWatchLineLimit = 220;
const codeHighLineLimit = 300;
const cssWatchLineLimit = 400;
const cssHighLineLimit = 800;

const lineBudgets = new Map([
  ["src/domain/retailTypes.ts", 257],
  ["src/components/Layout.tsx", 237],
  ["src/app/createAdaxTrainingActions.ts", 231],
  ["src/components/retail/RetailExecutionWorkspace.tsx", 223]
]);

const violations = [];

function log(message = "") {
  console.log(`[check-source-shape] ${message}`);
}

function toProjectPath(path) {
  return relative(rootDir, path).split(sep).join("/");
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

function lineCount(content) {
  if (content.length === 0) return 0;
  return content.split(/\r?\n/).length;
}

function limitsFor(path) {
  const isCss = extname(path) === ".css";
  return {
    watch: isCss ? cssWatchLineLimit : codeWatchLineLimit,
    high: isCss ? cssHighLineLimit : codeHighLineLimit
  };
}

function pressureFor(lines, limits) {
  if (lines >= limits.high) return "high";
  if (lines >= limits.watch) return "watch";
  return "ok";
}

const files = listFiles(sourceDir)
  .filter((path) => sourceExtensions.has(extname(path)))
  .map((path) => ({
    path: toProjectPath(path),
    lines: lineCount(readFileSync(path, "utf8"))
  }));

for (const file of files) {
  const limits = limitsFor(file.path);
  const pressure = pressureFor(file.lines, limits);
  if (pressure === "ok") continue;

  const budget = lineBudgets.get(file.path);
  if (!budget) {
    violations.push({
      file: file.path,
      detail: `${file.lines} lines crosses ${pressure} threshold (${limits.watch} watch / ${limits.high} high)`
    });
    continue;
  }

  if (file.lines > budget) {
    violations.push({
      file: file.path,
      detail: `${file.lines} lines exceeds source-shape budget ${budget}`
    });
  }
}

log(`source files checked: ${files.length}`);
log(`budgeted pressure files: ${lineBudgets.size}`);

if (violations.length > 0) {
  console.error("\nSource shape check failed:\n");
  for (const violation of violations) {
    console.error(`- ${violation.file}`);
    console.error(`  ${violation.detail}`);
  }
  console.error("\nRefactor the file, or update the budget only after documenting the reason in docs/ADAX_SOURCE_SHAPE_AUDIT.md.");
  process.exit(1);
}

log("all source-shape budgets passed.");
