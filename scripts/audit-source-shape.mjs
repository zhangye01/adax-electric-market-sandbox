import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";

const rootDir = process.cwd();
const sourceDir = resolve(rootDir, "src");

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);
const importableExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const ignoredDirectories = new Set(["node_modules", "dist", ".git", "legacy"]);

const codeWatchLineLimit = 220;
const codeHighLineLimit = 300;
const cssWatchLineLimit = 400;
const cssHighLineLimit = 800;

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

function lineCount(content) {
  if (content.length === 0) return 0;
  return content.split(/\r?\n/).length;
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

function resolveImport(filePath, importSpec, filePathSet) {
  if (!importSpec.startsWith(".")) return null;

  const base = resolve(dirname(filePath), importSpec);
  const candidates = [
    base,
    ...importableExtensions.map((extension) => `${base}${extension}`),
    ...importableExtensions.map((extension) => resolve(base, `index${extension}`))
  ];

  return candidates.find((candidate) => filePathSet.has(candidate)) || null;
}

function layerFor(projectPath) {
  const layers = [
    "src/app",
    "src/domain",
    "src/data",
    "src/services",
    "src/utils",
    "src/routes",
    "src/pages",
    "src/components",
    "src/styles"
  ];

  return layers.find((layer) => isInside(projectPath, layer)) || "src/root";
}

function linePressureFor(file) {
  const isCss = file.extension === ".css";
  const highLimit = isCss ? cssHighLineLimit : codeHighLineLimit;
  const watchLimit = isCss ? cssWatchLineLimit : codeWatchLineLimit;

  if (file.lines >= highLimit) return "high";
  if (file.lines >= watchLimit) return "watch";
  return "ok";
}

function formatTable(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => column.value(row)).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
}

function sortByCountThenPath(a, b) {
  return b.count - a.count || a.path.localeCompare(b.path);
}

const sourceFiles = listFiles(sourceDir).filter((file) => sourceExtensions.has(extname(file)));
const sourceFileSet = new Set(sourceFiles);

const files = sourceFiles.map((path) => {
  const content = readText(path);
  const projectPath = toProjectPath(path);
  const imports = extractImports(content);
  const resolvedImports = imports
    .map((importSpec) => resolveImport(path, importSpec, sourceFileSet))
    .filter(Boolean)
    .map(toProjectPath);

  return {
    path: projectPath,
    absolutePath: path,
    extension: extname(path),
    layer: layerFor(projectPath),
    lines: lineCount(content),
    importCount: imports.length,
    resolvedImports
  };
});

const totalLines = files.reduce((sum, file) => sum + file.lines, 0);
const codeFiles = files.filter((file) => file.extension !== ".css");
const cssFiles = files.filter((file) => file.extension === ".css");

const layerRows = [...files.reduce((map, file) => {
  const current = map.get(file.layer) || { layer: file.layer, files: 0, lines: 0 };
  current.files += 1;
  current.lines += file.lines;
  map.set(file.layer, current);
  return map;
}, new Map()).values()].sort((a, b) => b.lines - a.lines || a.layer.localeCompare(b.layer));

const importFanIn = new Map();
for (const file of files) {
  for (const importedPath of file.resolvedImports) {
    importFanIn.set(importedPath, (importFanIn.get(importedPath) || 0) + 1);
  }
}

const fanInRows = [...importFanIn.entries()]
  .map(([path, count]) => ({ path, count }))
  .sort(sortByCountThenPath)
  .slice(0, 12);

const fanOutRows = files
  .map((file) => ({ path: file.path, count: file.importCount }))
  .filter((row) => row.count > 0)
  .sort(sortByCountThenPath)
  .slice(0, 12);

const linePressureRows = files
  .map((file) => ({ ...file, pressure: linePressureFor(file) }))
  .filter((file) => file.pressure !== "ok")
  .sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path));

const topFiles = [...files].sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path)).slice(0, 15);
const topCodeFiles = [...codeFiles].sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path)).slice(0, 12);
const topStyleFiles = [...cssFiles].sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path)).slice(0, 10);

console.log("# ADAX Source Shape Audit");
console.log("");
console.log(`Generated by \`npm run audit:source\`.`);
console.log("");
console.log("## Summary");
console.log("");
console.log(
  formatTable(
    [
      { metric: "Active source files", value: files.length },
      { metric: "Code files", value: codeFiles.length },
      { metric: "Style files", value: cssFiles.length },
      { metric: "Total active source lines", value: totalLines },
      { metric: "Watch line threshold", value: `${codeWatchLineLimit} code / ${cssWatchLineLimit} CSS` },
      { metric: "High line threshold", value: `${codeHighLineLimit} code / ${cssHighLineLimit} CSS` }
    ],
    [
      { label: "Metric", value: (row) => row.metric },
      { label: "Value", value: (row) => String(row.value) }
    ]
  )
);
console.log("");
console.log("## Layer Size");
console.log("");
console.log(
  formatTable(layerRows, [
    { label: "Layer", value: (row) => row.layer },
    { label: "Files", value: (row) => String(row.files) },
    { label: "Lines", value: (row) => String(row.lines) }
  ])
);
console.log("");
console.log("## Largest Files");
console.log("");
console.log(
  formatTable(topFiles, [
    { label: "File", value: (row) => row.path },
    { label: "Lines", value: (row) => String(row.lines) },
    { label: "Layer", value: (row) => row.layer }
  ])
);
console.log("");
console.log("## Largest Code Files");
console.log("");
console.log(
  formatTable(topCodeFiles, [
    { label: "File", value: (row) => row.path },
    { label: "Lines", value: (row) => String(row.lines) }
  ])
);
console.log("");
console.log("## Largest Style Files");
console.log("");
console.log(
  formatTable(topStyleFiles, [
    { label: "File", value: (row) => row.path },
    { label: "Lines", value: (row) => String(row.lines) }
  ])
);
console.log("");
console.log("## Import Fan-Out Hotspots");
console.log("");
console.log(
  formatTable(fanOutRows, [
    { label: "File", value: (row) => row.path },
    { label: "Import count", value: (row) => String(row.count) }
  ])
);
console.log("");
console.log("## Import Fan-In Hotspots");
console.log("");
console.log(
  formatTable(fanInRows, [
    { label: "Imported file", value: (row) => row.path },
    { label: "Importer count", value: (row) => String(row.count) }
  ])
);
console.log("");
console.log("## Line Pressure");
console.log("");
if (linePressureRows.length === 0) {
  console.log("No active files exceed the watch thresholds.");
} else {
  console.log(
    formatTable(linePressureRows, [
      { label: "Pressure", value: (row) => row.pressure },
      { label: "File", value: (row) => row.path },
      { label: "Lines", value: (row) => String(row.lines) }
    ])
  );
}
